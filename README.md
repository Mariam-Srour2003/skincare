# Skincare Tracker

Full-stack skincare routine tracking application built with Next.js, TypeScript, Prisma, and MySQL.

## The Story Behind This

I am a Lebanese web developer. These days, Lebanon is going through a war, and I have been displaced. The news, the sounds, and the constant uncertainty affected my stress levels, mental health, and ability to think clearly. That stress took a visible toll on my skin and pushed it to a state I had never seen before.

So I decided to build a routine and actually stick to it.

As a developer, I wanted to channel some of that energy into something practical, so I used vibe coding with GitHub Copilot to build this skincare routine tracker. I run it locally and actively use it to track my own routine. That means I am both the developer and the user, which is often the fastest way to discover what is missing, what needs fixing, and what should come next.

This project is also part of testing a bigger idea: when you build something you genuinely use, you care about details differently.

## A Note on the Code

This is my first time working with this framework. As a first public version, there are still rough edges, unstructured parts, and areas that need cleanup. That is intentional and honest. I am learning by building, improving it with Copilot as I go.

One thing I learned early: Copilot is very helpful, but it is not a replacement for technical direction. Treating it like a non-technical product manager gave inconsistent results. You still need working knowledge of database design and application logic to give clear direction. The AI can accelerate execution, but the architecture and decisions still come from you.

## What This App Does

- Authentication: register, login, logout with hashed passwords and secure httpOnly session cookie
- Product management: create, read, update, and delete products with image upload, category, time-of-use, active/inactive status, and search/filter
- Routine management: morning and night routines, with weekday-specific routines or default fallback routines
- Ordered steps: drag-and-drop reordering of routine items
- Daily tracking: persistent completion state per day with a date-specific detail view
- Dashboard: morning/night checklist, completion progress, weekly summary, and streak counter
- History: calendar view and CSV export
- Dark mode

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL
- Zod validation
- React Hook Form
- dnd-kit (drag and drop)
- Sonner toasts

## Project Structure

```text
prisma/
  schema.prisma
  seed.ts
  migrations/
src/
  app/
    (auth)/
    (app)/
    api/
  components/
  lib/
```

## Local Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="mysql://root:password@localhost:3306/skincare_tracker"
JWT_SECRET="replace-with-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Run Locally

1. Make sure MySQL is running and your `.env` is configured.
2. From the project root, run:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run build
npm run dev
```

3. Open http://localhost:3000

Demo account created by seed:

- Email: demo@skincare.local
- Password: demo1234

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run local dev server |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migration in dev |
| `npm run prisma:seed` | Seed demo data |

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/products | List or create products |
| GET/PATCH/DELETE | /api/products/:id | Get, update, or delete a product |
| GET/POST | /api/routines | List or create routines |
| GET/PATCH/DELETE | /api/routines/:id | Get, update, or delete a routine |
| POST | /api/routines/:id/items/reorder | Reorder routine steps |
| GET/PATCH | /api/daily/:date | Get or update a daily log |
| POST | /api/daily/:date/toggle | Toggle a step completion state |
| GET | /api/dashboard | Dashboard summary data |
| POST | /api/upload | Upload a product image |
| GET | /api/export/history | Export history as CSV |

## Notes

- Uploaded product images are stored in `public/uploads`, and the image path is saved in the database.
- Old daily logs remain immutable snapshots. If routines change later, past entries stay as originally recorded.
- Prisma client generation on Windows can fail if the Next.js dev server is running and locking Prisma files. If that happens, stop the dev server, run `npm run prisma:generate`, then restart the server.
