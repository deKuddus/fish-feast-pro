import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Suspense } from "react";
import { AdminSettingsClient } from "./admin-settings-client";

function AdminSettingsSkeleton() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton className="h-10 w-[200px] mb-2" />
				<Skeleton className="h-4 w-[300px]" />
			</div>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-[150px]" />
				</CardHeader>
				<CardContent className="space-y-4">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-4 w-[120px]" />
							<Skeleton className="h-10 w-full" />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

async function getSettings() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("settings")
		.select("*")
		.eq("id", "00000000-0000-0000-0000-000000000001")
		.single();

	if (!data) {
		return {
			shop_name: "",
			phone: "",
			opening_hours: "{}",
			privacy_policy: "",
			cookie_policy: "",
			email_notifications_enabled: false,
			email_verification_required: false,
			allow_order_cancellation: true,
			notification_email: "",
		};
	}

	return {
		shop_name: data.shop_name || "",
		phone: data.phone || "",
		opening_hours:
			typeof data.opening_hours === "string"
				? data.opening_hours
				: JSON.stringify(data.opening_hours || {}),
		privacy_policy: data.privacy_policy || "",
		cookie_policy: data.cookie_policy || "",
		email_notifications_enabled: data.email_notifications_enabled ?? false,
		email_verification_required: data.email_verification_required ?? false,
		allow_order_cancellation: data.allow_order_cancellation ?? true,
		notification_email: data.notification_email || "",
	};
}

async function AdminSettingsContent() {
	const settings = await getSettings();

	return <AdminSettingsClient initialSettings={settings} />;
}

export default function AdminSettingsPage() {
	return (
		<Suspense fallback={<AdminSettingsSkeleton />}>
			<AdminSettingsContent />
		</Suspense>
	);
}
