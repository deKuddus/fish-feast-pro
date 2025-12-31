"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("orders")
			.update({ status, updated_at: new Date().toISOString() })
			.eq("id", orderId);

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/orders");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update order status" };
	}
}

export async function updatePaymentStatus(
	orderId: string,
	paymentStatus: string
) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("orders")
			.update({
				payment_status: paymentStatus,
				updated_at: new Date().toISOString(),
			})
			.eq("id", orderId);

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/orders");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update payment status" };
	}
}

// Product Options Management
export async function fetchProductOptionGroups(productId: string) {
	try {
		const supabase = await createSupabaseServer();

		const { data: groups, error: groupsError } = await supabase
			.from("product_option_groups")
			.select("*")
			.eq("product_id", productId)
			.order("sort_order");

		if (groupsError) {
			return { error: groupsError.message };
		}

		if (!groups) {
			return { data: [] };
		}

		// Fetch options for each group
		const groupsWithOptions = await Promise.all(
			groups.map(async (group: any) => {
				const { data: options } = await supabase
					.from("product_options")
					.select("*")
					.eq("option_group_id", group.id)
					.order("sort_order");

				return {
					...group,
					is_required: group.is_required ?? false,
					min_selections: group.min_selections ?? 0,
					max_selections: group.max_selections ?? 1,
					sort_order: group.sort_order ?? 0,
					options: (options || []).map((opt: any) => ({
						...opt,
						is_default: opt.is_default ?? false,
						price_modifier: opt.price_modifier ?? 0,
						sort_order: opt.sort_order ?? 0,
					})),
				};
			})
		);

		return { data: groupsWithOptions };
	} catch (error: any) {
		return { error: error.message || "Failed to fetch option groups" };
	}
}

export async function saveProductOptionGroup(
	productId: string,
	groupData: {
		name: string;
		is_required: boolean;
		min_selections: number;
		max_selections: number;
		sort_order: number;
	},
	groupId?: string
) {
	try {
		const supabase = await createSupabaseServer();

		const data = {
			product_id: productId,
			...groupData,
		};

		let error;
		if (groupId) {
			({ error } = await supabase
				.from("product_option_groups")
				.update(data)
				.eq("id", groupId));
		} else {
			({ error } = await supabase.from("product_option_groups").insert(data));
		}

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to save option group" };
	}
}

export async function deleteProductOptionGroup(groupId: string) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("product_option_groups")
			.delete()
			.eq("id", groupId);

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to delete option group" };
	}
}

export async function saveProductOption(
	optionData: {
		option_group_id: string;
		name: string;
		price_modifier: number;
		is_default: boolean;
		sort_order: number;
	},
	optionId?: string
) {
	try {
		const supabase = await createSupabaseServer();

		let error;
		if (optionId) {
			({ error } = await supabase
				.from("product_options")
				.update(optionData)
				.eq("id", optionId));
		} else {
			({ error } = await supabase.from("product_options").insert(optionData));
		}

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to save option" };
	}
}

export async function deleteProductOption(optionId: string) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("product_options")
			.delete()
			.eq("id", optionId);

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to delete option" };
	}
}
