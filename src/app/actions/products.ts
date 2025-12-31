"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
	const supabase = await createSupabaseServer();

	const productData = {
		name: formData.get("name") as string,
		description: formData.get("description") as string,
		price: parseFloat(formData.get("price") as string),
		category_id: formData.get("category_id") as string,
		image_url: formData.get("image_url") as string,
		is_available: formData.get("is_available") === "true",
	};

	const { data, error } = await supabase
		.from("products")
		.insert(productData)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/products");
	revalidatePath("/");
	return { success: true, data };
}

export async function updateProduct(productId: string, formData: FormData) {
	const supabase = await createSupabaseServer();

	const productData = {
		name: formData.get("name") as string,
		description: formData.get("description") as string,
		price: parseFloat(formData.get("price") as string),
		category_id: formData.get("category_id") as string,
		image_url: formData.get("image_url") as string,
		is_available: formData.get("is_available") === "true",
	};

	const { data, error } = await supabase
		.from("products")
		.update(productData)
		.eq("id", productId)
		.select()
		.single();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/products");
	revalidatePath("/");
	return { success: true, data };
}

export async function deleteProduct(productId: string) {
	const supabase = await createSupabaseServer();

	const { error } = await supabase
		.from("products")
		.delete()
		.eq("id", productId);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/products");
	revalidatePath("/");
	return { success: true };
}

export async function toggleProductAvailability(
	productId: string,
	isAvailable: boolean
) {
	const supabase = await createSupabaseServer();

	const { error } = await supabase
		.from("products")
		.update({ is_available: isAvailable })
		.eq("id", productId);

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/admin/products");
	revalidatePath("/");
	return { success: true };
}
