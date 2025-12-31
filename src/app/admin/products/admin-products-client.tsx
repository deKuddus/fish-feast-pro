"use client";

import { ProductOptionsManager } from "@/components/admin/ProductOptionsManager";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
	ChevronLeft,
	ChevronRight,
	Edit,
	Plus,
	Search,
	Settings,
	Trash2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createProduct, deleteProduct, updateProduct } from "./actions";

const itemsPerPage = 10;

interface ProductsClientProps {
	initialProducts: any[];
	initialCategories: any[];
	initialTotal: number;
}

export function AdminProductsClient({
	initialProducts,
	initialCategories,
	initialTotal,
}: ProductsClientProps) {
	const { toast } = useToast();
	const [products, setProducts] = useState(initialProducts);
	const [filteredProducts, setFilteredProducts] = useState(initialProducts);
	const [searchQuery, setSearchQuery] = useState("");
	const [categories] = useState(initialCategories);
	const [productDialogOpen, setProductDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<any>(null);
	const [selectedProductForOptions, setSelectedProductForOptions] =
		useState<any>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isPending, startTransition] = useTransition();

	const [productForm, setProductForm] = useState({
		name: "",
		description: "",
		price: "",
		category_id: "",
		is_available: true,
		delivery_available: true,
		pickup_available: true,
		is_popular: false,
	});

	const [formErrors, setFormErrors] = useState({
		name: "",
		price: "",
		category_id: "",
	});

	useEffect(() => {
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const filtered = products.filter(
				(product) =>
					product.name?.toLowerCase().includes(query) ||
					product.description?.toLowerCase().includes(query) ||
					product.categories?.name?.toLowerCase().includes(query)
			);
			setFilteredProducts(filtered);
		} else {
			setFilteredProducts(products);
		}
	}, [searchQuery, products]);

	const handleSaveProduct = async () => {
		// Reset errors
		const errors = { name: "", price: "", category_id: "" };
		let hasError = false;

		// Validate form
		if (!productForm.name.trim()) {
			errors.name = "Product name is required";
			hasError = true;
		}

		if (!productForm.price || parseFloat(productForm.price) <= 0) {
			errors.price = "Price must be greater than 0";
			hasError = true;
		}

		if (!productForm.category_id) {
			errors.category_id = "Please select a category";
			hasError = true;
		}

		setFormErrors(errors);

		if (hasError) {
			return;
		}

		startTransition(async () => {
			const formData = new FormData();
			formData.append("name", productForm.name);
			formData.append("description", productForm.description);
			formData.append("price", productForm.price);
			formData.append("category_id", productForm.category_id);
			formData.append("is_available", String(productForm.is_available));
			formData.append(
				"delivery_available",
				String(productForm.delivery_available)
			);
			formData.append("pickup_available", String(productForm.pickup_available));
			formData.append("is_popular", String(productForm.is_popular));

			const result = editingProduct
				? await updateProduct(editingProduct.id, formData)
				: await createProduct(formData);

			if (result.error) {
				// Check if it's a duplicate name error
				if (
					result.error.toLowerCase().includes("product") &&
					result.error.toLowerCase().includes("name already exists")
				) {
					setFormErrors({ name: result.error, price: "", category_id: "" });
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
					description: editingProduct ? "Product updated" : "Product created",
				});
				setProductDialogOpen(false);
				setEditingProduct(null);
				setProductForm({
					name: "",
					description: "",
					price: "",
					category_id: "",
					is_available: true,
					delivery_available: true,
					pickup_available: true,
					is_popular: false,
				});
				setFormErrors({ name: "", price: "", category_id: "" });
				window.location.reload();
			}
		});
	};

	const handleDeleteProduct = async (id: string) => {
		if (!confirm("Are you sure you want to delete this product?")) return;

		startTransition(async () => {
			const result = await deleteProduct(id);
			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Deleted", description: "Product removed" });
				window.location.reload();
			}
		});
	};

	const openEditProduct = (product: any) => {
		setEditingProduct(product);
		setProductForm({
			name: product.name,
			description: product.description || "",
			price: product.price.toString(),
			category_id: product.category_id || "",
			is_available: product.is_available,
			delivery_available: product.delivery_available ?? true,
			pickup_available: product.pickup_available ?? true,
			is_popular: product.is_popular ?? false,
		});
		setProductDialogOpen(true);
	};

	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	const paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	return (
		<Card>
			<CardHeader className="flex flex-col space-y-4">
				<div className="flex flex-row items-center justify-between">
					<CardTitle>Products</CardTitle>
					<Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
						<DialogTrigger asChild>
							<Button
								size="sm"
								onClick={() => {
									setEditingProduct(null);
									setProductForm({
										name: "",
										description: "",
										price: "",
										category_id: "",
										is_available: true,
										delivery_available: true,
										pickup_available: true,
										is_popular: false,
									});
									setFormErrors({ name: "", price: "", category_id: "" });
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{editingProduct ? "Edit Product" : "Add New Product"}
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label>Name</Label>
									<Input
										value={productForm.name}
										onChange={(e) =>
											setProductForm((f) => ({
												...f,
												name: e.target.value,
											}))
										}
										className={formErrors.name ? "border-red-500" : ""}
									/>
									{formErrors.name && (
										<p className="text-sm text-red-500">{formErrors.name}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label>Description</Label>
									<Input
										value={productForm.description}
										onChange={(e) =>
											setProductForm((f) => ({
												...f,
												description: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Price (£)</Label>
									<Input
										type="number"
										step="0.01"
										value={productForm.price}
										onChange={(e) =>
											setProductForm((f) => ({
												...f,
												price: e.target.value,
											}))
										}
										className={formErrors.price ? "border-red-500" : ""}
									/>
									{formErrors.price && (
										<p className="text-sm text-red-500">{formErrors.price}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label>Category</Label>
									<select
										className={`w-full bg-secondary border-none rounded-lg px-3 py-2 ${
											formErrors.category_id ? "border border-red-500" : ""
										}`}
										value={productForm.category_id}
										onChange={(e) =>
											setProductForm((f) => ({
												...f,
												category_id: e.target.value,
											}))
										}
									>
										<option value="">Select category</option>
										{categories.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
									{formErrors.category_id && (
										<p className="text-sm text-red-500">
											{formErrors.category_id}
										</p>
									)}
								</div>
								<div className="flex items-center justify-between py-2">
									<Label htmlFor="delivery">Delivery</Label>
									<Switch
										id="delivery"
										checked={productForm.delivery_available}
										onCheckedChange={(checked) =>
											setProductForm((f) => ({
												...f,
												delivery_available: checked,
											}))
										}
									/>
								</div>
								<div className="flex items-center justify-between py-2">
									<Label htmlFor="pickup">Pickup</Label>
									<Switch
										id="pickup"
										checked={productForm.pickup_available}
										onCheckedChange={(checked) =>
											setProductForm((f) => ({
												...f,
												pickup_available: checked,
											}))
										}
									/>
								</div>
								<div className="flex items-center justify-between py-2">
									<Label htmlFor="popular">Mark as Popular</Label>
									<Switch
										id="popular"
										checked={productForm.is_popular}
										onCheckedChange={(checked) =>
											setProductForm((f) => ({
												...f,
												is_popular: checked,
											}))
										}
									/>
								</div>
								<div className="flex items-center justify-between py-2">
									<Label htmlFor="available">Available</Label>
									<Switch
										id="available"
										checked={productForm.is_available}
										onCheckedChange={(checked) =>
											setProductForm((f) => ({
												...f,
												is_available: checked,
											}))
										}
									/>
								</div>
								<Button
									className="w-full"
									onClick={handleSaveProduct}
									disabled={isPending}
								>
									{editingProduct ? "Update" : "Create"} Product
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by name, description, or category..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
			</CardHeader>
			<CardContent>
				{selectedProductForOptions ? (
					<div className="space-y-4">
						<div className="flex items-center justify-between pb-4 border-b">
							<div>
								<h3 className="text-lg font-semibold">
									{selectedProductForOptions.name}
								</h3>
								<p className="text-sm text-muted-foreground">
									{selectedProductForOptions.categories?.name}
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setSelectedProductForOptions(null)}
							>
								Back to Products
							</Button>
						</div>
						<ProductOptionsManager
							productId={selectedProductForOptions.id}
							productName={selectedProductForOptions.name}
						/>
					</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Available</TableHead>
									<TableHead>Popular</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedProducts.map((product) => (
									<TableRow key={product.id}>
										<TableCell className="font-medium">
											{product.name}
										</TableCell>
										<TableCell>{product.categories?.name || "-"}</TableCell>
										<TableCell>{formatPrice(product.price)}</TableCell>
										<TableCell>
											<Badge
												variant={product.is_available ? "default" : "secondary"}
											>
												{product.is_available ? "Available" : "Unavailable"}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={product.is_popular ? "default" : "outline"}
											>
												{product.is_popular ? "Popular" : "Regular"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openEditProduct(product)}
													title="Edit Product"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setSelectedProductForOptions(product)}
													title="Manage Options"
												>
													<Settings className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive"
													onClick={() => handleDeleteProduct(product.id)}
													title="Delete Product"
													disabled={isPending}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
								{paginatedProducts.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={6}
											className="text-center text-muted-foreground"
										>
											{searchQuery
												? "No products found matching your search"
												: "No products yet"}
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
									{Math.min(
										currentPage * itemsPerPage,
										filteredProducts.length
									)}{" "}
									of {filteredProducts.length} products
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
					</>
				)}
			</CardContent>
		</Card>
	);
}
