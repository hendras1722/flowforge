"use client";

import { X } from "lucide-react";
import { startTransition, useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteTodo, toggleTodoComplete } from "@/actions/todo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItemProps {
	id: number;
	title: string;
	completed: boolean;
}

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			variant="ghost"
			size="icon"
			className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
			disabled={pending}
			aria-label="Delete task"
		>
			<X className="h-4 w-4" />
		</Button>
	);
}

function ToggleCheckbox({
	checked,
	formRef,
}: {
	checked: boolean;
	formRef: React.RefObject<HTMLFormElement | null>;
}) {
	const { pending } = useFormStatus();
	return (
		<Checkbox
			checked={checked}
			disabled={pending}
			onCheckedChange={() => {
				startTransition(() => {
					if (formRef.current) {
						const submitButton =
							formRef.current.querySelector<HTMLButtonElement>(
								'button[type="submit"]',
							);
						if (submitButton) {
							submitButton.click();
						} else {
							formRef.current.requestSubmit();
						}
					}
				});
			}}
			aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
		/>
	);
}

export function TodoItem({ id, title, completed }: TodoItemProps) {
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<div className="group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all duration-150 animate-in fade-in hover:bg-accent">
			<form ref={formRef} action={toggleTodoComplete.bind(null, id)}>
				<input type="hidden" name="id" value={id} />
				<button
					type="submit"
					className="sr-only"
					aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
				/>
				<ToggleCheckbox checked={completed} formRef={formRef} />
			</form>

			<span
				className={`flex-1 text-sm transition-all duration-200 ${
					completed ? "text-muted-foreground line-through" : ""
				}`}
			>
				{title}
			</span>

			<form action={deleteTodo.bind(null, id)}>
				<input type="hidden" name="id" value={id} />
				<SubmitButton />
			</form>
		</div>
	);
}
