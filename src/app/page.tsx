import { getAllCategories } from "@/lib/data/categories";
import { getAllProducts } from "@/lib/data/products";
import HomeClient from "./home-client";

export default async function HomePage() {
	const [products, categories] = await Promise.all([
		getAllProducts(),
		getAllCategories(),
	]);

	return (
		<HomeClient
			initialProducts={products || []}
			initialCategories={categories || []}
		/>
	);
}
