import { createSupabaseServer } from "@/lib/supabase/server";

export async function getUserProfile(userId: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) throw error;
	return data;
}

export async function getAllUsers() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getUserRole(userId: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("user_roles")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) return null;
	return data;
}
