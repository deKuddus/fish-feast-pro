import { createSupabaseServer } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
	const body = await request.text();
	const headersList = await headers();
	const signature = headersList.get("stripe-signature")!;

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (error) {
		console.error("Webhook signature verification failed:", error);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const supabase = await createSupabaseServer();

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;

				const orderId = session.metadata?.order_id;

				if (orderId) {
					await supabase
						.from("orders")
						.update({
							payment_status: "paid",
							payment_intent_id: session.payment_intent as string,
						})
						.eq("id", orderId);
				}
				break;
			}

			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				if (paymentIntent.metadata?.order_id) {
					await supabase
						.from("orders")
						.update({ payment_status: "paid" })
						.eq("id", paymentIntent.metadata.order_id);
				}
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;

				if (paymentIntent.metadata?.order_id) {
					await supabase
						.from("orders")
						.update({ payment_status: "failed" })
						.eq("id", paymentIntent.metadata.order_id);
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}
