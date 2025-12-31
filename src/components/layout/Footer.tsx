"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
	const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
	const [cookiePreferences, setCookiePreferences] = useState({
		necessary: true,
		analytics: false,
		marketing: false,
	});

	useEffect(() => {
		// Load saved cookie preferences
		const saved = localStorage.getItem("cookiePreferences");
		if (saved) {
			setCookiePreferences(JSON.parse(saved));
		}
	}, []);

	const saveCookiePreferences = () => {
		localStorage.setItem(
			"cookiePreferences",
			JSON.stringify(cookiePreferences)
		);
		setCookieDialogOpen(false);
	};

	return (
		<footer className="bg-card border-t mt-auto">
			<div className="container py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
					{/* About Section */}
					<div>
						<h3 className="font-bold text-lg mb-4">Fish Feast Pro</h3>
						<p className="text-sm text-muted-foreground">
							Your favorite fish and chips, now online. Fresh, delicious, and
							delivered to your door.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/"
									className="text-muted-foreground hover:text-primary"
								>
									Menu
								</Link>
							</li>
							<li>
								<Link
									href="/orders"
									className="text-muted-foreground hover:text-primary"
								>
									My Orders
								</Link>
							</li>
							<li>
								<Link
									href="/cart"
									className="text-muted-foreground hover:text-primary"
								>
									Cart
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className="font-semibold mb-4">Legal</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/privacy-policy"
									className="text-muted-foreground hover:text-primary"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms-of-use"
									className="text-muted-foreground hover:text-primary"
								>
									Terms of Use
								</Link>
							</li>
							<li>
								<Link
									href="/about-cookie"
									className="text-muted-foreground hover:text-primary"
								>
									About Cookie
								</Link>
							</li>
						</ul>
					</div>

					{/* Cookie Settings */}
					<div>
						<h4 className="font-semibold mb-4">Privacy</h4>
						<Dialog open={cookieDialogOpen} onOpenChange={setCookieDialogOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									Cookie Settings
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Cookie Settings</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="necessary">Necessary Cookies</Label>
											<p className="text-xs text-muted-foreground">
												Required for the website to function properly
											</p>
										</div>
										<Switch
											id="necessary"
											checked={cookiePreferences.necessary}
											disabled
										/>
									</div>
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="analytics">Analytics Cookies</Label>
											<p className="text-xs text-muted-foreground">
												Help us improve by collecting usage data
											</p>
										</div>
										<Switch
											id="analytics"
											checked={cookiePreferences.analytics}
											onCheckedChange={(checked) =>
												setCookiePreferences((prev) => ({
													...prev,
													analytics: checked,
												}))
											}
										/>
									</div>
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="marketing">Marketing Cookies</Label>
											<p className="text-xs text-muted-foreground">
												Personalize ads and offers for you
											</p>
										</div>
										<Switch
											id="marketing"
											checked={cookiePreferences.marketing}
											onCheckedChange={(checked) =>
												setCookiePreferences((prev) => ({
													...prev,
													marketing: checked,
												}))
											}
										/>
									</div>
									<Button onClick={saveCookiePreferences} className="w-full">
										Save Preferences
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t pt-6 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} Fish Feast Pro. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
