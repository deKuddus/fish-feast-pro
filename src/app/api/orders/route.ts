import { createSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const supabase = await createSupabaseServer();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			items,
			orderType,
			deliveryAddress,
			phone,
			notes,
			paymentMethod,
			paymentStatus,
		} = body;

		// Calculate total
		const total = items.reduce((sum: number, item: any) => {
			const basePrice = item.product?.price || 0;
			const optionsPrice =
				item.selectedOptions?.reduce(
					(s: number, opt: any) => s + (opt.price_modifier || 0),
					0
				) || 0;
			return sum + (basePrice + optionsPrice) * item.quantity;
		}, 0);

		// Create order
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				user_id: user.id,
				subtotal: total,
				total,
				status: "pending",
				order_type: orderType,
				delivery_address: deliveryAddress,
				phone,
				notes,
				payment_method: paymentMethod,
				payment_status: paymentStatus,
			})
			.select()
			.single();

		if (orderError) {
			console.error("Order creation error:", orderError);
			return NextResponse.json(
				{ success: false, error: orderError.message },
				{ status: 500 }
			);
		}

		// Create order items
		const orderItems = items.map((item: any) => {
			const basePrice = item.product?.price || 0;
			const optionsPrice =
				item.selectedOptions?.reduce(
					(s: number, opt: any) => s + (opt.price_modifier || 0),
					0
				) || 0;
			const unitPrice = basePrice + optionsPrice;

			return {
				order_id: order.id,
				product_id: item.productId,
				product_name: item.product?.name || "Unknown Product",
				quantity: item.quantity,
				unit_price: unitPrice,
				selected_options: item.selectedOptions || [],
				special_instructions: item.specialInstructions,
			};
		});

		const { error: itemsError } = await supabase
			.from("order_items")
			.insert(orderItems);

		if (itemsError) {
			console.error("Order items error:", itemsError);
			// Try to delete the order if items insertion fails
			await supabase.from("orders").delete().eq("id", order.id);
			return NextResponse.json(
				{ success: false, error: itemsError.message },
				{ status: 500 }
			);
		}

		// Clear cart
		await supabase.from("cart_items").delete().eq("user_id", user.id);

		return NextResponse.json({
			success: true,
			orderId: order.id,
			order,
		});
	} catch (error) {
		console.error("Order creation error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create order" },
			{ status: 500 }
		);
	}
}
