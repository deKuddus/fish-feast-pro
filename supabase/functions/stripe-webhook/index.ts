import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const logStep = (step: string, details?: any) => {
	const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
	console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
	const signature = req.headers.get("stripe-signature");
	const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
	const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

	if (!stripeKey) {
		logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
		return new Response(
			JSON.stringify({ error: "Server configuration error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (!webhookSecret) {
		logStep("ERROR", { message: "STRIPE_WEBHOOK_SECRET not set" });
		return new Response(
			JSON.stringify({ error: "Server configuration error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	if (!signature) {
		logStep("ERROR", { message: "No signature provided" });
		return new Response(JSON.stringify({ error: "No signature" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
	const supabaseClient = createClient(
		Deno.env.get("SUPABASE_URL") ?? "",
		Deno.env.get("SUPABASE_ANON_KEY") ?? ""
	);

	try {
		const body = await req.text();
		const event = stripe.webhooks.constructEvent(
			body,
			signature,
			webhookSecret
		);

		logStep("Event received", { type: event.type, id: event.id });

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = session.metadata?.order_id;

				if (!orderId) {
					logStep("WARNING", { message: "No order_id in metadata" });
					break;
				}

				logStep("Checkout completed", { orderId, sessionId: session.id });

				// Update order payment status
				const { error: updateError } = await supabaseClient
					.from("orders")
					.update({
						payment_status: "paid",
						stripe_payment_intent_id: session.payment_intent as string,
						status: "confirmed",
					})
					.eq("id", orderId);

				if (updateError) {
					logStep("ERROR updating order", { orderId, error: updateError });
					throw updateError;
				}

				logStep("Order updated successfully", { orderId });
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				const orderId = session.metadata?.order_id;

				if (orderId) {
					logStep("Checkout expired", { orderId, sessionId: session.id });

					// Mark order as cancelled
					const { error: updateError } = await supabaseClient
						.from("orders")
						.update({
							payment_status: "failed",
							status: "cancelled",
						})
						.eq("id", orderId);

					if (updateError) {
						logStep("ERROR updating expired order", {
							orderId,
							error: updateError,
						});
					}
				}
				break;
			}

			case "payment_intent.succeeded": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				logStep("Payment succeeded", { paymentIntentId: paymentIntent.id });
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				logStep("Payment failed", { paymentIntentId: paymentIntent.id });

				// Find order by payment intent and mark as failed
				const { data: orders } = await supabaseClient
					.from("orders")
					.select("id")
					.eq("stripe_payment_intent_id", paymentIntent.id);

				if (orders && orders.length > 0) {
					const { error } = await supabaseClient
						.from("orders")
						.update({
							payment_status: "failed",
							status: "cancelled",
						})
						.eq("id", orders[0].id);

					if (error) {
						logStep("ERROR updating failed payment", { error });
					}
				}
				break;
			}

			default:
				logStep("Unhandled event type", { type: event.type });
		}

		return new Response(JSON.stringify({ received: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logStep("ERROR", { message: errorMessage });
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
});
