export default function WorkflowsLoading() {
	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="skeleton h-7 w-32" />
					<div className="skeleton h-4 w-64" />
				</div>
				<div className="skeleton h-10 w-36 rounded-lg" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3, 4, 5, 6].map((id) => (
					<div
						key={`workflow-skeleton-${id}`}
						className="rounded-lg border border-border bg-card p-5 space-y-4"
					>
						<div className="flex items-center gap-3">
							<div className="skeleton h-10 w-10 rounded-lg" />
							<div className="space-y-1.5 flex-1">
								<div className="skeleton h-4 w-28" />
								<div className="skeleton h-3 w-40" />
							</div>
						</div>
						<div className="skeleton h-3 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}
