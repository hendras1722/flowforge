"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Clock, Code2, GitBranch, Globe } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

// ─── Base Node Wrapper ────────────────────────────────────────

interface BaseNodeProps {
	label: string;
	icon: React.ReactNode;
	colorClass: string;
	borderClass: string;
	children?: React.ReactNode;
	selected?: boolean;
	hasSourceHandle?: boolean;
	hasTargetHandle?: boolean;
	/** For condition node — dual source handles */
	dualSourceHandles?: boolean;
	id?: string;
}

function BaseNode({
	label,
	icon,
	colorClass,
	borderClass,
	children,
	selected,
	hasSourceHandle = true,
	hasTargetHandle = true,
	dualSourceHandles = false,
	id,
}: BaseNodeProps) {
	return (
		<div
			className={cn(
				"relative rounded-lg border-2 bg-card shadow-lg min-w-[180px] max-w-[220px] transition-all duration-200",
				borderClass,
				selected &&
					"ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl",
			)}
		>
			{hasTargetHandle && (
				<Handle
					type="target"
					position={Position.Top}
					className="!bg-muted-foreground/60 !border-card"
				/>
			)}

			{/* Header */}
			<div
				className={cn(
					"flex items-center gap-2 px-3 py-2 rounded-t-[calc(var(--radius)-2px)]",
					colorClass,
				)}
			>
				<div className="shrink-0">{icon}</div>
				<span className="text-xs font-semibold truncate text-white flex-1">
					{label}
				</span>
				{id && (
					<span className="text-[9px] font-bold text-white/50 bg-black/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
						{id}
					</span>
				)}
			</div>

			{/* Body */}
			{children && (
				<div className="px-3 py-2 text-[10px] text-muted-foreground space-y-1">
					{children}
				</div>
			)}

			{!dualSourceHandles && hasSourceHandle && (
				<Handle
					type="source"
					position={Position.Bottom}
					className="!bg-muted-foreground/60 !border-card"
				/>
			)}

			{dualSourceHandles && (
				<>
					<Handle
						type="source"
						position={Position.Bottom}
						id="true"
						className="!bg-success !border-card"
						style={{ left: "30%" }}
					/>
					<Handle
						type="source"
						position={Position.Bottom}
						id="false"
						className="!bg-destructive !border-card"
						style={{ left: "70%" }}
					/>
					<div className="flex justify-between px-3 pb-1 text-[9px]">
						<span className="text-success font-medium">True</span>
						<span className="text-destructive font-medium">False</span>
					</div>
				</>
			)}
		</div>
	);
}

// ─── HTTP Node ────────────────────────────────────────────────

export const HttpNode = memo(function HttpNode({
	id,
	data,
	selected,
}: NodeProps) {
	const nodeData =
		typeof data.config === "string" ? JSON.parse(data.config as string) : data;

	return (
		<BaseNode
			label={(nodeData.label as string) || "HTTP Request"}
			icon={<Globe className="h-3.5 w-3.5 text-white" />}
			colorClass="bg-node-http"
			borderClass="border-node-http/30"
			selected={selected}
			id={id}
		>
			<div className="flex items-center gap-1.5">
				<span className="rounded bg-node-http/20 px-1.5 py-0.5 font-mono font-bold text-node-http">
					{(nodeData.method as string) || "GET"}
				</span>
				<span className="truncate">
					{(nodeData.url as string) || "https://..."}
				</span>
			</div>
		</BaseNode>
	);
});

// ─── Delay Node ───────────────────────────────────────────────

export const DelayNode = memo(function DelayNode({
	id,
	data,
	selected,
}: NodeProps) {
	const nodeData =
		typeof data.config === "string" ? JSON.parse(data.config as string) : data;

	return (
		<BaseNode
			label={(nodeData.label as string) || "Delay"}
			icon={<Clock className="h-3.5 w-3.5 text-white" />}
			colorClass="bg-node-delay"
			borderClass="border-node-delay/30"
			selected={selected}
			id={id}
		>
			<p>
				Wait {(nodeData.duration as number) || 0}
				{(nodeData.unit as string) || "s"}
			</p>
		</BaseNode>
	);
});

// ─── Condition Node ───────────────────────────────────────────

export const ConditionNode = memo(function ConditionNode({
	id,
	data,
	selected,
}: NodeProps) {
	const nodeData =
		typeof data.config === "string" ? JSON.parse(data.config as string) : data;

	return (
		<BaseNode
			label={(nodeData.label as string) || "Condition"}
			icon={<GitBranch className="h-3.5 w-3.5 text-white" />}
			colorClass="bg-node-condition"
			borderClass="border-node-condition/30"
			selected={selected}
			dualSourceHandles
			id={id}
		>
			<p className="font-mono truncate">
				{(nodeData.expression as string) || "expression"}
			</p>
		</BaseNode>
	);
});

// ─── Script Node ──────────────────────────────────────────────

export const ScriptNode = memo(function ScriptNode({
	id,
	data,
	selected,
}: NodeProps) {
	const nodeData =
		typeof data.config === "string" ? JSON.parse(data.config as string) : data;

	return (
		<BaseNode
			label={(nodeData.label as string) || "Script"}
			icon={<Code2 className="h-3.5 w-3.5 text-white" />}
			colorClass="bg-node-script"
			borderClass="border-node-script/30"
			selected={selected}
			id={id}
		>
			<p className="font-mono truncate">
				{(nodeData.code as string)?.slice(0, 40) || "// code"}
			</p>
		</BaseNode>
	);
});

export const NODE_TYPES = {
	http: HttpNode,
	delay: DelayNode,
	condition: ConditionNode,
	script: ScriptNode,
};
