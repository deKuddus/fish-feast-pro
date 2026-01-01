import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-[200px]" />
				<Skeleton className="h-10 w-[120px]" />
			</div>
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-[150px]" />
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								{[...Array(4)].map((_, i) => (
									<TableHead key={i}>
										<Skeleton className="h-4 w-full" />
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...Array(rows)].map((_, rowIndex) => (
								<TableRow key={rowIndex}>
									{[...Array(4)].map((_, cellIndex) => (
										<TableCell key={cellIndex}>
											<Skeleton className="h-4 w-full" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export function AdminCardsSkeleton({ cards = 4 }: { cards?: number }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{[...Array(cards)].map((_, i) => (
				<Card key={i}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-[100px]" />
						<Skeleton className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-[80px] mb-1" />
						<Skeleton className="h-3 w-[120px]" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function AdminDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton className="h-10 w-[250px] mb-2" />
				<Skeleton className="h-4 w-[350px]" />
			</div>
			<AdminCardsSkeleton />
			<div className="space-y-4">
				<Skeleton className="h-8 w-[200px]" />
				<AdminTableSkeleton rows={10} />
			</div>
		</div>
	);
}
