// lib/store.js
//
// This file is the ONLY place in the app that talks to localStorage directly.
// Everything else (pages, components) calls the functions below.

const KEYS = {
  USERS: "pms_users",
  PROJECTS: "pms_projects",
  TASKS: "pms_tasks",
  SPRINTS: "pms_sprints",
  BUGS: "pms_bugs",
  CURRENT_USER: "pms_current_user",
  SEEDED: "pms_seeded_v4",
};

// ---------- low level helpers ----------

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
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
    { id: "u-pm1", name: "Naidu Srinivas", email: "naidu@demo.com", role: "Project Manager" },
    { id: "u-pm2", name: "Rahul Verma", email: "rahul@demo.com", role: "Project Manager" },
    { id: "u-dev1", name: "Aravind Kumar", email: "aravind@demo.com", role: "Developer" },
    { id: "u-dev2", name: "Manoj Reddy", email: "manoj@demo.com", role: "Developer" },
    { id: "u-dev3", name: "Tilak Varma", email: "tilak@demo.com", role: "Developer" },
    { id: "u-dev4", name: "Vamsi Krishna", email: "vamsi@demo.com", role: "Developer" },
    { id: "u-dev5", name: "Rakesh Nagendra", email: "rakesh@demo.com", role: "Developer" },
    { id: "u-dev6", name: "Sairam Chowdary", email: "sairam@demo.com", role: "Developer" },
    { id: "u-dev7", name: "Bharath Teja", email: "bharath@demo.com", role: "Developer" },
    { id: "u-dev8", name: "Akhil Kiran", email: "akhil@demo.com", role: "Developer" },
  ];

  const allDevIds = users.filter((u) => u.role === "Developer").map((u) => u.id);

  const projects = [
    {
      id: "p-1",
      name: "Checkout Revamp",
      description: "Redesign the checkout flow to reduce cart abandonment.",
      client: "ABC Retail",
      startDate: "2026-05-01",
      endDate: "2026-08-01",
      status: "Active",
      createdBy: "u-pm1",
      members: ["u-pm1", ...allDevIds.slice(0, 4)],
      createdAt: Date.now(),
    },
    {
      id: "p-2",
      name: "Online Banking Portal",
      description: "Secure customer portal for account management and transfers.",
      client: "ABC Bank",
      startDate: "2026-04-15",
      endDate: "2026-09-30",
      status: "Active",
      createdBy: "u-pm2",
      members: ["u-pm2", ...allDevIds.slice(2, 8)],
      createdAt: Date.now(),
    },
    {
      id: "p-3",
      name: "Hospital Management System",
      description: "Patient records, appointments, and billing in one system.",
      client: "CityCare Hospitals",
      startDate: "2026-06-01",
      endDate: "2026-12-01",
      status: "On Hold",
      createdBy: "u-pm1",
      members: ["u-pm1", ...allDevIds.slice(4, 8)],
      createdAt: Date.now(),
    },
  ];

  const sprints = [
    { id: "s-1", projectId: "p-1", name: "Sprint 1", startDate: "2026-05-01", endDate: "2026-05-14" },
    { id: "s-2", projectId: "p-2", name: "Sprint 1", startDate: "2026-04-15", endDate: "2026-04-29" },
    { id: "s-3", projectId: "p-2", name: "Sprint 2", startDate: "2026-04-30", endDate: "2026-05-14" },
  ];

  const tasks = [
    // Checkout Revamp (p-1)
    { id: "t-1", projectId: "p-1", sprintId: "s-1", key: "TASK-101", title: "Design new cart page", description: "Wireframe the updated cart layout.", status: "todo", priority: "medium", type: "task", assignee: "u-dev1", dueDate: "2026-07-10", createdAt: Date.now() },
    { id: "t-2", projectId: "p-1", sprintId: "s-1", key: "TASK-102", title: "Payment API times out", description: "Stripe call occasionally hangs for 30s+.", status: "in-progress", priority: "high", type: "bug", assignee: "u-dev2", dueDate: "2026-07-05", createdAt: Date.now() },
    { id: "t-3", projectId: "p-1", sprintId: "s-1", key: "TASK-103", title: "Add promo code field", description: "Allow users to apply discount codes at checkout.", status: "review", priority: "low", type: "task", assignee: "u-dev3", dueDate: "2026-07-12", createdAt: Date.now() },
    { id: "t-4", projectId: "p-1", sprintId: null, key: "TASK-104", title: "Set up analytics events", description: "Track funnel drop-off at each checkout step.", status: "done", priority: "medium", type: "task", assignee: "u-dev4", dueDate: "2026-07-02", createdAt: Date.now() },

    // Online Banking Portal (p-2)
    { id: "t-5", projectId: "p-2", sprintId: "s-2", key: "TASK-201", title: "Create login page", description: "Implement OTP-based secure login.", status: "done", priority: "high", type: "task", assignee: "u-dev3", dueDate: "2026-07-01", createdAt: Date.now() },
    { id: "t-6", projectId: "p-2", sprintId: "s-2", key: "TASK-202", title: "Build dashboard UI", description: "Account overview with balances and recent transactions.", status: "in-progress", priority: "high", type: "task", assignee: "u-dev4", dueDate: "2026-07-08", createdAt: Date.now() },
    { id: "t-7", projectId: "p-2", sprintId: "s-3", key: "TASK-203", title: "Payment module", description: "Fund transfers between linked accounts.", status: "todo", priority: "high", type: "task", assignee: "u-dev5", dueDate: "2026-07-15", createdAt: Date.now() },
    { id: "t-8", projectId: "p-2", sprintId: "s-3", key: "TASK-204", title: "Fix session timeout bug", description: "Users get logged out mid-transfer.", status: "review", priority: "high", type: "bug", assignee: "u-dev6", dueDate: "2026-07-06", createdAt: Date.now() },
    { id: "t-9", projectId: "p-2", sprintId: null, key: "TASK-205", title: "Transaction history export", description: "Allow CSV/PDF export of statements.", status: "todo", priority: "low", type: "task", assignee: "u-dev7", dueDate: "2026-07-20", createdAt: Date.now() },

    // Hospital Management System (p-3)
    { id: "t-10", projectId: "p-3", sprintId: null, key: "TASK-301", title: "Patient registration form", description: "Capture demographics and medical history.", status: "todo", priority: "medium", type: "task", assignee: "u-dev6", dueDate: "2026-07-18", createdAt: Date.now() },
    { id: "t-11", projectId: "p-3", sprintId: null, key: "TASK-302", title: "Appointment scheduling bug", description: "Double-booking allowed on same time slot.", status: "in-progress", priority: "high", type: "bug", assignee: "u-dev8", dueDate: "2026-07-09", createdAt: Date.now() },
    { id: "t-12", projectId: "p-3", sprintId: null, key: "TASK-303", title: "Billing summary page", description: "Itemized invoice view for patients.", status: "todo", priority: "medium", type: "task", assignee: "u-dev5", dueDate: "2026-07-22", createdAt: Date.now() },
  ];

  const bugs = [
    { id: "b-1", projectId: "p-1", title: "Login button not working on Safari", description: "Click event doesn't fire on iOS Safari 17.", priority: "high", assignee: "u-dev2", status: "Open", createdAt: Date.now() },
    { id: "b-2", projectId: "p-1", title: "Payment failed silently", description: "No error shown when Stripe declines a card.", priority: "high", assignee: "u-dev2", status: "In Progress", createdAt: Date.now() },
    { id: "b-3", projectId: "p-2", title: "Session timeout mid-transfer", description: "Users logged out during fund transfer.", priority: "high", assignee: "u-dev6", status: "In Progress", createdAt: Date.now() },
    { id: "b-4", projectId: "p-2", title: "Balance not refreshing", description: "Dashboard shows stale balance after a transfer.", priority: "medium", assignee: "u-dev4", status: "Open", createdAt: Date.now() },
    { id: "b-5", projectId: "p-3", title: "Duplicate appointment slots", description: "Two patients can book the same time slot.", priority: "high", assignee: "u-dev8", status: "Open", createdAt: Date.now() },
    { id: "b-6", projectId: "p-1", title: "Promo code not applying discount", description: "Valid codes accepted but discount not calculated.", priority: "medium", assignee: "u-dev3", status: "Fixed", createdAt: Date.now() },
  ];

  write(KEYS.USERS, users);
  write(KEYS.PROJECTS, projects);
  write(KEYS.SPRINTS, sprints);
  write(KEYS.TASKS, tasks);
  write(KEYS.BUGS, bugs);
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

export function updateUser(userId, changes) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...changes };
  write(KEYS.USERS, users);
  // keep the logged-in session in sync if it's the same user
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(users[idx]);
  }
  return users[idx];
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

export function addProject({ name, description, client, startDate, endDate, status, createdBy }) {
  const projects = getProjects();
  const project = {
    id: uid("p"),
    name,
    description,
    client: client || "",
    startDate: startDate || "",
    endDate: endDate || "",
    status: status || "Active",
    createdBy,
    members: [createdBy],
    createdAt: Date.now(),
  };
  projects.push(project);
  write(KEYS.PROJECTS, projects);
  return project;
}

export function updateProject(projectId, changes) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...changes };
  write(KEYS.PROJECTS, projects);
  return projects[idx];
}

// ---------- sprints ----------

export function getSprintsByProject(projectId) {
  return read(KEYS.SPRINTS, []).filter((s) => s.projectId === projectId);
}

export function getSprint(id) {
  return read(KEYS.SPRINTS, []).find((s) => s.id === id) || null;
}

export function addSprint({ projectId, name, startDate, endDate }) {
  const sprints = read(KEYS.SPRINTS, []);
  const sprint = { id: uid("s"), projectId, name, startDate: startDate || "", endDate: endDate || "" };
  sprints.push(sprint);
  write(KEYS.SPRINTS, sprints);
  return sprint;
}

export function deleteSprint(sprintId) {
  const sprints = read(KEYS.SPRINTS, []).filter((s) => s.id !== sprintId);
  write(KEYS.SPRINTS, sprints);
  // unlink any tasks that were in this sprint
  const tasks = getAllTasks().map((t) => (t.sprintId === sprintId ? { ...t, sprintId: null } : t));
  write(KEYS.TASKS, tasks);
}

// ---------- tasks ----------

export function getAllTasks() {
  return read(KEYS.TASKS, []);
}

export function getTasksByProject(projectId) {
  return getAllTasks().filter((t) => t.projectId === projectId);
}

export function getTasksBySprint(sprintId) {
  return getAllTasks().filter((t) => t.sprintId === sprintId);
}

function nextTaskKey() {
  const tasks = getAllTasks();
  const max = tasks.reduce((m, t) => {
    const n = parseInt(String(t.key).split("-")[1] || "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 100);
  return `TASK-${max + 1}`;
}

export function addTask({ projectId, sprintId, title, description, priority, type, assignee, dueDate }) {
  const tasks = getAllTasks();
  const task = {
    id: uid("t"),
    projectId,
    sprintId: sprintId || null,
    key: nextTaskKey(),
    title,
    description,
    status: "todo",
    priority: priority || "medium",
    type: type || "task",
    assignee: assignee || "",
    dueDate: dueDate || "",
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

// ---------- bugs (dedicated Bug Tracking module) ----------

export function getAllBugs() {
  return read(KEYS.BUGS, []);
}

export function getBugsByProject(projectId) {
  return getAllBugs().filter((b) => b.projectId === projectId);
}

export function addBug({ projectId, title, description, priority, assignee }) {
  const bugs = getAllBugs();
  const bug = {
    id: uid("b"),
    projectId,
    title,
    description: description || "",
    priority: priority || "medium",
    assignee: assignee || "",
    status: "Open",
    createdAt: Date.now(),
  };
  bugs.push(bug);
  write(KEYS.BUGS, bugs);
  return bug;
}

export function updateBug(bugId, changes) {
  const bugs = getAllBugs();
  const idx = bugs.findIndex((b) => b.id === bugId);
  if (idx === -1) return null;
  bugs[idx] = { ...bugs[idx], ...changes };
  write(KEYS.BUGS, bugs);
  return bugs[idx];
}