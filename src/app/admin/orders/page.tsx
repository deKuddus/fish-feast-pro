import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { getAllOrders } from "@/lib/data/orders";
import { Suspense } from "react";
import { AdminOrdersClient } from "./admin-orders-client";

async function AdminOrdersContent() {
	const orders = await getAllOrders();

	return (
		<AdminOrdersClient
			initialOrders={orders || []}
			initialTotal={orders?.length || 0}
		/>
	);
}

export default function AdminOrdersPage() {
	return (
		<Suspense fallback={<AdminTableSkeleton rows={10} />}>
			<AdminOrdersContent />
		</Suspense>
	);
}
