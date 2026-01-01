"use client";

import { updateUserRole } from "@/app/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils";
import {
	ChevronLeft,
	ChevronRight,
	Edit,
	Eye,
	Loader2,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";

const itemsPerPage = 10;

interface UsersClientProps {
	initialUsers: any[];
	initialTotal: number;
}

export function AdminUsersClient({
	initialUsers,
	initialTotal,
}: UsersClientProps) {
	const [users, setUsers] = useState(initialUsers);
	const [filteredUsers, setFilteredUsers] = useState(initialUsers);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [userDetailsOpen, setUserDetailsOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [userOrders, setUserOrders] = useState<any[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);
	const [editingRole, setEditingRole] = useState<"admin" | "user">("user");
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const filtered = users.filter(
				(user) =>
					user.email?.toLowerCase().includes(query) ||
					user.full_name?.toLowerCase().includes(query) ||
					user.phone?.toLowerCase().includes(query)
			);
			setFilteredUsers(filtered);
		} else {
			setFilteredUsers(users);
		}
	}, [searchQuery, users]);

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleViewUserDetails = async (user: any) => {
		setSelectedUser(user);
		setUserDetailsOpen(true);

		// Fetch user orders
		setLoadingOrders(true);
		try {
			const response = await fetch(`/api/admin/users/${user.id}/orders`);
			if (response.ok) {
				const orders = await response.json();
				setUserOrders(orders);
			}
		} catch (error) {
			console.error("Error fetching user orders:", error);
		} finally {
			setLoadingOrders(false);
		}
	};

	const handleEditUser = async (user: any) => {
		setSelectedUser(user);
		setEditingRole(user.role || "user");
		setEditDialogOpen(true);
	};

	const handleSaveUserRole = async () => {
		if (!selectedUser) return;

		setIsSaving(true);
		try {
			const result = await updateUserRole(selectedUser.id, editingRole);

			if (result.success) {
				toast({
					title: "Success",
					description: "User role updated successfully",
				});

				// Update the local state
				const updatedUsers = users.map((u) =>
					u.id === selectedUser.id ? { ...u, role: editingRole } : u
				);
				setUsers(updatedUsers);
				setFilteredUsers(updatedUsers);
				setEditDialogOpen(false);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to update user role",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error updating user role:", error);
			toast({
				title: "Error",
				description: "Failed to update user role",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Users</CardTitle>
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								className="pl-8 w-64"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Full Name</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.email || "N/A"}
									</TableCell>
									<TableCell>{user.full_name || "-"}</TableCell>
									<TableCell>{user.phone || "-"}</TableCell>
									<TableCell>
										<Badge
											variant={user.role === "admin" ? "default" : "secondary"}
										>
											{user.role === "admin" ? "Admin" : "Customer"}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(user.created_at)}</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditUser(user)}
												title="Edit User Role"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewUserDetails(user)}
												title="View User Details"
											>
												<Eye className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{paginatedUsers.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center text-muted-foreground"
									>
										{searchQuery ? "No matching users found" : "No users yet"}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between px-2 py-4">
							<div className="text-sm text-muted-foreground">
								Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
								{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
								{filteredUsers.length} users
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<div className="flex gap-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										let pageNum;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<Button
												key={pageNum}
												variant={
													currentPage === pageNum ? "default" : "outline"
												}
												size="sm"
												onClick={() => setCurrentPage(pageNum)}
												className="w-8"
											>
												{pageNum}
											</Button>
										);
									})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Details Dialog */}
			<Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{selectedUser.email || "N/A"}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Full Name</p>
									<p className="font-medium">
										{selectedUser.full_name || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">{selectedUser.phone || "N/A"}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Joined</p>
									<p className="font-medium">
										{formatDate(selectedUser.created_at)}
									</p>
								</div>
							</div>

							<div className="border-t pt-4">
								<h4 className="font-semibold mb-3 flex items-center gap-2">
									Order History
									{loadingOrders && (
										<Loader2 className="h-4 w-4 animate-spin" />
									)}
								</h4>
								{loadingOrders ? (
									<div className="text-center py-8">
										<Loader2 className="h-8 w-8 animate-spin mx-auto" />
									</div>
								) : userOrders.length > 0 ? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Order #</TableHead>
												<TableHead>Date</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Total</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{userOrders.map((order) => (
												<TableRow key={order.id}>
													<TableCell className="font-mono text-sm">
														{order.order_number}
													</TableCell>
													<TableCell>{formatDate(order.created_at)}</TableCell>
													<TableCell className="capitalize">
														{order.order_type}
													</TableCell>
													<TableCell>
														<Badge className={getStatusColor(order.status)}>
															{order.status}
														</Badge>
													</TableCell>
													<TableCell className="font-semibold">
														{formatPrice(order.total)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								) : (
									<p className="text-sm text-muted-foreground text-center py-4">
										No orders yet
									</p>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit User Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User Role</DialogTitle>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Email</Label>
								<Input value={selectedUser.email || "N/A"} disabled />
							</div>
							<div className="space-y-2">
								<Label>Full Name</Label>
								<Input value={selectedUser.full_name || "N/A"} disabled />
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<Select
									value={editingRole}
									onValueChange={(value: "admin" | "user") =>
										setEditingRole(value)
									}
								>
									<SelectTrigger id="role">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">Customer</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditDialogOpen(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button onClick={handleSaveUserRole} disabled={isSaving}>
							{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
