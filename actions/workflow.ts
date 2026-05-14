"use server";

import { getDb } from "@/db/client";
import type {
	Execution,
	ExecutionLog,
	Workflow,
	WorkflowEdge,
	WorkflowNode,
} from "@/types/workflow";

// ─── Workflows ───────────────────────────────────────────────

export async function getWorkflows(): Promise<Workflow[]> {
	const db = getDb();
	return db
		.query("SELECT * FROM workflows ORDER BY updated_at DESC")
		.all() as Workflow[];
}

export async function getWorkflowById(id: string): Promise<Workflow | null> {
	const db = getDb();
	const row = db.query("SELECT * FROM workflows WHERE id = ?").get(id);
	return (row as Workflow) ?? null;
}

export async function createWorkflow(
	id: string,
	name: string,
	description: string,
): Promise<Workflow> {
	const db = getDb();
	db.query(
		"INSERT INTO workflows (id, name, description) VALUES (?, ?, ?)",
	).run(id, name, description);
	return getWorkflowById(id) as Promise<Workflow>;
}

export async function createWorkflowAction(
	prevState: any,
	formData: FormData,
) {
	const name = formData.get("name") as string;
	const description = formData.get("description") as string;

	if (!name) {
		return { success: false, message: "Name is required" };
	}

	try {
		const id = `wf-${Date.now()}`;
		const workflow = await createWorkflow(id, name, description);
		return { success: true, data: workflow };
	} catch (error) {
		return { success: false, message: "Failed to create workflow" };
	}
}

export async function updateWorkflow(
	id: string,
	name: string,
	description: string,
): Promise<void> {
	const db = getDb();
	db.query(
		"UPDATE workflows SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
	).run(name, description, id);
}

export async function deleteWorkflow(id: string): Promise<void> {
	const db = getDb();
	db.query("DELETE FROM workflows WHERE id = ?").run(id);
}

// ─── Nodes ───────────────────────────────────────────────────

export async function getNodesByWorkflow(
	workflowId: string,
): Promise<WorkflowNode[]> {
	const db = getDb();
	return db
		.query("SELECT * FROM nodes WHERE workflow_id = ?")
		.all(workflowId) as WorkflowNode[];
}

export async function saveNodes(
	workflowId: string,
	nodes: WorkflowNode[],
): Promise<void> {
	const db = getDb();
	db.query("DELETE FROM nodes WHERE workflow_id = ?").run(workflowId);
	const insert = db.query(
		"INSERT INTO nodes (id, workflow_id, type, position_x, position_y, data) VALUES (?, ?, ?, ?, ?, ?)",
	);
	for (const node of nodes) {
		insert.run(
			node.id,
			workflowId,
			node.type,
			node.position_x,
			node.position_y,
			node.data,
		);
	}
}

// ─── Edges ───────────────────────────────────────────────────

export async function getEdgesByWorkflow(
	workflowId: string,
): Promise<WorkflowEdge[]> {
	const db = getDb();
	return db
		.query("SELECT * FROM edges WHERE workflow_id = ?")
		.all(workflowId) as WorkflowEdge[];
}

export async function saveEdges(
	workflowId: string,
	edges: WorkflowEdge[],
): Promise<void> {
	const db = getDb();
	db.query("DELETE FROM edges WHERE workflow_id = ?").run(workflowId);
	const insert = db.query(
		"INSERT INTO edges (id, workflow_id, source, target, source_handle, target_handle) VALUES (?, ?, ?, ?, ?, ?)",
	);
	for (const edge of edges) {
		insert.run(
			edge.id,
			workflowId,
			edge.source,
			edge.target,
			edge.source_handle ?? null,
			edge.target_handle ?? null,
		);
	}
}

// ─── Executions ──────────────────────────────────────────────

export async function getExecutionsByWorkflow(
	workflowId: string,
): Promise<Execution[]> {
	const db = getDb();
	return db
		.query(
			"SELECT * FROM executions WHERE workflow_id = ? ORDER BY started_at DESC",
		)
		.all(workflowId) as Execution[];
}

export async function getAllExecutions(): Promise<
	(Execution & { workflow_name: string })[]
> {
	const db = getDb();
	return db
		.query(
			`SELECT e.*, w.name as workflow_name 
       FROM executions e 
       LEFT JOIN workflows w ON e.workflow_id = w.id 
       ORDER BY e.started_at DESC 
       LIMIT 100`,
		)
		.all() as (Execution & { workflow_name: string })[];
}

export async function createExecution(
	id: string,
	workflowId: string,
): Promise<void> {
	const db = getDb();
	db.query(
		"INSERT INTO executions (id, workflow_id, status, started_at) VALUES (?, ?, 'running', CURRENT_TIMESTAMP)",
	).run(id, workflowId);
}

export async function updateExecutionStatus(
	id: string,
	status: string,
): Promise<void> {
	const db = getDb();
	if (status === "success" || status === "failed") {
		db.query(
			"UPDATE executions SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?",
		).run(status, id);
	} else {
		db.query("UPDATE executions SET status = ? WHERE id = ?").run(status, id);
	}
}

// ─── Execution Logs ──────────────────────────────────────────

export async function getExecutionLogs(
	executionId: string,
): Promise<ExecutionLog[]> {
	const db = getDb();
	return db
		.query(
			"SELECT * FROM execution_logs WHERE execution_id = ? ORDER BY created_at ASC",
		)
		.all(executionId) as ExecutionLog[];
}

export async function createExecutionLog(
	executionId: string,
	nodeId: string | null,
	status: string,
	message: string | null,
	data: string | null,
): Promise<void> {
	const db = getDb();
	db.query(
		"INSERT INTO execution_logs (execution_id, node_id, status, message, data) VALUES (?, ?, ?, ?, ?)",
	).run(executionId, nodeId, status, message, data);
}

// ─── Dashboard Metrics ───────────────────────────────────────

export interface DashboardMetrics {
	totalWorkflows: number;
	activeExecutions: number;
	successRate: number;
	avgDuration: number;
	totalExecutions: number;
	recentExecutions: (Execution & { workflow_name: string })[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const db = getDb();

	const totalWorkflows = (
		db.query("SELECT COUNT(*) as count FROM workflows").get() as {
			count: number;
		}
	).count;

	const activeExecutions = (
		db
			.query(
				"SELECT COUNT(*) as count FROM executions WHERE status = 'running'",
			)
			.get() as { count: number }
	).count;

	const totalExecutions = (
		db.query("SELECT COUNT(*) as count FROM executions").get() as {
			count: number;
		}
	).count;

	const successCount = (
		db
			.query(
				"SELECT COUNT(*) as count FROM executions WHERE status = 'success'",
			)
			.get() as { count: number }
	).count;

	const successRate =
		totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

	const avgResult = db
		.query(
			`SELECT AVG(
        CASE WHEN finished_at IS NOT NULL AND started_at IS NOT NULL 
        THEN (julianday(finished_at) - julianday(started_at)) * 86400 
        ELSE NULL END
      ) as avg_duration FROM executions`,
		)
		.get() as { avg_duration: number | null };

	const avgDuration = avgResult.avg_duration ?? 0;

	const recentExecutions = db
		.query(
			`SELECT e.*, w.name as workflow_name 
       FROM executions e 
       LEFT JOIN workflows w ON e.workflow_id = w.id 
       ORDER BY e.started_at DESC 
       LIMIT 10`,
		)
		.all() as (Execution & { workflow_name: string })[];

	return {
		totalWorkflows,
		activeExecutions,
		successRate,
		avgDuration,
		totalExecutions,
		recentExecutions,
	};
}
