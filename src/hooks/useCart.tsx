"use client";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { Product, SelectedOption } from "@/types";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

interface CartItem {
	id: string;
	productId: string;
	quantity: number;
	selectedOptions: SelectedOption[];
	specialInstructions?: string;
	product?: Product;
}

interface CartContextType {
	items: CartItem[];
	isLoading: boolean;
	itemCount: number;
	subtotal: number;
	addToCart: (
		productId: string,
		quantity: number,
		selectedOptions?: SelectedOption[],
		specialInstructions?: string
	) => Promise<void>;
	updateQuantity: (itemId: string, quantity: number) => Promise<void>;
	removeFromCart: (itemId: string) => Promise<void>;
	clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const { toast } = useToast();
	const [items, setItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchCart = useCallback(async () => {
		if (!user) return;

		setIsLoading(true);
		try {
			const response = await fetch("/api/cart");
			if (!response.ok) throw new Error("Failed to fetch cart");

			const data = await response.json();

			const typedData = (data || []).map((item: any) => ({
				id: item.id,
				productId: item.product_id,
				quantity: item.quantity,
				selectedOptions:
					(item.selected_options as unknown as SelectedOption[]) || [],
				specialInstructions: item.special_instructions || undefined,
				product: item.product as unknown as Product,
			}));

			setItems(typedData);
		} catch (error) {
			console.error("Error fetching cart:", error);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			fetchCart();
		} else {
			const saved = localStorage.getItem("cart");
			if (saved) {
				setItems(JSON.parse(saved));
			}
		}
	}, [user, fetchCart]);

	const addToCart = async (
		productId: string,
		quantity: number,
		selectedOptions: SelectedOption[] = [],
		specialInstructions?: string
	) => {
		if (!user) {
			const updated = [...items];
			// For items with options, always add as new item
			if (selectedOptions.length > 0) {
				updated.push({
					id: crypto.randomUUID(),
					productId,
					quantity,
					selectedOptions,
					specialInstructions,
				});
			} else {
				const existingIndex = updated.findIndex(
					(i) => i.productId === productId && i.selectedOptions.length === 0
				);
				if (existingIndex >= 0) {
					updated[existingIndex].quantity += quantity;
				} else {
					updated.push({
						id: crypto.randomUUID(),
						productId,
						quantity,
						selectedOptions: [],
					});
				}
			}

			setItems(updated);
			localStorage.setItem("cart", JSON.stringify(updated));
			toast({ title: "Added to cart" });
			return;
		}

		try {
			const response = await fetch("/api/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId,
					quantity,
					selectedOptions,
					specialInstructions,
				}),
			});

			if (!response.ok) throw new Error("Failed to add to cart");

			await fetchCart();
			toast({ title: "Added to cart" });
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast({
				title: "Error",
				description: "Failed to add item",
				variant: "destructive",
			});
		}
	};

	const updateQuantity = async (itemId: string, quantity: number) => {
		if (!user) {
			const updated = items
				.map((item) => (item.id === itemId ? { ...item, quantity } : item))
				.filter((item) => item.quantity > 0);
			setItems(updated);
			localStorage.setItem("cart", JSON.stringify(updated));
			return;
		}

		try {
			if (quantity <= 0) {
				await removeFromCart(itemId);
				return;
			}

			const response = await fetch(`/api/cart/${itemId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quantity }),
			});

			if (!response.ok) throw new Error("Failed to update quantity");

			await fetchCart();
		} catch (error) {
			console.error("Error updating cart:", error);
		}
	};

	const removeFromCart = async (itemId: string) => {
		if (!user) {
			const updated = items.filter((item) => item.id !== itemId);
			setItems(updated);
			localStorage.setItem("cart", JSON.stringify(updated));
			return;
		}

		try {
			const response = await fetch(`/api/cart/${itemId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to remove item");

			await fetchCart();
			toast({ title: "Removed from cart" });
		} catch (error) {
			console.error("Error removing from cart:", error);
		}
	};

	const clearCart = async () => {
		if (!user) {
			setItems([]);
			localStorage.removeItem("cart");
			return;
		}

		try {
			const response = await fetch("/api/cart", {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to clear cart");

			setItems([]);
		} catch (error) {
			console.error("Error clearing cart:", error);
		}
	};

	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = items.reduce((sum, item) => {
		const basePrice = item.product?.price || 0;
		const options = item.selectedOptions || [];
		const optionsPrice = options.reduce((s, opt) => s + opt.price_modifier, 0);
		return sum + (basePrice + optionsPrice) * item.quantity;
	}, 0);

	return (
		<CartContext.Provider
			value={{
				items,
				isLoading,
				itemCount,
				subtotal,
				addToCart,
				updateQuantity,
				removeFromCart,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
