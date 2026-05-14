import { NextResponse } from "next/server";
import { getExecutionLogs } from "@/actions/workflow";

interface RouteParams {
	params: Promise<{ id: string; executionId: string }>;
}

export async function GET(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	try {
		const { executionId } = await params;
		const logs = await getExecutionLogs(executionId);

		return NextResponse.json({
			success: true,
			data: logs,
		});
	} catch (error) {
		console.error("Error fetching logs:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch logs" },
			{ status: 500 },
		);
	}
}
