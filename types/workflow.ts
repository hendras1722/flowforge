export type NodeType = "http" | "delay" | "condition" | "script";

export type ExecutionStatus =
	| "pending"
	| "running"
	| "success"
	| "failed"
	| "retrying";

export interface WorkflowNode {
	id: string;
	workflow_id: string;
	type: string;
	position_x: number;
	position_y: number;
	data: string; // JSON string
}

export interface WorkflowEdge {
	id: string;
	workflow_id: string;
	source: string;
	target: string;
	source_handle?: string;
	target_handle?: string;
}

export interface Workflow {
	id: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface Execution {
	id: string;
	workflow_id: string;
	status: ExecutionStatus;
	started_at: string | null;
	finished_at: string | null;
}

export interface ExecutionLog {
	id: number;
	execution_id: string;
	node_id: string | null;
	status: string;
	message: string | null;
	data: string | null;
	created_at: string;
}

// Parsed node data types
export interface HttpNodeData {
	label: string;
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	url: string;
	headers: string;
	body: string;
}

export interface DelayNodeData {
	label: string;
	duration: number;
	unit: "ms" | "s" | "m";
}

export interface ConditionNodeData {
	label: string;
	expression: string;
}

export interface ScriptNodeData {
	label: string;
	code: string;
	language: "javascript";
}

export type NodeData =
	| HttpNodeData
	| DelayNodeData
	| ConditionNodeData
	| ScriptNodeData;
