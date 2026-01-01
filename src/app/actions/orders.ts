"use server";

import { getSettings } from "@/lib/data/settings";
import { sendOrderStatusUpdateEmail } from "@/lib/email/service";
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
		.select(
			`
			*,
			order_items (
				product_name,
				quantity,
				subtotal
			),
			profiles!inner (
				email,
				full_name
			)
		`
		)
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	// Send status update email
	try {
		const profile = (data as any).profiles;
		if (profile?.email) {
			await sendOrderStatusUpdateEmail({
				orderId: data.id,
				customerName: profile.full_name || "Customer",
				customerEmail: profile.email,
				orderType: data.order_type,
				total: data.total,
				status: data.status,
				items: ((data as any).order_items || []).map((item: any) => ({
					name: item.product_name,
					quantity: item.quantity,
					price: item.subtotal,
				})),
			});
		}
	} catch (emailError) {
		console.error("Failed to send order status update email:", emailError);
		// Don't fail the order update if email fails
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

	// Check if order cancellation is allowed in settings
	const settings = await getSettings();
	if (!settings?.allow_order_cancellation) {
		return { success: false, error: "Order cancellation is not allowed" };
	}

	// Get the order to check its status
	const { data: order } = await supabase
		.from("orders")
		.select("status")
		.eq("id", orderId)
		.eq("user_id", user.id)
		.single();

	if (!order) {
		return { success: false, error: "Order not found" };
	}

	// Only allow cancellation of pending orders
	if (order.status !== "pending") {
		return { success: false, error: "Only pending orders can be cancelled" };
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
	revalidatePath("/admin/orders");
	return { success: true, data };
}
