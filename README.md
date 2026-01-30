# Expense Tracer (Income & Expense Tracker)

## A) Architecture Overview
This project is a monorepo containing a full-stack application:
- **apps/web**: Next.js 14 (App Router) frontend. Uses React Query for state management, Tailwind for styling, and Recharts for visualization. Handles i18n locally with persistent storage.
- **apps/api**: Node.js/Express backend. Uses Prisma ORM with PostgreSQL. Implements JWT Auth (Access + Refresh Token via httpOnly cookies).
- **packages/shared**: Shared TypeScript types and Zod schemas for consistent validation across frontend and backend.
- **Infrastructure**: Docker Compose orchestrates the PostgreSQL database.

## B) Folder Tree
```
/
├── docker-compose.yml
├── package.json
├── packages
│   └── shared
│       ├── index.ts
│       ├── package.json
│       └── tsconfig.json
├── apps
│   ├── api
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── tests
│   │   │   └── health.test.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web
│       ├── app
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── locales/
│       │   ├── bn/
│       │   └── en/
│       ├── types/
│       ├── .env.example
│       ├── next.config.js
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
```

## C) Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

### 2. Environment Config
Create `.env` files in both apps:

**apps/api/.env**
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_tracer?schema=public"
JWT_SECRET="supersecret_access_key_change_me"
JWT_REFRESH_SECRET="supersecret_refresh_key_change_me"
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Install Dependencies
From the root directory:
```bash
npm install
```

### 4. Database Setup
Start the database container:
```bash
docker-compose up -d postgres
```

Run migrations and seed the database (Categories in BN/EN):
```bash
cd apps/api
npx prisma migrate dev --name init
npm run seed
```

### 5. Run Development
Return to root and run both apps:
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### 6. Tests
Backend tests are located in `apps/api/tests`.
```bash
cd apps/api
npm test
```
