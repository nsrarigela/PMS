import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { addProject, getUsers } from "../lib/store";

export default function NewProject() {
  const { user, ready, logout } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [developers, setDevelopers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (ready && user.role !== "Project Manager") {
      navigate("/projects", { replace: true });
      return;
    }

    const devs = getUsers().filter((u) => u.role === "Developer");
    setDevelopers(devs);
  }, [ready, user, navigate]);

  if (!ready || user.role !== "Project Manager") return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const project = addProject({
      name: name.trim(),
      description: description.trim(),
      client: client.trim(),
      startDate,
      endDate,
      status,
      createdBy: user.id,
      members: selectedMembers,
    });

    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content" style={{ maxWidth: 560 }}>
          <div className="page-header"><h1>New project</h1></div>
          <form onSubmit={handleSubmit} className="card">
            <div className="field">
              <label htmlFor="pname">Project name</label>
              <input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mobile App Redesign" />
            </div>

            <div className="field">
              <label htmlFor="pclient">Client</label>
              <input id="pclient" value={client} onChange={(e) => setClient(e.target.value)} placeholder="ABC Bank" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="pstart">Start date</label>
                <input id="pstart" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pend">End date</label>
                <input id="pend" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pstatus">Status</label>
              <select id="pstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="pdesc">Description</label>
              <textarea id="pdesc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
            </div>

            <div className="field">
              <label>Assign Team Members</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 10,
                  marginTop: 10,
                  padding: 10,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                {developers.map((dev) => (
                  <label
                    key={dev.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(dev.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, dev.id]);
                        } else {
                          setSelectedMembers(
                            selectedMembers.filter((id) => id !== dev.id)
                          );
                        }
                      }}
                    />
                    {dev.name}
                  </label>
                ))}
                {developers.length === 0 && (
                  <p style={{ fontSize: 12.5, color: "var(--muted)", gridColumn: "1 / -1" }}>
                    No developer accounts yet — add some from the Users page first.
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Create project</button>
          </form>
        </main>
      </div>
    </div>
  );
}