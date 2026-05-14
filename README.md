# Bun + Next.js Workflow Automation App

A full-stack workflow automation application built with [Bun](https://bun.com), [Next.js](https://nextjs.org), and SQL Lite.

## Quick Start

```bash
# Install dependencies
bun install

# Set up database (copy .env.example and add your DATABASE_URL)
cp .env.example .env.local

# Init the database
bun run db:init

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prerequisites

- [Bun](https://bun.com/docs/installation) installed
- SQLlite database local

### Database Setup

You need a SQLlite database. You can use:
- **Local**: Install SQLite and create a database

**Local SQLite (macOS):**
```bash
bunx sqlite3 db.sqlite3 < db/schema.sql
```

## Tech Stack

- **Runtime**: [Bun](https://bun.com)
- **Framework**: [Next.js](https://nextjs.org)
- **Database**: SQLlite (via Bun's native SQL API)
- **UI**: [ShadCN](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun run db:seed` - Seed the database (creates table and sample data)
- `bun run lint` - Run Biome linter
- `bun run format` - Format code with Biome

## Deployment

For deployment instructions and hosting options, see Bun's [deployment guides](https://bun.com/docs/guides/deployment/vercel).
