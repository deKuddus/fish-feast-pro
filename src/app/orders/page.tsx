import { getCurrentUser } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserOrders } from "@/lib/data/orders";
import { formatDistanceToNow } from "date-fns";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth");
	}

	const orders = await getUserOrders(user.id);

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
			case "completed":
				return "bg-gray-500";
			case "cancelled":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">My Orders</h1>

			{orders && orders.length > 0 ? (
				<div className="space-y-4">
					{orders.map((order: any) => (
						<Card key={order.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										Order #{order.id.slice(0, 8)}
									</CardTitle>
									<Badge className={getStatusColor(order.status)}>
										{order.status}
									</Badge>
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
															{item.products?.name || "Product"}
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
			) : (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No orders yet.</p>
				</div>
			)}
		</main>
	);
}
