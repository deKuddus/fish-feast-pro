"use client";

import { cancelOrder } from "@/app/actions/orders";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface OrdersClientProps {
	orders: any[];
	allowCancellation: boolean;
}

export function OrdersClient({ orders, allowCancellation }: OrdersClientProps) {
	const { toast } = useToast();
	const [cancellingId, setCancellingId] = useState<string | null>(null);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-500";
			case "confirmed":
				return "bg-blue-500";
			case "preparing":
				return "bg-purple-500";
			case "ready":
				return "bg-green-500";
			case "out-for-delivery":
				return "bg-cyan-500";
			case "delivered":
				return "bg-emerald-500";
			case "completed":
				return "bg-gray-500";
			case "cancelled":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const canCancelOrder = (order: any) => {
		if (!allowCancellation) return false;
		// Can only cancel pending orders
		return order.status === "pending";
	};

	const handleCancelOrder = async (orderId: string) => {
		setCancellingId(orderId);
		const result = await cancelOrder(orderId);
		setCancellingId(null);

		if (result.error) {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Success",
				description: "Order cancelled successfully",
			});
			// Refresh the page to show updated status
			window.location.reload();
		}
	};

	if (!orders || orders.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					You haven't placed any orders yet.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{orders.map((order: any) => (
				<Card key={order.id}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">
								Order #{order.id.slice(0, 8)}
							</CardTitle>
							<div className="flex items-center gap-2">
								<Badge className={getStatusColor(order.status)}>
									{order.status}
								</Badge>
								{canCancelOrder(order) && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												disabled={cancellingId === order.id}
											>
												{cancellingId === order.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<>
														<X className="h-4 w-4 mr-1" />
														Cancel
													</>
												)}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Cancel Order?</AlertDialogTitle>
												<AlertDialogDescription>
													Are you sure you want to cancel this order? This
													action cannot be undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>No, keep order</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleCancelOrder(order.id)}
													className="bg-red-500 hover:bg-red-600"
												>
													Yes, cancel order
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							{formatDistanceToNow(new Date(order.created_at), {
								addSuffix: true,
							})}
						</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Type:</span>
								<span className="capitalize">{order.order_type}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total:</span>
								<span className="font-semibold">
									£{order.total?.toFixed(2) || "0.00"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Payment:</span>
								<span className="capitalize">{order.payment_status}</span>
							</div>

							{order.order_items && order.order_items.length > 0 && (
								<div className="mt-4 pt-4 border-t">
									<p className="font-semibold mb-2">Items:</p>
									<ul className="space-y-1">
										{order.order_items.map((item: any) => (
											<li
												key={item.id}
												className="flex justify-between text-sm"
											>
												<span className="text-muted-foreground">
													{item.quantity}x{" "}
													{item.products?.name ||
														item.product_name ||
														"Product"}
												</span>
												<span className="font-medium">
													£
													{(item.unit_price * item.quantity)?.toFixed(2) ||
														"0.00"}
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
