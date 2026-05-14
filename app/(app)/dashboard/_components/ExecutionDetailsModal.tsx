"use client";

import { useEffect, useState } from "react";
import { X, Terminal, CheckCircle2, AlertCircle, Loader2, Clock, Workflow as WorkflowIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
	id: number;
	node_id: string | null;
	status: string;
	message: string | null;
	data: string | null;
	created_at: string;
}

interface ExecutionDetailsModalProps {
	execution: any;
	isOpen: boolean;
	onClose: () => void;
}

export function ExecutionDetailsModal({ execution, isOpen, onClose }: ExecutionDetailsModalProps) {
	const [logs, setLogs] = useState<Log[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && execution) {
			setIsLoading(true);
			fetch(`/api/workflows/${execution.workflow_id}/executions/${execution.id}/logs`)
				.then((res) => res.json())
				.then((result) => {
					if (result.success) {
						setLogs(result.data);
					}
				})
				.finally(() => setIsLoading(false));
		} else {
			setLogs([]);
		}
	}, [isOpen, execution]);

	if (!isOpen || !execution) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
			<div className="bg-card w-full max-w-2xl border border-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-zoom-in">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
					<div className="flex items-center gap-3">
						<div className={cn(
							"h-3 w-3 rounded-full",
							execution.status === "success" ? "bg-success" : execution.status === "failed" ? "bg-destructive" : "bg-warning animate-pulse"
						)} />
						<div>
							<h2 className="text-sm font-bold flex items-center gap-2">
								{execution.workflow_name}
								<span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">
									{execution.id}
								</span>
							</h2>
							<p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
								<Clock className="h-3 w-3" />
								{new Date(execution.started_at).toLocaleString()}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 hover:bg-accent rounded-lg transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Summary Section */}
					<div className="grid grid-cols-2 gap-4">
						<div className="p-3 rounded-lg border border-border/50 bg-muted/20">
							<span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">Status</span>
							<span className={cn(
								"text-sm font-bold uppercase",
								execution.status === "success" ? "text-success" : execution.status === "failed" ? "text-destructive" : "text-warning"
							)}>
								{execution.status}
							</span>
						</div>
						<div className="p-3 rounded-lg border border-border/50 bg-muted/20">
							<span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">Duration</span>
							<span className="text-sm font-bold">
								{execution.finished_at ? 
									((new Date(execution.finished_at).getTime() - new Date(execution.started_at).getTime()) / 1000).toFixed(2) + "s" 
									: "Running..."
								}
							</span>
						</div>
					</div>

					{/* Logs Section */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 border-b border-border pb-2">
							<Terminal className="h-4 w-4 text-primary" />
							<h3 className="text-xs font-bold uppercase tracking-wider">Step Execution Logs</h3>
						</div>

						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
								<Loader2 className="h-6 w-6 animate-spin text-primary" />
								<span className="text-xs">Loading execution details...</span>
							</div>
						) : logs.length === 0 ? (
							<div className="text-center py-12 text-sm text-muted-foreground italic border border-dashed border-border rounded-lg">
								No logs available for this execution.
							</div>
						) : (
							<div className="space-y-3">
								{logs.map((log) => (
									<div 
										key={log.id} 
										className={cn(
											"p-4 rounded-xl border transition-all",
											log.status === "success" ? "bg-success/5 border-success/20" : 
											log.status === "failed" ? "bg-destructive/5 border-destructive/20" : 
											"bg-muted/50 border-border"
										)}
									>
										<div className="flex items-start justify-between gap-4 mb-2">
											<div className="flex items-center gap-2">
												{log.status === "success" ? (
													<CheckCircle2 className="h-4 w-4 text-success" />
												) : log.status === "failed" ? (
													<AlertCircle className="h-4 w-4 text-destructive" />
												) : (
													<Loader2 className="h-4 w-4 text-primary animate-spin" />
												)}
												<span className="text-xs font-bold font-mono text-primary">
													{log.node_id || "SYSTEM"}
												</span>
											</div>
											<span className="text-[10px] text-muted-foreground font-mono">
												{new Date(log.created_at).toLocaleTimeString()}
											</span>
										</div>
										
										<p className={cn(
											"text-xs leading-relaxed",
											log.status === "failed" ? "text-destructive font-semibold" : "text-foreground/80"
										)}>
											{log.message}
										</p>

										{log.data && (
											<div className="mt-3">
												<span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Output Data:</span>
												<pre className="p-3 rounded-lg bg-black/40 border border-border/50 text-[11px] font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
													{log.data}
												</pre>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-lg bg-muted hover:bg-accent text-xs font-semibold transition-colors"
					>
						Close Details
					</button>
				</div>
			</div>
		</div>
	);
}
