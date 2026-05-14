"use client";

import type { Node } from "@xyflow/react";
import { Clock, Code2, GitBranch, Globe, X } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface NodeConfigPanelProps {
	node: Node;
	onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
	onClose: () => void;
}

const TYPE_META: Record<
	string,
	{ icon: typeof Globe; label: string; color: string }
> = {
	http: { icon: Globe, label: "HTTP Request", color: "text-node-http" },
	delay: { icon: Clock, label: "Delay / Wait", color: "text-node-delay" },
	condition: {
		icon: GitBranch,
		label: "Condition",
		color: "text-node-condition",
	},
	script: { icon: Code2, label: "Script", color: "text-node-script" },
};

function InputField({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
}: {
	label: string;
	value: string | number;
	onChange: (val: string) => void;
	placeholder?: string;
	type?: string;
}) {
	const id = useId();
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
			>
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
			/>
		</div>
	);
}

function TextareaField({
	label,
	value,
	onChange,
	placeholder,
	rows = 3,
}: {
	label: string;
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	rows?: number;
}) {
	const id = useId();
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
			>
				{label}
			</label>
			<textarea
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
			/>
		</div>
	);
}

function SelectField({
	label,
	value,
	onChange,
	options,
}: {
	label: string;
	value: string;
	onChange: (val: string) => void;
	options: { value: string; label: string }[];
}) {
	const id = useId();
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={id}
				className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
			>
				{label}
			</label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-primary"
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	);
}

export function NodeConfigPanel({
	node,
	onUpdate,
	onClose,
}: NodeConfigPanelProps) {
	const nodeType = (node.type ?? "http") as string;
	const meta = TYPE_META[nodeType] ?? TYPE_META.http;
	const Icon = meta.icon;

	const rawConfig =
		typeof node.data.config === "string"
			? JSON.parse(node.data.config as string)
			: node.data;

	const [config, setConfig] = useState<Record<string, unknown>>(rawConfig);

	const updateField = useCallback(
		(key: string, value: unknown) => {
			const updated = { ...config, [key]: value };
			setConfig(updated);
			onUpdate(node.id, updated);
		},
		[config, node.id, onUpdate],
	);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<div className="flex items-center gap-2">
					<Icon className={cn("h-4 w-4", meta.color)} />
					<span className="text-xs font-semibold">{meta.label}</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-md p-1 text-muted-foreground hover:bg-accent transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Fields */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				<InputField
					label="Label"
					value={(config.label as string) ?? ""}
					onChange={(val) => updateField("label", val)}
					placeholder="Node name"
				/>

				{nodeType === "http" && (
					<>
						<SelectField
							label="Method"
							value={(config.method as string) ?? "GET"}
							onChange={(val) => updateField("method", val)}
							options={[
								{ value: "GET", label: "GET" },
								{ value: "POST", label: "POST" },
								{ value: "PUT", label: "PUT" },
								{ value: "DELETE", label: "DELETE" },
								{ value: "PATCH", label: "PATCH" },
							]}
						/>
						<InputField
							label="URL"
							value={(config.url as string) ?? ""}
							onChange={(val) => updateField("url", val)}
							placeholder="https://api.example.com"
						/>
						<TextareaField
							label="Headers (JSON)"
							value={(config.headers as string) ?? "{}"}
							onChange={(val) => updateField("headers", val)}
							placeholder='{"Content-Type": "application/json"}'
						/>
						<TextareaField
							label="Body"
							value={(config.body as string) ?? ""}
							onChange={(val) => updateField("body", val)}
							placeholder="Request body..."
						/>
					</>
				)}

				{nodeType === "delay" && (
					<>
						<InputField
							label="Duration"
							value={(config.duration as number) ?? 1}
							onChange={(val) => updateField("duration", Number(val))}
							type="number"
						/>
						<SelectField
							label="Unit"
							value={(config.unit as string) ?? "s"}
							onChange={(val) => updateField("unit", val)}
							options={[
								{ value: "ms", label: "Milliseconds" },
								{ value: "s", label: "Seconds" },
								{ value: "m", label: "Minutes" },
							]}
						/>
					</>
				)}

				{nodeType === "condition" && (
					<TextareaField
						label="Expression"
						value={(config.expression as string) ?? ""}
						onChange={(val) => updateField("expression", val)}
						placeholder="response.status === 200"
						rows={4}
					/>
				)}

				{nodeType === "script" && (
					<TextareaField
						label="Code"
						value={(config.code as string) ?? ""}
						onChange={(val) => updateField("code", val)}
						placeholder='console.log("hello");'
						rows={8}
					/>
				)}
			</div>

			{/* Footer */}
			<div className="border-t border-border p-4">
				<p className="text-[10px] text-muted-foreground">
					Node ID: <span className="font-mono">{node.id}</span>
				</p>
			</div>
		</div>
	);
}
