# Skincare Tracker

Full-stack skincare routine tracking application built with Next.js, TypeScript, Prisma, and MySQL.

## Features

- Authentication (register/login/logout) with hashed passwords and secure httpOnly session cookie
- Product management (CRUD, image upload, category/time-of-use, active/inactive, search/filter)
- Routine management (morning/night, weekday-specific or default fallback routines)
- Ordered routine steps with drag-and-drop reordering
- Daily tracking with persistent completion state and date-specific detail view
- Dashboard with morning/night checklist, completion progress, weekly summary, and streak
- Calendar/history view and CSV export
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

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="mysql://root:password@localhost:3306/skincare_tracker"
JWT_SECRET="replace-with-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Local Setup

1. Ensure MySQL is running and your `.env` is set.

2. Run these commands in terminal from project root (same sequence used during setup):

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

- `npm run dev` - run local dev server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - run ESLint
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migration in dev
- `npm run prisma:seed` - seed demo data

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST /api/products`
- `GET/PATCH/DELETE /api/products/:id`
- `GET/POST /api/routines`
- `GET/PATCH/DELETE /api/routines/:id`
- `POST /api/routines/:id/items/reorder`
- `GET/PATCH /api/daily/:date`
- `POST /api/daily/:date/toggle`
- `GET /api/dashboard`
- `POST /api/upload`
- `GET /api/export/history`

## Notes

- Uploaded product images are stored in `public/uploads` and image path is stored in the database.
- Old daily logs remain immutable snapshots even if routines change later.
- Build and lint checks pass locally.
