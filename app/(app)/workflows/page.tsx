import {
	ArrowRight,
	Clock,
	Plus,
	Workflow as WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { getWorkflows } from "@/actions/workflow";
import { WorkflowActions as WorkflowCardActions } from "@/components/shared/WorkflowActions";

export default async function WorkflowsPage() {
	const workflows = await getWorkflows();

	return (
		<div className="p-8 space-y-8 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage and build your automation workflows
					</p>
				</div>
				<Link
					href="/workflows/new"
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/20"
				>
					<Plus className="h-4 w-4" />
					New Workflow
				</Link>
			</div>

			{/* Workflow Grid */}
			{workflows.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 mb-4">
						<WorkflowIcon className="h-8 w-8 text-primary" />
					</div>
					<h2 className="text-lg font-semibold">No workflows yet</h2>
					<p className="text-sm text-muted-foreground mt-1 max-w-sm">
						Create your first workflow to start automating tasks
					</p>
					<Link
						href="/workflows/new"
						className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
					>
						<Plus className="h-4 w-4" />
						Create Workflow
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{workflows.map((wf, index) => (
						<Link
							key={wf.id}
							href={`/workflows/${wf.id}`}
							className="group relative rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
										<WorkflowIcon className="h-5 w-5 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
											{wf.name}
										</h3>
										<p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
											{wf.description || "No description"}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<WorkflowCardActions
										workflowId={wf.id}
										workflowName={wf.name}
									/>
									<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
								</div>
							</div>
							<div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
								<Clock className="h-3 w-3" />
								<span>
									Updated{" "}
									{new Date(wf.updated_at).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
							{/* Bottom gradient accent */}
							<div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
