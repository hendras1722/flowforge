import { NextResponse } from "next/server";
import {
	createExecution,
	createExecutionLog,
	getEdgesByWorkflow,
	getNodesByWorkflow,
	updateExecutionStatus,
} from "@/actions/workflow";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function POST(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	try {
		const { id: workflowId } = await params;
		const executionId = `exec-${Date.now()}`;

		await createExecution(executionId, workflowId);
		await createExecutionLog(
			executionId,
			null,
			"running",
			"Workflow execution started",
			null,
		);

		// Get the workflow graph
		const nodes = await getNodesByWorkflow(workflowId);
		const edges = await getEdgesByWorkflow(workflowId);

		// Simple topological execution (non-blocking)
		executeWorkflow(executionId, nodes, edges).catch((err) =>
			console.error("Execution error:", err),
		);

		return NextResponse.json({
			success: true,
			data: { executionId },
			message: "Workflow execution started",
		});
	} catch (error) {
		console.error("Error executing workflow:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to execute workflow" },
			{ status: 500 },
		);
	}
}

interface SimpleNode {
	id: string;
	type: string;
	data: string;
}

interface SimpleEdge {
	source: string;
	target: string;
	source_handle?: string;
	target_handle?: string;
}

async function executeWorkflow(
	executionId: string,
	nodes: SimpleNode[],
	edges: SimpleEdge[],
): Promise<void> {
	const adjList = new Map<string, SimpleEdge[]>();
	const inDegree = new Map<string, number>();
	const context: Record<string, any> = {};

	for (const node of nodes) {
		adjList.set(node.id, []);
		inDegree.set(node.id, 0);
	}

	for (const edge of edges) {
		adjList.get(edge.source)?.push(edge);
		inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
	}

	const queue: string[] = [];
	for (const [nodeId, degree] of inDegree) {
		if (degree === 0) queue.push(nodeId);
	}

	const nodeMap = new Map(nodes.map((n) => [n.id, n]));
	const skippedNodes = new Set<string>();

	try {
		while (queue.length > 0) {
			const currentId = queue.shift();
			if (!currentId) continue;
			const node = nodeMap.get(currentId);
			if (!node) continue;

			// If the node is skipped, we don't execute it, but we must propagate skip to children
			if (skippedNodes.has(currentId)) {
				await createExecutionLog(
					executionId,
					currentId,
					"skipped",
					`Node skipped due to branching logic`,
					null,
				);

				const outgoingEdges = adjList.get(currentId) ?? [];
				for (const edge of outgoingEdges) {
					skippedNodes.add(edge.target);
					const targetId = edge.target;
					const newDegree = (inDegree.get(targetId) ?? 1) - 1;
					inDegree.set(targetId, newDegree);
					if (newDegree === 0) queue.push(targetId);
				}
				continue;
			}

			await createExecutionLog(
				executionId,
				currentId,
				"running",
				`Executing node: ${currentId}`,
				null,
			);

			const config = JSON.parse(node.data || "{}");
			const result = await performNodeExecution(node.type, config, context);
			
			context[currentId] = result;
			if (node.type === "http") context.lastResponse = result;

			await createExecutionLog(
				executionId,
				currentId,
				"success",
				`Node ${currentId} completed`,
				safeStringify(result),
			);

			const outgoingEdges = adjList.get(currentId) ?? [];
			for (const edge of outgoingEdges) {
				const targetId = edge.target;
				
				// Branching logic for condition nodes
				if (node.type === "condition") {
					const conditionResult = !!result;
					const edgeHandle = edge.source_handle; // Use snake_case from DB
					
					if (edgeHandle && edgeHandle !== String(conditionResult)) {
						skippedNodes.add(targetId);
					}
				}

				const newDegree = (inDegree.get(targetId) ?? 1) - 1;
				inDegree.set(targetId, newDegree);
				if (newDegree === 0) queue.push(targetId);
			}
		}

		await updateExecutionStatus(executionId, "success");
		await createExecutionLog(
			executionId,
			null,
			"success",
			"Workflow execution completed successfully",
			null,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		await updateExecutionStatus(executionId, "failed");
		await createExecutionLog(
			executionId,
			null,
			"failed",
			`Workflow execution failed: ${message}`,
			null,
		);
	}
}

async function performNodeExecution(
	type: string,
	config: Record<string, unknown>,
	context: Record<string, any>,
): Promise<any> {
	switch (type) {
		case "http": {
			const method = (config.method as string) ?? "GET";
			const url = config.url as string;
			const headers = JSON.parse((config.headers as string) || "{}");
			const body = config.body as string;

			const start = Date.now();
			try {
				const response = await fetch(url, {
					method,
					headers,
					body: method !== "GET" && method !== "HEAD" ? body : undefined,
				});

				const text = await response.text();
				let data = text;
				try {
					data = JSON.parse(text);
				} catch (e) {
					// Not JSON
				}

				return {
					status: response.status,
					statusText: response.statusText,
					data: data,
					body: data, // Alias for convenience
					duration: Date.now() - start,
				};
			} catch (error) {
				throw new Error(`HTTP Request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
			}
		}
		case "delay": {
			const duration = (config.duration as number) ?? 1;
			const unit = (config.unit as string) ?? "s";
			let ms = duration;
			if (unit === "s") ms = duration * 1000;
			if (unit === "m") ms = duration * 60000;
			await new Promise((resolve) => setTimeout(resolve, Math.min(ms, 60000)));
			return { delayed: ms };
		}
		case "condition": {
			const expression = (config.expression as string) || "true";
			try {
				// Create a proxy-like response object that merges data into the response
				const lastRes = context.lastResponse || {};
				let responseProxy = lastRes;
				if (lastRes && typeof lastRes.data === "object" && lastRes.data !== null) {
					responseProxy = Array.isArray(lastRes.data) 
						? { ...lastRes, items: lastRes.data }
						: { ...lastRes, ...lastRes.data };
				}

				const fn = new Function("context", "response", `return (${expression})`);
				return fn(context, responseProxy);
			} catch (error) {
				throw new Error(`Condition evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
			}
		}
		case "script": {
			const code = (config.code as string) || "";
			const scriptLogs: { type: "log" | "alert"; message: string }[] = [];
			
			const serverLog = console.log;
			const logFunc = (msg: any) => {
				const s = typeof msg === "object" ? JSON.stringify(msg) : String(msg);
				scriptLogs.push({ type: "log", message: s });
				serverLog(`[Workflow Script]: ${s}`);
			};

			const alertFunc = (msg: any) => {
				const s = String(msg);
				scriptLogs.push({ type: "alert", message: s });
				serverLog(`[Workflow Alert]: ${s}`);
			};

			try {
				const lastRes = context.lastResponse || {};
				let responseProxy = lastRes;
				if (lastRes && typeof lastRes.data === "object" && lastRes.data !== null) {
					responseProxy = Array.isArray(lastRes.data) 
						? { ...lastRes, items: lastRes.data }
						: { ...lastRes, ...lastRes.data };
				}
				
				const scriptConsole = {
					...console,
					log: logFunc,
					error: logFunc,
					warn: logFunc,
					info: logFunc,
				};
				
				// Use AsyncFunction and eval to support implicit return of the last expression (REPL-like behavior)
				const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
				const fn = new AsyncFunction("context", "response", "console", "log", "alert", "code", `
					return eval(code);
				`);
				
				const result = await fn(context, responseProxy, scriptConsole, logFunc, alertFunc, code);
				
				// Auto-log the result if it's not undefined and not already in logs
				if (result !== undefined) {
					const s = typeof result === "object" ? JSON.stringify(result) : String(result);
					scriptLogs.push({ type: "log", message: `Result: ${s}` });
				}

				return { success: true, result, output: scriptLogs };
			} catch (error) {
				throw new Error(`Script execution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
			}
		}
		default:
			return { executed: true };
	}
}

function safeStringify(obj: any): string | null {
	try {
		return JSON.stringify(obj);
	} catch (e) {
		return "[Unserializable Data]";
	}
}
