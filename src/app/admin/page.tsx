import { AdminDashboardSkeleton } from "@/components/admin/AdminSkeleton";
import { getAllOrders } from "@/lib/data/orders";
import { Suspense } from "react";
import { AdminOrdersClient } from "./orders/admin-orders-client";

async function AdminDashboard() {
	const orders = await getAllOrders();

	return (
		<AdminOrdersClient
			initialOrders={orders || []}
			initialTotal={orders?.length || 0}
		/>
	);
}

export default function AdminPage() {
	return (
		<Suspense fallback={<AdminDashboardSkeleton />}>
			<AdminDashboard />
		</Suspense>
	);
}
