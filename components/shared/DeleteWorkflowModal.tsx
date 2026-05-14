"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface DeleteWorkflowModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	workflowName: string;
	isDeleting: boolean;
}

export function DeleteWorkflowModal({
	isOpen,
	onClose,
	onConfirm,
	workflowName,
	isDeleting,
}: DeleteWorkflowModalProps) {
	// Close on ESC
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-pure-fade-in"
				onClick={onClose}
			/>
			
			{/* Modal Content */}
			<div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-zoom-in">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent transition-colors"
				>
					<X className="h-4 w-4" />
				</button>

				<div className="flex flex-col items-center text-center space-y-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
						<AlertTriangle className="h-6 w-6 text-destructive" />
					</div>
					
					<div className="space-y-2">
						<h3 className="text-lg font-semibold leading-none">Delete Workflow</h3>
						<p className="text-sm text-muted-foreground">
							Are you sure you want to delete <strong>{workflowName}</strong>? 
							All nodes, edges, and logs will be permanently removed.
						</p>
					</div>
				</div>

				<div className="mt-8 flex gap-3">
					<button
						onClick={onClose}
						disabled={isDeleting}
						className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isDeleting}
						className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
					>
						{isDeleting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Delete Workflow"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
