import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanSquare, GitBranch, Bug, Eye, EyeOff, ShieldCheck, KeyRound, Database } from "lucide-react";
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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    seedIfNeeded();
    getUsers();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const user = upsertUser({ name: name.trim(), email: email.trim(), role });
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label htmlFor="pw">Password</label>
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, cursor: "not-allowed" }}>Forgot password?</span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", padding: 2 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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

          <div className="login-trust-badges">
            <span><ShieldCheck size={13} /> Secure</span>
            <span><KeyRound size={13} /> Role-based access</span>
            <span><Database size={13} /> Local storage demo</span>
          </div>
        </div>
      </div>
    </div>
  );
}