"use client";

import { ProductOptionsManager } from "@/components/admin/ProductOptionsManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Product {
	id: string;
	name: string;
	categories?: {
		name: string;
	} | null;
}

interface AdminOptionsClientProps {
	initialProducts: Product[];
}

export function AdminOptionsClient({
	initialProducts,
}: AdminOptionsClientProps) {
	const [selectedProductForOptions, setSelectedProductForOptions] =
		useState<Product | null>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Manage Product Options</CardTitle>
				<p className="text-sm text-muted-foreground">
					Add customization options like sauces, toppings, or sizes to your
					products
				</p>
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
									{selectedProductForOptions.categories?.name || "No category"}
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
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Select a product to manage its options
						</p>
						<div className="grid gap-2">
							{initialProducts.map((product) => (
								<Button
									key={product.id}
									variant="outline"
									className="justify-start h-auto py-3"
									onClick={() => setSelectedProductForOptions(product)}
								>
									<div className="text-left">
										<div className="font-medium">{product.name}</div>
										<div className="text-sm text-muted-foreground">
											{product.categories?.name || "No category"}
										</div>
									</div>
								</Button>
							))}
							{initialProducts.length === 0 && (
								<p className="text-center text-muted-foreground py-8">
									No products available. Please add products first.
								</p>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
