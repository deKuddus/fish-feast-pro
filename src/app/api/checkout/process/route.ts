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

		const { sessionId } = await request.json();

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID required" },
				{ status: 400 }
			);
		}

		// Retrieve the checkout session from Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId, {
			expand: ["line_items", "line_items.data.price.product"],
		});

		if (session.payment_status !== "paid") {
			return NextResponse.json(
				{ error: "Payment not completed" },
				{ status: 400 }
			);
		}

		// Get cart items for the order
		const { data: cartItems, error: cartError } = (await supabase
			.from("cart_items")
			.select(
				`
        id,
        quantity,
        selected_options,
        product:products!inner (
          id,
          name,
          price,
          image_url
        )
      `
			)
			.eq("user_id", user.id)) as any;

		if (cartError) {
			console.error("Error fetching cart:", cartError);
			return NextResponse.json(
				{ error: "Failed to fetch cart" },
				{ status: 500 }
			);
		}

		if (!cartItems || cartItems.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// Calculate total
		const total = cartItems.reduce((sum: number, item: any) => {
			const basePrice = item.product?.price || 0;
			const optionsPrice =
				item.selected_options?.reduce(
					(optSum: number, opt: any) => optSum + (opt.price_modifier || 0),
					0
				) || 0;
			return sum + (basePrice + optionsPrice) * item.quantity;
		}, 0);

		// Create order
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				user_id: user.id,
				status: "confirmed",
				payment_method: "card",
				payment_status: "paid",
				order_type: session.metadata?.order_type || "delivery",
				delivery_address: session.metadata?.delivery_address || null,
				phone: session.metadata?.phone || null,
				notes: session.metadata?.notes || null,
				subtotal: total,
				total: total,
				stripe_session_id: sessionId,
			})
			.select()
			.single();

		if (orderError) {
			console.error("Error creating order:", orderError);
			return NextResponse.json(
				{ error: "Failed to create order" },
				{ status: 500 }
			);
		}

		// Create order items
		const orderItems = cartItems.map((item: any) => {
			const basePrice = item.product?.price || 0;
			const optionsPrice =
				item.selected_options?.reduce(
					(sum: number, opt: any) => sum + (opt.price_modifier || 0),
					0
				) || 0;

			return {
				order_id: order.id,
				product_id: item.product?.id,
				product_name: item.product?.name || "Unknown Product",
				quantity: item.quantity,
				unit_price: basePrice,
				price: basePrice,
				subtotal: (basePrice + optionsPrice) * item.quantity,
				selected_options: item.selected_options,
			};
		});

		const { error: itemsError } = await supabase
			.from("order_items")
			.insert(orderItems);

		if (itemsError) {
			console.error("Error creating order items:", itemsError);
			return NextResponse.json(
				{ error: "Failed to create order items" },
				{ status: 500 }
			);
		}

		// Clear cart
		const { error: clearError } = await supabase
			.from("cart_items")
			.delete()
			.eq("user_id", user.id);

		if (clearError) {
			console.error("Error clearing cart:", clearError);
		}

		return NextResponse.json({
			orderId: order.id,
			orderNumber: order.order_number,
			total: order.total,
		});
	} catch (error: any) {
		console.error("Error processing checkout:", error);
		return NextResponse.json(
			{ error: "Failed to process checkout", details: error.message },
			{ status: 500 }
		);
	}
}
