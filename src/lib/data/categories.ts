import { createSupabaseServer } from "@/lib/supabase/server";

export async function getAllCategories() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("categories")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function getCategoryById(categoryId: string) {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("categories")
		.select("*")
		.eq("id", categoryId)
		.single();

	if (error) throw error;
	return data;
}

export async function getCategoriesWithProductCount() {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("categories")
		.select("*, products(count)")
		.order("sort_order", { ascending: true });

	if (error) throw error;
	return data;
}
