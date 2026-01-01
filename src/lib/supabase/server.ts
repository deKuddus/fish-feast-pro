import type { Database } from "@/integrations/supabase/types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer(): Promise<any> {
	const cookieStore = await cookies();

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(
					cookiesToSet: {
						name: string;
						value: string;
						options: CookieOptions;
					}[]
				) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options)
						);
					} catch (error) {
						// Ignore cookie setting errors in contexts where cookies can't be modified
						// This can happen during static generation or when rendering server components
						// The cookies will be set properly in Server Actions or Route Handlers
					}
				},
			},
		}
	);
}
