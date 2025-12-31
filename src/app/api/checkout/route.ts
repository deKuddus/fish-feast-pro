import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
	try {
		const supabase = await createSupabaseServer();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { items, orderType, deliveryAddress, phone, notes } = body;

		if (!items || items.length === 0) {
			return NextResponse.json({ error: "No items in cart" }, { status: 400 });
		}

		console.log(
			"Creating checkout session for items:",
			JSON.stringify(items, null, 2)
		);

		const lineItems = items.map((item: any) => {
			const basePrice = item.product?.price || 0;
			const optionsPrice =
				item.selectedOptions?.reduce(
					(sum: number, opt: any) => sum + (opt.price_modifier || 0),
					0
				) || 0;
			const unitAmount = Math.round((basePrice + optionsPrice) * 100);

			console.log(
				`Line item: ${
					item.product?.name
				}, base: ${basePrice}, options: ${optionsPrice}, total: ${
					unitAmount / 100
				}`
			);

			return {
				price_data: {
					currency: "gbp",
					product_data: {
						name: item.product?.name || "Unknown Product",
						description:
							item.selectedOptions
								?.map((opt: any) => opt.option_name)
								.join(", ") || undefined,
					},
					unit_amount: unitAmount,
				},
				quantity: item.quantity,
			};
		});

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
			metadata: {
				user_id: user.id,
				order_type: orderType,
				delivery_address: deliveryAddress || "",
				phone: phone || "",
				notes: notes || "",
			},
			customer_email: user.email,
		});

		console.log("Stripe session created:", session.id);

		return NextResponse.json({ sessionId: session.id, url: session.url });
	} catch (error: any) {
		console.error("Error creating checkout session:", error);
		console.error("Error details:", {
			message: error.message,
			type: error.type,
			code: error.code,
			statusCode: error.statusCode,
		});
		return NextResponse.json(
			{ error: "Failed to create checkout session", details: error.message },
			{ status: 500 }
		);
	}
}
