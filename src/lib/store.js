// lib/store.js
//
// This file is the ONLY place in the app that talks to localStorage directly.
// Everything else (pages, components) calls the functions below.
// Think of it as a tiny fake backend/database that lives in the browser.

const KEYS = {
  USERS: "pms_users",
  PROJECTS: "pms_projects",
  TASKS: "pms_tasks",
  CURRENT_USER: "pms_current_user",
  SEEDED: "pms_seeded",
};

// ---------- low level helpers ----------

function read(key, fallback) {
  if (typeof window === "undefined") return fallback; // guards against server-side render
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- seed data (runs once, first time the app loads) ----------

export function seedIfNeeded() {
  if (read(KEYS.SEEDED, false)) return;

  const users = [
    { id: "u-pm1", name: "Alice Chen", email: "alice@demo.com", role: "Project Manager" },
    { id: "u-dev1", name: "Bob Kumar", email: "bob@demo.com", role: "Developer" },
    { id: "u-dev2", name: "Priya Rao", email: "priya@demo.com", role: "Developer" },
  ];

  const projects = [
    {
      id: "p-1",
      name: "Checkout Revamp",
      description: "Redesign the checkout flow to reduce cart abandonment.",
      createdBy: "u-pm1",
      members: ["u-pm1", "u-dev1", "u-dev2"],
      createdAt: Date.now(),
    },
  ];

  const tasks = [
    { id: "t-1", projectId: "p-1", key: "TASK-101", title: "Design new cart page", description: "Wireframe the updated cart layout.", status: "todo", priority: "medium", type: "task", assignee: "u-dev1", createdAt: Date.now() },
    { id: "t-2", projectId: "p-1", key: "TASK-102", title: "Payment API times out", description: "Stripe call occasionally hangs for 30s+.", status: "in-progress", priority: "high", type: "bug", assignee: "u-dev2", createdAt: Date.now() },
    { id: "t-3", projectId: "p-1", key: "TASK-103", title: "Add promo code field", description: "Allow users to apply discount codes at checkout.", status: "review", priority: "low", type: "task", assignee: "u-dev1", createdAt: Date.now() },
    { id: "t-4", projectId: "p-1", key: "TASK-104", title: "Set up analytics events", description: "Track funnel drop-off at each checkout step.", status: "done", priority: "medium", type: "task", assignee: "u-dev2", createdAt: Date.now() },
  ];

  write(KEYS.USERS, users);
  write(KEYS.PROJECTS, projects);
  write(KEYS.TASKS, tasks);
  write(KEYS.SEEDED, true);
}

// ---------- users ----------

export function getUsers() {
  return read(KEYS.USERS, []);
}

export function upsertUser(user) {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    existing.name = user.name;
    existing.role = user.role;
    write(KEYS.USERS, users);
    return existing;
  }
  const newUser = { ...user, id: uid("u") };
  users.push(newUser);
  write(KEYS.USERS, users);
  return newUser;
}

export function getCurrentUser() {
  return read(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  write(KEYS.CURRENT_USER, user);
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.CURRENT_USER);
}

// ---------- projects ----------

export function getProjects() {
  return read(KEYS.PROJECTS, []);
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

export function addProject({ name, description, createdBy }) {
  const projects = getProjects();
  const project = {
    id: uid("p"),
    name,
    description,
    createdBy,
    members: [createdBy],
    createdAt: Date.now(),
  };
  projects.push(project);
  write(KEYS.PROJECTS, projects);
  return project;
}

// ---------- tasks ----------

export function getAllTasks() {
  return read(KEYS.TASKS, []);
}

export function getTasksByProject(projectId) {
  return getAllTasks().filter((t) => t.projectId === projectId);
}

function nextTaskKey() {
  const tasks = getAllTasks();
  const max = tasks.reduce((m, t) => {
    const n = parseInt(String(t.key).split("-")[1] || "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100);
  return `TASK-${max + 1}`;
}

export function addTask({ projectId, title, description, priority, type, assignee }) {
  const tasks = getAllTasks();
  const task = {
    id: uid("t"),
    projectId,
    key: nextTaskKey(),
    title,
    description,
    status: "todo",
    priority: priority || "medium",
    type: type || "task",
    assignee: assignee || "",
    createdAt: Date.now(),
  };
  tasks.push(task);
  write(KEYS.TASKS, tasks);
  return task;
}

export function updateTask(taskId, changes) {
  const tasks = getAllTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...changes };
  write(KEYS.TASKS, tasks);
  return tasks[idx];
}

export function deleteTask(taskId) {
  const tasks = getAllTasks().filter((t) => t.id !== taskId);
  write(KEYS.TASKS, tasks);
}
