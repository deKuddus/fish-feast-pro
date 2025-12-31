import { getCurrentUser } from "@/app/actions/auth";
import { getUserProfile } from "@/lib/data/users";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth");
	}

	const profile = await getUserProfile(user.id);

	return (
		<main className="flex-1 container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">My Profile</h1>
			<ProfileClient user={user} profile={profile} />
		</main>
	);
}
