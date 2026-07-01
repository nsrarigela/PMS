import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { seedIfNeeded, getUsers, upsertUser, setCurrentUser } from "../lib/store";

export default function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
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
      <div className="card login-card">
        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">Project Management System &middot; demo login</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@company.com" />
          </div>

          <div className="field">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Developer</option>
              <option>Project Manager</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Sign in
          </button>
        </form>

        {demoUsers.length > 0 && (
          <div className="demo-users">
            <p>Or jump in as a seeded demo user:</p>
            {demoUsers.map((u) => (
              <button key={u.id} className="btn demo-user-btn" onClick={() => quickLogin(u)}>
                {u.name} &middot; {u.role}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
