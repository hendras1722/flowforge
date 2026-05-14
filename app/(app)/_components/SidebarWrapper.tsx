import { getWorkflows } from "@/actions/workflow";
import { Sidebar } from "@/components/shared/Sidebar";

export async function SidebarWrapper() {
	const workflows = await getWorkflows();

	return (
		<Sidebar workflows={workflows.map((w) => ({ id: w.id, name: w.name }))} />
	);
}
