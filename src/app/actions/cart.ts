"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

export async function addToCart(
	productId: string,
	quantity: number,
	selectedOptions?: any,
	specialInstructions?: string
) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Please sign in to add items to cart" };
	}

	const { data, error } = await supabase
		.from("cart_items")
		.insert({
			user_id: user.id,
			product_id: productId,
			quantity,
			selected_options: selectedOptions || [],
			special_instructions: specialInstructions,
		})
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/cart");
	return { success: true, data };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	if (quantity <= 0) {
		return await removeFromCart(itemId);
	}

	const { data, error } = await supabase
		.from("cart_items")
		.update({ quantity })
		.eq("id", itemId)
		.eq("user_id", user.id)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/cart");
	return { success: true, data };
}

export async function removeFromCart(itemId: string) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const { error } = await supabase
		.from("cart_items")
		.delete()
		.eq("id", itemId)
		.eq("user_id", user.id);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/cart");
	return { success: true };
}

export async function clearCart() {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const { error } = await supabase
		.from("cart_items")
		.delete()
		.eq("user_id", user.id);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/cart");
	return { success: true };
}

export async function getUserCart() {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized", data: [] };
	}

	const { data, error } = await supabase
		.from("cart_items")
		.select("*, products(*)")
		.eq("user_id", user.id);

	if (error) {
		return { success: false, error: error.message, data: [] };
	}

	return { success: true, data };
}
