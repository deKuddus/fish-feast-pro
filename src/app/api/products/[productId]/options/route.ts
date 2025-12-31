import { createSupabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ productId: string }> }
) {
	try {
		const { productId } = await params;
		const supabase = await createSupabaseServer();

		// Fetch option groups for the product
		const { data: groups, error: groupsError } = await supabase
			.from("product_option_groups")
			.select("*")
			.eq("product_id", productId)
			.order("sort_order");

		if (groupsError) {
			return NextResponse.json({ error: groupsError.message }, { status: 500 });
		}

		if (!groups || groups.length === 0) {
			return NextResponse.json([]);
		}

		// Fetch options for each group
		const groupsWithOptions = await Promise.all(
			groups.map(async (group: any) => {
				const { data: options, error: optionsError } = await supabase
					.from("product_options")
					.select("*")
					.eq("option_group_id", group.id)
					.order("sort_order");

				if (optionsError) {
					throw optionsError;
				}

				return {
					...group,
					options: options || [],
				};
			})
		);

		return NextResponse.json(groupsWithOptions);
	} catch (error) {
		console.error("Error fetching product options:", error);
		return NextResponse.json(
			{ error: "Failed to fetch product options" },
			{ status: 500 }
		);
	}
}
