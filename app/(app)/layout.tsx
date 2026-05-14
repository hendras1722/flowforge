import { Suspense } from "react";
import { SidebarWrapper } from "./_components/SidebarWrapper";

export default function AppShellLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen">
			<Suspense
				fallback={
					<aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-border bg-card/50 backdrop-blur-xl">
						<div className="flex items-center gap-3 px-6 py-5 border-b border-border">
							<div className="skeleton h-9 w-9 rounded-lg" />
							<div className="space-y-1.5">
								<div className="skeleton h-4 w-20" />
								<div className="skeleton h-2 w-16" />
							</div>
						</div>
						<div className="p-3 space-y-2">
							<div className="skeleton h-9 w-full rounded-lg" />
							<div className="skeleton h-9 w-full rounded-lg" />
						</div>
					</aside>
				}
			>
				<SidebarWrapper />
			</Suspense>
			<main className="ml-[260px] flex-1 min-h-screen">{children}</main>
		</div>
	);
}
