import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		console.log(" auth code found in callback");
		const supabase = await createSupabaseServer();
		const { data: sessionData, error: sessionError } =
			await supabase.auth.exchangeCodeForSession(code);

		if (sessionError) {
			console.error("Session exchange error:", sessionError);
		} else {
			console.log(
				"Session created successfully for user:",
				sessionData?.user?.email
			);
		}

		if (!sessionError && sessionData?.user) {
			const user = sessionData.user;

			// Check if profile exists
			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", user.id)
				.single();

			// Create profile if it doesn't exist (for OAuth users)
			if (!existingProfile) {
				console.log("Creating new profile for user:", user.email);
				// Insert profile
				await supabase.from("profiles").insert({
					id: user.id,
					email: user.email,
					full_name:
						user.user_metadata?.full_name || user.user_metadata?.name || null,
				});

				// Insert default user role
				await supabase.from("user_roles").insert({
					user_id: user.id,
					role: "user",
				});
			} else {
				console.log("Profile already exists for user:", user.email);
			}
		}
	} else {
		console.log("No auth code found in callback");
	}

	// Revalidate the layout to refresh auth state
	revalidatePath("/", "layout");

	console.log("Redirecting to home page");
	return NextResponse.redirect(new URL("/", requestUrl.origin));
}
