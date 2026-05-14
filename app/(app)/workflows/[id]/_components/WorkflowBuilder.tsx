"use client";

import {
	addEdge,
	Background,
	BackgroundVariant,
	type Connection,
	Controls,
	type Edge,
	MiniMap,
	type Node,
	ReactFlow,
	type ReactFlowInstance,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkflow } from "@/actions/workflow";
import { WorkflowActions } from "@/components/shared/WorkflowActions";
import "@xyflow/react/dist/style.css";

import { Loader2, Play, Save, Terminal as TerminalIcon, Trash2 } from "lucide-react";
import { NODE_TYPES } from "./CustomNodes";
import { NodePalette } from "./NodePalette";
import { LogsPanel } from "./LogsPanel";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { NodeConfigPanel } from "./NodeConfigPanel";

interface WorkflowBuilderProps {
	workflowId: string;
	workflowName: string;
	initialNodes: Node[];
	initialEdges: Edge[];
}

const DEFAULT_NODE_DATA: Record<string, Record<string, unknown>> = {
	http: {
		label: "HTTP Request",
		method: "GET",
		url: "",
		headers: "{}",
		body: "",
	},
	delay: { label: "Delay", duration: 1, unit: "s" },
	condition: { label: "Condition", expression: "" },
	script: { label: "Script", code: "", language: "javascript" },
};

let nodeIdCounter = 100;

export function WorkflowBuilder({
	workflowId,
	workflowName,
	initialNodes,
	initialEdges,
}: WorkflowBuilderProps) {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
		"idle",
	);
	const [activeExecutionId, setActiveExecutionId] = useState<string | null>(
		null,
	);
	const router = useRouter();
	const [logs, setLogs] = useState<any[]>([]);
	const [showLogs, setShowLogs] = useState(false);
	const seenLogIds = useRef<Set<number>>(new Set());

	// Poll logs when running
	useEffect(() => {
		if (!activeExecutionId) {
			seenLogIds.current.clear();
			return;
		}

		const interval = setInterval(async () => {
			try {
				const response = await fetch(
					`/api/workflows/${workflowId}/executions/${activeExecutionId}/logs`,
				);
				const result = await response.json();
				if (result.success) {
					setLogs(result.data);

					// Forward to browser console
					for (const log of result.data) {
						if (!seenLogIds.current.has(log.id)) {
							seenLogIds.current.add(log.id);
							if (log.status === "success" && log.data) {
								try {
									const data = JSON.parse(log.data);
									if (data.output && Array.isArray(data.output)) {
										for (const item of data.output) {
											// Check if it's a simple string or an object with type/message
											if (typeof item === "object" && item.type === "alert") {
												window.alert(item.message);
											} else {
												const msg = typeof item === "object" ? item.message : item;
												console.log(`%c[Workflow Script] %c${msg}`, "color: #10b981; font-weight: bold", "color: inherit");
											}
										}
									}
								} catch (e) {
									// not json or no output
								}
							}
						}
					}

					// If last log is success or failed, stop polling after a bit
					const lastLog = result.data[result.data.length - 1];
					if (
						lastLog?.node_id === null &&
						(lastLog?.status === "success" || lastLog?.status === "failed")
					) {
						clearInterval(interval);
						setActiveExecutionId(null);
						setTimeout(() => setIsRunning(false), 1000);
					}
				}
			} catch (error) {
				console.error("Polling error:", error);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [activeExecutionId, workflowId]);

	const onConnect = useCallback(
		(params: Connection) => {
			setEdges((eds) => addEdge({ ...params, animated: true }, eds));
		},
		[setEdges],
	);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();
			const type = event.dataTransfer.getData("application/reactflow");
			if (!type || !rfInstance || !reactFlowWrapper.current) return;

			const bounds = reactFlowWrapper.current.getBoundingClientRect();
			const position = rfInstance.screenToFlowPosition({
				x: event.clientX - bounds.left,
				y: event.clientY - bounds.top,
			});

			const newNode: Node = {
				id: `node-${++nodeIdCounter}`,
				type,
				position,
				data: { config: JSON.stringify(DEFAULT_NODE_DATA[type] ?? {}) },
			};

			setNodes((nds) => [...nds, newNode]);
		},
		[rfInstance, setNodes],
	);

	const onDragStart = useCallback(
		(event: React.DragEvent, nodeType: string) => {
			event.dataTransfer.setData("application/reactflow", nodeType);
			event.dataTransfer.effectAllowed = "move";
		},
		[],
	);

	const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
		setSelectedNode(node);
	}, []);

	const onPaneClick = useCallback(() => {
		setSelectedNode(null);
	}, []);

	const handleSave = useCallback(async () => {
		setIsSaving(true);
		setSaveStatus("idle");
		try {
			const response = await fetch(`/api/workflows/${workflowId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nodes: nodes.map((n) => ({
						id: n.id,
						workflow_id: workflowId,
						type: n.type ?? "http",
						position_x: n.position.x,
						position_y: n.position.y,
						data:
							typeof n.data.config === "string"
								? n.data.config
								: JSON.stringify(n.data),
					})),
					edges: edges.map((e) => ({
						id: e.id,
						workflow_id: workflowId,
						source: e.source,
						target: e.target,
						source_handle: e.sourceHandle ?? null,
						target_handle: e.targetHandle ?? null,
					})),
				}),
			});
			if (!response.ok) throw new Error("Failed to save");
			setSaveStatus("saved");
			setTimeout(() => setSaveStatus("idle"), 2000);
		} catch {
			setSaveStatus("error");
		} finally {
			setIsSaving(false);
		}
	}, [workflowId, nodes, edges]);

	const handleRun = useCallback(async () => {
		// Auto-save first
		setIsSaving(true);
		try {
			await fetch(`/api/workflows/${workflowId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					nodes: nodes.map((n) => ({
						id: n.id,
						workflow_id: workflowId,
						type: n.type ?? "http",
						position_x: n.position.x,
						position_y: n.position.y,
						data: typeof n.data.config === "string" ? n.data.config : JSON.stringify(n.data),
					})),
					edges: edges.map((e) => ({
						id: e.id,
						workflow_id: workflowId,
						source: e.source,
						target: e.target,
						source_handle: e.sourceHandle ?? null,
						target_handle: e.targetHandle ?? null,
					})),
				}),
			});
			setSaveStatus("saved");
			setTimeout(() => setSaveStatus("idle"), 2000);
		} catch (err) {
			console.error("Auto-save failed", err);
		} finally {
			setIsSaving(false);
		}

		setIsRunning(true);
		setLogs([]);
		setShowLogs(true);
		try {
			const response = await fetch(`/api/workflows/${workflowId}/execute`, {
				method: "POST",
			});
			const result = await response.json();
			if (result.success) {
				setActiveExecutionId(result.data.executionId);
			} else {
				throw new Error("Failed to execute");
			}
		} catch {
			setIsRunning(false);
		}
	}, [workflowId, nodes, edges]);

	const handleNodeUpdate = useCallback(
		(nodeId: string, newData: Record<string, unknown>) => {
			setNodes((nds) =>
				nds.map((n) =>
					n.id === nodeId
						? { ...n, data: { ...n.data, config: JSON.stringify(newData) } }
						: n,
				),
			);
			setSelectedNode((prev) =>
				prev?.id === nodeId
					? { ...prev, data: { ...prev.data, config: JSON.stringify(newData) } }
					: prev,
			);
		},
		[setNodes],
	);

	return (
		<div className="flex h-[calc(100vh-1px)] animate-fade-in">
			{/* Left Panel — Node Palette */}
			<div className="w-[200px] shrink-0 border-r border-border bg-card/30 p-4 space-y-6 overflow-y-auto">
				<div>
					<h2 className="text-sm font-bold truncate">{workflowName}</h2>
					<p className="text-[10px] text-muted-foreground mt-0.5">
						Drag nodes to the canvas
					</p>
				</div>
				<NodePalette onDragStart={onDragStart} />
			</div>

			{/* Center — React Flow Canvas */}
			<div className="flex-1 relative" ref={reactFlowWrapper}>
				{/* Toolbar */}
				<div className="absolute top-4 right-4 z-10 flex items-center gap-2">
					{saveStatus === "saved" && (
						<span className="text-xs text-success font-medium animate-fade-in">
							Saved!
						</span>
					)}
					{saveStatus === "error" && (
						<span className="text-xs text-destructive font-medium animate-fade-in">
							Error saving
						</span>
					)}
					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving}
						className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium transition-all hover:bg-accent disabled:opacity-50"
					>
						{isSaving ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<Save className="h-3.5 w-3.5" />
						)}
						Save
					</button>
					<button
						type="button"
						onClick={handleRun}
						disabled={isRunning}
						className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-xs font-medium text-success-foreground transition-all hover:opacity-90 disabled:opacity-50"
					>
						{isRunning ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<Play className="h-3.5 w-3.5" />
						)}
						Run
					</button>
					<button
						type="button"
						onClick={() => setShowLogs(!showLogs)}
						className={cn(
							"p-2 rounded-lg border border-border transition-all",
							showLogs ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
						)}
						title="Toggle Logs"
					>
						<TerminalIcon className="h-4 w-4" />
					</button>
					<WorkflowActions
						workflowId={workflowId}
						workflowName={workflowName}
						onDeleted={() => {
							router.push("/workflows");
							router.refresh();
						}}
					/>
				</div>

				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onInit={setRfInstance}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onNodeClick={onNodeClick}
					onPaneClick={onPaneClick}
					nodeTypes={NODE_TYPES}
					fitView
					defaultEdgeOptions={{ animated: true }}
					proOptions={{ hideAttribution: true }}
					className="!bg-background"
				>
					<Background
						variant={BackgroundVariant.Dots}
						gap={20}
						size={1}
						color="oklch(0.3 0.01 260)"
					/>
					<Controls />
					<MiniMap
						nodeStrokeWidth={3}
						pannable
						zoomable
						style={{ background: "var(--card)" }}
					/>
				</ReactFlow>

				{/* Logs Panel overlay */}
				<LogsPanel
					logs={logs}
					isOpen={showLogs}
					onClose={() => setShowLogs(false)}
				/>
			</div>

			{/* Right Panel — Node Config */}
			{selectedNode && (
				<div className="w-[280px] shrink-0 border-l border-border bg-card/30 overflow-y-auto animate-slide-in-left">
					<NodeConfigPanel
						node={selectedNode}
						onUpdate={handleNodeUpdate}
						onClose={() => setSelectedNode(null)}
					/>
				</div>
			)}
		</div>
	);
}
