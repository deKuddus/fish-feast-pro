"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export async function updateOrderStatus(orderId: string, status: string) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const { data, error } = await supabase
		.from("orders")
		.update({ status })
		.eq("id", orderId)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/orders");
	revalidatePath("/orders");
	return { success: true, data };
}

export async function createOrder(orderData: {
	user_id: string;
	total_amount: number;
	order_type: "delivery" | "pickup";
	delivery_address?: string;
	items: Array<{
		product_id: string;
		quantity: number;
		price: number;
		selected_options?: any;
	}>;
}) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({
			user_id: orderData.user_id,
			total_amount: orderData.total_amount,
			order_type: orderData.order_type,
			delivery_address: orderData.delivery_address,
			status: "pending",
			payment_status: "pending",
		})
		.select()
		.single();

	if (orderError) {
		return { success: false, error: orderError.message };
	}

	const orderItems = orderData.items.map((item) => ({
		order_id: order.id,
		product_id: item.product_id,
		quantity: item.quantity,
		price: item.price,
		selected_options: item.selected_options,
	}));

	const { error: itemsError } = await supabase
		.from("order_items")
		.insert(orderItems);

	if (itemsError) {
		await supabase.from("orders").delete().eq("id", order.id);
		return { success: false, error: itemsError.message };
	}

	revalidatePath("/orders");
	return { success: true, data: order };
}

export async function cancelOrder(orderId: string) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const { data, error } = await supabase
		.from("orders")
		.update({ status: "cancelled" })
		.eq("id", orderId)
		.eq("user_id", user.id)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/orders");
	return { success: true, data };
}
