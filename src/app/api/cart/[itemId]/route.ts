import { createSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH - Update cart item quantity
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> }
) {
	try {
		const { itemId } = await params;
		const supabase = await createSupabaseServer();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { quantity } = body;

		if (quantity <= 0) {
			// Delete if quantity is 0 or less
			const { error } = await supabase
				.from("cart_items")
				.delete()
				.eq("id", itemId)
				.eq("user_id", user.id);

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			return NextResponse.json({ success: true, deleted: true });
		}

		const { data, error } = await supabase
			.from("cart_items")
			.update({ quantity })
			.eq("id", itemId)
			.eq("user_id", user.id)
			.select(`*, product:products(*)`)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error updating cart item:", error);
		return NextResponse.json(
			{ error: "Failed to update cart item" },
			{ status: 500 }
		);
	}
}

// DELETE - Remove cart item
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> }
) {
	try {
		const { itemId } = await params;
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
			.eq("id", itemId)
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing cart item:", error);
		return NextResponse.json(
			{ error: "Failed to remove cart item" },
			{ status: 500 }
		);
	}
}
