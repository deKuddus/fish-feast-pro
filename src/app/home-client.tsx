"use client";

import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { MobileCategoryNav } from "@/components/menu/MobileCategoryNav";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductOptionsModal } from "@/components/menu/ProductOptionsModal";
import { SearchBar } from "@/components/menu/SearchBar";
import { Category, Product } from "@/types";
import { Bike, Clock } from "lucide-react";
import { useMemo, useState } from "react";

interface HomeClientProps {
	initialProducts: Product[];
	initialCategories: Category[];
	settings: any;
}

export default function HomeClient({
	initialProducts,
	initialCategories,
	settings,
}: HomeClientProps) {
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Filter products by order type and search query
	const filteredProducts = useMemo(() => {
		let filtered = initialProducts;

		// Filter by order type (delivery or pickup availability)
		if (orderType === "delivery") {
			filtered = filtered.filter((p) => p.delivery_available !== false);
		} else {
			filtered = filtered.filter((p) => p.pickup_available !== false);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description?.toLowerCase().includes(query)
			);
		}

		return filtered;
	}, [initialProducts, searchQuery, orderType]);

	// Group products by category
	const productsByCategory = useMemo(() => {
		const grouped: { [key: string]: Product[] } = {};

		// Add popular products section
		const popularProducts = filteredProducts.filter((p) => p.is_popular);
		if (popularProducts.length > 0) {
			grouped["popular"] = popularProducts;
		}

		// Group by category
		initialCategories.forEach((category) => {
			const categoryProducts = filteredProducts.filter(
				(p) => p.category_id === category.id
			);
			if (categoryProducts.length > 0) {
				grouped[category.slug] = categoryProducts;
			}
		});

		return grouped;
	}, [filteredProducts, initialCategories]);

	const handleProductSelect = (product: Product) => {
		setSelectedProduct(product);
		setIsModalOpen(true);
	};

	return (
		<>
			{/* Hero Section */}
			<section className="relative h-96 overflow-hidden">
				<img
					src={"/hero-fish-chips.jpg"}
					alt="Delicious fish and chips"
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
				<div className="absolute bottom-0 left-0 right-0 p-6 container">
					<h1 className="text-3xl font-bold mb-2">
						{settings?.shop_name || "Fish Feast Pro"}
					</h1>
					<p className="text-muted-foreground mb-4">
						{settings?.address_line1 || ""}
						{settings?.address_line2 && `, ${settings.address_line2}`}
						{settings?.city && `, ${settings.city}`}
						{settings?.postcode && `, ${settings.postcode}`}
					</p>
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<span className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Opens for delivery at {settings?.opens_at || "15:30"}
						</span>
						<span className="flex items-center gap-2">
							<Bike className="h-4 w-4" />
							Delivery time {settings?.delivery_time_minutes || 45} min
						</span>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className="container py-8">
				<div className="flex gap-8">
					{/* Sidebar */}
					<CategorySidebar
						categories={initialCategories}
						activeCategory={activeCategory}
						onCategoryChange={setActiveCategory}
					/>

					{/* Main Content Area */}
					<div className="flex-1 min-w-0">
						{/* Mobile Category Nav */}
						<MobileCategoryNav
							categories={initialCategories}
							activeCategory={activeCategory}
							onCategoryChange={setActiveCategory}
						/>
						<div className="lg:hidden sticky top-[120px] z-20 bg-background pb-3 mb-4 space-y-3">
							<SearchBar value={searchQuery} onChange={setSearchQuery} />
							<div className="relative bg-secondary rounded-lg p-1 max-w-xs mx-auto">
								<div
									className="absolute top-1 bottom-1 left-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
									style={{
										width: "calc(50% - 4px)",
										transform:
											orderType === "pickup"
												? "translateX(calc(100% + 4px))"
												: "translateX(0)",
									}}
								/>
								<div className="relative flex">
									<button
										className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 ${
											orderType === "delivery"
												? "text-primary-foreground"
												: "text-secondary-foreground hover:text-foreground"
										}`}
										onClick={() => setOrderType("delivery")}
									>
										<Bike className="h-4 w-4" />
										Delivery
									</button>
									<button
										className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 ${
											orderType === "pickup"
												? "text-primary-foreground"
												: "text-secondary-foreground hover:text-foreground"
										}`}
										onClick={() => setOrderType("pickup")}
									>
										<Clock className="h-4 w-4" />
										Pick-up
									</button>
								</div>
							</div>
						</div>

						{/* Desktop Search - Hidden on mobile since we have 3 options above */}
						<div className="mb-6 hidden lg:block sticky top-24 z-10 bg-background pb-4">
							<SearchBar value={searchQuery} onChange={setSearchQuery} />
						</div>

						<div className="space-y-8">
							{/* Popular Products Section */}
							{productsByCategory["popular"] && (
								<section id="popular" className="scroll-mt-24">
									<h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
										❤️ Most popular products
									</h2>
									<div className="grid gap-3">
										{productsByCategory["popular"].map((product) => (
											<ProductCard
												key={product.id}
												product={product}
												onSelect={handleProductSelect}
											/>
										))}
									</div>
								</section>
							)}

							{/* Category Sections */}
							{initialCategories
								.filter((cat) => productsByCategory[cat.slug])
								.map((category) => (
									<section
										key={category.id}
										id={category.slug}
										className="scroll-mt-24"
									>
										<h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
											<span>{category.icon}</span>
											<span>{category.name}</span>
										</h2>
										<div className="grid gap-3">
											{productsByCategory[category.slug].map((product) => (
												<ProductCard
													key={product.id}
													product={product}
													onSelect={handleProductSelect}
												/>
											))}
										</div>
									</section>
								))}
						</div>
					</div>

					{/* Desktop Order Type Sidebar */}
					<aside className="hidden lg:block w-64 shrink-0">
						<div className="sticky top-24 space-y-4">
							<h3 className="text-lg font-semibold">Service Method</h3>
							<div className="relative bg-secondary rounded-lg p-1">
								<div
									className="absolute top-1 bottom-1 left-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
									style={{
										width: "calc(50% - 4px)",
										transform:
											orderType === "pickup"
												? "translateX(calc(100% + 4px))"
												: "translateX(0)",
									}}
								/>
								<div className="relative flex">
									<button
										className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-300 ${
											orderType === "delivery"
												? "text-primary-foreground"
												: "text-secondary-foreground hover:text-foreground"
										}`}
										onClick={() => setOrderType("delivery")}
									>
										Delivery
									</button>
									<button
										className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-300 ${
											orderType === "pickup"
												? "text-primary-foreground"
												: "text-secondary-foreground hover:text-foreground"
										}`}
										onClick={() => setOrderType("pickup")}
									>
										Pick-up
									</button>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>

			{/* Product Options Modal */}
			<ProductOptionsModal
				product={selectedProduct}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</>
	);
}
