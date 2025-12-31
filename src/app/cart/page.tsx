"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
	const { items, updateQuantity, removeFromCart, clearCart, isLoading } =
		useCart();

	if (isLoading) {
		return (
			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<p className="text-muted-foreground">Loading cart...</p>
				</div>
			</main>
		);
	}

	if (items.length === 0) {
		return (
			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
					<p className="text-muted-foreground mb-8">
						Add some delicious items to get started!
					</p>
					<Button asChild>
						<Link href="/">Browse Menu</Link>
					</Button>
				</div>
			</main>
		);
	}

	const total = items.reduce((sum, item) => {
		const basePrice = item.product?.price || 0;
		const options = item.selectedOptions || [];
		const optionsPrice = options.reduce((s, opt) => s + opt.price_modifier, 0);
		return sum + (basePrice + optionsPrice) * item.quantity;
	}, 0);

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">Shopping Cart</h1>
					<Button variant="ghost" onClick={clearCart}>
						Clear Cart
					</Button>
				</div>

				<div className="space-y-4 mb-8">
					{items.map((item) => {
						const basePrice = item.product?.price || 0;
						const options = item.selectedOptions || [];
						const optionsPrice = options.reduce(
							(s, opt) => s + opt.price_modifier,
							0
						);
						const itemTotal = (basePrice + optionsPrice) * item.quantity;

						return (
							<Card key={item.id}>
								<CardContent className="p-4">
									<div className="flex gap-4">
										{item.product?.image_url && (
											<div className="relative w-24 h-24 flex-shrink-0">
												<Image
													src={item.product.image_url}
													alt={item.product.name}
													fill
													className="object-cover rounded"
												/>
											</div>
										)}

										<div className="flex-1">
											<h3 className="font-semibold">
												{item.product?.name || "Unknown Product"}
											</h3>
											<p className="text-sm text-muted-foreground">
												£{basePrice.toFixed(2)}
											</p>

											{item.selectedOptions &&
												item.selectedOptions.length > 0 && (
													<div className="text-sm text-muted-foreground mt-1">
														{item.selectedOptions.map((opt) => (
															<div key={opt.option_id}>
																+ {opt.option_name} (£
																{opt.price_modifier.toFixed(2)})
															</div>
														))}
													</div>
												)}

											{item.specialInstructions && (
												<p className="text-sm text-muted-foreground mt-1">
													Note: {item.specialInstructions}
												</p>
											)}

											<div className="flex items-center gap-3 mt-3">
												<div className="flex items-center gap-2">
													<Button
														size="icon"
														variant="outline"
														onClick={() =>
															updateQuantity(item.id, item.quantity - 1)
														}
													>
														<Minus className="h-4 w-4" />
													</Button>
													<span className="w-8 text-center">
														{item.quantity}
													</span>
													<Button
														size="icon"
														variant="outline"
														onClick={() =>
															updateQuantity(item.id, item.quantity + 1)
														}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>

												<Button
													size="icon"
													variant="ghost"
													onClick={() => removeFromCart(item.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>

										<div className="text-right">
											<p className="font-semibold">£{itemTotal.toFixed(2)}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<span className="text-lg font-semibold">Total:</span>
							<span className="text-2xl font-bold">£{total.toFixed(2)}</span>
						</div>
						<Button asChild className="w-full" size="lg">
							<Link href="/checkout">Proceed to Checkout</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
