import type { Edge, Node } from "@xyflow/react";
import { notFound } from "next/navigation";
import {
	getEdgesByWorkflow,
	getNodesByWorkflow,
	getWorkflowById,
} from "@/actions/workflow";
import { WorkflowBuilder } from "./_components/WorkflowBuilder";

interface WorkflowPageProps {
	params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
	const { id } = await params;
	const workflow = await getWorkflowById(id);

	if (!workflow) {
		notFound();
	}

	const dbNodes = await getNodesByWorkflow(id);
	const dbEdges = await getEdgesByWorkflow(id);

	// Convert DB nodes to React Flow nodes
	const flowNodes: Node[] = dbNodes.map((n) => ({
		id: n.id,
		type: n.type,
		position: { x: n.position_x, y: n.position_y },
		data: { config: n.data },
	}));

	// Convert DB edges to React Flow edges
	const flowEdges: Edge[] = dbEdges.map((e) => ({
		id: e.id,
		source: e.source,
		target: e.target,
		sourceHandle: e.source_handle ?? undefined,
		targetHandle: e.target_handle ?? undefined,
		animated: true,
	}));

	return (
		<WorkflowBuilder
			workflowId={id}
			workflowName={workflow.name}
			initialNodes={flowNodes}
			initialEdges={flowEdges}
		/>
	);
}
