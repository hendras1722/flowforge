import { Loader2 } from "lucide-react";

export default function WorkflowBuilderLoading() {
	return (
		<div className="flex h-[calc(100vh-1px)] items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">Loading workflow...</p>
			</div>
		</div>
	);
}
