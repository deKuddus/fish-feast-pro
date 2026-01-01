import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { getAllCategories } from "@/lib/data/categories";
import { Suspense } from "react";
import { AdminCategoriesClient } from "./admin-categories-client";

async function AdminCategoriesContent() {
	const categories = await getAllCategories();

	return <AdminCategoriesClient initialCategories={categories || []} />;
}

export default function AdminCategoriesPage() {
	return (
		<Suspense fallback={<AdminTableSkeleton />}>
			<AdminCategoriesContent />
		</Suspense>
	);
}
