import { createSupabaseServer } from "@/lib/supabase/server";

export async function getRestaurantSettings() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase.from("settings").select("*").single();

	if (error) throw error;
	return data;
}

export async function getBusinessHours() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("settings")
		.select("business_hours")
		.single();

	if (error) throw error;
	return data?.business_hours;
}

export async function isDeliveryAvailable() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("settings")
		.select("enable_delivery")
		.single();

	if (error) return false;
	return data?.enable_delivery ?? true;
}

export async function isPickupAvailable() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("settings")
		.select("enable_pickup")
		.single();

	if (error) return false;
	return data?.enable_pickup ?? true;
}

// Alias for compatibility
export const getSettings = getRestaurantSettings;
