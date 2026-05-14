import { NextResponse } from "next/server";
import { saveEdges, saveNodes } from "@/actions/workflow";
import type { WorkflowEdge, WorkflowNode } from "@/types/workflow";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function PUT(
	request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	try {
		const { id } = await params;
		const body = await request.json();
		const { nodes, edges } = body as {
			nodes: WorkflowNode[];
			edges: WorkflowEdge[];
		};

		await saveNodes(id, nodes);
		await saveEdges(id, edges);

		return NextResponse.json({ success: true, message: "Workflow saved" });
	} catch (error) {
		console.error("Error saving workflow:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to save workflow" },
			{ status: 500 },
		);
	}
}
