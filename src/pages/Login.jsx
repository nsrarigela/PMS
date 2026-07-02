import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanSquare, GitBranch, Bug, Eye, EyeOff } from "lucide-react";
import { seedIfNeeded, getUsers, upsertUser, setCurrentUser } from "../lib/store";

const FEATURES = [
  { icon: KanbanSquare, title: "Visual Kanban Boards", desc: "Drag tasks across To Do, In Progress, Review, and Done." },
  { icon: GitBranch, title: "Sprint Planning", desc: "Organize work into focused development cycles." },
  { icon: Bug, title: "Bug Tracking", desc: "Report, assign, and resolve issues without losing context." },
];

export default function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [showHint, setShowHint] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    seedIfNeeded();
    setDemoUsers(getUsers());
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const user = upsertUser({ name: name.trim(), email: email.trim(), role });
    setCurrentUser(user);
    navigate("/dashboard");
  }

  function quickLogin(user) {
    setCurrentUser(user);
    navigate("/dashboard");
  }

  return (
    <div className="login-wrap">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-mark">P</div>
          <span>PMS</span>
        </div>

        <h1 className="login-panel-title">
          Ship projects.<br />
          <span className="login-panel-title-accent">Not chaos.</span>
        </h1>
        <p className="login-panel-sub">
          One workspace for planning sprints, tracking tasks, and squashing bugs — built for teams that move fast.
        </p>

        <div className="login-feature-list">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div className="login-feature" key={f.title}>
                <div className="login-feature-icon"><Icon size={18} /></div>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="login-form-side">
        <div className="card login-card">
          <h2 className="login-title">Sign in</h2>
          <p className="login-sub">Enter your details to access your workspace</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@company.com" />
            </div>

            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Developer</option>
                <option>Project Manager</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              Sign in
            </button>
          </form>

          {demoUsers.length > 0 && (
            <div className="demo-users">
              <button
                type="button"
                className="demo-toggle"
                onClick={() => setShowHint((s) => !s)}
              >
                {showHint ? <EyeOff size={13} /> : <Eye size={13} />}
                {showHint ? "Hide demo accounts" : "Show demo accounts"}
              </button>
              {showHint && demoUsers.map((u) => (
                <button key={u.id} className="btn demo-user-btn" onClick={() => quickLogin(u)}>
                  {u.name} &middot; {u.role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}