import {
	Activity,
	CheckCircle2,
	Timer,
	TrendingUp,
	Workflow,
} from "lucide-react";
import { getDashboardMetrics } from "@/actions/workflow";
import { ExecutionTable } from "./_components/ExecutionTable";
import { MetricCard } from "./_components/MetricCard";

export default async function DashboardPage() {
	const metrics = await getDashboardMetrics();

	return (
		<div className="p-8 space-y-8 animate-fade-in">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Overview of your workflow automations
				</p>
			</div>

			{/* Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="Total Workflows"
					value={metrics.totalWorkflows}
					icon={<Workflow className="h-4 w-4" />}
					accent="primary"
				/>
				<MetricCard
					title="Active Runs"
					value={metrics.activeExecutions}
					icon={<Activity className="h-4 w-4" />}
					accent="warning"
				/>
				<MetricCard
					title="Success Rate"
					value={`${metrics.successRate.toFixed(1)}%`}
					icon={<CheckCircle2 className="h-4 w-4" />}
					accent="success"
				/>
				<MetricCard
					title="Avg Duration"
					value={`${metrics.avgDuration.toFixed(1)}s`}
					icon={<Timer className="h-4 w-4" />}
					accent="primary"
				/>
			</div>

			{/* Stats overview */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
					<div className="flex items-center gap-2 mb-4">
						<TrendingUp className="h-4 w-4 text-primary" />
						<h2 className="text-sm font-semibold">Recent Executions</h2>
					</div>
					<ExecutionTable executions={metrics.recentExecutions} />
				</div>

				{/* Quick Stats */}
				<div className="rounded-lg border border-border bg-card p-6 space-y-6">
					<h2 className="text-sm font-semibold">Quick Stats</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Total Executions
							</span>
							<span className="text-sm font-semibold">
								{metrics.totalExecutions}
							</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Successful</span>
							<span className="text-sm font-semibold text-success">
								{Math.round(
									(metrics.successRate / 100) * metrics.totalExecutions,
								)}
							</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Failed</span>
							<span className="text-sm font-semibold text-destructive">
								{metrics.totalExecutions -
									Math.round(
										(metrics.successRate / 100) * metrics.totalExecutions,
									)}
							</span>
						</div>
						<div className="h-px bg-border" />
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Active Workflows
							</span>
							<span className="text-sm font-semibold">
								{metrics.totalWorkflows}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
