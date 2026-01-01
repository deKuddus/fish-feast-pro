import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Suspense } from "react";
import { AdminProductsClient } from "./admin-products-client";

async function getProductsData() {
	const supabase = await createSupabaseServer();

	const [productsRes, categoriesRes] = await Promise.all([
		supabase
			.from("products")
			.select("*, categories(name)")
			.order("created_at", { ascending: false }),
		supabase
			.from("categories")
			.select("*")
			.order("created_at", { ascending: false }),
	]);

	return {
		products: productsRes.data || [],
		categories: categoriesRes.data || [],
	};
}

async function AdminProductsContent() {
	const { products, categories } = await getProductsData();

	return (
		<AdminProductsClient
			initialProducts={products}
			initialCategories={categories}
			initialTotal={products.length}
		/>
	);
}

export default function AdminProductsPage() {
	return (
		<Suspense fallback={<AdminTableSkeleton rows={10} />}>
			<AdminProductsContent />
		</Suspense>
	);
}
