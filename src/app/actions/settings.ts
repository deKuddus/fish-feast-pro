"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateRestaurantSettings(formData: FormData) {
	const supabase = await createSupabaseServer();

	const settingsData = {
		enable_delivery: formData.get("enable_delivery") === "true",
		enable_pickup: formData.get("enable_pickup") === "true",
		delivery_fee: parseFloat(formData.get("delivery_fee") as string) || 0,
		minimum_order: parseFloat(formData.get("minimum_order") as string) || 0,
		tax_rate: parseFloat(formData.get("tax_rate") as string) || 0,
	};

	const { data, error } = await supabase
		.from("settings")
		.update(settingsData)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/settings");
	revalidatePath("/");
	return { success: true, data };
}

export async function updateBusinessHours(businessHours: any) {
	const supabase = await createSupabaseServer();

	const { data, error } = await supabase
		.from("settings")
		.update({ business_hours: businessHours })
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/settings");
	return { success: true, data };
}
