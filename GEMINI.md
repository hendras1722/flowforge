# GEMINI.md — Bun + Next.js Todo

## 1. Project Overview

- **Name** : Bun + Next.js Todo
- **Description** : Simple Todo App with Bun, Next.js and Tailwind CSS
- **Goal** : Simple Todo App
- **Target Users**: Users
- **Version** : 0.0.1
- **Status** : Active Development

---

## 2. Tech Stack

- **Language** : TypeScript
- **Framework** : Next.js 16 (App Router)
- **Styling** : Tailwind CSS
- **UI Library** : shadcn/ui
- **State Management**: Zustand (Global), React Context (Scoped/Feature Only)
- **Data Fetching** : TanStack Query v5 & Fetch Native ./actions/[name_of_action].ts (for client & server)
- **Runtime & Package Manager** : Bun
- **Deployment** : Railway
- **Unit Testing** : Vitest
- **E2E Testing** : Playwright

---

## 3. Commands

```bash
# Development
bun run dev          # Jalankan development server
bun run build        # Build aplikasi untuk production
bun run start        # Jalankan production build
bun run lint         # Jalankan linter (ESLint)
bun run format       # Format kode

# Package Management
bun add [package]    # Selalu gunakan bun, dilarang menggunakan npm/yarn

# Testing
bun run test         # Jalankan semua test (Vitest)
bun run test:unit    # Jalankan unit test saja
bun run test:e2e     # Jalankan e2e test saja (Playwright)
```

---

## 4. Project Structure

Architecture: by feature

```
[root]/
  app/              # Next.js App Router (Routing & Layout)
    (auth)/         # Route Group untuk autentikasi
    [feature]/      # Folder per halaman/fitur
      _components/  # Komponen khusus fitur (Private)
      _logic/       # Business logic / Custom hooks khusus fitur
      _types/       # TypeScript types khusus fitur
      _tests/       # Unit test khusus fitur
    page.tsx        # Entry point halaman
    layout.tsx      # Layout untuk halaman fitur
    loading.tsx     # Loading UI untuk halaman fitur
    not-found.tsx   # Not found UI untuk halaman fitur
  components/       # Shared UI Components (Re-usable)
    ui/             # Base components (shadcn)
    shared/         # Komponen global buatan sendiri
  hooks/            # Global custom hooks
  services/         # API Service layer (ky instances & fetcher functions)
  store/            # Zustand global store definitions
  types/            # Global TypeScript interfaces
  utils/            # Global helper functions
  public/             # Static assets (images, icons)
  e2e/                # End-to-End test files (Root level)
```

File placement rules:

- New UI components global always go to [components/ui/base], for custom component go to [components/shared/base]
- Business logic always go to [app/[page]/\_logic]
- TypeScript types always go to [app/[page]/\_types]
- Helper dan utility always go to [app/[page]/\_utils]
- folder testing go to [app/[page]/\_tests]
- Unit Testing go to [app/[page]/\_tests] and E2E Testing go to [e2e/]
- Don't create a new folder without asking

---

## 5. Naming Conventions

```
# File dan Folder
- Komponen      : PascalCase    (UserCard.tsx)
- Non-komponen  : camelCase     (useAuth.ts, formatCurrency.ts)
- Folder Fitur  : kebab-case    (marketing-stats/)
- Next.js Files : page.tsx, layout.tsx, loading.tsx

# Di dalam Kode
- Variabel      : camelCase     (userData, isLoading)
- Konstanta     : UPPER_SNAKE   (MAX_RETRY_LIMIT, API_BASE_URL)
- Fungsi        : camelCase     (getUserData, handleSubmit)
- Tipe/Interface: PascalCase    (UserDetail, ApiResponse)

# Git Branch
- Fitur baru    : feat/[nama-fitur]
- Bug fix       : fix/[nama-bug]
- Refactor      : refactor/[nama-modul]

Note: Pastikan untuk membuat branch fitur baru dari branch main atau development.
```

---

## 6. Code Conventions

```
# Structural Rules
- Always follow clean code principle
- Avoid code duplication, make function if used more than once
- Write readable code, not the shortest code

# TypeScript
- Use strict mode (client)
- Don't use 'any' type
- Always write explicit return type for function
- Use interface for objects, type for unions or intersections

# Import Rules
1. External library (React, Next.js, dll)
2. Internal absolute (@/components, @/utils, dll)
3. Internal relative (./Component, ../utils)
4. Tipe dan Interface
5. Assets dan styles

# Export Pattern
- Use named export for components and functions
- Use default export only for page.tsx and layout.tsx

# Error Handling
- Always use try-catch for async function
- Don't leave errors without handling
- Write informative and specific error messages
```

---

## 7. Component Rules

```
# Component Rules
1. Import
2. Type or Interface props
3. Definisi komponen
4. Hooks (useState, useEffect, dll)
5. Handler dan fungsi lokal
6. Return JSX
7. Export

# Props Rules
- Always write explicit type for props
- Use default value for optional props
- Usahakan untuk menjaga jumlah props seminimal mungkin. Jika sebuah komponen memiliki terlalu banyak props (misalnya, lebih dari 10), pertimbangkan untuk memecahnya menjadi komponen yang lebih kecil atau mengelompokkan props terkait ke dalam objek

# Server vs Client Component (untuk Next.js)
- Default: Server Component
- Gunakan 'use client' jika butuh:
    - useState / useEffect / hooks others
    - Event listener (onClick, onChange, dll)
    - Browser API (localStorage, window, dll)
    - Library haven't support SSR

# Komponen Kecil
- Separate to new file if used more than one place
- Can be combined in one file if only used in one component
```

---

## 8. Styling Rules

```
# Styling Approach
- Use [Tailwind CSS]
- Don't use inline style unless for dynamic values
- Don't use !important except if can't change css

# Tailwind CSS
- Use utility class directly in JSX
- Use clsx or cn for conditional class
- Extract to component if the same class is used more than once
- Class order: layout > spacing > sizing > color > typography > state

# Responsive Design
- Use mobile-first approach
- Breakpoint: sm (640px) / md (768px) / lg (1024px) / xl (1280px)

# Dark Mode
- Use [dark: prefix Tailwind / CSS variables / dll]
- Always test dark mode appearance after creating new component

# Design Tokens
- Use CSS variables for colors, spacing, and typography
- Don't hardcode color values directly
- Use variables defined in [config file]
```

---

## 9. API & Data Fetching Rules

```
# Server vs Client Fetching
- Server fetch  : data no need user interaction (initial page load)
- Client fetch  : data change after user interaction
- Use [TanStack Query] for client-side data fetching. ky is used as the HTTP client.
- For convenience, use the custom hook `useHttp` which wraps both for easier integration and cache management.
- Don't use useEffect for fetching data.

# API Response Format
- Always return consistent format in all endpoint:
  { success: boolean, data: T | null, message: string }

# Error Handling di API
- Always handle error with try-catch
- Return appropriate status code (200, 400, 401, 404, 500)
- Don't expose detail error to client in production

# Fetch Function Location
- All fetch functions should be stored in [src/services] or [src/app/[page]/_logic] if feature-specific.
- Don't write fetch functions directly in components.

# Environment
- Use environment variables for all URLs and API keys.
- Don't hardcode URLs or secrets directly in the code.
```

---

## 10. State Management Rules

```
# Hierarchical State (use the simplest first)
1. Local state (useState)   : used by only 1 component
2. Lifted state             : used by 2-3 nearby components
3. Global state             : used by many components in many places

# When to Use Global State
- User or auth data needed by many components
- Global UI state (theme, language, layout toggle)
- Data needed by many components

# Rules [Zustand]
- Use Zustand for global state management.
- Don't use React Context for global state unless specifically scoped to a feature.
```

---

## 11. Performance Rules

```
# Code Splitting
- Use dynamic import for large components that not immediately visible
- Lazy load pages and components that rarely accessed

# Image Optimization
- Always use Image component from framework (next/image, dll)
- Set width and height for each image
- Use WebP or AVIF format for new images
- Don't use regular img tag

# Re-render Optimization
- Use useMemo for heavy calculations
- Use useCallback for functions passed as props
- Don't overuse memo, profile first before optimizing

# Bundle Size
- Import only what's needed, not the whole library
  Correct : import { debounce } from 'lodash'
  Wrong   : import _ from 'lodash'

# SSR and SSG (Next.js)
- Default to Server Component for reducing JavaScript on client
- Use Static Generation for pages with data that rarely changes
- Use ISR for pages that need periodic revalidation
```

---

## 12. Format Save Files

Format files when finished editing using:

```bash
bun run format
```

or you can read file commitlint.config.cjs and .prettierrc.cjs for more details

---

## 13. Git Rules

```
# Commit Strategy
- Commit changes frequently following a logical unit of work.
- Use atomic commits (one specific change per commit).
- Push to GitHub once a feature or a significant fix is completed and tested.

# Format Commit Message
feat     : [description of new feature]
fix      : [description of bug that fixed]
refactor : [description of refactor changes]
style    : [description of styling or formatting changes]
docs     : [description of documentation changes]
test     : [description of test changes]
chore    : [description of configuration or tooling changes]

# Example
feat: add user authentication with Google OAuth
fix: resolve infinite scroll not triggering on mobile
refactor: extract user card into reusable component

# Additional Rules
- Don't commit .env file or file that contains any secrets
- Don't combine unrelated changes in one commit
```

---

## 14. Features

```
# Already completed and running
- [x] [Feature 1 name]
- [x] [Feature 2 name]
- [x] [Feature 3 name]

# Being worked on — don't change without confirmation
- [ ] [Feature name in progress]
- [ ] [Feature name in progress]

# Not yet started
- [ ] [Planned feature name]
- [ ] [Planned feature name]
```

---

## 15. Testing

```
# Testing Approach
- Testing type  : Unit / E2E
- Framework      : Vitest / Playwright

# What to Test
- All utility and helper functions
- Complex business logic
- API endpoints (happy path and error cases)
- Critical components used across many pages

# What Not to Test
- Very simple presentational components
- Third-party libraries (already tested by their creators)
- Configuration files

# Test Writing Rules
- One test file per one file being tested
- Test names must be descriptive:
  'should [expected behavior] when [condition]'
- Use AAA pattern: Arrange, Act, Assert

# Coverage Target
- Minimum coverage : 80%
- Priority         : business logic > API > UI components
```

---

## 16. Do Not

If your instructions or prompts are ambiguous, ASK FIRST before starting to code.
Don't assume and start working without confirmation.

```
# Structure and File
- Don't create new folder without confirmation
- Don't delete file without confirmation
- Don't move file without confirmation
- Don't change existing folder structure

# Code
- Don't use 'any' type in TypeScript
- Don't hardcode values that should come from environment variables
- Don't commit .env file or file that contains any secrets
- Don't install new package without confirmation
- Don't delete or change existing feature without clear instruction

# Forbidden Patterns
- Don't use inline style for values that can use utility class
- Don't use useEffect for data fetching

# Database
- Don't execute commands that modify or delete production data
- Don't create database migrations without confirmation
- Don't expose database credentials to client

# Security
- Don't expose API key or secret anything to client
- Don't bypass user input validation
- Don't skip error handling in API routes
```

---

## 18. Environment Variables

```
# Setup
- Copy .env.example to .env.local for local development
- Don't commit .env or .env.local file to repository

# Public Variables — safe to use in client side
NEXT_PUBLIC_[NAME]      # [Description of this variable]
NEXT_PUBLIC_[NAME]      # [Description of this variable]
```

---
