# Finan / Aurum Dashboard

Production-ready React + Express finance dashboard.

## Deploy on Vercel

This repo is configured to deploy as a single Vercel project:
- Frontend build output comes from `my-app`.
- Backend is exposed through `api/index.js`.
- The backend requires MongoDB on Vercel.

### Required environment variables

Set these in your Vercel project:
- `MONGODB_URI` = MongoDB Atlas connection string
- `JWT_SECRET` = a long random secret

For local development, copy `.env.example` to `.env` and adjust values as needed.

### Deploy steps

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Keep the root as the project directory.
4. Add the environment variables above.
5. Deploy.

If you use separate frontend and backend projects, set `VITE_API_BASE_URL` in the frontend project to the backend URL. For this repo’s current setup, the backend is served from the same Vercel project through `api/index.js`.

### Optional data migration

If you already have users or transactions in `backend/data/store.json`, migrate them into MongoDB before or after deploy:

```bash
cd backend
export MONGODB_URI="your-mongodb-uri"
node migrate/store-to-mongo.js
```

If you need to hash plaintext passwords in the file store first, run:

```bash
cd backend
npm run migrate:hash-passwords
```

### Local development

Install dependencies once:

```bash
npm install
npm install --prefix backend
npm install --prefix my-app
```

The repo includes example env files at `.env.example`, `backend/.env.example`, and `my-app/.env.example`.

Run both frontend and backend locally:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

### Local API env

If you run the frontend separately from the backend, point it at the backend URL:

```bash
export VITE_API_BASE_URL=http://localhost:4000
npm run dev --prefix my-app
```

### Start backend only

```bash
cd backend
npm install
npm run dev
```

### Start full stack locally

```bash
cd /Users/nishiii/Desktop/Projects/finan
npm run dev
```

## Health check

After deploy, verify the backend with:

```bash
curl https://your-project.vercel.app/api/health
```

You should get:

```json
{"ok":true}
```
