import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";

async function getCookiePolicy() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("settings")
		.select("cookie_policy")
		.eq("id", "00000000-0000-0000-0000-000000000001")
		.single();

	return ((data as any)?.cookie_policy as string) || "";
}

export default async function AboutCookiePage() {
	const content = await getCookiePolicy();

	return (
		<main className="container py-8 flex-1">
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">About Cookie</CardTitle>
				</CardHeader>
				<CardContent className="prose prose-sm max-w-none">
					{content ? (
						<div className="whitespace-pre-wrap">{content}</div>
					) : (
						<p className="text-muted-foreground">
							No cookie policy content available. Please contact the
							administrator.
						</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
