import { cn } from "@/lib/utils";
import { Category } from "@/types";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface CategorySidebarProps {
	categories: Category[];
	activeCategory: string | null;
	onCategoryChange: (slug: string | null) => void;
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
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
		<aside className="w-64 shrink-0 hidden lg:block">
			<nav className="sticky top-20 space-y-1">
				<a
					href="#popular"
					onClick={(e) => {
						e.preventDefault();
						handleCategoryClick("popular");
					}}
					className={cn(
						"category-item w-full text-left",
						activeSection === "popular" && "active"
					)}
				>
					<Heart className="h-4 w-4" />
					<span>Most popular products</span>
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
								"category-item w-full text-left",
								activeSection === category.slug && "active"
							)}
						>
							<span>{category.icon}</span>
							<span>{category.name}</span>
						</a>
					))}
			</nav>
		</aside>
	);
}
