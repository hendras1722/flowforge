import { cn } from "@/lib/utils";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	accent: "primary" | "success" | "warning" | "destructive";
}

const ACCENT_STYLES = {
	primary: {
		bg: "bg-primary/10",
		text: "text-primary",
		glow: "shadow-primary/5",
	},
	success: {
		bg: "bg-success/10",
		text: "text-success",
		glow: "shadow-success/5",
	},
	warning: {
		bg: "bg-warning/10",
		text: "text-warning",
		glow: "shadow-warning/5",
	},
	destructive: {
		bg: "bg-destructive/10",
		text: "text-destructive",
		glow: "shadow-destructive/5",
	},
};

export function MetricCard({ title, value, icon, accent }: MetricCardProps) {
	const style = ACCENT_STYLES[accent];

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
				style.glow,
			)}
		>
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						{title}
					</p>
					<p className="text-2xl font-bold tracking-tight">{value}</p>
				</div>
				<div
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
						style.bg,
						style.text,
					)}
				>
					{icon}
				</div>
			</div>
			{/* Decorative gradient */}
			<div
				className={cn(
					"absolute bottom-0 left-0 h-[2px] w-full opacity-50",
					accent === "primary" &&
						"bg-gradient-to-r from-transparent via-primary to-transparent",
					accent === "success" &&
						"bg-gradient-to-r from-transparent via-success to-transparent",
					accent === "warning" &&
						"bg-gradient-to-r from-transparent via-warning to-transparent",
					accent === "destructive" &&
						"bg-gradient-to-r from-transparent via-destructive to-transparent",
				)}
			/>
		</div>
	);
}
