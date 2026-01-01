import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { getSettings } from "@/lib/data/settings";
import { Providers } from "@/providers/providers";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-playfair",
});

export const metadata: Metadata = {
	title: "Fish Feast Pro - Premium Seafood Restaurant",
	description: "Order fresh seafood online for delivery or pickup",
	keywords: ["seafood", "restaurant", "online ordering", "delivery", "pickup"],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const settings = await getSettings().catch(() => null);

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
			>
				<Providers>
					<ConditionalLayout settings={settings}>{children}</ConditionalLayout>
				</Providers>
			</body>
		</html>
	);
}
