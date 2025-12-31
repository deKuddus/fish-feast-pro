"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuthPage = pathname?.startsWith("/auth");

	if (isAuthPage) {
		return <>{children}</>;
	}

	return (
		<>
			<Header />
			<main className="min-h-screen">{children}</main>
			<Footer />
		</>
	);
}
