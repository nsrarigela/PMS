import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getProject, getUsers, updateProject } from "../lib/store";

export default function EditProject() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [developers, setDevelopers] = useState([]);

  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (user.role !== "Project Manager") {
      navigate(`/projects/${id}`, { replace: true });
      return;
    }

    const p = getProject(id);
    if (!p) {
      navigate("/projects", { replace: true });
      return;
    }

    setProject(p);
    setName(p.name || "");
    setClient(p.client || "");
    setStartDate(p.startDate || "");
    setEndDate(p.endDate || "");
    setStatus(p.status || "Active");
    setDescription(p.description || "");
    setSelectedMembers((p.members || []).filter((m) => m !== p.createdBy));

    setDevelopers(getUsers().filter((u) => u.role === "Developer"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id, user, navigate]);

  if (!ready || !project) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    updateProject(id, {
      name: name.trim(),
      client: client.trim(),
      startDate,
      endDate,
      status,
      description: description.trim(),
      members: [project.createdBy, ...selectedMembers],
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content" style={{ maxWidth: 560 }}>
          <div className="page-header">
            <div>
              <h1>Edit project</h1>
              <p>Update project details and team members.</p>
            </div>
            <Link to={`/projects/${id}/sprints`} className="btn">Back to sprints</Link>
          </div>

          <form onSubmit={handleSubmit} className="card">
            <div className="field">
              <label htmlFor="pname">Project name</label>
              <input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="pclient">Client</label>
              <input id="pclient" value={client} onChange={(e) => setClient(e.target.value)} />
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
              <textarea id="pdesc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="field">
              <label>Team members</label>
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
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(dev.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, dev.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter((m) => m !== dev.id));
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
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>
                You (the project creator) always have access and can't be removed here.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary">Save changes</button>
              {saved && (
                <span style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                  Saved ✓
                </span>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}