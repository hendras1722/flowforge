"use client";

import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createWorkflowAction } from "@/actions/workflow";

const initialState = {
	success: false,
	message: "",
};

export default function NewWorkflowPage() {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(
		createWorkflowAction,
		initialState,
	);

	useEffect(() => {
		if (state?.success && state.data) {
			router.push(`/workflows/${state.data.id}`);
			router.refresh();
		}
	}, [state, router]);

	return (
		<div className="flex items-center justify-center min-h-screen p-8 animate-fade-in">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-3">
					<div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/15 mx-auto">
						<Zap className="h-7 w-7 text-primary" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						Create New Workflow
					</h1>
					<p className="text-sm text-muted-foreground">
						Define your automation workflow and start building
					</p>
				</div>

				{/* Form */}
				<form
					action={formAction}
					className="rounded-lg border border-border bg-card p-6 space-y-5"
				>
					<div className="space-y-1.5">
						<label
							htmlFor="wf-name"
							className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
						>
							Workflow Name
						</label>
						<input
							id="wf-name"
							name="name"
							type="text"
							placeholder="e.g. API Health Check"
							className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="wf-desc"
							className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
						>
							Description
							<span className="text-muted-foreground/50 ml-1 normal-case tracking-normal">
								(optional)
							</span>
						</label>
						<textarea
							id="wf-desc"
							name="description"
							placeholder="Describe what this workflow does..."
							rows={3}
							className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
						/>
					</div>

					{state?.message && !state.success && (
						<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-xs text-destructive font-medium">
							{state.message}
						</div>
					)}

					<button
						type="submit"
						disabled={isPending}
						className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
					>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Workflow"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
