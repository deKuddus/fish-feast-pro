"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface AuthActionResult {
	success: boolean;
	error?: string;
}

export async function signInWithEmail(
	formData: FormData
): Promise<AuthActionResult> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { success: false, error: "Email and password are required" };
	}

	const supabase = await createSupabaseServer();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/", "layout");
	return { success: true };
}

export async function signUpWithEmail(
	formData: FormData
): Promise<AuthActionResult> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const fullName = formData.get("fullName") as string;

	if (!email || !password) {
		return { success: false, error: "Email and password are required" };
	}

	const supabase = await createSupabaseServer();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: fullName,
			},
			emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
		},
	});

	if (error) {
		return { success: false, error: error.message };
	}

	return { success: true };
}

export async function signInWithGoogle(): Promise<AuthActionResult> {
	const supabase = await createSupabaseServer();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
		},
	});

	if (error) {
		return { success: false, error: error.message };
	}

	if (data.url) {
		redirect(data.url);
	}

	return { success: true };
}

export async function signOutUser() {
	const supabase = await createSupabaseServer();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/auth");
}

export async function getCurrentUser() {
	const supabase = await createSupabaseServer();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}

export async function getCurrentSession() {
	const supabase = await createSupabaseServer();
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}

export async function checkUserIsAdmin(userId: string): Promise<boolean> {
	const supabase = await createSupabaseServer();
	const { data, error } = await supabase
		.from("user_roles")
		.select("role")
		.eq("user_id", userId);

	if (error) {
		console.error("Error checking admin role:", error);
		return false;
	}

	// Check if any of the roles is 'admin' (in case of multiple rows)
	const isAdmin =
		(data as any)?.some((row: any) => row.role === "admin") ?? false;
	return isAdmin;
}
