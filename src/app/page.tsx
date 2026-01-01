import { getAllCategories } from "@/lib/data/categories";
import { getAllProducts } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import HomeClient from "./home-client";

export default async function HomePage() {
	const [products, categories, settings] = await Promise.all([
		getAllProducts(),
		getAllCategories(),
		getSettings(),
	]);

	return (
		<HomeClient
			initialProducts={products || []}
			initialCategories={categories || []}
			settings={settings}
		/>
	);
}
