"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Product, ProductOptionGroup, SelectedOption } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductOptionsModalProps {
	product: Product | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductOptionsModal({
	product,
	open,
	onOpenChange,
}: ProductOptionsModalProps) {
	const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);
	const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
	const [specialInstructions, setSpecialInstructions] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const { addToCart } = useCart();

	useEffect(() => {
		if (product && open) {
			fetchOptionGroups();
			setSelectedOptions([]);
			setSpecialInstructions("");
			setQuantity(1);
		}
	}, [product, open]);

	async function fetchOptionGroups() {
		if (!product) return;
		setIsLoading(true);

		try {
			const response = await fetch(`/api/products/${product.id}/options`);
			if (!response.ok) {
				throw new Error("Failed to fetch options");
			}

			const groupsWithOptions = await response.json();

			if (groupsWithOptions && groupsWithOptions.length > 0) {
				setOptionGroups(groupsWithOptions);

				// Set default options
				const defaults: SelectedOption[] = [];
				groupsWithOptions.forEach((group: ProductOptionGroup) => {
					group.options?.forEach((opt) => {
						if (opt.is_default) {
							defaults.push({
								group_id: group.id,
								group_name: group.name,
								option_id: opt.id,
								option_name: opt.name,
								price_modifier: opt.price_modifier,
							});
						}
					});
				});
				setSelectedOptions(defaults);
			}
		} catch (error) {
			console.error("Error fetching option groups:", error);
		} finally {
			setIsLoading(false);
		}
	}

	const handleSingleSelect = (group: ProductOptionGroup, optionId: string) => {
		const option = group.options?.find((o) => o.id === optionId);
		if (!option) return;

		setSelectedOptions((prev) => {
			const filtered = prev.filter((s) => s.group_id !== group.id);
			return [
				...filtered,
				{
					group_id: group.id,
					group_name: group.name,
					option_id: option.id,
					option_name: option.name,
					price_modifier: option.price_modifier,
				},
			];
		});
	};

	const handleMultiSelect = (
		group: ProductOptionGroup,
		optionId: string,
		checked: boolean
	) => {
		const option = group.options?.find((o) => o.id === optionId);
		if (!option) return;

		setSelectedOptions((prev) => {
			if (checked) {
				const currentGroupCount = prev.filter(
					(s) => s.group_id === group.id
				).length;
				if (currentGroupCount >= group.max_selections) return prev;

				return [
					...prev,
					{
						group_id: group.id,
						group_name: group.name,
						option_id: option.id,
						option_name: option.name,
						price_modifier: option.price_modifier,
					},
				];
			} else {
				return prev.filter(
					(s) => !(s.group_id === group.id && s.option_id === optionId)
				);
			}
		});
	};

	const calculateTotal = () => {
		if (!product) return 0;
		const optionsTotal = selectedOptions.reduce(
			(sum, opt) => sum + opt.price_modifier,
			0
		);
		return (product.price + optionsTotal) * quantity;
	};

	const handleAddToCart = () => {
		if (!product) return;
		addToCart(
			product.id,
			quantity,
			selectedOptions,
			specialInstructions || undefined
		);
		onOpenChange(false);
	};

	const isValid = () => {
		if (!product) return false;
		for (const group of optionGroups) {
			if (group.is_required) {
				const selected = selectedOptions.filter((s) => s.group_id === group.id);
				if (selected.length < group.min_selections) return false;
			}
		}
		return true;
	};

	if (!product) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">{product.name}</DialogTitle>
					{product.description && (
						<p className="text-muted-foreground text-sm">
							{product.description}
						</p>
					)}
				</DialogHeader>

				<div className="space-y-6 py-4">
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2].map((i) => (
								<div
									key={i}
									className="h-20 bg-muted rounded-lg animate-pulse"
								/>
							))}
						</div>
					) : (
						optionGroups.map((group) => (
							<div key={group.id} className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-medium">{group.name}</h4>
									{group.is_required && (
										<span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
											Required
										</span>
									)}
								</div>

								{group.max_selections === 1 ? (
									<RadioGroup
										value={
											selectedOptions.find((s) => s.group_id === group.id)
												?.option_id || ""
										}
										onValueChange={(value) => handleSingleSelect(group, value)}
									>
										{group.options?.map((option) => (
											<div
												key={option.id}
												className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
											>
												<div className="flex items-center gap-3">
													<RadioGroupItem value={option.id} id={option.id} />
													<Label htmlFor={option.id} className="cursor-pointer">
														{option.name}
													</Label>
												</div>
												{option.price_modifier > 0 && (
													<span className="text-sm text-primary">
														+{formatPrice(option.price_modifier)}
													</span>
												)}
											</div>
										))}
									</RadioGroup>
								) : (
									<div className="space-y-1">
										{group.options?.map((option) => {
											const isChecked = selectedOptions.some(
												(s) =>
													s.group_id === group.id && s.option_id === option.id
											);
											return (
												<div
													key={option.id}
													className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
												>
													<div className="flex items-center gap-3">
														<Checkbox
															id={option.id}
															checked={isChecked}
															onCheckedChange={(checked) =>
																handleMultiSelect(group, option.id, !!checked)
															}
														/>
														<Label
															htmlFor={option.id}
															className="cursor-pointer"
														>
															{option.name}
														</Label>
													</div>
													{option.price_modifier > 0 && (
														<span className="text-sm text-primary">
															+{formatPrice(option.price_modifier)}
														</span>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						))
					)}

					{/* Special Instructions */}
					<div className="space-y-2">
						<Label htmlFor="instructions">
							Special Instructions (optional)
						</Label>
						<Textarea
							id="instructions"
							placeholder="E.g., no onions, extra sauce..."
							value={specialInstructions}
							onChange={(e) => setSpecialInstructions(e.target.value)}
							className="resize-none"
							rows={2}
						/>
					</div>

					{/* Quantity */}
					<div className="flex items-center justify-between">
						<span className="font-medium">Quantity</span>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setQuantity((q) => Math.max(1, q - 1))}
								disabled={quantity <= 1}
							>
								<Minus className="h-4 w-4" />
							</Button>
							<span className="w-8 text-center font-semibold">{quantity}</span>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setQuantity((q) => q + 1)}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				{/* Add to Cart Button */}
				<Button
					className="w-full"
					size="lg"
					onClick={handleAddToCart}
					disabled={!isValid()}
				>
					Add to Cart • {formatPrice(calculateTotal())}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
