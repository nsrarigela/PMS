import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";

import { seedIfNeeded, getCurrentUser } from "./lib/store";

import Profile from "./pages/Profile";
import MyTasks from "./pages/MyTasks";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import EditProject from "./pages/EditProject";


// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const NewProject = lazy(() => import("./pages/NewProject"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Sprints = lazy(() => import("./pages/Sprints"));
const Bugs = lazy(() => import("./pages/Bugs"));
const Reports = lazy(() => import("./pages/Reports"));


export default function App() {

  const [checked, setChecked] = useState(false);


  useEffect(() => {
    seedIfNeeded();
    setChecked(true);
  }, []);


  if (!checked) return null;


  return (

    <Suspense fallback={<div className="loading">Loading...</div>}>

      <Routes>

        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />


        {/* Projects */}
        <Route path="/projects" element={<Projects />} />

        <Route 
          path="/projects/new" 
          element={<NewProject />} 
        />

        <Route 
          path="/projects/:id" 
          element={<ProjectDetail />} 
        />

        <Route 
          path="/projects/:id/edit" 
          element={<EditProject />} 
        />

        <Route 
          path="/projects/:id/sprints" 
          element={<Sprints />} 
        />

        <Route 
          path="/projects/:id/bugs" 
          element={<Bugs />} 
        />


        {/* Other Pages */}
        <Route path="/reports" element={<Reports />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/my-tasks" element={<MyTasks />} />

        <Route 
          path="/notifications" 
          element={<Notifications />} 
        />

        <Route 
          path="/users" 
          element={<Users />} 
        />


        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />

      </Routes>

    </Suspense>
  );
}



function RootRedirect() {

  const user = getCurrentUser();

  return (
    <Navigate 
      to={user ? "/dashboard" : "/login"} 
      replace 
    />
  );
}