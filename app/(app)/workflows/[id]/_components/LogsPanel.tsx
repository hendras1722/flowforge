"use client";

import { Terminal, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface Log {
	id: number;
	node_id: string | null;
	status: string;
	message: string | null;
	data: string | null;
	created_at: string;
}

interface LogsPanelProps {
	logs: Log[];
	isOpen: boolean;
	onClose: () => void;
}

export function LogsPanel({ logs, isOpen, onClose }: LogsPanelProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [logs]);

	if (!isOpen) return null;

	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] max-h-[300px] border border-border bg-card/95 backdrop-blur-xl rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-in-top">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
				<div className="flex items-center gap-2">
					<Terminal className="h-4 w-4 text-primary" />
					<span className="text-xs font-semibold uppercase tracking-wider">
						Execution Logs
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-1 hover:bg-accent rounded-md transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Logs List */}
			<div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1 bg-black/20">
				{logs.length === 0 && (
					<div className="flex items-center justify-center h-20 text-muted-foreground italic">
						Waiting for logs...
					</div>
				)}
				{logs.map((log) => (
					<div
						key={log.id}
						className={cn(
							"px-2 py-1 rounded border-l-2",
							log.status === "success"
								? "border-success bg-success/5"
								: log.status === "failed"
									? "border-destructive bg-destructive/5"
									: "border-primary bg-primary/5",
						)}
					>
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								{log.status === "success" ? (
									<CheckCircle2 className="h-3 w-3 text-success" />
								) : log.status === "failed" ? (
									<AlertCircle className="h-3 w-3 text-destructive" />
								) : (
									<Loader2 className="h-3 w-3 text-primary animate-spin" />
								)}
								<span className="font-bold text-primary/80">
									{log.node_id || "SYSTEM"}:
								</span>
								<span>{log.message}</span>
							</div>
							<span className="text-[10px] text-muted-foreground/50">
								{new Date(log.created_at).toLocaleTimeString()}
							</span>
						</div>
						{log.data && (
							<pre className="mt-1 ml-5 p-1.5 bg-background/50 rounded border border-border/50 text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
								{log.data}
							</pre>
						)}
					</div>
				))}
				<div ref={scrollRef} />
			</div>
		</div>
	);
}
