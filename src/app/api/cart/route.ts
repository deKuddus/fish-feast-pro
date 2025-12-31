import { createSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch cart items for the current user
export async function GET() {
	try {
		const supabase = await createSupabaseServer();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("cart_items")
			.select(`*, product:products(*)`)
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data || []);
	} catch (error) {
		console.error("Error fetching cart:", error);
		return NextResponse.json(
			{ error: "Failed to fetch cart" },
			{ status: 500 }
		);
	}
}

// POST - Add item to cart
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
		const { productId, quantity, selectedOptions, specialInstructions } = body;

		// If item has options, always add as new
		if (selectedOptions && selectedOptions.length > 0) {
			const { data, error } = await supabase
				.from("cart_items")
				.insert({
					user_id: user.id,
					product_id: productId,
					quantity,
					selected_options: selectedOptions,
					special_instructions: specialInstructions,
				})
				.select(`*, product:products(*)`)
				.single();

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			return NextResponse.json(data);
		}

		// For simple items, check if it already exists and update quantity
		const { data: existing, error: existingError } = await supabase
			.from("cart_items")
			.select("id, quantity")
			.eq("user_id", user.id)
			.eq("product_id", productId)
			.maybeSingle();

		if (existingError) {
			return NextResponse.json(
				{ error: existingError.message },
				{ status: 500 }
			);
		}

		if (existing) {
			const { data, error } = await supabase
				.from("cart_items")
				.update({ quantity: existing.quantity + quantity })
				.eq("id", existing.id)
				.select(`*, product:products(*)`)
				.single();

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			return NextResponse.json(data);
		}

		// Insert new item
		const { data, error } = await supabase
			.from("cart_items")
			.insert({
				user_id: user.id,
				product_id: productId,
				quantity,
				selected_options: [],
			})
			.select(`*, product:products(*)`)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error adding to cart:", error);
		return NextResponse.json(
			{ error: "Failed to add to cart" },
			{ status: 500 }
		);
	}
}

// DELETE - Clear entire cart
export async function DELETE() {
	try {
		const supabase = await createSupabaseServer();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { error } = await supabase
			.from("cart_items")
			.delete()
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error clearing cart:", error);
		return NextResponse.json(
			{ error: "Failed to clear cart" },
			{ status: 500 }
		);
	}
}
