"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function CheckoutSuccessContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");

	const [status, setStatus] = useState<"processing" | "success" | "error">(
		"processing"
	);
	const [orderId, setOrderId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) {
			setStatus("error");
			setError("No session ID provided");
			return;
		}

		// Process the checkout session
		async function processCheckout() {
			try {
				const response = await fetch("/api/checkout/process", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ sessionId }),
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || "Failed to process order");
				}

				const data = await response.json();
				setOrderId(data.orderId);
				setStatus("success");

				// Redirect to order details after 2 seconds
				setTimeout(() => {
					router.push(`/orders/${data.orderId}`);
				}, 2000);
			} catch (err: any) {
				console.error("Error processing checkout:", err);
				setStatus("error");
				setError(err.message);
			}
		}

		processCheckout();
	}, [sessionId, router]);

	if (status === "processing") {
		return (
			<div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin" />
							Processing Payment
						</CardTitle>
						<CardDescription>
							Please wait while we confirm your order...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-destructive">Payment Error</CardTitle>
						<CardDescription>{error || "Something went wrong"}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => router.push("/checkout")} className="w-full">
							Back to Checkout
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-green-600">
						<CheckCircle2 className="h-6 w-6" />
						Payment Successful!
					</CardTitle>
					<CardDescription>
						Your order has been placed successfully
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Redirecting to your order details...
					</p>
					{orderId && (
						<Button
							onClick={() => router.push(`/orders/${orderId}`)}
							className="w-full"
						>
							View Order
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Loader2 className="h-6 w-6 animate-spin" />
								Loading...
							</CardTitle>
						</CardHeader>
					</Card>
				</div>
			}
		>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
