import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";

async function getTermsOfUse() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("settings")
		.select("privacy_policy")
		.eq("id", "00000000-0000-0000-0000-000000000001")
		.single();

	return data?.privacy_policy || "";
}

export default async function TermsOfUsePage() {
	const content = await getTermsOfUse();

	return (
		<main className="container py-8 flex-1">
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">Terms of Use</CardTitle>
				</CardHeader>
				<CardContent className="prose prose-sm max-w-none">
					{content ? (
						<div className="whitespace-pre-wrap">{content}</div>
					) : (
						<p className="text-muted-foreground">
							No terms of use content available. Please contact the
							administrator.
						</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
