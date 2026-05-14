import { db } from "./client";

console.log("🚀 Initializing database manually...");

try {
	const schema = await Bun.file("./db/schema.sql").text();
	db.run(schema);
	console.log("✅ Database schema applied successfully");
} catch (error) {
	console.error("❌ Failed to apply schema:", error);
	process.exit(1);
}