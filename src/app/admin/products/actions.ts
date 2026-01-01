"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper function to parse database errors into user-friendly messages
function parseDbError(error: any): string {
	const errorMessage = error?.message || "";
	const errorCode = error?.code;

	// Handle unique constraint violations
	if (errorCode === "23505" || errorMessage.includes("duplicate key")) {
		if (errorMessage.includes("categories_name_unique")) {
			return "A category with this name already exists";
		}
		if (errorMessage.includes("categories_slug_key")) {
			return "A category with this URL slug already exists";
		}
		if (errorMessage.includes("products")) {
			return "A product with this name already exists";
		}
		return "This entry already exists in the database";
	}

	// Handle foreign key violations
	if (errorCode === "23503" || errorMessage.includes("foreign key")) {
		return "Cannot delete this item as it is being used elsewhere";
	}

	// Handle not null violations
	if (errorCode === "23502" || errorMessage.includes("null value")) {
		return "Required field is missing";
	}

	// Return original message if no specific match
	return errorMessage || "An unexpected error occurred";
}

export async function createProduct(formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const productData = {
			name: formData.get("name") as string,
			description: (formData.get("description") as string) || null,
			price: parseFloat(formData.get("price") as string),
			category_id: (formData.get("category_id") as string) || null,
			is_available: formData.get("is_available") === "true",
			delivery_available: formData.get("delivery_available") === "true",
			pickup_available: formData.get("pickup_available") === "true",
			is_popular: formData.get("is_popular") === "true",
		};

		// Check if product name already exists
		const { data: existingProducts } = await supabase
			.from("products")
			.select("id")
			.eq("name", productData.name)
			.limit(1);

		if (existingProducts && existingProducts.length > 0) {
			return { error: "A product with this name already exists" };
		}

		const { error } = await supabase.from("products").insert(productData);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to create product" };
	}
}

export async function updateProduct(productId: string, formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const productData = {
			name: formData.get("name") as string,
			description: (formData.get("description") as string) || null,
			price: parseFloat(formData.get("price") as string),
			category_id: (formData.get("category_id") as string) || null,
			is_available: formData.get("is_available") === "true",
			delivery_available: formData.get("delivery_available") === "true",
			pickup_available: formData.get("pickup_available") === "true",
			is_popular: formData.get("is_popular") === "true",
		};

		// Check if product name already exists (excluding current product)
		const { data: existingProducts } = await supabase
			.from("products")
			.select("id")
			.eq("name", productData.name)
			.neq("id", productId)
			.limit(1);

		if (existingProducts && existingProducts.length > 0) {
			return { error: "A product with this name already exists" };
		}

		const { error } = await supabase
			.from("products")
			.update(productData)
			.eq("id", productId);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update product" };
	}
}

export async function deleteProduct(productId: string) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("products")
			.delete()
			.eq("id", productId);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/products");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to delete product" };
	}
}

export async function createCategory(formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const categoryData = {
			name: formData.get("name") as string,
			slug: (formData.get("slug") as string) || null,
			icon: (formData.get("icon") as string) || null,
			sort_order: parseInt(formData.get("sort_order") as string) || 0,
		};

		// Check if category name already exists
		const { data: existingByName } = await supabase
			.from("categories")
			.select("id")
			.eq("name", categoryData.name)
			.limit(1);

		if (existingByName && existingByName.length > 0) {
			return { error: "A category with this name already exists" };
		}

		// Check if slug already exists
		if (categoryData.slug) {
			const { data: existingBySlug } = await supabase
				.from("categories")
				.select("id")
				.eq("slug", categoryData.slug)
				.limit(1);

			if (existingBySlug && existingBySlug.length > 0) {
				return { error: "A category with this URL slug already exists" };
			}
		}

		const { error } = await supabase.from("categories").insert(categoryData);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/categories");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to create category" };
	}
}

export async function updateCategory(categoryId: string, formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const categoryData = {
			name: formData.get("name") as string,
			slug: (formData.get("slug") as string) || null,
			icon: (formData.get("icon") as string) || null,
			sort_order: parseInt(formData.get("sort_order") as string) || 0,
		};

		// Check if category name already exists (excluding current category)
		const { data: existingByName } = await supabase
			.from("categories")
			.select("id")
			.eq("name", categoryData.name)
			.neq("id", categoryId)
			.limit(1);

		if (existingByName && existingByName.length > 0) {
			return { error: "A category with this name already exists" };
		}

		// Check if slug already exists (excluding current category)
		if (categoryData.slug) {
			const { data: existingBySlug } = await supabase
				.from("categories")
				.select("id")
				.eq("slug", categoryData.slug)
				.neq("id", categoryId)
				.limit(1);

			if (existingBySlug && existingBySlug.length > 0) {
				return { error: "A category with this URL slug already exists" };
			}
		}

		const { error } = await supabase
			.from("categories")
			.update(categoryData)
			.eq("id", categoryId);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/categories");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update category" };
	}
}

export async function deleteCategory(categoryId: string) {
	try {
		const supabase = await createSupabaseServer();

		const { error } = await supabase
			.from("categories")
			.delete()
			.eq("id", categoryId);

		if (error) {
			return { error: parseDbError(error) };
		}

		revalidatePath("/admin/categories");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to delete category" };
	}
}

export async function updateSettings(formData: FormData) {
	try {
		const supabase = await createSupabaseServer();

		const settingsData = {
			shop_name: formData.get("shop_name") as string,
			phone: formData.get("phone") as string,
			address_line1: formData.get("address_line1") as string,
			address_line2: formData.get("address_line2") as string,
			city: formData.get("city") as string,
			postcode: formData.get("postcode") as string,
			email: formData.get("email") as string,
			delivery_time_minutes: parseInt(
				formData.get("delivery_time_minutes") as string
			),
			opens_at: formData.get("opens_at") as string,
			opening_hours: JSON.parse(
				(formData.get("opening_hours") as string) || "{}"
			),
			privacy_policy: formData.get("privacy_policy") as string,
			cookie_policy: formData.get("cookie_policy") as string,
			email_notifications_enabled:
				formData.get("email_notifications_enabled") === "true",
			email_verification_required:
				formData.get("email_verification_required") === "true",
			allow_order_cancellation:
				formData.get("allow_order_cancellation") === "true",
			notification_email: formData.get("notification_email") as string,
			updated_at: new Date().toISOString(),
		};

		const { error } = await supabase
			.from("settings")
			.update(settingsData)
			.eq("id", "00000000-0000-0000-0000-000000000001");

		if (error) {
			return { error: error.message };
		}

		revalidatePath("/admin/settings");
		return { success: true };
	} catch (error: any) {
		return { error: error.message || "Failed to update settings" };
	}
}
