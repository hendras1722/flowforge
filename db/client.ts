import { Database } from "bun:sqlite";

/**
 * FlowForge Database Client - 100% Bun Native
 * Pure connection manager.
 */

const DB_FILE = "flowforge.sqlite";

// Initialize the database instance immediately
export const db = new Database(DB_FILE);

// Set pragmas for better performance
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

// Backward compatibility for getDb()
export function getDb() {
	return db;
}
