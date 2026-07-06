import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks } from "../lib/store";

export default function Projects() {
  const { user, ready, logout } = useSession();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!ready) return;

    setProjects(getProjects());
    setTasks(getAllTasks());
  }, [ready]);

  if (!ready) return null;

  const canCreate = user.role === "Project Manager";
  const visibleTasks =
  user.role === "Project Manager"
    ? tasks
    : tasks.filter((t) => t.assignee === user.id);

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />

      <div className="main-col">
        <Topbar user={user} />

        <main className="content">
          <div className="page-header">
            <div>
              <h1>Projects</h1>
              <p>
                {user.role === "Project Manager"
                  ? "Manage all projects."
                  : "Projects assigned to you."}
              </p>
            </div>

            {canCreate && (
              <Link to="/projects/new" className="btn btn-primary">
                + New Project
              </Link>
            )}
          </div>

          {projects.length === 0 && (
            <p className="empty-state">
              No projects available.
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
              gap: 18,
            }}
          >
            {projects
  .filter((project) => {
    if (user.role === "Project Manager") return true;

    return visibleTasks.some(
      (t) => t.projectId === project.id
    );
  })
  .map((project) => {
             const projectTasks = visibleTasks.filter(
  (t) => t.projectId === project.id
);

              const completed = projectTasks.filter(
                (t) => t.status === "done"
              ).length;

              const inProgress = projectTasks.filter(
                (t) => t.status === "in-progress"
              ).length;

              const todo = projectTasks.filter(
                (t) => t.status === "todo"
              ).length;

              const completion =
                projectTasks.length > 0
                  ? Math.round(
                      (completed / projectTasks.length) * 100
                    )
                  : 0;

              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <h3 style={{ marginBottom: 8 }}>
                    {project.name}
                  </h3>

                  <p
                    style={{
                      color: "var(--muted)",
                      marginBottom: 15,
                    }}
                  >
                    {project.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  >
                    <span>Completion</span>

                    <strong>{completion}%</strong>
                  </div>

                  <div
                    className="bar-track"
                    style={{
                      height: 10,
                      marginBottom: 15,
                    }}
                  >
                    <div
                      className="bar-fill"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <strong>{projectTasks.length}</strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: "gray",
                        }}
                      >
                        Tasks
                      </div>
                    </div>

                    <div>
                      <strong>{completed}</strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: "green",
                        }}
                      >
                        Done
                      </div>
                    </div>

                    <div>
                      <strong>{todo + inProgress}</strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#ff9800",
                        }}
                      >
                        Pending
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}