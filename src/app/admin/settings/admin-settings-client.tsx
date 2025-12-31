"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { updateSettings } from "../products/actions";

interface OpeningHours {
	monday: string;
	tuesday: string;
	wednesday: string;
	thursday: string;
	friday: string;
	saturday: string;
	sunday: string;
}

interface SettingsClientProps {
	initialSettings: Record<string, string>;
}

export function AdminSettingsClient({ initialSettings }: SettingsClientProps) {
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	// Parse opening hours from settings or use defaults
	const parseOpeningHours = (): OpeningHours => {
		try {
			const hoursStr = initialSettings.opening_hours;
			if (hoursStr) {
				return JSON.parse(hoursStr);
			}
		} catch (e) {
			console.error("Error parsing opening hours:", e);
		}
		return {
			monday: "10:00-22:00",
			tuesday: "10:00-22:00",
			wednesday: "10:00-22:00",
			thursday: "10:00-22:00",
			friday: "10:00-23:00",
			saturday: "10:00-23:00",
			sunday: "11:00-21:00",
		};
	};

	const [settings, setSettings] = useState({
		shop_name: initialSettings.shop_name || "",
		phone: initialSettings.phone || "",
		opening_hours: parseOpeningHours(),
		privacy_policy: initialSettings.privacy_policy || "",
		cookie_policy: initialSettings.cookie_policy || "",
	});

	const handleSaveSettings = async () => {
		startTransition(() => {
			const formData = new FormData();
			formData.append("shop_name", settings.shop_name);
			formData.append("phone", settings.phone);
			formData.append("opening_hours", JSON.stringify(settings.opening_hours));
			formData.append("privacy_policy", settings.privacy_policy);
			formData.append("cookie_policy", settings.cookie_policy);

			updateSettings(formData).then((result) => {
				if (result.error) {
					toast({
						title: "Error",
						description: result.error,
						variant: "destructive",
					});
				} else {
					toast({
						title: "Success",
						description: "Settings saved successfully",
					});
				}
			});
		});
	};

	const daysOfWeek = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">Settings</h2>
				<Button onClick={handleSaveSettings} disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Settings"
					)}
				</Button>
			</div>

			<div className="grid gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="shop_name">Shop Name</Label>
							<Input
								id="shop_name"
								value={settings.shop_name}
								onChange={(e) =>
									setSettings((s) => ({ ...s, shop_name: e.target.value }))
								}
								placeholder="Fish Feast Pro"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								type="tel"
								value={settings.phone}
								onChange={(e) =>
									setSettings((s) => ({ ...s, phone: e.target.value }))
								}
								placeholder="+44 20 1234 5678"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Opening Hours */}
				<Card>
					<CardHeader>
						<CardTitle>Opening Hours</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{daysOfWeek.map((day) => (
							<div key={day} className="flex items-center gap-4">
								<Label className="w-32 capitalize">{day}</Label>
								<Input
									value={settings.opening_hours[day as keyof OpeningHours]}
									onChange={(e) =>
										setSettings((s) => ({
											...s,
											opening_hours: {
												...s.opening_hours,
												[day]: e.target.value,
											},
										}))
									}
									placeholder="10:00-22:00"
									className="flex-1"
								/>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Privacy Policy */}
				<Card>
					<CardHeader>
						<CardTitle>Privacy Policy</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							value={settings.privacy_policy}
							onChange={(e) =>
								setSettings((s) => ({ ...s, privacy_policy: e.target.value }))
							}
							placeholder="Enter your privacy policy content..."
							rows={10}
							className="font-mono text-sm"
						/>
					</CardContent>
				</Card>

				{/* Cookie Policy */}
				<Card>
					<CardHeader>
						<CardTitle>Cookie Policy</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							value={settings.cookie_policy}
							onChange={(e) =>
								setSettings((s) => ({ ...s, cookie_policy: e.target.value }))
							}
							placeholder="Enter your cookie policy content..."
							rows={10}
							className="font-mono text-sm"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
