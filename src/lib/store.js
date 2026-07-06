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
  SEEDED: "pms_seeded_v9",
  NOTIFICATIONS: "pms_notifications",
};

export function getNotifications(userId) {
  return read(KEYS.NOTIFICATIONS, []).filter((n) => n.userId === userId);
}

export function addNotification(notification) {
  const list = read(KEYS.NOTIFICATIONS, []);
  list.unshift({
    id: uid("n"),
    isRead: false,
    createdAt: Date.now(),
    ...notification,
  });
  write(KEYS.NOTIFICATIONS, list);
}

export function markNotificationRead(id) {
  const list = read(KEYS.NOTIFICATIONS, []);
  const index = list.findIndex((n) => n.id === id);
  if (index !== -1) {
    list[index].isRead = true;
  }
  write(KEYS.NOTIFICATIONS, list);
}

export function deleteUser(userId) {
  const users = getUsers().filter((u) => u.id !== userId);
  write(KEYS.USERS, users);
}

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

export function seedIfNeeded() {
  if (read(KEYS.SEEDED, false)) return;

  write(KEYS.USERS, []);
  write(KEYS.PROJECTS, []);
  write(KEYS.SPRINTS, []);
  write(KEYS.TASKS, []);
  write(KEYS.BUGS, []);
  write(KEYS.SEEDED, true);
}

export function authenticate(email, password) {
  const users = getUsers();
  const match = users.find(
    (u) =>
      u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );
  return match || null;
}

export function getUsers() {
  return read(KEYS.USERS, []);
}

export function registerUser({ name, email, password, role }) {
  const users = getUsers();

  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return {
      success: false,
      message: "Email already exists",
    };
  }

  const newUser = {
    id: uid("u"),
    name,
    email,
    password,
    role,
    createdAt: Date.now(),
  };

  users.push(newUser);
  write(KEYS.USERS, users);

  return {
    success: true,
    user: newUser,
  };
}

export function updateUser(userId, changes) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...changes };
  write(KEYS.USERS, users);
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

export function getProjects() {
  return read(KEYS.PROJECTS, []);
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

export function addProject({ name, description, client, startDate, endDate, status, createdBy, members = [] }) {
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
    members: [createdBy, ...members],
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

export function updateProjectMembers(projectId, members) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return;
  projects[index].members = members;
  write(KEYS.PROJECTS, projects);
}

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
  const tasks = getAllTasks().map((t) => (t.sprintId === sprintId ? { ...t, sprintId: null } : t));
  write(KEYS.TASKS, tasks);
}

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

export function addTask({ projectId, sprintId, title, description, priority, type, assignee, dueDate, estimatedHours }) {
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
    estimatedHours: Number(estimatedHours) || 0,
    hoursLogged: 0,
    comments: [],
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

export function getComments(taskId) {
  const comments = read("pms_comments", {});
  return comments[taskId] || [];
}

export function addComment(taskId, user, message) {
  const comments = read("pms_comments", {});
  if (!comments[taskId]) {
    comments[taskId] = [];
  }
  comments[taskId].push({
    id: Date.now(),
    user,
    message,
    createdAt: new Date().toLocaleString(),
  });
  write("pms_comments", comments);
}