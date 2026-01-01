import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { getAllUsers } from "@/lib/data/users";
import { Suspense } from "react";
import { AdminUsersClient } from "./admin-users-client";

async function AdminUsersContent() {
	const users = await getAllUsers();

	return (
		<AdminUsersClient
			initialUsers={users || []}
			initialTotal={users?.length || 0}
		/>
	);
}

export default function AdminUsersPage() {
	return (
		<Suspense fallback={<AdminTableSkeleton rows={10} />}>
			<AdminUsersContent />
		</Suspense>
	);
}
