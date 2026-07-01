import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { seedIfNeeded, getCurrentUser } from "./lib/store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Reports from "./pages/Reports";

// This is the entire "map" of the app: URL path -> which page component to show.
// It replaces the folder structure Next.js used (app/dashboard/page.jsx, etc.)
// with one explicit list, which is how a plain React SPA typically does routing.
export default function App() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    seedIfNeeded(); // make sure demo data exists before any page tries to read it
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <Routes>
      {/* "/" decides where to send the user based on whether they're logged in */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/reports" element={<Reports />} />
      {/* Catch-all: any unknown URL just goes back to the root logic above */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const user = getCurrentUser();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
