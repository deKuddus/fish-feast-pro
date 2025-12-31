import { getAllUsers } from "@/lib/data/users";
import { AdminUsersClient } from "./admin-users-client";

export default async function AdminUsersPage() {
	const users = await getAllUsers();

	return (
		<AdminUsersClient
			initialUsers={users || []}
			initialTotal={users?.length || 0}
		/>
	);
}
