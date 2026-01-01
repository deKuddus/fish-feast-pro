import { getSettings } from "@/lib/data/settings";
import { Resend } from "resend";

let resendInstance: Resend | null = null;

async function getResendClient(): Promise<Resend | null> {
	if (resendInstance) {
		return resendInstance;
	}

	if (!process.env.RESEND_API_KEY) {
		console.warn("Resend API key not configured in environment variables");
		return null;
	}

	resendInstance = new Resend(process.env.RESEND_API_KEY);
	return resendInstance;
}

interface OrderEmailData {
	orderId: string;
	customerName: string;
	customerEmail: string;
	orderType: string;
	total: number;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
	status?: string;
}

export async function sendOrderConfirmationEmail(orderData: OrderEmailData) {
	const settings = await getSettings();

	if (!settings?.email_notifications_enabled) {
		console.log("Email notifications are disabled");
		return { success: false, message: "Email notifications disabled" };
	}

	const resend = await getResendClient();
	if (!resend) {
		return { success: false, message: "Resend not configured" };
	}

	const emailHtml = generateOrderConfirmationHtml(orderData);

	try {
		await resend.emails.send({
			from: settings.notification_email || "orders@yourdomain.com",
			to: orderData.customerEmail,
			subject: `Order Confirmation - #${orderData.orderId.slice(0, 8)}`,
			html: emailHtml,
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to send order confirmation email:", error);
		return { success: false, error };
	}
}

export async function sendOrderStatusUpdateEmail(orderData: OrderEmailData) {
	const settings = await getSettings();

	if (!settings?.email_notifications_enabled) {
		console.log("Email notifications are disabled");
		return { success: false, message: "Email notifications disabled" };
	}

	const resend = await getResendClient();
	if (!resend) {
		return { success: false, message: "Resend not configured" };
	}

	const emailHtml = generateOrderStatusUpdateHtml(orderData);

	try {
		await resend.emails.send({
			from: settings.notification_email || "orders@yourdomain.com",
			to: orderData.customerEmail,
			subject: `Order Status Update - #${orderData.orderId.slice(0, 8)}`,
			html: emailHtml,
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to send order status update email:", error);
		return { success: false, error };
	}
}

function generateOrderConfirmationHtml(orderData: OrderEmailData): string {
	const itemsHtml = orderData.items
		.map(
			(item) => `
		<tr>
			<td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
			<td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${
				item.quantity
			}</td>
			<td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(
				2
			)}</td>
		</tr>
	`
		)
		.join("");

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
		<h1 style="color: #2563eb; margin: 0 0 10px 0;">Order Confirmation</h1>
		<p style="color: #666; margin: 0;">Thank you for your order!</p>
	</div>

	<div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
		<h2 style="color: #333; margin-top: 0;">Order Details</h2>
		<p><strong>Order ID:</strong> #${orderData.orderId.slice(0, 8)}</p>
		<p><strong>Customer:</strong> ${orderData.customerName}</p>
		<p><strong>Order Type:</strong> ${orderData.orderType}</p>

		<h3 style="margin-top: 20px;">Items Ordered</h3>
		<table style="width: 100%; border-collapse: collapse;">
			<thead>
				<tr style="background-color: #f8f9fa;">
					<th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
					<th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
					<th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
				</tr>
			</thead>
			<tbody>
				${itemsHtml}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total:</td>
					<td style="padding: 12px 8px; text-align: right; font-weight: bold;">£${orderData.total.toFixed(
						2
					)}</td>
				</tr>
			</tfoot>
		</table>
	</div>

	<div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; color: #666; font-size: 14px;">
		<p>We'll send you another email when your order status changes.</p>
		<p>If you have any questions, please contact us.</p>
	</div>
</body>
</html>
	`;
}

function generateOrderStatusUpdateHtml(orderData: OrderEmailData): string {
	const statusMessages: Record<string, string> = {
		pending: "Your order has been received and is being processed.",
		confirmed: "Your order has been confirmed and is being prepared.",
		preparing: "Your order is being prepared.",
		ready: "Your order is ready for pickup!",
		"out-for-delivery": "Your order is out for delivery.",
		delivered: "Your order has been delivered. Enjoy your meal!",
		completed: "Your order has been completed.",
		cancelled: "Your order has been cancelled.",
	};

	const statusMessage =
		statusMessages[orderData.status || "pending"] ||
		"Your order status has been updated.";

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
		<h1 style="color: #2563eb; margin: 0 0 10px 0;">Order Status Update</h1>
		<p style="color: #666; margin: 0;">Order #${orderData.orderId.slice(0, 8)}</p>
	</div>

	<div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
		<h2 style="color: #333; margin-top: 0;">Hello ${orderData.customerName},</h2>
		<p style="font-size: 16px;">${statusMessage}</p>

		<div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
			<p style="margin: 0;"><strong>Current Status:</strong> <span style="text-transform: capitalize; color: #2563eb;">${
				orderData.status || "pending"
			}</span></p>
		</div>

		<p><strong>Order Type:</strong> ${orderData.orderType}</p>
		<p><strong>Total:</strong> £${orderData.total.toFixed(2)}</p>
	</div>

	<div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; color: #666; font-size: 14px;">
		<p>Thank you for choosing Fish Feast Pro!</p>
	</div>
</body>
</html>
	`;
}
