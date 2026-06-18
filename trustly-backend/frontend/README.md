# Trustly Frontend

React + TypeScript admin/customer portal for the Trustly Spring Boot API.

## Prerequisites

- Node.js 18+
- Spring Boot backend running on **http://localhost:8080**

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. API calls are proxied to the backend via Vite (no CORS changes needed on the server).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- JWT auth with refresh token rotation (`/api/auth/login`, protected routes)
- Admin dashboard with animated KPI cards
- CRUD for categories, service requests, complaints, worker applications
- Worker search, apply flow, and profile management
- Slide-over forms, field-level validation errors, toast notifications
- Framer Motion animations, responsive layout, skeleton loaders

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/` | Dashboard |
| `/workers` | Search workers |
| `/service-requests` | Service request list |
| `/complaints` | My complaints |
| `/categories` | Admin category management |
| `/worker-applications` | Admin worker applications |
| `/admin/complaints` | Admin complaint review |
| `/worker-profile` | Worker profile (workers) |
| `/worker/apply` | Apply to become a worker |
