export interface Category {
	id: string;
	name: string;
	slug: string;
	icon: string | null;
	sort_order: number;
	created_at: string;
}

export interface Product {
	id: string;
	category_id: string | null;
	name: string;
	description: string | null;
	price: number;
	image_url: string | null;
	is_popular: boolean;
	is_available: boolean;
	delivery_available: boolean;
	pickup_available: boolean;
	allergens: string[] | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
	category?: Category;
	option_groups?: ProductOptionGroup[];
}

export interface ProductOptionGroup {
	id: string;
	product_id: string;
	name: string;
	is_required: boolean;
	min_selections: number;
	max_selections: number;
	sort_order: number;
	options?: ProductOption[];
}

export interface ProductOption {
	id: string;
	option_group_id: string;
	name: string;
	price_modifier: number;
	is_default: boolean;
	sort_order: number;
}

export interface CartItem {
	id: string;
	user_id: string;
	product_id: string;
	quantity: number;
	selected_options: SelectedOption[];
	special_instructions: string | null;
	created_at: string;
	updated_at: string;
	product?: Product;
}

export interface SelectedOption {
	group_id: string;
	group_name: string;
	option_id: string;
	option_name: string;
	price_modifier: number;
}

export interface Order {
	id: string;
	user_id: string;
	order_number: string;
	status:
		| "pending"
		| "confirmed"
		| "preparing"
		| "ready"
		| "delivered"
		| "cancelled";
	order_type: "delivery" | "pickup";
	subtotal: number;
	delivery_fee: number;
	total: number;
	payment_method: string | null;
	payment_status: "pending" | "paid" | "failed" | "refunded";
	stripe_payment_intent_id: string | null;
	delivery_address: DeliveryAddress | null;
	phone: string | null;
	notes: string | null;
	estimated_time: number | null;
	created_at: string;
	updated_at: string;
	items?: OrderItem[];
}

export interface DeliveryAddress {
	line1: string;
	line2?: string;
	city: string;
	postcode: string;
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	unit_price: number;
	selected_options: SelectedOption[];
	special_instructions: string | null;
	created_at: string;
}

export interface Profile {
	id: string;
	email: string | null;
	full_name: string | null;
	phone: string | null;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface UserRole {
	id: string;
	user_id: string;
	role: "admin" | "customer";
	created_at: string;
}
