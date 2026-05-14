"use client";

import { cn } from "@/lib/utils";
import type { Execution } from "@/types/workflow";
import { useState } from "react";
import { ExecutionDetailsModal } from "./ExecutionDetailsModal";

interface ExecutionTableProps {
	executions: (Execution & { workflow_name: string })[];
}

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
	success: { dot: "bg-success", label: "text-success" },
	failed: { dot: "bg-destructive", label: "text-destructive" },
	running: { dot: "bg-warning animate-pulse", label: "text-warning" },
	pending: { dot: "bg-muted-foreground", label: "text-muted-foreground" },
	retrying: { dot: "bg-warning animate-pulse", label: "text-warning" },
};

function formatTime(dateStr: string | null): string {
	if (!dateStr) return "—";
	const date = new Date(dateStr);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDuration(start: string | null, end: string | null): string {
	if (!start || !end) return "—";
	const ms = new Date(end).getTime() - new Date(start).getTime();
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionTable({ executions }: ExecutionTableProps) {
	const [selectedExecution, setSelectedExecution] = useState<any>(null);

	if (executions.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
				No executions yet
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border text-left">
							<th className="pb-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Status
							</th>
							<th className="pb-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Workflow
							</th>
							<th className="pb-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Started
							</th>
							<th className="pb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Duration
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/50">
						{executions.map((exec) => {
							const statusStyle =
								STATUS_STYLES[exec.status] ?? STATUS_STYLES.pending;
							return (
								<tr
									key={exec.id}
									onClick={() => setSelectedExecution(exec)}
									className="group transition-colors hover:bg-accent/30 cursor-pointer"
								>
									<td className="py-3 pr-4">
										<div className="flex items-center gap-2">
											<div
												className={cn("h-2 w-2 rounded-full", statusStyle.dot)}
											/>
											<span
												className={cn(
													"text-xs font-medium capitalize",
													statusStyle.label,
												)}
											>
												{exec.status}
											</span>
										</div>
									</td>
									<td className="py-3 pr-4 font-medium">
										{exec.workflow_name || "Unknown"}
									</td>
									<td className="py-3 pr-4 text-muted-foreground" suppressHydrationWarning>
										{formatTime(exec.started_at)}
									</td>
									<td className="py-3 text-muted-foreground" suppressHydrationWarning>
										{formatDuration(exec.started_at, exec.finished_at)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<ExecutionDetailsModal 
				execution={selectedExecution} 
				isOpen={!!selectedExecution} 
				onClose={() => setSelectedExecution(null)} 
			/>
		</>
	);
}
