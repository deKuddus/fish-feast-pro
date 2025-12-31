import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Category } from "@/types";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileCategoryNavProps {
	categories: Category[];
	activeCategory: string | null;
	onCategoryChange: (slug: string | null) => void;
}

export function MobileCategoryNav({ categories }: MobileCategoryNavProps) {
	const [activeSection, setActiveSection] = useState<string>("popular");

	// Track which section is currently in view
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-100px 0px -66% 0px",
			}
		);

		// Observe all sections
		const sections = document.querySelectorAll("section[id]");
		sections.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	}, [categories]);

	const handleCategoryClick = (slug: string) => {
		const element = document.getElementById(slug);
		if (element) {
			const offset = 80; // Header height
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="lg:hidden sticky top-16 z-30 bg-background pb-2">
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex gap-2 pb-2">
					<a
						href="#popular"
						onClick={(e) => {
							e.preventDefault();
							handleCategoryClick("popular");
						}}
						className={cn(
							"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 no-underline",
							activeSection === "popular"
								? "bg-primary text-primary-foreground"
								: "bg-card hover:bg-muted border border-border"
						)}
					>
						<Heart className="h-4 w-4" />
						<span>Popular</span>
					</a>

					{categories
						.filter((c) => c.slug !== "popular")
						.sort((a, b) => a.sort_order - b.sort_order)
						.map((category) => (
							<a
								key={category.id}
								href={`#${category.slug}`}
								onClick={(e) => {
									e.preventDefault();
									handleCategoryClick(category.slug);
								}}
								className={cn(
									"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 no-underline",
									activeSection === category.slug
										? "bg-primary text-primary-foreground"
										: "bg-card hover:bg-muted border border-border"
								)}
							>
								<span>{category.icon}</span>
								<span>{category.name}</span>
							</a>
						))}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}
