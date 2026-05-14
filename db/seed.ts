import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./client";

const db = getDb();

// Apply schema first
const schemaPath = join(process.cwd(), "db/schema.sql");
const schema = readFileSync(schemaPath, "utf8");
db.exec(schema);

console.log("🚀 Seeding FlowForge database...");

try {
	db.exec("DELETE FROM workflows WHERE id = 'wf-health-check'");
	const wfHealthId = "wf-health-check";
	db.query(
		"INSERT INTO workflows (id, name, description) VALUES (?, ?, ?)",
	).run(
		wfHealthId,
		"Health Check Live",
		"Real-time health check for local API",
	);

	const nodesHealth = [
		{
			id: "h-1",
			type: "http",
			px: 250,
			py: 50,
			data: JSON.stringify({
				label: "Hit Local API",
				method: "GET",
				url: "http://localhost:3000/api/health",
				headers: "{}",
				body: "",
			}),
		},
		{
			id: "h-2",
			type: "condition",
			px: 250,
			py: 200,
			data: JSON.stringify({
				label: "Check OK",
				expression: "response.message === 'ok'",
			}),
		},
		{
			id: "h-3",
			type: "script",
			px: 250,
			py: 350,
			data: JSON.stringify({
				label: "Console Log",
				code: "console.log('✅ API Health is OK!');",
				language: "javascript",
			}),
		},
	];

	for (const n of nodesHealth) {
		db.query(
			"INSERT INTO nodes (id, workflow_id, type, position_x, position_y, data) VALUES (?, ?, ?, ?, ?, ?)",
		).run(n.id, wfHealthId, n.type, n.px, n.py, n.data);
	}

	const edgesHealth = [
		{ id: "h-e1", source: "h-1", target: "h-2" },
		{
			id: "h-e2",
			source: "h-2",
			target: "h-3",
			sourceHandle: "true",
		},
	];

	for (const e of edgesHealth) {
		db.query(
			"INSERT INTO edges (id, workflow_id, source, target, source_handle, target_handle) VALUES (?, ?, ?, ?, ?, ?)",
		).run(
			e.id,
			wfHealthId,
			e.source,
			e.target,
			"sourceHandle" in e ? e.sourceHandle : null,
			null,
		);
	}

	// Clear existing data
	db.exec("DELETE FROM execution_logs");
	db.exec("DELETE FROM executions");
	db.exec("DELETE FROM edges");
	db.exec("DELETE FROM nodes");
	db.exec("DELETE FROM workflows");

	// ─── Sample Workflow 1: API Health Check ──────────────────
	const wf1Id = "wf-api-health-check";
	db.query(
		"INSERT INTO workflows (id, name, description) VALUES (?, ?, ?)",
	).run(
		wf1Id,
		"API Health Check",
		"Checks API endpoints and sends alerts on failure",
	);

	// Nodes for workflow 1
	const nodes1 = [
		{
			id: "node-1",
			type: "http",
			px: 250,
			py: 50,
			data: JSON.stringify({
				label: "Check API",
				method: "GET",
				url: "http://localhost:3000/api/health",
				headers: "{}",
				body: "",
			}),
		},
		{
			id: "node-2",
			type: "condition",
			px: 250,
			py: 200,
			data: JSON.stringify({
				label: "Is Healthy?",
				expression: "response.status === 200",
			}),
		},
		{
			id: "node-3",
			type: "http",
			px: 100,
			py: 350,
			data: JSON.stringify({
				label: "Send Alert",
				method: "POST",
				url: "https://hooks.slack.com/webhook",
				headers: '{"Content-Type": "application/json"}',
				body: '{"text": "API is down!"}',
			}),
		},
		{
			id: "node-4",
			type: "script",
			px: 400,
			py: 350,
			data: JSON.stringify({
				label: "Log Success",
				code: 'console.log("API is healthy");',
				language: "javascript",
			}),
		},
	];

	const insertNode = db.query(
		"INSERT INTO nodes (id, workflow_id, type, position_x, position_y, data) VALUES (?, ?, ?, ?, ?, ?)",
	);

	for (const n of nodes1) {
		insertNode.run(n.id, wf1Id, n.type, n.px, n.py, n.data);
	}

	// Edges for workflow 1
	const edges1 = [
		{ id: "edge-1-2", source: "node-1", target: "node-2" },
		{
			id: "edge-2-3",
			source: "node-2",
			target: "node-3",
			sourceHandle: "false",
		},
		{
			id: "edge-2-4",
			source: "node-2",
			target: "node-4",
			sourceHandle: "true",
		},
	];

	const insertEdge = db.query(
		"INSERT INTO edges (id, workflow_id, source, target, source_handle, target_handle) VALUES (?, ?, ?, ?, ?, ?)",
	);

	for (const e of edges1) {
		insertEdge.run(
			e.id,
			wf1Id,
			e.source,
			e.target,
			"sourceHandle" in e ? e.sourceHandle : null,
			null,
		);
	}

	// ─── Sample Workflow 2: Data Pipeline ─────────────────────
	const wf2Id = "wf-data-pipeline";
	db.query(
		"INSERT INTO workflows (id, name, description) VALUES (?, ?, ?)",
	).run(
		wf2Id,
		"Data Pipeline",
		"Fetches data, transforms it, and stores results",
	);

	const nodes2 = [
		{
			id: "dp-1",
			type: "http",
			px: 250,
			py: 50,
			data: JSON.stringify({
				label: "Fetch Data",
				method: "GET",
				url: "https://api.example.com/data",
				headers: "{}",
				body: "",
			}),
		},
		{
			id: "dp-2",
			type: "delay",
			px: 250,
			py: 200,
			data: JSON.stringify({
				label: "Rate Limit Wait",
				duration: 2,
				unit: "s",
			}),
		},
		{
			id: "dp-3",
			type: "script",
			px: 250,
			py: 350,
			data: JSON.stringify({
				label: "Transform Data",
				code: "const result = data.map(d => ({ ...d, processed: true }));",
				language: "javascript",
			}),
		},
		{
			id: "dp-4",
			type: "http",
			px: 250,
			py: 500,
			data: JSON.stringify({
				label: "Store Results",
				method: "POST",
				url: "https://api.example.com/results",
				headers: '{"Content-Type": "application/json"}',
				body: "",
			}),
		},
	];

	for (const n of nodes2) {
		insertNode.run(n.id, wf2Id, n.type, n.px, n.py, n.data);
	}

	const edges2 = [
		{ id: "dp-e1", source: "dp-1", target: "dp-2" },
		{ id: "dp-e2", source: "dp-2", target: "dp-3" },
		{ id: "dp-e3", source: "dp-3", target: "dp-4" },
	];

	for (const e of edges2) {
		insertEdge.run(e.id, wf2Id, e.source, e.target, null, null);
	}

	// ─── Sample Executions ────────────────────────────────────
	const insertExecution = db.query(
		"INSERT INTO executions (id, workflow_id, status, started_at, finished_at) VALUES (?, ?, ?, datetime('now', ?), CASE WHEN ? != 'running' THEN datetime('now', ?) ELSE NULL END)",
	);

	insertExecution.run(
		"exec-1",
		wf1Id,
		"success",
		"-2 hours",
		"success",
		"-1 hours",
	);
	insertExecution.run(
		"exec-2",
		wf1Id,
		"failed",
		"-5 hours",
		"failed",
		"-4 hours",
	);
	insertExecution.run(
		"exec-3",
		wf2Id,
		"success",
		"-1 hours",
		"success",
		"-0.5 hours",
	);
	insertExecution.run(
		"exec-4",
		wf1Id,
		"success",
		"-30 minutes",
		"success",
		"-25 minutes",
	);

	// ─── Sample Execution Logs ────────────────────────────────
	const insertLog = db.query(
		"INSERT INTO execution_logs (execution_id, node_id, status, message, data) VALUES (?, ?, ?, ?, ?)",
	);

	insertLog.run(
		"exec-1",
		"node-1",
		"success",
		"HTTP GET 200 OK",
		'{"status": 200}',
	);
	insertLog.run(
		"exec-1",
		"node-2",
		"success",
		"Condition evaluated: true",
		null,
	);
	insertLog.run(
		"exec-1",
		"node-4",
		"success",
		"Script executed successfully",
		null,
	);

	insertLog.run(
		"exec-2",
		"node-1",
		"success",
		"HTTP GET 200 OK",
		'{"status": 200}',
	);
	insertLog.run(
		"exec-2",
		"node-2",
		"success",
		"Condition evaluated: false",
		null,
	);
	insertLog.run(
		"exec-2",
		"node-3",
		"failed",
		"HTTP POST 500 Internal Server Error",
		'{"error": "webhook failed"}',
	);

	const workflows = db.query("SELECT * FROM workflows").all();
	const executions = db.query("SELECT * FROM executions").all();

	console.log(
		`✅ Seeded ${workflows.length} workflows and ${executions.length} executions`,
	);
} catch (error) {
	console.error("❌ Error seeding database:", error);
	if (error instanceof Error) {
		console.error("Error message:", error.message);
	}
	process.exit(1);
}
