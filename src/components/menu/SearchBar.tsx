"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Phone, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
	const [restaurantPhone, setRestaurantPhone] = useState<string>("");

	useEffect(() => {
		fetchRestaurantPhone();
	}, []);

	const fetchRestaurantPhone = async () => {
		try {
			const response = await fetch("/api/settings");
			if (response.ok) {
				const data = await response.json();
				if (data?.phone) {
					setRestaurantPhone(data.phone);
				}
			}
		} catch (error) {
			console.error("Error fetching settings:", error);
		}
	};

	return (
		<div className={`flex items-center gap-2 ${className || ""}`}>
			<div className="relative flex-1 mt-3">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search dish... ex. Southern Fries Chicken Burger"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="search-input pl-10 outline-red-500"
				/>
			</div>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<AlertCircle className="h-4 w-4" />
						Allergens
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Allergens</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<span className="text-base">
								If you have allergies or other dietary restrictions, please
								contact the restaurant!
							</span>
							{restaurantPhone && (
								<a
									href={`tel:${restaurantPhone}`}
									className="flex items-center gap-2 text-primary hover:underline font-medium"
								>
									<Phone className="h-4 w-4" />
									{restaurantPhone}
								</a>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Close</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
