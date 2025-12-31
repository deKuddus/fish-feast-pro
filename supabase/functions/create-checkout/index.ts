import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

/* ----------------------------------------
   CORS
----------------------------------------- */
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

/* ----------------------------------------
   Logger
----------------------------------------- */
const logStep = (step: string, details?: unknown) => {
	console.log(
		`[CREATE-CHECKOUT] ${step}`,
		details ? JSON.stringify(details) : ""
	);
};

/* ----------------------------------------
   Server
----------------------------------------- */
serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		logStep("Function started");

		/* ----------------------------------------
       ENV CHECK
    ----------------------------------------- */
		const supabaseUrl = Deno.env.get("SUPABASE_URL");
		const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
		const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

		if (!supabaseUrl) throw new Error("SUPABASE_URL is not set");
		if (!supabaseAnonKey) throw new Error("anon key not found is not set");
		if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

		/* ----------------------------------------
       SUPABASE CLIENT (SERVICE ROLE)
    ----------------------------------------- */
		const supabase = createClient(supabaseUrl, supabaseAnonKey, {
			global: {
				headers: { Authorization: req.headers.get("Authorization")! },
			},
		});

		/* ----------------------------------------
       AUTH
    ----------------------------------------- */
		const authHeader = req.headers.get("Authorization");

		if (!authHeader) {
			return new Response(
				JSON.stringify({ error: "Missing Authorization header" }),
				{
					status: 401,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		const token = authHeader.replace("Bearer ", "");

		const { data: authData, error: authError } = await supabase.auth.getUser(
			token
		);

		if (authError || !authData?.user) {
			return new Response(JSON.stringify({ error: "Your JWT token expired" }), {
				status: 401,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		if (!authData.user.email) {
			throw new Error("Authenticated user has no email");
		}

		/* ----------------------------------------
       REQUEST BODY
    ----------------------------------------- */
		const body = await req.json();
		const { items, orderId, deliveryFee } = body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			throw new Error("Invalid items payload");
		}

		if (!orderId) {
			throw new Error("Missing orderId");
		}

		logStep("Order received", { orderId, itemCount: items.length });

		/* ----------------------------------------
       STRIPE
    ----------------------------------------- */
		const stripe = new Stripe(stripeKey, {
			apiVersion: "2025-08-27.basil",
		});

		/* ----------------------------------------
       CUSTOMER LOOKUP
    ----------------------------------------- */
		const customers = await stripe.customers.list({
			email: authData.user.email,
			limit: 1,
		});

		let customerId: string | undefined;

		if (customers.data.length > 0) {
			customerId = customers.data[0].id;
			logStep("Existing customer found", { customerId });
		}

		/* ----------------------------------------
       LINE ITEMS
    ----------------------------------------- */
		const lineItems = items.map((item: any) => ({
			price_data: {
				currency: "gbp",
				product_data: {
					name: item.name,
					description: item.options ?? undefined,
				},
				unit_amount: Math.round(item.unitPrice * 100),
			},
			quantity: item.quantity,
		}));

		if (deliveryFee && deliveryFee > 0) {
			lineItems.push({
				price_data: {
					currency: "gbp",
					product_data: {
						name: "Delivery Fee",
						description: "Delivery Charge",
					},
					unit_amount: Math.round(deliveryFee * 100),
				},
				quantity: 1,
			});
		}

		/* ----------------------------------------
       CHECKOUT SESSION
    ----------------------------------------- */
		const origin = req.headers.get("origin") ?? "http://localhost:8080";

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			customer_email: customerId ? undefined : authData.user.email,
			line_items: lineItems,
			mode: "payment",
			success_url: `${origin}/orders?success=true&order_id=${orderId}`,
			cancel_url: `${origin}/checkout?canceled=true`,
			metadata: {
				order_id: orderId,
				user_id: authData.user.id,
			},
		});

		logStep("Checkout created", { sessionId: session.id });

		/* ----------------------------------------
       RESPONSE
    ----------------------------------------- */
		return new Response(
			JSON.stringify({
				sessionId: session.id,
				url: session.url,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logStep("ERROR", message);

		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
