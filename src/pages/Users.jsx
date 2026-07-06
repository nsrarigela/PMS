import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Copy } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getUsers, registerUser, deleteUser } from "../lib/store";

export default function Users() {
  const { user, ready, logout } = useSession();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [error, setError] = useState("");
  const [createdAccount, setCreatedAccount] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    if (ready && user.role !== "Project Manager") {
      navigate("/dashboard", { replace: true });
    }
  }, [ready, user, navigate]);

  function refresh() {
    setUsers(getUsers());
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
  }, [ready]);

  if (!ready || user.role !== "Project Manager") return null;

  function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreatedAccount(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in name, email, and password.");
      return;
    }

    const result = registerUser({ name: name.trim(), email: email.trim(), password, role });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setCreatedAccount({ name: result.user.name, email: result.user.email, password, role: result.user.role });
    setName("");
    setEmail("");
    setPassword("");
    setRole("Developer");
    refresh();
  }

  function handleDelete(id) {
    if (id === user.id) return;
    deleteUser(id);
    refresh();
  }

  function togglePasswordVisible(id) {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function copyCredentials(u) {
    const text = `Email: ${u.email}\nPassword: ${u.password}`;
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>Users</h1>
              <p>Create accounts for your team and manage access.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Close" : "+ Add member"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@company.com" />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Password</label>
                  <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option>Developer</option>
                    <option>Project Manager</option>
                  </select>
                </div>
              </div>

              {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Create account</button>
            </form>
          )}

          {createdAccount && (
            <div className="card" style={{ marginBottom: 20, border: "1px solid var(--accent)", background: "var(--accent-soft)" }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
                Account created - share these credentials with {createdAccount.name}:
              </p>
              <p style={{ fontSize: 13, fontFamily: "monospace", margin: 0 }}>
                Email: {createdAccount.email}<br />
                Password: {createdAccount.password}
              </p>
              <button
                className="btn"
                style={{ marginTop: 10 }}
                onClick={() => { navigator.clipboard?.writeText(`Email: ${createdAccount.email}\nPassword: ${createdAccount.password}`); }}
              >
                <Copy size={14} /> Copy credentials
              </button>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>All users ({users.length})</h3>
            {users.length === 0 ? (
              <p className="empty-state">No accounts yet - add your first team member above.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: 12.5 }}>
                          {visiblePasswords[u.id] ? u.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePasswordVisible(u.id)}
                          style={{ background: "none", border: "none", marginLeft: 8, cursor: "pointer", color: "var(--muted)", verticalAlign: "middle" }}
                          title={visiblePasswords[u.id] ? "Hide password" : "Show password"}
                        >
                          {visiblePasswords[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyCredentials(u)}
                          style={{ background: "none", border: "none", marginLeft: 4, cursor: "pointer", color: "var(--muted)", verticalAlign: "middle" }}
                          title="Copy credentials"
                        >
                          <Copy size={14} />
                        </button>
                      </td>
                      <td><span className={`badge ${u.role === "Project Manager" ? "badge-high" : "badge-task"}`}>{u.role}</span></td>
                      <td>
                        {u.id !== user.id && (
                          <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleDelete(u.id)}>
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}