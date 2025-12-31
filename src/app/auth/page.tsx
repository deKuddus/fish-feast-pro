"use client";

import {
	signInWithEmail,
	signInWithGoogle,
	signUpWithEmail,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { refreshUser } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await signInWithEmail(formData);

		if (result?.error) {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
			setIsLoading(false);
		} else {
			// Refresh the auth context to update the header
			await refreshUser();
			toast({
				title: "Success",
				description: "Signed in successfully",
			});
			// Small delay to ensure state updates propagate
			setTimeout(() => router.push("/"), 100);
		}
	};

	const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await signUpWithEmail(formData);

		setIsLoading(false);

		if (result.error) {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
		} else {
			toast({
				title: "Success",
				description: "Account created! Please check your email to verify.",
			});
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		await signInWithGoogle();
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome to Fish Feast Pro</CardTitle>
					<CardDescription>
						Sign in to your account or create a new one
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="signin" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<form onSubmit={handleSignIn} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="signin-email">Email</Label>
									<Input
										id="signin-email"
										name="email"
										type="email"
										placeholder="you@example.com"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signin-password">Password</Label>
									<Input
										id="signin-password"
										name="password"
										type="password"
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Sign In
								</Button>
							</form>

							<div className="relative my-4">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>

							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={handleGoogleSignIn}
								disabled={isLoading}
							>
								Google
							</Button>
						</TabsContent>

						<TabsContent value="signup">
							<form onSubmit={handleSignUp} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="signup-name">Full Name</Label>
									<Input
										id="signup-name"
										name="fullName"
										placeholder="John Doe"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signup-email">Email</Label>
									<Input
										id="signup-email"
										name="email"
										type="email"
										placeholder="you@example.com"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="signup-password">Password</Label>
									<Input
										id="signup-password"
										name="password"
										type="password"
										required
										minLength={6}
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Create Account
								</Button>
							</form>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
