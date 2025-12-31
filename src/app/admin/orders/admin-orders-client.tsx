"use client";

import { updateOrderStatus, updatePaymentStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatPrice, getStatusColor } from "@/lib/utils";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	MapPin,
	Phone,
	Printer,
	Search,
	Users,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const itemsPerPage = 10;

interface OrdersClientProps {
	initialOrders: any[];
	initialTotal: number;
}

export function AdminOrdersClient({
	initialOrders,
	initialTotal,
}: OrdersClientProps) {
	const { toast } = useToast();
	const [orders, setOrders] = useState(initialOrders);
	const [filteredOrders, setFilteredOrders] = useState(initialOrders);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalOrders] = useState(initialTotal);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);
	const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		// Filter orders based on search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const filtered = orders.filter(
				(order) =>
					order.order_number?.toLowerCase().includes(query) ||
					order.delivery_address?.name?.toLowerCase().includes(query) ||
					order.status?.toLowerCase().includes(query)
			);
			setFilteredOrders(filtered);
		} else {
			setFilteredOrders(orders);
		}
	}, [searchQuery, orders]);

	const handleViewOrderDetails = async (order: any) => {
		setSelectedOrder(order);
		setOrderDetailsOpen(true);
	};

	const handleUpdateStatus = async (orderId: string, status: string) => {
		startTransition(() => {
			updateOrderStatus(orderId, status).then((result) => {
				if (result.error) {
					toast({
						title: "Error",
						description: result.error,
						variant: "destructive",
					});
				} else {
					toast({
						title: "Success",
						description: "Order status updated",
					});
					// Update local state
					setOrders((prev) =>
						prev.map((o) => (o.id === orderId ? { ...o, status } : o))
					);
					if (selectedOrder?.id === orderId) {
						setSelectedOrder({ ...selectedOrder, status });
					}
				}
			});
		});
	};

	const handleUpdatePaymentStatus = async (
		orderId: string,
		paymentStatus: string
	) => {
		startTransition(() => {
			updatePaymentStatus(orderId, paymentStatus).then((result) => {
				if (result.error) {
					toast({
						title: "Error",
						description: result.error,
						variant: "destructive",
					});
				} else {
					toast({
						title: "Success",
						description: "Payment status updated",
					});
					// Update local state
					setOrders((prev) =>
						prev.map((o) =>
							o.id === orderId ? { ...o, payment_status: paymentStatus } : o
						)
					);
					if (selectedOrder?.id === orderId) {
						setSelectedOrder({
							...selectedOrder,
							payment_status: paymentStatus,
						});
					}
				}
			});
		});
	};

	const handlePrintInvoice = (order: any) => {
		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		// Thermal receipt format (80mm width)
		const invoiceHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Receipt - ${order.order_number}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					html {
						width: 80mm;
						margin: 0 auto;
					}
					body {
						font-family: 'Courier New', monospace;
						width: 80mm;
						max-width: 80mm;
						margin: 0 auto;
						padding: 10mm 5mm;
						font-size: 11px;
						line-height: 1.4;
						background: white;
					}
					.center { text-align: center; }
					.bold { font-weight: bold; }
					.large { font-size: 14px; }
					.divider {
						border-top: 1px dashed #000;
						margin: 8px 0;
					}
					.header {
						text-align: center;
						margin-bottom: 10px;
					}
					.company {
						font-size: 16px;
						font-weight: bold;
						margin-bottom: 3px;
					}
					.row {
						display: flex;
						justify-content: space-between;
						margin: 3px 0;
					}
					.item-row {
						margin: 5px 0;
					}
					.item-name {
						font-weight: bold;
						margin-bottom: 2px;
					}
					.item-details {
						font-size: 10px;
						color: #333;
						margin-left: 5px;
					}
					.item-line {
						display: flex;
						justify-content: space-between;
						margin-top: 2px;
					}
					.total-section {
						margin-top: 10px;
						border-top: 1px solid #000;
						padding-top: 5px;
					}
					.grand-total {
						font-size: 14px;
						font-weight: bold;
						margin-top: 5px;
						padding-top: 5px;
						border-top: 2px solid #000;
					}
					.footer {
						margin-top: 15px;
						text-align: center;
						font-size: 10px;
					}
					.status {
						display: inline-block;
						padding: 2px 6px;
						margin: 3px 0;
						border: 1px solid #000;
						text-transform: uppercase;
						font-size: 9px;
					}
					@media print {
						html, body {
							width: 80mm;
							margin: 0 auto;
							padding: 0;
						}
						body {
							padding: 0 5mm;
						}
						.no-print { display: none !important; }
					}
					@page {
						size: 80mm auto;
						margin: 10mm 0;
					}
				</style>
			</head>
			<body>
				<div class="header">
					<div class="company">FISH-A-LICIOUS</div>
					<div>808 London Rd</div>
					<div>Leigh-on-Sea, SS9 3LB</div>
				</div>

				<div class="divider"></div>

				<div class="center bold">
					${order.order_type === "delivery" ? "DELIVERY ORDER" : "PICKUP ORDER"}
				</div>

				<div class="divider"></div>

				<div class="row">
					<span>Order #:</span>
					<span class="bold">${order.order_number}</span>
				</div>
				<div class="row">
					<span>Date:</span>
					<span>${new Date(order.created_at).toLocaleString("en-GB", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})}</span>
				</div>

				${
					order.delivery_address?.name || order.phone
						? `
					<div class="divider"></div>
					<div class="bold">CUSTOMER:</div>
					${
						order.delivery_address?.name
							? `<div>${order.delivery_address.name}</div>`
							: ""
					}
					${order.phone ? `<div>Tel: ${order.phone}</div>` : ""}
				`
						: ""
				}

				${
					order.order_type === "delivery" && order.delivery_address
						? `
					<div class="divider"></div>
					<div class="bold">DELIVERY ADDRESS:</div>
					<div>${order.delivery_address.street || ""}</div>
					<div>${order.delivery_address.city || ""} ${
								order.delivery_address.postcode || ""
						  }</div>
				`
						: ""
				}

				<div class="divider"></div>

				<div class="bold">ITEMS:</div>
				${order.order_items
					?.map(
						(item: any) => `
					<div class="item-row">
						<div class="item-name">${item.product_name}</div>
						${
							item.selected_options && item.selected_options.length > 0
								? `<div class="item-details">+ ${item.selected_options
										.map((opt: any) => opt.name)
										.join(", ")}</div>`
								: ""
						}
						${
							item.special_instructions
								? `<div class="item-details">Note: ${item.special_instructions}</div>`
								: ""
						}
						<div class="item-line">
							<span>${item.quantity} x £${item.unit_price.toFixed(2)}</span>
							<span class="bold">£${(item.unit_price * item.quantity).toFixed(2)}</span>
						</div>
					</div>
				`
					)
					.join("")}

				<div class="divider"></div>

				<div class="total-section">
					<div class="row">
						<span>Subtotal:</span>
						<span>£${order.subtotal.toFixed(2)}</span>
					</div>
					${
						order.delivery_fee > 0
							? `
						<div class="row">
							<span>Delivery:</span>
							<span>£${order.delivery_fee.toFixed(2)}</span>
						</div>
					`
							: ""
					}
					<div class="row grand-total">
						<span>TOTAL:</span>
						<span>£${order.total.toFixed(2)}</span>
					</div>
				</div>

				<div class="divider"></div>

				<div class="center">
					<div class="status">Status: ${order.status.toUpperCase()}</div>
					<div class="status">Payment: ${order.payment_status.toUpperCase()}${
			order.payment_method === "cash" ? " (COD)" : ""
		}</div>
				</div>

				${
					order.notes
						? `
					<div class="divider"></div>
					<div class="bold">SPECIAL INSTRUCTIONS:</div>
					<div style="margin-top: 3px;">${order.notes}</div>
				`
						: ""
				}

				<div class="divider"></div>

				<div class="footer">
					<div class="bold">Thank you for your order!</div>
					<div>info@fish-a-licious.co.uk</div>
				</div>

				<div class="no-print center" style="margin-top: 20px;">
					<button onclick="window.print()" style="padding: 8px 20px; cursor: pointer; background: #000; color: white; border: none; margin: 5px;">Print Receipt</button>
					<button onclick="window.close()" style="padding: 8px 20px; cursor: pointer; background: #666; color: white; border: none; margin: 5px;">Close</button>
				</div>
			</body>
			</html>
		`;

		printWindow.document.write(invoiceHTML);
		printWindow.document.close();
	};

	const totalPages = Math.ceil(totalOrders / itemsPerPage);
	const paginatedOrders = filteredOrders.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	return (
		<div>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Orders</CardTitle>
						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search orders..."
									className="pl-8 w-64"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedOrders.map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-mono text-sm">
										{order.order_number}
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">
												{order.delivery_address?.name || "Guest"}
											</p>
											<p className="text-sm text-muted-foreground">
												{order.phone || "No phone"}
											</p>
										</div>
									</TableCell>
									<TableCell>{formatDate(order.created_at)}</TableCell>
									<TableCell className="capitalize">
										{order.order_type}
									</TableCell>
									<TableCell>
										<Badge className={getStatusColor(order.status)}>
											{order.status}
										</Badge>
									</TableCell>
									<TableCell className="font-semibold">
										{formatPrice(order.total)}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Select
												value={order.status}
												onValueChange={(value) =>
													handleUpdateStatus(order.id, value)
												}
												disabled={isPending}
											>
												<SelectTrigger className="w-[140px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="pending">Pending</SelectItem>
													<SelectItem value="confirmed">Confirmed</SelectItem>
													<SelectItem value="preparing">Preparing</SelectItem>
													<SelectItem value="ready">Ready</SelectItem>
													<SelectItem value="out_for_delivery">
														Out for Delivery
													</SelectItem>
													<SelectItem value="completed">Completed</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
												</SelectContent>
											</Select>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewOrderDetails(order)}
												title="View Details"
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handlePrintInvoice(order)}
												title="Print Invoice"
											>
												<Printer className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{paginatedOrders.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										className="text-center text-muted-foreground"
									>
										{searchQuery ? "No matching orders found" : "No orders yet"}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between px-2 py-4">
							<div className="text-sm text-muted-foreground">
								Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
								{Math.min(currentPage * itemsPerPage, totalOrders)} of{" "}
								{totalOrders} orders
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<div className="flex gap-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										let pageNum;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<Button
												key={pageNum}
												variant={
													currentPage === pageNum ? "default" : "outline"
												}
												size="sm"
												onClick={() => setCurrentPage(pageNum)}
												className="w-8"
											>
												{pageNum}
											</Button>
										);
									})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Order Details Dialog */}
			<Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Order Details - {selectedOrder?.order_number}
						</DialogTitle>
					</DialogHeader>
					{selectedOrder && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="font-semibold mb-2 flex items-center gap-2">
										<Users className="h-4 w-4" />
										Customer Information
									</h4>
									<div className="space-y-1 text-sm">
										<p>
											<strong>Name:</strong>{" "}
											{selectedOrder.delivery_address?.name || "N/A"}
										</p>
										<p className="flex items-center gap-1">
											<Phone className="h-3 w-3" />
											{selectedOrder.phone || "N/A"}
										</p>
										{selectedOrder.order_type === "delivery" && (
											<p className="flex items-start gap-1">
												<MapPin className="h-3 w-3 mt-1" />
												<span>
													{selectedOrder.delivery_address?.street || ""},
													{selectedOrder.delivery_address?.city || ""},
													{selectedOrder.delivery_address?.postcode || ""}
												</span>
											</p>
										)}
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Order Information</h4>
									<div className="space-y-1 text-sm">
										<p>
											<strong>Type:</strong>{" "}
											<span className="capitalize">
												{selectedOrder.order_type}
											</span>
										</p>
										<div>
											<strong>Status:</strong>{" "}
											<Badge className={getStatusColor(selectedOrder.status)}>
												{selectedOrder.status}
											</Badge>
										</div>
										<p>
											<strong>Date:</strong>{" "}
											{formatDate(selectedOrder.created_at)}
										</p>
										{selectedOrder.estimated_time && (
											<p>
												<strong>Est. Time:</strong>{" "}
												{selectedOrder.estimated_time} mins
											</p>
										)}
									</div>
								</div>
							</div>

							{selectedOrder.notes && (
								<div>
									<h4 className="font-semibold mb-2">Order Notes</h4>
									<p className="text-sm text-muted-foreground bg-muted p-3 rounded">
										{selectedOrder.notes}
									</p>
								</div>
							)}

							<div>
								<h4 className="font-semibold mb-3">Order Items</h4>
								<div className="space-y-2">
									{selectedOrder.order_items?.map((item: any) => (
										<div
											key={item.id}
											className="flex justify-between items-start border-b pb-2"
										>
											<div className="flex-1">
												<p className="font-medium">
													{item.quantity}x {item.product_name}
												</p>
												{item.selected_options &&
													item.selected_options.length > 0 && (
														<p className="text-sm text-muted-foreground">
															{item.selected_options
																.map((opt: any) => opt.name)
																.join(", ")}
														</p>
													)}
												{item.special_instructions && (
													<p className="text-sm italic text-muted-foreground">
														Note: {item.special_instructions}
													</p>
												)}
											</div>
											<span className="font-medium">
												{formatPrice(item.unit_price * item.quantity)}
											</span>
										</div>
									))}
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Subtotal:</span>
										<span>{formatPrice(selectedOrder.subtotal)}</span>
									</div>
									{selectedOrder.delivery_fee > 0 && (
										<div className="flex justify-between text-sm">
											<span>Delivery Fee:</span>
											<span>{formatPrice(selectedOrder.delivery_fee)}</span>
										</div>
									)}
									<div className="flex justify-between font-bold text-lg border-t pt-2">
										<span>Total:</span>
										<span>{formatPrice(selectedOrder.total)}</span>
									</div>
								</div>
							</div>

							<div>
								<h4 className="font-semibold mb-2">Update Status</h4>
								<Select
									value={selectedOrder.status}
									onValueChange={(value) =>
										handleUpdateStatus(selectedOrder.id, value)
									}
									disabled={isPending}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="confirmed">Confirmed</SelectItem>
										<SelectItem value="preparing">Preparing</SelectItem>
										<SelectItem value="ready">Ready</SelectItem>
										<SelectItem value="out_for_delivery">
											Out for Delivery
										</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<h4 className="font-semibold mb-2">Update Payment Status</h4>
								<Select
									value={selectedOrder.payment_status}
									onValueChange={(value) =>
										handleUpdatePaymentStatus(selectedOrder.id, value)
									}
									disabled={isPending}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="failed">Failed</SelectItem>
										<SelectItem value="refunded">Refunded</SelectItem>
									</SelectContent>
								</Select>
								{selectedOrder.payment_method === "cash" && (
									<p className="text-sm text-muted-foreground mt-2">
										💰 Cash on Delivery (COD)
									</p>
								)}
							</div>

							<div className="flex gap-2">
								<Button
									onClick={() => handlePrintInvoice(selectedOrder)}
									className="flex-1"
								>
									<Printer className="h-4 w-4 mr-2" />
									Print Invoice
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
