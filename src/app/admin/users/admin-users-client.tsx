"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Eye, Loader2, Search } from "lucide-react";
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
	const [userOrders, setUserOrders] = useState<any[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);

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
									<TableCell>{formatDate(user.created_at)}</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleViewUserDetails(user)}
											title="View User Details"
										>
											<Eye className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
							{paginatedUsers.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
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
		</div>
	);
}
