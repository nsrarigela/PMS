import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { seedIfNeeded, getCurrentUser } from "./lib/store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Sprints from "./pages/Sprints";
import Bugs from "./pages/Bugs";
import Reports from "./pages/Reports";

export default function App() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    seedIfNeeded();
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/:id/sprints" element={<Sprints />} />
      <Route path="/projects/:id/bugs" element={<Bugs />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const user = getCurrentUser();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}