import { createSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrderDetailsClient } from "./order-details-client";

interface PageProps {
	params: Promise<{ orderId: string }>;
}

async function getOrderDetails(orderId: string, userId: string) {
	const supabase = await createSupabaseServer();

	const { data: order, error } = await supabase
		.from("orders")
		.select(
			`
			*,
			order_items (
				*,
				product:products (*)
			)
		`
		)
		.eq("id", orderId)
		.eq("user_id", userId)
		.single();

	if (error) {
		console.error("Error fetching order:", error);
		return null;
	}

	return order;
}

export default async function OrderDetailsPage({ params }: PageProps) {
	const { orderId } = await params;
	const supabase = await createSupabaseServer();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth");
	}

	const order = await getOrderDetails(orderId, user.id);

	if (!order) {
		redirect("/orders");
	}

	return <OrderDetailsClient order={order} />;
}
