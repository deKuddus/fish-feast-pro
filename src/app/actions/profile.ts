"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { error: "Not authenticated" };
		}

		const profileData = {
			full_name: formData.get("full_name") as string,
			phone: formData.get("phone") as string,
		};

		const { error } = await supabase
			.from("profiles")
			.update(profileData)
			.eq("id", user.id);

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/profile");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update profile" };
	}
}
