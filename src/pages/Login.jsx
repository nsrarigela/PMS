import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, LayoutPanelLeft, LineChart, Eye, EyeOff } from "lucide-react";
import { seedIfNeeded, authenticate, registerUser, setCurrentUser } from "../lib/store";

const FEATURES = [

  { 
    icon: Users, 
    label: "Team & Role Management" 
  },

  { 
    icon: LayoutPanelLeft, 
    label: "Projects, Sprints & Kanban Workflow" 
  },

  { 
    icon: LineChart, 
    label: "Performance Reports & Progress Insights" 
  },

];


export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    seedIfNeeded();
  }, []);

  function resetMessages() {
    setError("");
  }

  function handleSignIn(e) {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    const matchedUser = authenticate(email, password);
    if (!matchedUser) {
      setError("Invalid email or password. If you don't have an account yet, sign up below.");
      return;
    }

    setCurrentUser(matchedUser);
    navigate("/dashboard");
  }

  function handleSignUp(e) {
    e.preventDefault();
    resetMessages();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 4) {
      setError("Password should be at least 4 characters.");
      return;
    }

    const result = registerUser({ name, email, password, role });
    if (!result.success) {
      setError(result.message);
      return;
    }

    setCurrentUser(result.user);
    navigate("/dashboard");
  }

  return (
    <div className="login-wrap-hero">
      <div className="login-hero-panel">
        <h1 className="login-hero-title">

Organize Projects.
<br/>

<span className="login-hero-accent">
Track Progress.
</span>

<br/>

Achieve Goals.

</h1>
     <p className="login-hero-sub">

PMS helps organizations plan projects,
assign tasks, manage sprints, track bugs,
and improve team productivity from a single platform.

</p>

        <div className="login-hero-features">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div className="login-hero-feature" key={f.label}>
                <div className="login-hero-feature-icon"><Icon size={20} /></div>
                <span>{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="login-form-side">
        <div className="card login-card-simple">
          {mode === "signin" ? (
            <>
              <h2 className="login-title" style={{ textAlign: "center" }}>Welcome to PMS</h2>
              <p className="login-sub" style={{ textAlign: "center" }}>Access your project management workspace</p>

              <form onSubmit={handleSignIn} style={{ marginTop: 20 }}>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="username" />
                </div>

                <div className="field">
                  <label htmlFor="pw">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="pw"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
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

                {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Sign In
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 13, marginTop: 16, color: "var(--muted)" }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); resetMessages(); }}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="login-title" style={{ textAlign: "center" }}>Create your workspace and collaborate with your team</h2>
              <p className="login-sub" style={{ textAlign: "center" }}></p>

              <form onSubmit={handleSignUp} style={{ marginTop: 20 }}>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" autoComplete="name" />
                </div>

                <div className="field">
                  <label htmlFor="suEmail">Email address</label>
                  <input id="suEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="username" />
                </div>

                <div className="field">
                  <label htmlFor="suPw">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="suPw"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a password"
                      autoComplete="new-password"
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

                {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Create account
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 13, marginTop: 16, color: "var(--muted)" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); resetMessages(); }}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}