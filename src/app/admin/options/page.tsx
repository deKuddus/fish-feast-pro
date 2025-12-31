import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminOptionsClient } from "./admin-options-client";

async function getProducts() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("products")
		.select("id, name, categories(name)")
		.order("name");

	// Transform the data to ensure proper type structure
	const products =
		data?.map((product: any) => ({
			id: product.id,
			name: product.name,
			categories: product.categories || null,
		})) || [];

	return products;
}

export default async function AdminOptionsPage() {
	const products = await getProducts();

	return <AdminOptionsClient initialProducts={products} />;
}
