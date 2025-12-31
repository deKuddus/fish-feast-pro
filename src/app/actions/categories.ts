"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
	const supabase = await createSupabaseServer();

	const categoryData = {
		name: formData.get("name") as string,
		description: formData.get("description") as string,
		display_order: parseInt(formData.get("display_order") as string) || 0,
	};

	const { data, error } = await supabase
		.from("categories")
		.insert(categoryData)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/categories");
	revalidatePath("/");
	return { success: true, data };
}

export async function updateCategory(categoryId: string, formData: FormData) {
	const supabase = await createSupabaseServer();

	const categoryData = {
		name: formData.get("name") as string,
		description: formData.get("description") as string,
		display_order: parseInt(formData.get("display_order") as string) || 0,
	};

	const { data, error } = await supabase
		.from("categories")
		.update(categoryData)
		.eq("id", categoryId)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/categories");
	revalidatePath("/");
	return { success: true, data };
}

export async function deleteCategory(categoryId: string) {
	const supabase = await createSupabaseServer();

	const { error } = await supabase
		.from("categories")
		.delete()
		.eq("id", categoryId);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/categories");
	revalidatePath("/");
	return { success: true };
}
