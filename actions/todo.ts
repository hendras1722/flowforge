"use server";

import { sql } from "bun";
import { cacheTag, updateTag } from "next/cache";
import z from "zod";

export interface Todo {
	id: number;
	title: string;
	completed: boolean;
	created_at?: Date | string;
}

async function ensureTodosTable() {
	try {
		await sql`
			CREATE TABLE IF NOT EXISTS todos (
				id SERIAL PRIMARY KEY,
				title TEXT NOT NULL,
				completed BOOLEAN NOT NULL DEFAULT false,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`;
	} catch (error) {
		console.error("Error creating todos table:", error);
	}
}

export async function getTodos(): Promise<Todo[]> {
	"use cache";
	cacheTag("todos");

	try {
		await ensureTodosTable();
		const result = await sql`SELECT * FROM todos ORDER BY id DESC`;
		return result;
	} catch (error) {
		console.error("Error fetching todos:", error);
		throw new Error("Failed to fetch todos");
	}
}

const createTodoSchema = z.object({ title: z.string().min(1).max(500) });

const createTodoStateSchema = z.object({
	message: z.string(),
	errors: z.record(z.string(), z.array(z.string())).optional(),
});

type CreateTodoState = z.infer<typeof createTodoStateSchema>;

export async function createTodo(
	_prevState: CreateTodoState,
	formData: FormData,
): Promise<CreateTodoState> {
	const validatedFields = createTodoSchema.safeParse({
		title: formData.get("title"),
	});

	if (!validatedFields.success) {
		return {
			message: "Validation failed",
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { title } = validatedFields.data;

	try {
		await ensureTodosTable();
		const result =
			await sql`INSERT INTO todos (title) VALUES (${title}) RETURNING *`;
		if (!result || result.length === 0) {
			throw new Error("Failed to create todo");
		}
		updateTag("todos");
		return { message: "Todo created successfully" };
	} catch (error) {
		console.error("Error creating todo:", error);
		return {
			message: "Failed to create todo. Please try again.",
			errors: {},
		};
	}
}

const idSchema = z.number().int().positive();

export async function toggleTodoComplete(id: number): Promise<void> {
	const validatedId = idSchema.safeParse(id);

	if (!validatedId.success) {
		throw new Error("Invalid todo ID");
	}

	try {
		const result =
			await sql`UPDATE todos SET completed = NOT completed WHERE id = ${validatedId.data} RETURNING *`;
		if (!result || result.length === 0) {
			throw new Error("Todo not found");
		}
		updateTag("todos");
	} catch (error) {
		console.error("Error toggling todo:", error);
		throw new Error("Failed to toggle todo");
	}
}

export async function deleteTodo(id: number): Promise<void> {
	const validatedId = idSchema.safeParse(id);

	if (!validatedId.success) {
		throw new Error("Invalid todo ID");
	}

	try {
		const result =
			await sql`DELETE FROM todos WHERE id = ${validatedId.data} RETURNING id`;
		if (!result || result.length === 0) {
			throw new Error("Todo not found");
		}
		updateTag("todos");
	} catch (error) {
		console.error("Error deleting todo:", error);
		throw new Error("Failed to delete todo");
	}
}
