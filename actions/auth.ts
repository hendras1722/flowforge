"use server";

import { getDb } from "@/db/client";

export async function loginAction(prevState: any, formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { success: false, message: "Email and password are required" };
	}

	const db = getDb();
	const user = db.query("SELECT * FROM users WHERE email = ?").get(email) as any;

	if (!user) {
		return { success: false, message: "Invalid email or password" };
	}

	const isPasswordValid = await Bun.password.verify(password, user.password);

	if (!isPasswordValid) {
		return { success: false, message: "Invalid email or password" };
	}

	// In a real app, you'd set a cookie/session here
	return { success: true, message: "Login successful", user: { id: user.id, name: user.name, email: user.email } };
}

export async function registerAction(prevState: any, formData: FormData) {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!name || !email || !password) {
		return { success: false, message: "All fields are required" };
	}

	const db = getDb();
	
	// Check if user exists
	const existingUser = db.query("SELECT * FROM users WHERE email = ?").get(email);
	if (existingUser) {
		return { success: false, message: "Email already registered" };
	}

	try {
		const id = `user-${Date.now()}`;
		const hashedPassword = await Bun.password.hash(password);
		
		db.query(
			"INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)"
		).run(id, name, email, hashedPassword);

		return { success: true, message: "Registration successful" };
	} catch (error) {
		console.error("Registration error:", error);
		return { success: false, message: "Failed to create account" };
	}
}
