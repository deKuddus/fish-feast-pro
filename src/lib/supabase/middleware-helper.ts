import type { Database } from "@/integrations/supabase/types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(
					cookiesToSet: {
						name: string;
						value: string;
						options: CookieOptions;
					}[]
				) {
					try {
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value)
						);
						supabaseResponse = NextResponse.next({
							request,
						});
						cookiesToSet.forEach(({ name, value, options }) =>
							supabaseResponse.cookies.set(name, value, options)
						);
					} catch (error) {
						// Ignore cookie errors in middleware - they'll be set in the route handler
					}
				},
			},
		}
	);

	// Allow auth callback to proceed without user check
	if (request.nextUrl.pathname === "/auth/callback") {
		return supabaseResponse;
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (
		!user &&
		request.nextUrl.pathname.startsWith("/admin") &&
		!request.nextUrl.pathname.startsWith("/auth")
	) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth";
		return NextResponse.redirect(url);
	}

	if (
		!user &&
		(request.nextUrl.pathname.startsWith("/checkout") ||
			request.nextUrl.pathname.startsWith("/orders") ||
			request.nextUrl.pathname.startsWith("/profile"))
	) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth";
		return NextResponse.redirect(url);
	}

	if (user && request.nextUrl.pathname === "/auth") {
		const url = request.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
