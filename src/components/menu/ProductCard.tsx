"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { Plus } from "lucide-react";

interface ProductCardProps {
	product: Product;
	onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
	return (
		<div
			className="product-card cursor-pointer group bg-card border border-border rounded-lg hover:shadow-lg transition-shadow"
			onClick={() => onSelect?.(product)}
		>
			<div className="p-4 flex justify-between items-start gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-medium text-foreground truncate">
							{product.name}
						</h3>
						{product.is_popular && (
							<span className="badge-popular shrink-0">Popular</span>
						)}
					</div>

					{product.description && (
						<p className="text-sm text-muted-foreground line-clamp-2 mb-2">
							{product.description}
						</p>
					)}

					{product.allergens && product.allergens.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-2">
							{product.allergens.slice(0, 3).map((allergen) => (
								<span key={allergen} className="allergen-tag">
									{allergen}
								</span>
							))}
						</div>
					)}

					<span className="text-primary font-semibold text-lg">
						£{product.price.toFixed(2)}
					</span>
				</div>

				<Button
					size="icon"
					className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 w-10"
					onClick={() => onSelect?.(product)}
					disabled={!product.is_available}
				>
					<Plus className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}
