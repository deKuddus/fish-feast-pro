"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import Link from "next/link";

interface OrderDetailsProps {
	order: any;
}

export function OrderDetailsClient({ order }: OrderDetailsProps) {
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="h-5 w-5 text-yellow-500" />;
			case "confirmed":
				return <CheckCircle className="h-5 w-5 text-blue-500" />;
			case "preparing":
				return <Package className="h-5 w-5 text-purple-500" />;
			case "ready":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "out_for_delivery":
				return <Truck className="h-5 w-5 text-blue-500" />;
			case "completed":
				return <CheckCircle className="h-5 w-5 text-green-600" />;
			case "cancelled":
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Clock className="h-5 w-5" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "confirmed":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "preparing":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "ready":
				return "bg-green-100 text-green-800 border-green-200";
			case "out_for_delivery":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<Link href="/orders">
						<Button variant="ghost" size="sm">
							← Back to Orders
						</Button>
					</Link>
				</div>

				<div className="mb-6">
					<h1 className="text-3xl font-bold mb-2">Order Details</h1>
					<p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
				</div>

				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Order Status</span>
								<Badge
									variant="outline"
									className={getStatusColor(order.status)}
								>
									<span className="flex items-center gap-2">
										{getStatusIcon(order.status)}
										{order.status.replace(/_/g, " ")}
									</span>
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Order Date</p>
									<p className="font-medium">
										{formatDate(new Date(order.created_at))}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Order Type</p>
									<p className="font-medium capitalize">{order.order_type}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Payment Method
									</p>
									<p className="font-medium uppercase">
										{order.payment_method || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Payment Status
									</p>
									<p className="font-medium capitalize">
										{order.payment_status || "N/A"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{order.delivery_address && (
						<Card>
							<CardHeader>
								<CardTitle>Delivery Address</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="whitespace-pre-wrap">{order.delivery_address}</p>
							</CardContent>
						</Card>
					)}

					{order.phone && (
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">Phone</p>
								<p className="font-medium">{order.phone}</p>
							</CardContent>
						</Card>
					)}

					{order.notes && (
						<Card>
							<CardHeader>
								<CardTitle>Order Notes</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="whitespace-pre-wrap">{order.notes}</p>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Order Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{order.order_items?.map((item: any) => (
									<div key={item.id}>
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<p className="font-medium">
													{item.quantity}x {item.product_name}
												</p>
												{item.selected_options &&
													item.selected_options.length > 0 && (
														<div className="text-sm text-muted-foreground mt-1">
															{item.selected_options.map((opt: any) => (
																<div key={opt.option_id}>
																	+ {opt.option_name} (£
																	{opt.price_modifier.toFixed(2)})
																</div>
															))}
														</div>
													)}
												{item.special_instructions && (
													<p className="text-sm text-muted-foreground mt-1">
														Note: {item.special_instructions}
													</p>
												)}
											</div>
											<p className="font-medium">
												£{(item.unit_price * item.quantity).toFixed(2)}
											</p>
										</div>
										<Separator className="mt-4" />
									</div>
								))}
							</div>

							<div className="mt-6 space-y-2">
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>£{order.subtotal?.toFixed(2) || "0.00"}</span>
								</div>
								<Separator />
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span>£{order.total?.toFixed(2) || "0.00"}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
