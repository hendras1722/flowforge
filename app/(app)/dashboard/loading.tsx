export default function DashboardLoading() {
	return (
		<div className="p-8 space-y-8">
			{/* Header skeleton */}
			<div className="space-y-2">
				<div className="skeleton h-7 w-40" />
				<div className="skeleton h-4 w-64" />
			</div>

			{/* Metric cards skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((id) => (
					<div
						key={`metric-skeleton-${id}`}
						className="rounded-lg border border-border bg-card p-5 space-y-3"
					>
						<div className="skeleton h-3 w-20" />
						<div className="skeleton h-8 w-16" />
					</div>
				))}
			</div>

			{/* Table skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 rounded-lg border border-border bg-card p-6 space-y-4">
					<div className="skeleton h-4 w-36" />
					{[1, 2, 3, 4, 5].map((id) => (
						<div key={`row-skeleton-${id}`} className="flex gap-4">
							<div className="skeleton h-4 w-16" />
							<div className="skeleton h-4 w-32" />
							<div className="skeleton h-4 w-24" />
							<div className="skeleton h-4 w-16" />
						</div>
					))}
				</div>
				<div className="rounded-lg border border-border bg-card p-6 space-y-4">
					<div className="skeleton h-4 w-24" />
					{[1, 2, 3, 4].map((id) => (
						<div key={`stat-skeleton-${id}`} className="flex justify-between">
							<div className="skeleton h-4 w-28" />
							<div className="skeleton h-4 w-10" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
