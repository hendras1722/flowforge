"use client";

import { Clock, Code2, GitBranch, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodePaletteProps {
	onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const PALETTE_ITEMS = [
	{
		type: "http",
		label: "HTTP Request",
		icon: Globe,
		colorClass: "bg-node-http/15 text-node-http border-node-http/30",
	},
	{
		type: "delay",
		label: "Delay / Wait",
		icon: Clock,
		colorClass: "bg-node-delay/15 text-node-delay border-node-delay/30",
	},
	{
		type: "condition",
		label: "Condition",
		icon: GitBranch,
		colorClass:
			"bg-node-condition/15 text-node-condition border-node-condition/30",
	},
	{
		type: "script",
		label: "Script",
		icon: Code2,
		colorClass: "bg-node-script/15 text-node-script border-node-script/30",
	},
];

export function NodePalette({ onDragStart }: NodePaletteProps) {
	return (
		<div className="space-y-2">
			<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
				Drag to add
			</h3>
			<div className="space-y-1.5">
				{PALETTE_ITEMS.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.type}
							type="button"
							draggable
							onDragStart={(e) => onDragStart(e, item.type)}
							className={cn(
								"flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
								item.colorClass,
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							<span className="text-xs font-medium">{item.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
