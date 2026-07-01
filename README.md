# Project Management System (React SPA)

A pure **HTML + CSS + JavaScript + React** single-page application (SPA),
built with Vite. No server-side framework — all routing happens in the
browser via `react-router-dom`, and data is stored in `localStorage`
through `src/lib/store.js` (acting as a mock backend/API).

## Features -> Files

| Feature | Where it lives |
|---|---|
| Login (Project Manager / Developer) | `src/pages/Login.jsx`, `src/lib/useSession.js` |
| Projects | `src/pages/Projects.jsx`, `src/pages/NewProject.jsx` |
| Tasks / Bugs | `src/pages/ProjectDetail.jsx` (NewTaskForm), `src/lib/store.js` |
| Kanban Board | `src/pages/ProjectDetail.jsx`, `src/components/TaskCard.jsx` |
| Task Tracking (hours + comments) | `src/pages/ProjectDetail.jsx` (TaskDetailPanel) |
| Reports | `src/pages/Reports.jsx` |
| Dashboard / stats | `src/pages/Dashboard.jsx` |
| Routing | `src/App.jsx` (all routes defined here, using react-router-dom) |

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Demo users are seeded automatically on first load:
- **Alice Chen** — Project Manager
- **Bob Kumar** — Developer
- **Priya Rao** — Developer

## Deploy (GitHub + Vercel)

```bash
git init
git add .
git commit -m "Project management system - React SPA"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on https://vercel.com: **Add New Project** -> import the repo ->
Vercel auto-detects Vite -> click **Deploy**. `vercel.json` in this repo
makes sure page refreshes on routes like `/projects/p-1` still work
correctly (since this is a client-side-routed SPA).

## Notes

- This is a plain React app (Vite + react-router-dom), not Next.js — no
  server-side rendering or file-based routing magic, just standard
  React components and `<Routes>`/`<Route>` definitions in `App.jsx`.
- Role permissions: only a **Project Manager** can create projects/tasks;
  a **Developer** can only move/track tasks assigned to them.
