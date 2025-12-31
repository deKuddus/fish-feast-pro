import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const supabase = await createSupabaseServer();
		await supabase.auth.exchangeCodeForSession(code);
	}

	// Revalidate the layout to refresh auth state
	revalidatePath("/", "layout");

	return NextResponse.redirect(new URL("/", requestUrl.origin));
}
