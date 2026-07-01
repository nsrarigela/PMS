import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { addProject } from "../lib/store";

export default function NewProject() {
  const { user, ready, logout } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (ready && user.role !== "Project Manager") {
      navigate("/projects", { replace: true });
    }
  }, [ready, user, navigate]);

  if (!ready || user.role !== "Project Manager") return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const project = addProject({ name: name.trim(), description: description.trim(), createdBy: user.id });
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content" style={{ maxWidth: 520 }}>
        <div className="page-header"><h1>New project</h1></div>
        <form onSubmit={handleSubmit} className="card">
          <div className="field">
            <label htmlFor="pname">Project name</label>
            <input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mobile App Redesign" />
          </div>
          <div className="field">
            <label htmlFor="pdesc">Description</label>
            <textarea id="pdesc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
          </div>
          <button type="submit" className="btn btn-primary">Create project</button>
        </form>
      </main>
    </div>
  );
}
