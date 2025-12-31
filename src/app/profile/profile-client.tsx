"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, User } from "lucide-react";
import { useState, useTransition } from "react";
import { updateProfile } from "../actions/profile";

interface ProfileClientProps {
	user: any;
	profile: any;
}

export function ProfileClient({ user, profile }: ProfileClientProps) {
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();
	const [formData, setFormData] = useState({
		full_name: profile?.full_name || "",
		phone: profile?.phone || "",
	});

	const handleSave = () => {
		startTransition(() => {
			const data = new FormData();
			data.append("full_name", formData.full_name);
			data.append("phone", formData.phone);

			updateProfile(data).then((result) => {
				if (result.error) {
					toast({
						title: "Error",
						description: result.error,
						variant: "destructive",
					});
				} else {
					toast({
						title: "Success",
						description: "Profile updated successfully",
					});
				}
			});
		});
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Mail className="h-4 w-4" />
							Email
						</Label>
						<Input value={user.email || ""} disabled />
						<p className="text-sm text-muted-foreground">
							Email cannot be changed
						</p>
					</div>

					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<User className="h-4 w-4" />
							Full Name
						</Label>
						<Input
							value={formData.full_name}
							onChange={(e) =>
								setFormData((p) => ({ ...p, full_name: e.target.value }))
							}
							placeholder="Enter your full name"
						/>
					</div>

					<div className="space-y-2">
						<Label>Phone Number</Label>
						<Input
							type="tel"
							value={formData.phone}
							onChange={(e) =>
								setFormData((p) => ({ ...p, phone: e.target.value }))
							}
							placeholder="07XXX XXXXXX"
						/>
					</div>

					<Button onClick={handleSave} disabled={isPending} className="w-full">
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
