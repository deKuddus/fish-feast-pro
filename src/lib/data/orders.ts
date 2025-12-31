import { createSupabaseServer } from "@/lib/supabase/server";

export async function getUserOrders(userId: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*, products(*))")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getOrderById(orderId: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*, products(*))")
		.eq("id", orderId)
		.single();

	if (error) throw error;
	return data;
}

export async function getAllOrders() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*, products(*))")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getOrdersByStatus(status: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*, products(*))")
		.eq("status", status)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}
