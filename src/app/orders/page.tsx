import { getCurrentUser } from "@/app/actions/auth";
import { getUserOrders } from "@/lib/data/orders";
import { getSettings } from "@/lib/data/settings";
import { redirect } from "next/navigation";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth");
	}

	const [orders, settings] = await Promise.all([
		getUserOrders(user.id),
		getSettings(),
	]);

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">My Orders</h1>
			<OrdersClient
				orders={orders || []}
				allowCancellation={settings?.allow_order_cancellation ?? true}
			/>
		</main>
	);
}
