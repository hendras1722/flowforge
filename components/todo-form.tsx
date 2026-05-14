"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { createTodo } from "@/actions/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
	message: "",
	errors: undefined as { title?: string[] } | undefined,
};

export function TodoForm() {
	const [state, formAction, pending] = useActionState(createTodo, initialState);
	const inputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (state?.message && !state?.errors && !pending) {
			formRef.current?.reset();

			if (inputRef.current && !inputRef.current.disabled) {
				inputRef.current.focus();
			}
		}
	}, [state?.message, state?.errors, pending]);

	return (
		<form ref={formRef} action={formAction} className="flex gap-2 shrink-0">
			<div className="flex-1">
				<label htmlFor="title" className="sr-only">
					Add a new task
				</label>
				<Input
					ref={inputRef}
					id="title"
					type="text"
					name="title"
					placeholder="Add a new task..."
					required
					aria-invalid={state?.errors?.title ? "true" : "false"}
					aria-describedby={state?.errors?.title ? "title-error" : undefined}
					className="flex-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-pink-400"
					disabled={pending}
				/>
				{state?.errors?.title && (
					<p
						id="title-error"
						className="text-sm text-red-500 mt-1"
						role="alert"
					>
						{state.errors.title[0]}
					</p>
				)}
			</div>
			<Button
				type="submit"
				size="icon"
				className="hover:bg-pink-400 hover:text-white"
				disabled={pending}
			>
				<Plus className="h-4 w-4" />
				<span className="sr-only">Add task</span>
			</Button>
			{state?.message && !state?.errors && (
				<p className="sr-only" aria-live="polite">
					{state.message}
				</p>
			)}
		</form>
	);
}
