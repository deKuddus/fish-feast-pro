"use client";

import { useOrderTypeStore } from "@/stores/order-type-store";
import { Bike, Store } from "lucide-react";

interface OrderTypeToggleProps {
	value?: "delivery" | "pickup";
	onChange?: (type: "delivery" | "pickup") => void;
}

export function OrderTypeToggle({
	value,
	onChange,
}: OrderTypeToggleProps = {}) {
	const { orderType: storeOrderType, setOrderType: setStoreOrderType } =
		useOrderTypeStore();

	const orderType = value ?? storeOrderType;
	const setOrderType = onChange ?? setStoreOrderType;

	return (
		<div className="relative bg-secondary rounded-lg p-1">
			<div
				className="absolute top-1 bottom-1 left-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
				style={{
					width: "calc(50% - 4px)",
					transform:
						orderType === "pickup"
							? "translateX(calc(100% + 4px))"
							: "translateX(0)",
				}}
			/>
			<div className="relative flex">
				<button
					className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
						orderType === "delivery"
							? "text-primary-foreground"
							: "text-secondary-foreground hover:text-foreground"
					}`}
					onClick={() => setOrderType("delivery")}
				>
					<Bike className="h-4 w-4" />
					Delivery
				</button>
				<button
					className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
						orderType === "pickup"
							? "text-primary-foreground"
							: "text-secondary-foreground hover:text-foreground"
					}`}
					onClick={() => setOrderType("pickup")}
				>
					<Store className="h-4 w-4" />
					Pick-up
				</button>
			</div>
		</div>
	);
}
