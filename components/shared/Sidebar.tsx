"use client";

import { LayoutDashboard, Plus, Workflow, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WorkflowActions } from "@/components/shared/WorkflowActions";

interface SidebarProps {
	workflows: { id: string; name: string }[];
}

const NAV_ITEMS = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/workflows", label: "Workflows", icon: Workflow },
];

export function Sidebar({ workflows }: SidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-border bg-card/50 backdrop-blur-xl">
			{/* Logo */}
			<div className="flex items-center gap-3 px-6 py-5 border-b border-border">
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
					<Zap className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h1 className="text-base font-bold tracking-tight">FlowForge</h1>
					<p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
						Automation
					</p>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
				{NAV_ITEMS.map((item) => {
					const isActive =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
								isActive
									? "bg-primary/15 text-primary shadow-sm"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{item.label}
						</Link>
					);
				})}

				{/* Workflow list */}
				<div className="pt-4">
					<div className="flex items-center justify-between px-3 mb-2">
						<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
							Workflows
						</span>
						<Link
							href="/workflows/new"
							className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
						>
							<Plus className="h-3 w-3" />
						</Link>
					</div>
					<div className="space-y-0.5">
						{workflows.map((wf) => {
							const isActive = pathname === `/workflows/${wf.id}`;
							return (
								<Link
									key={wf.id}
									href={`/workflows/${wf.id}`}
									className={cn(
										"flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all duration-200 group",
										isActive
											? "bg-primary/10 text-primary"
											: "text-muted-foreground hover:bg-accent hover:text-foreground",
									)}
								>
									<div
										className={cn(
											"h-2 w-2 rounded-full shrink-0",
											isActive ? "bg-primary" : "bg-muted-foreground/40",
										)}
									/>
									<span className="truncate flex-1">{wf.name}</span>
									<div className="opacity-0 group-hover:opacity-100 transition-opacity">
										<WorkflowActions
											workflowId={wf.id}
											workflowName={wf.name}
											size="sm"
										/>
									</div>
								</Link>
							);
						})}
						{workflows.length === 0 && (
							<p className="px-3 py-2 text-xs text-muted-foreground/60">
								No workflows yet
							</p>
						)}
					</div>
				</div>
			</nav>

			{/* Footer */}
			<div className="border-t border-border px-6 py-4">
				<p className="text-[10px] text-muted-foreground/60">
					FlowForge v0.1.0 — MVP
				</p>
			</div>
		</aside>
	);
}
