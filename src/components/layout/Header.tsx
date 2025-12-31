"use client";

import { signOutUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, Settings, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { user, isAdmin, refreshUser } = useAuth();
	const { itemCount } = useCart();

	useEffect(() => {
		setMounted(true);
	}, []);

	console.log(user);

	const handleSignOut = async () => {
		await signOutUser();
		await refreshUser();
		setMobileMenuOpen(false);
	};

	return (
		<header className="sticky top-0 z-50 w-full bg-[hsl(var(--header-bg))] border-b border-border">
			<div className="container flex h-16 items-center justify-between">
				<Link href="/" className="text-2xl font-display font-bold text-primary">
					Fish Feast Pro
				</Link>

				<nav className="hidden md:flex items-center gap-6">
					<Link
						href="/"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Browse Menu
					</Link>
					<Link
						href="/restaurant-info"
						className="text-sm font-medium transition-colors hover:text-primary"
					>
						Restaurant Info
					</Link>
				</nav>

				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild className="relative">
						<Link href="/cart">
							<ShoppingCart className="h-5 w-5" />
							{mounted && itemCount > 0 && (
								<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
									{itemCount}
								</span>
							)}
						</Link>
					</Button>

					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<User className="h-5 w-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link href="/profile">Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/orders">My Orders</Link>
								</DropdownMenuItem>
								{isAdmin && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href="/admin">
												<Settings className="mr-2 h-4 w-4" />
												Admin
											</Link>
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link href="/auth">Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
