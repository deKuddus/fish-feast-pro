import {
	deleteProductOption,
	deleteProductOptionGroup,
	fetchProductOptionGroups,
	saveProductOption,
	saveProductOptionGroup,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface ProductOptionGroup {
	id: string;
	name: string;
	is_required: boolean;
	min_selections: number;
	max_selections: number;
	sort_order: number;
	options?: ProductOption[];
}

interface ProductOption {
	id: string;
	name: string;
	price_modifier: number;
	is_default: boolean;
	sort_order: number;
}

interface Props {
	productId: string;
	productName: string;
}

export function ProductOptionsManager({ productId, productName }: Props) {
	const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);
	const [groupDialogOpen, setGroupDialogOpen] = useState(false);
	const [optionDialogOpen, setOptionDialogOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState<ProductOptionGroup | null>(
		null
	);
	const [editingOption, setEditingOption] = useState<{
		option: ProductOption;
		groupId: string;
	} | null>(null);
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const { toast } = useToast();

	const [groupForm, setGroupForm] = useState({
		name: "",
		is_required: false,
		min_selections: 0,
		max_selections: 1,
	});

	const [optionForm, setOptionForm] = useState({
		name: "",
		price_modifier: 0,
		is_default: false,
	});

	useEffect(() => {
		loadOptionGroups();
	}, [productId]);

	const loadOptionGroups = async () => {
		const result = await fetchProductOptionGroups(productId);
		if (result.error) {
			toast({
				title: "Error",
				description: result.error,
				variant: "destructive",
			});
		} else if (result.data) {
			setOptionGroups(result.data);
		}
	};

	const handleSaveGroup = async () => {
		startTransition(async () => {
			const groupData = {
				name: groupForm.name,
				is_required: groupForm.is_required,
				min_selections: groupForm.min_selections,
				max_selections: groupForm.max_selections,
				sort_order: optionGroups.length,
			};

			const result = await saveProductOptionGroup(
				productId,
				groupData,
				editingGroup?.id
			);

			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Success", description: "Option group saved" });
				setGroupDialogOpen(false);
				setEditingGroup(null);
				setGroupForm({
					name: "",
					is_required: false,
					min_selections: 0,
					max_selections: 1,
				});
				await loadOptionGroups();
			}
		});
	};

	const handleSaveOption = async () => {
		if (!selectedGroup) return;

		startTransition(async () => {
			const optionData = {
				option_group_id: selectedGroup,
				name: optionForm.name,
				price_modifier: optionForm.price_modifier,
				is_default: optionForm.is_default,
				sort_order: 0,
			};

			const result = await saveProductOption(
				optionData,
				editingOption?.option.id
			);

			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Success", description: "Option saved" });
				setOptionDialogOpen(false);
				setEditingOption(null);
				setOptionForm({ name: "", price_modifier: 0, is_default: false });
				await loadOptionGroups();
			}
		});
	};

	const handleDeleteGroup = async (id: string) => {
		if (!confirm("Delete this option group and all its options?")) return;

		startTransition(async () => {
			const result = await deleteProductOptionGroup(id);
			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Deleted", description: "Option group removed" });
				await loadOptionGroups();
			}
		});
	};

	const handleDeleteOption = async (id: string) => {
		if (!confirm("Delete this option?")) return;

		startTransition(async () => {
			const result = await deleteProductOption(id);
			if (result.error) {
				toast({
					title: "Error",
					description: result.error,
					variant: "destructive",
				});
			} else {
				toast({ title: "Deleted", description: "Option removed" });
				await loadOptionGroups();
			}
		});
	};

	const openEditGroup = (group: ProductOptionGroup) => {
		setEditingGroup(group);
		setGroupForm({
			name: group.name,
			is_required: group.is_required,
			min_selections: group.min_selections,
			max_selections: group.max_selections,
		});
		setGroupDialogOpen(true);
	};

	const openEditOption = (option: ProductOption, groupId: string) => {
		setEditingOption({ option, groupId });
		setSelectedGroup(groupId);
		setOptionForm({
			name: option.name,
			price_modifier: option.price_modifier,
			is_default: option.is_default,
		});
		setOptionDialogOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					Product Options for {productName}
				</h3>
				<Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
					<DialogTrigger asChild>
						<Button
							size="sm"
							onClick={() => {
								setEditingGroup(null);
								setGroupForm({
									name: "",
									is_required: false,
									min_selections: 0,
									max_selections: 1,
								});
							}}
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Option Group
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingGroup ? "Edit" : "Add"} Option Group
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>Group Name (e.g., "Sauces", "Salad")</Label>
								<Input
									value={groupForm.name}
									onChange={(e) =>
										setGroupForm((f) => ({ ...f, name: e.target.value }))
									}
									placeholder="Sauces"
								/>
							</div>
							<div className="flex items-center justify-between">
								<Label>Required</Label>
								<Switch
									checked={groupForm.is_required}
									onCheckedChange={(checked) =>
										setGroupForm((f) => ({ ...f, is_required: checked }))
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Min Selections</Label>
									<Input
										type="number"
										min="0"
										value={groupForm.min_selections}
										onChange={(e) =>
											setGroupForm((f) => ({
												...f,
												min_selections: parseInt(e.target.value) || 0,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Max Selections</Label>
									<Input
										type="number"
										min="1"
										value={groupForm.max_selections}
										onChange={(e) =>
											setGroupForm((f) => ({
												...f,
												max_selections: parseInt(e.target.value) || 1,
											}))
										}
									/>
								</div>
							</div>
							<Button className="w-full" onClick={handleSaveGroup}>
								{editingGroup ? "Update" : "Create"} Group
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{optionGroups.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						No option groups yet. Click "Add Option Group" to create one.
					</CardContent>
				</Card>
			) : (
				optionGroups.map((group) => (
					<Card key={group.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
							<div>
								<CardTitle className="text-base">{group.name}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{group.is_required ? "Required" : "Optional"} •{" "}
									{group.min_selections}-{group.max_selections} selections
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => openEditGroup(group)}
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive"
									onClick={() => handleDeleteGroup(group.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{group.options?.map((option) => (
									<div
										key={option.id}
										className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
									>
										<div>
											<span className="font-medium">{option.name}</span>
											{option.price_modifier > 0 && (
												<span className="text-sm text-primary ml-2">
													+£{option.price_modifier.toFixed(2)}
												</span>
											)}
											{option.is_default && (
												<span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-2">
													Default
												</span>
											)}
										</div>
										<div className="flex gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditOption(option, group.id)}
											>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive"
												onClick={() => handleDeleteOption(option.id)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
								<Dialog
									open={optionDialogOpen}
									onOpenChange={setOptionDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="w-full mt-2"
											onClick={() => {
												setSelectedGroup(group.id);
												setEditingOption(null);
												setOptionForm({
													name: "",
													price_modifier: 0,
													is_default: false,
												});
											}}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Option
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												{editingOption ? "Edit" : "Add"} Option
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label>Option Name</Label>
												<Input
													value={optionForm.name}
													onChange={(e) =>
														setOptionForm((f) => ({
															...f,
															name: e.target.value,
														}))
													}
													placeholder="e.g., Mayo, Ketchup"
												/>
											</div>
											<div className="space-y-2">
												<Label>Price Modifier (£)</Label>
												<Input
													type="number"
													step="0.01"
													value={optionForm.price_modifier}
													onChange={(e) =>
														setOptionForm((f) => ({
															...f,
															price_modifier: parseFloat(e.target.value) || 0,
														}))
													}
												/>
											</div>
											<div className="flex items-center justify-between">
												<Label>Set as Default</Label>
												<Switch
													checked={optionForm.is_default}
													onCheckedChange={(checked) =>
														setOptionForm((f) => ({
															...f,
															is_default: checked,
														}))
													}
												/>
											</div>
											<Button className="w-full" onClick={handleSaveOption}>
												{editingOption ? "Update" : "Create"} Option
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</CardContent>
					</Card>
				))
			)}
		</div>
	);
}
