import { checkUserIsAdmin, getCurrentUser } from "@/app/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
	Cog,
	FolderTree,
	Package,
	Settings,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getAdminStats() {
	const supabase = await createSupabaseServer();

	const { data: allOrders } = await supabase
		.from("orders")
		.select("total, status, payment_status");

	const { count: productsCount } = await supabase
		.from("products")
		.select("*", { count: "exact", head: true });

	const { count: customersCount } = await supabase
		.from("profiles")
		.select("*", { count: "exact", head: true })
		.eq("role", "customer");

	const totalRevenue = allOrders
		? allOrders
				.filter((o: any) => o.payment_status === "paid")
				.reduce((sum: number, o: any) => sum + Number(o.total), 0)
		: 0;
	const pendingOrders = allOrders
		? allOrders.filter((o: any) => o.status === "pending").length
		: 0;

	return {
		totalOrders: allOrders?.length || 0,
		totalRevenue,
		pendingOrders,
		totalProducts: productsCount || 0,
		totalCustomers: customersCount || 0,
	};
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth");
	}

	const isAdmin = await checkUserIsAdmin(user.id);

	if (!isAdmin) {
		redirect("/");
	}

	const stats = await getAdminStats();

	const navItems = [
		{ href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
		{ href: "/admin/users", icon: Users, label: "Users" },
		{ href: "/admin/products", icon: Package, label: "Products" },
		{ href: "/admin/categories", icon: FolderTree, label: "Categories" },
		{ href: "/admin/options", icon: Settings, label: "Product Options" },
		{ href: "/admin/settings", icon: Cog, label: "Settings" },
	];

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b">
				<div className="container">
					<nav className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
						{navItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link key={item.href} href={item.href}>
									<button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors whitespace-nowrap">
										<Icon className="h-4 w-4" />
										<span className="text-sm font-medium">{item.label}</span>
									</button>
								</Link>
							);
						})}
					</nav>
				</div>
			</div>

			<main className="container py-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-full bg-primary/10">
									<ShoppingCart className="h-6 w-6 text-primary" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Total Orders</p>
									<p className="text-2xl font-bold">{stats.totalOrders}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-full bg-success/10">
									<TrendingUp className="h-6 w-6 text-success" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Revenue (Paid)
									</p>
									<p className="text-2xl font-bold">
										{formatPrice(stats.totalRevenue)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-full bg-info/10">
									<Users className="h-6 w-6 text-info" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Customers</p>
									<p className="text-2xl font-bold">{stats.totalCustomers}</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="p-3 rounded-full bg-warning/10">
									<Package className="h-6 w-6 text-warning" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Products</p>
									<p className="text-2xl font-bold">{stats.totalProducts}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{children}
			</main>
		</div>
	);
}
