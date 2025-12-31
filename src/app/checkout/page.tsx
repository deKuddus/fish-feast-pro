"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/providers/auth-provider";
import { useOrderTypeStore } from "@/stores/order-type-store";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user } = useAuth();
	const { items, clearCart } = useCart();
	const { orderType, setOrderType } = useOrderTypeStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("card");

	const total = items.reduce((sum, item) => {
		const basePrice = item.product?.price || 0;
		const options = item.selectedOptions || [];
		const optionsPrice = options.reduce((s, opt) => s + opt.price_modifier, 0);
		return sum + (basePrice + optionsPrice) * item.quantity;
	}, 0);

	const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!user) {
			toast({
				title: "Authentication Required",
				description: "Please sign in to complete your order",
				variant: "destructive",
			});
			router.push("/auth");
			return;
		}

		if (items.length === 0) {
			toast({
				title: "Cart Empty",
				description: "Please add items to your cart",
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			const formData = new FormData(e.currentTarget);

			if (paymentMethod === "cod") {
				// Handle COD order directly
				const response = await fetch("/api/orders", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						items: items.map((item) => ({
							productId: item.productId,
							quantity: item.quantity,
							selectedOptions: item.selectedOptions,
							specialInstructions: item.specialInstructions,
							product: item.product,
						})),
						orderType,
						deliveryAddress: formData.get("address"),
						phone: formData.get("phone"),
						notes: formData.get("notes"),
						paymentMethod: "cod",
						paymentStatus: "pending",
					}),
				});

				const data = await response.json();

				if (data.success) {
					await clearCart();
					toast({
						title: "Order Placed!",
						description: "Your order has been placed successfully.",
					});
					router.push(`/orders/${data.orderId}`);
				} else {
					throw new Error(data.error || "Failed to create order");
				}
			} else {
				// Call Stripe checkout API
				const response = await fetch("/api/checkout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						items: items.map((item) => ({
							productId: item.productId,
							quantity: item.quantity,
							selectedOptions: item.selectedOptions,
							specialInstructions: item.specialInstructions,
							product: item.product,
						})),
						orderType,
						deliveryAddress: formData.get("address"),
						phone: formData.get("phone"),
						notes: formData.get("notes"),
					}),
				});

				const data = await response.json();

				if (data.url) {
					// Redirect to Stripe Checkout
					window.location.href = data.url;
				} else {
					throw new Error("Failed to create checkout session");
				}
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast({
				title: "Checkout Failed",
				description: "Something went wrong. Please try again.",
				variant: "destructive",
			});
			setIsProcessing(false);
		}
	};

	if (items.length === 0) {
		return (
			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
					<Button onClick={() => router.push("/")}>Browse Menu</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Checkout</h1>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<form
							id="checkout-form"
							onSubmit={handleCheckout}
							className="space-y-6"
						>
							<Card>
								<CardHeader>
									<CardTitle>Order Type</CardTitle>
								</CardHeader>
								<CardContent>
									<RadioGroup value={orderType} onValueChange={setOrderType}>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="delivery" id="delivery" />
											<Label htmlFor="delivery">Delivery</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="pickup" id="pickup" />
											<Label htmlFor="pickup">Pickup</Label>
										</div>
									</RadioGroup>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Contact Information</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											defaultValue={user?.email}
											disabled
										/>
									</div>
									<div>
										<Label htmlFor="phone">Phone</Label>
										<Input
											id="phone"
											name="phone"
											type="tel"
											required
											placeholder="Your phone number"
										/>
									</div>
								</CardContent>
							</Card>

							{orderType === "delivery" && (
								<Card>
									<CardHeader>
										<CardTitle>Delivery Address</CardTitle>
									</CardHeader>
									<CardContent>
										<Label htmlFor="address">Address</Label>
										<Textarea
											id="address"
											name="address"
											required
											placeholder="Enter your delivery address"
											rows={3}
										/>
									</CardContent>
								</Card>
							)}

							<Card>
								<CardHeader>
									<CardTitle>Additional Notes</CardTitle>
								</CardHeader>
								<CardContent>
									<Textarea
										id="notes"
										name="notes"
										placeholder="Any special requests? (optional)"
										rows={3}
									/>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Payment Method</CardTitle>
								</CardHeader>
								<CardContent>
									<RadioGroup
										value={paymentMethod}
										onValueChange={setPaymentMethod}
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="card" id="card" />
											<Label htmlFor="card">Credit/Debit Card</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="cod" id="cod" />
											<Label htmlFor="cod">Cash on Delivery</Label>
										</div>
									</RadioGroup>
								</CardContent>
							</Card>
						</form>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									{items.map((item) => {
										const basePrice = item.product?.price || 0;
										const options = item.selectedOptions || [];
										const optionsPrice = options.reduce(
											(s, opt) => s + opt.price_modifier,
											0
										);
										const itemTotal =
											(basePrice + optionsPrice) * item.quantity;

										return (
											<div
												key={item.id}
												className="flex justify-between text-sm"
											>
												<span>
													{item.quantity}x {item.product?.name || "Unknown"}
												</span>
												<span>£{itemTotal.toFixed(2)}</span>
											</div>
										);
									})}
								</div>

								<div className="border-t pt-4">
									<div className="flex justify-between text-sm mb-2">
										<span>Subtotal</span>
										<span>£{total.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm mb-2">
										<span>Service Type</span>
										<span className="capitalize">{orderType}</span>
									</div>
									<div className="flex justify-between font-bold text-lg pt-2 border-t">
										<span>Total</span>
										<span>£{total.toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Button
							type="submit"
							form="checkout-form"
							size="lg"
							className="w-full"
							disabled={isProcessing}
						>
							{isProcessing && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isProcessing
								? "Processing..."
								: paymentMethod === "cod"
								? "Place Order"
								: `Pay £${total.toFixed(2)}`}
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
