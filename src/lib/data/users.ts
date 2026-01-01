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

	// Fetch all profiles
	const { data: profiles, error: profilesError } = await supabase
		.from("profiles")
		.select("*")
		.order("created_at", { ascending: false });

	if (profilesError) throw profilesError;

	// Fetch all user roles
	const { data: userRoles, error: rolesError } = await supabase
		.from("user_roles")
		.select("user_id, role");

	if (rolesError) throw rolesError;

	// Create a map of user roles for quick lookup
	const rolesMap = new Map(
		userRoles?.map((ur: any) => [ur.user_id, ur.role]) || []
	);

	// Merge profiles with their roles
	return profiles?.map((user: any) => ({
		...user,
		role: rolesMap.get(user.id) || "user",
	}));
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
