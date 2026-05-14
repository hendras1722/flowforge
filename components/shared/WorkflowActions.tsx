"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteWorkflow } from "@/actions/workflow";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeleteWorkflowModal } from "./DeleteWorkflowModal";

interface WorkflowActionsProps {
	workflowId: string;
	workflowName: string;
	size?: "sm" | "md";
	onDeleted?: () => void;
}

export function WorkflowActions({
	workflowId,
	workflowName,
	size = "md",
	onDeleted,
}: WorkflowActionsProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteWorkflow(workflowId);
			setIsModalOpen(false);
			if (onDeleted) {
				onDeleted();
			} else {
				router.refresh();
			}
		} catch (error) {
			console.error("Failed to delete workflow:", error);
			alert("Failed to delete workflow");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsModalOpen(true);
				}}
				disabled={isDeleting}
				className={cn(
					"rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50",
					size === "sm" ? "p-1" : "p-2"
				)}
				title="Delete Workflow"
			>
				{isDeleting ? (
					<Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
				) : (
					<Trash2 className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
				)}
			</button>

			<DeleteWorkflowModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleDelete}
				workflowName={workflowName}
				isDeleting={isDeleting}
			/>
		</>
	);
}
