"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkUserIsAdmin, getCurrentUser } from "./auth";

export async function updateUserRole(userId: string, role: "admin" | "user") {
	const supabase = await createSupabaseServer();
	const currentUser = await getCurrentUser();

	if (!currentUser) {
		return { success: false, error: "Unauthorized" };
	}

	const isAdmin = await checkUserIsAdmin(currentUser.id);
	if (!isAdmin) {
		return { success: false, error: "Only admins can update user roles" };
	}

	const { data, error } = await supabase
		.from("user_roles")
		.upsert({ user_id: userId, role })
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/users");
	return { success: true, data };
}

export async function updateUserProfile(formData: FormData) {
	const supabase = await createSupabaseServer();
	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "Unauthorized" };
	}

	const profileData = {
		full_name: formData.get("full_name") as string,
		phone: formData.get("phone") as string,
		address: formData.get("address") as string,
	};

	const { data, error } = await supabase
		.from("profiles")
		.update(profileData)
		.eq("id", user.id)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/profile");
	return { success: true, data };
}

export async function deleteUser(userId: string) {
	const supabase = await createSupabaseServer();
	const currentUser = await getCurrentUser();

	if (!currentUser) {
		return { success: false, error: "Unauthorized" };
	}

	const isAdmin = await checkUserIsAdmin(currentUser.id);
	if (!isAdmin) {
		return { success: false, error: "Only admins can delete users" };
	}

	const { error } = await supabase.from("profiles").delete().eq("id", userId);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/users");
	return { success: true };
}
