import { NextResponse } from "next/server";
import { createWorkflow } from "@/actions/workflow";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { name, description } = body as {
			name: string;
			description: string;
		};

		if (!name || name.trim().length === 0) {
			return NextResponse.json(
				{ success: false, message: "Name is required" },
				{ status: 400 },
			);
		}

		const id = `wf-${Date.now()}`;
		const workflow = await createWorkflow(
			id,
			name.trim(),
			description?.trim() ?? "",
		);

		return NextResponse.json({
			success: true,
			data: workflow,
			message: "Workflow created",
		});
	} catch (error) {
		console.error("Error creating workflow:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create workflow" },
			{ status: 500 },
		);
	}
}
