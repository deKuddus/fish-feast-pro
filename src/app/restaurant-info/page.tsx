import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

interface OpeningHours {
	monday: string;
	tuesday: string;
	wednesday: string;
	thursday: string;
	friday: string;
	saturday: string;
	sunday: string;
}

async function getRestaurantInfo() {
	const supabase = await createSupabaseServer();
	const { data } = await supabase
		.from("settings")
		.select("shop_name, phone, opening_hours")
		.eq("id", "00000000-0000-0000-0000-000000000001")
		.single();

	return {
		shopName: data?.shop_name || "Fish Feast Pro",
		phone: data?.phone || "",
		openingHours: (data?.opening_hours as OpeningHours) || null,
	};
}

export default async function RestaurantInfoPage() {
	const { shopName, phone, openingHours } = await getRestaurantInfo();

	const formatOpeningHours = () => {
		if (!openingHours) return [];
		return Object.entries(openingHours).map(([day, hours]) => ({
			day: day.charAt(0).toUpperCase() + day.slice(1),
			hours: hours as string,
		}));
	};

	return (
		<main className="container py-8 flex-1">
			<h1 className="text-3xl font-bold mb-8">Restaurant Information</h1>

			<div className="grid md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-primary" />
							Location
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg font-medium">{shopName}</p>
						<p className="text-muted-foreground">808 London Rd</p>
						<p className="text-muted-foreground">Leigh-on-Sea</p>
						<p className="text-muted-foreground">Southend-on-Sea, SS9 3LB</p>
						<div className="mt-4 h-48 bg-secondary rounded-lg flex items-center justify-center">
							<span className="text-muted-foreground">Map placeholder</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-primary" />
							Opening Hours
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{formatOpeningHours().map(({ day, hours }) => (
								<div key={day} className="flex justify-between">
									<span className="text-muted-foreground">{day}</span>
									<span className="font-medium">{hours}</span>
								</div>
							))}
							{formatOpeningHours().length === 0 && (
								<p className="text-muted-foreground">
									Opening hours not available
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Phone className="h-5 w-5 text-primary" />
							Contact
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Phone</p>
								{phone ? (
									<a
										href={`tel:${phone}`}
										className="text-primary hover:underline"
									>
										{phone}
									</a>
								) : (
									<p className="text-muted-foreground">Not available</p>
								)}
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">Email</p>
								<a
									href="mailto:info@fishfeastpro.com"
									className="text-primary hover:underline"
								>
									info@fishfeastpro.com
								</a>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5 text-primary" />
							Get In Touch
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Have questions? We'd love to hear from you. Contact us through any
							of the methods above and we'll get back to you as soon as
							possible.
						</p>
						<div className="space-y-2 text-sm">
							<p>
								<strong>Delivery Service:</strong> Available
							</p>
							<p>
								<strong>Collection Service:</strong> Available
							</p>
							<p>
								<strong>Payment Methods:</strong> Card, Cash
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
