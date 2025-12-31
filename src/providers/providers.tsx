"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<CartProvider>
				<TooltipProvider>
					{children}
					<Toaster />
					<Sonner />
				</TooltipProvider>
			</CartProvider>
		</AuthProvider>
	);
}
