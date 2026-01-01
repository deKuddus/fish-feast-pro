"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";

interface ConditionalLayoutProps {
	children: React.ReactNode;
	settings?: any;
}

export function ConditionalLayout({
	children,
	settings,
}: ConditionalLayoutProps) {
	const pathname = usePathname();
	const isAuthPage = pathname?.startsWith("/auth");

	if (isAuthPage) {
		return <>{children}</>;
	}

	return (
		<>
			<Header />
			<main className="min-h-screen">{children}</main>
			<Footer settings={settings} />
		</>
	);
}
