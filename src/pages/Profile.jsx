import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { updateUser } from "../lib/store";
import { Phone, Building2, User as UserIcon } from "lucide-react";

const TABS = ["Profile", "Security"];

export default function Profile() {
  const { user, ready, logout } = useSession();
  const [tab, setTab] = useState("Profile");
  const [title, setTitle] = useState(user?.title || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);

  if (!ready) return null;

  function handleSave(e) {
    e.preventDefault();
    updateUser(user.id, { title, phone, department, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function initials(name) {
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content" style={{ maxWidth: 1040 }}>
        <div className="page-header">
          <div>
            <h1>Account settings</h1>
            <p>Manage your profile and workspace preferences.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
          <div className="card profile-summary-card">
            <div className="profile-avatar">{initials(user.name)}</div>
            <h3 style={{ marginTop: 14, fontSize: 16.5 }}>{user.name}</h3>
            <p style={{ color: "var(--muted)", fontSize: 12.5, margin: "4px 0 10px" }}>
              {title || "No title set"}
            </p>
            <span className="badge badge-task" style={{ textTransform: "capitalize" }}>{user.role}</span>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--muted)" }}>
              <p style={{ margin: "0 0 6px" }}><strong style={{ color: "var(--text)" }}>Email</strong><br />{user.email}</p>
            </div>
          </div>

          <div className="card">
            <div className="profile-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`profile-tab${tab === t ? " active" : ""}`}
                  onClick={() => setTab(t)}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Profile" && (
              <form onSubmit={handleSave} style={{ marginTop: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="field">
                    <label><UserIcon size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Job title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" />
                  </div>
                  <div className="field">
                    <label><Building2 size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Department</label>
                    <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
                  </div>
                </div>

                <div className="field">
                  <label><Phone size={12} style={{ verticalAlign: -2, marginRight: 4 }} />Contact phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>

                <div className="field">
                  <label>Bio / summary</label>
                  <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short summary about your role and focus areas..." />
                </div>

                <button type="submit" className="btn btn-primary">Save changes</button>
                {saved && <span style={{ marginLeft: 10, fontSize: 12.5, color: "var(--success)" }}>✓ Saved</span>}
              </form>
            )}

            {tab === "Security" && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                  This is a demo app using local browser storage — there's no real authentication or password to manage here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}