import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		const supabase = await createSupabaseServer();

		const { data: orders, error } = await supabase
			.from("orders")
			.select("*, order_items(*, products(*))")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return NextResponse.json(orders || []);
	} catch (error) {
		console.error("Error fetching user orders:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user orders" },
			{ status: 500 }
		);
	}
}
