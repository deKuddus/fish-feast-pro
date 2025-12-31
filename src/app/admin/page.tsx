import { getAllOrders } from "@/lib/data/orders";
import { AdminOrdersClient } from "./orders/admin-orders-client";

export default async function AdminPage() {
	const orders = await getAllOrders();

	return (
		<AdminOrdersClient
			initialOrders={orders || []}
			initialTotal={orders?.length || 0}
		/>
	);
}
