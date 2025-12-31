import { getAllOrders } from "@/lib/data/orders";
import { AdminOrdersClient } from "./admin-orders-client";

export default async function AdminOrdersPage() {
	const orders = await getAllOrders();

	return (
		<AdminOrdersClient
			initialOrders={orders || []}
			initialTotal={orders?.length || 0}
		/>
	);
}
