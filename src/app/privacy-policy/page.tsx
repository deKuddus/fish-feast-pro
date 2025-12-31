import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";

async function getPrivacyPolicy() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("settings")
		.select("privacy_policy")
		.eq("id", "00000000-0000-0000-0000-000000000001")
		.single();

	return data?.privacy_policy || "";
}

export default async function PrivacyPolicyPage() {
	const content = await getPrivacyPolicy();

	return (
		<main className="container py-8 flex-1">
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">Privacy Policy</CardTitle>
				</CardHeader>
				<CardContent className="prose prose-sm max-w-none">
					{content ? (
						<div className="whitespace-pre-wrap">{content}</div>
					) : (
						<p className="text-muted-foreground">
							No privacy policy content available. Please contact the
							administrator.
						</p>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
