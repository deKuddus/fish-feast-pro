import { getAllCategories } from "@/lib/data/categories";
import { AdminCategoriesClient } from "./admin-categories-client";

export default async function AdminCategoriesPage() {
	const categories = await getAllCategories();

	return <AdminCategoriesClient initialCategories={categories || []} />;
}
