"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from "../products/actions";

const itemsPerPage = 10;

interface CategoriesClientProps {
	initialCategories: any[];
}

export function AdminCategoriesClient({
	initialCategories,
}: CategoriesClientProps) {
	const { toast } = useToast();
	const [categories, setCategories] = useState(initialCategories);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<any>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isPending, startTransition] = useTransition();

	const [categoryForm, setCategoryForm] = useState({
		name: "",
		slug: "",
		icon: "",
		sort_order: 0,
	});

	const [formErrors, setFormErrors] = useState({
		name: "",
		slug: "",
	});

	const handleSaveCategory = async () => {
		// Validate form
		if (!categoryForm.name.trim()) {
			setFormErrors({ name: "Category name is required", slug: "" });
			return;
		}

		// Clear errors
		setFormErrors({ name: "", slug: "" });

		startTransition(async () => {
			const formData = new FormData();
			formData.append("name", categoryForm.name);
			formData.append(
				"slug",
				categoryForm.slug ||
					categoryForm.name.toLowerCase().replace(/\s+/g, "-")
			);
			formData.append("icon", categoryForm.icon);
			formData.append(
				"sort_order",
				String(categoryForm.sort_order || categories.length)
			);

			const result = editingCategory
				? await updateCategory(editingCategory.id, formData)
				: await createCategory(formData);

			if (result.error) {
				// Check if it's a name or slug duplicate error
				if (result.error.toLowerCase().includes("name already exists")) {
					setFormErrors({ name: result.error, slug: "" });
				} else if (result.error.toLowerCase().includes("slug already exists")) {
					setFormErrors({ name: "", slug: result.error });
				} else {
					// Show other errors as toast
					toast({
						title: "Error",
						description: result.error,
						variant: "destructive",
					});
				}
			} else {
				toast({
					title: "Success",
					description: editingCategory
						? "Category updated"
						: "Category created",
				});
				setCategoryDialogOpen(false);
				setEditingCategory(null);
				setCategoryForm({ name: "", slug: "", icon: "", sort_order: 0 });
				setFormErrors({ name: "", slug: "" });
				window.location.reload();
			}
		});
	};

	const handleDeleteCategory = async (id: string) => {
		if (!confirm("Are you sure you want to delete this category?")) return;

		startTransition(async () => {
			const result = await deleteCategory(id);
			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Deleted", description: "Category removed" });
				window.location.reload();
			}
		});
	};

	const openEditCategory = (category: any) => {
		setEditingCategory(category);
		setCategoryForm({
			name: category.name,
			slug: category.slug,
			icon: category.icon || "",
			sort_order: category.sort_order,
		});
		setCategoryDialogOpen(true);
	};

	const totalPages = Math.ceil(categories.length / itemsPerPage);
	const paginatedCategories = categories.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>Categories</CardTitle>
				<Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
					<DialogTrigger asChild>
						<Button
							size="sm"
							onClick={() => {
								setEditingCategory(null);
								setCategoryForm({
									name: "",
									slug: "",
									icon: "",
									sort_order: categories.length,
								});
								setFormErrors({ name: "", slug: "" });
							}}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingCategory ? "Edit Category" : "Add New Category"}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Name</Label>
								<Input
									value={categoryForm.name}
									onChange={(e) => {
										const name = e.target.value;
										const slug = name
											.toLowerCase()
											.replace(/\s+/g, "-")
											.replace(/[^a-z0-9-]/g, "");
										setCategoryForm((f) => ({
											...f,
											name: name,
											slug: editingCategory ? f.slug : slug,
										}));
									}}
									placeholder="e.g., Burgers"
									className={formErrors.name ? "border-red-500" : ""}
								/>
								{formErrors.name && (
									<p className="text-sm text-red-500">{formErrors.name}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Slug (URL-friendly name)</Label>
								<Input
									value={categoryForm.slug}
									onChange={(e) =>
										setCategoryForm((f) => ({
											...f,
											slug: e.target.value,
										}))
									}
									placeholder="e.g., burgers (auto-generated if empty)"
									className={formErrors.slug ? "border-red-500" : ""}
								/>
								{formErrors.slug && (
									<p className="text-sm text-red-500">{formErrors.slug}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label>Icon (emoji)</Label>
								<Input
									value={categoryForm.icon}
									onChange={(e) =>
										setCategoryForm((f) => ({
											...f,
											icon: e.target.value,
										}))
									}
									placeholder="🍔"
								/>
							</div>
							<div className="space-y-2">
								<Label>Sort Order</Label>
								<Input
									type="number"
									value={categoryForm.sort_order}
									onChange={(e) =>
										setCategoryForm((f) => ({
											...f,
											sort_order: parseInt(e.target.value) || 0,
										}))
									}
									placeholder="0"
								/>
							</div>
							<Button
								className="w-full"
								onClick={handleSaveCategory}
								disabled={isPending}
							>
								{editingCategory ? "Update" : "Create"} Category
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Icon</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Sort Order</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedCategories.map((category) => (
							<TableRow key={category.id}>
								<TableCell className="text-2xl">{category.icon}</TableCell>
								<TableCell className="font-medium">{category.name}</TableCell>
								<TableCell className="text-muted-foreground">
									{category.slug}
								</TableCell>
								<TableCell>{category.sort_order}</TableCell>
								<TableCell>
									<div className="flex gap-2">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => openEditCategory(category)}
											title="Edit Category"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="text-destructive"
											onClick={() => handleDeleteCategory(category.id)}
											title="Delete Category"
											disabled={isPending}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
						{paginatedCategories.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No categories yet
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
							{Math.min(currentPage * itemsPerPage, categories.length)} of{" "}
							{categories.length} categories
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
											variant={currentPage === pageNum ? "default" : "outline"}
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
	);
}
