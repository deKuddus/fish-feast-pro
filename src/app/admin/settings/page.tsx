import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminSettingsClient } from "./admin-settings-client";

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
	};
}

export default async function AdminSettingsPage() {
	const settings = await getSettings();

	return <AdminSettingsClient initialSettings={settings} />;
}
