import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Bell, Clock, CalendarDays, FolderKanban, ListChecks } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import TimeClockModal from "./TimeClockModal";
import { getTodayAttendance, getAllTasks, getProjects } from "../lib/store";
import { getUpcomingHolidays } from "../lib/holidays";

export default function Topbar({ user }) {
  const navigate = useNavigate();
  const [showTimeClock, setShowTimeClock] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [todayRecord, setTodayRecord] = useState(() => getTodayAttendance(user.id));
  const [now, setNow] = useState(Date.now());
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const eventsRef = useRef(null);
  const searchRef = useRef(null);

  const upcomingHolidays = getUpcomingHolidays(6);
  const isPM = user.role === "Project Manager";

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (eventsRef.current && !eventsRef.current.contains(e.target)) {
        setShowEvents(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCloseModal() {
    setShowTimeClock(false);
    setTodayRecord(getTodayAttendance(user.id));
  }

  const isWorking = todayRecord && !todayRecord.checkOutAt;
  let workingLabel = "";
  if (isWorking) {
    const totalSec = Math.max(0, Math.floor((now - todayRecord.checkInAt) / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    workingLabel = `Working: ${h}h ${m}m ${s}s`;
  }

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { tasks: [], projects: [] };

    const allTasks = getAllTasks();
    const allProjects = getProjects();

    const visibleTasks = isPM ? allTasks : allTasks.filter((t) => t.assignee === user.id);
    const visibleProjects = isPM ? allProjects : allProjects.filter((p) => p.members?.includes(user.id));

    const tasks = visibleTasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q))
      .slice(0, 5);

    const projects = visibleProjects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);

    return { tasks, projects };
  }, [query, isPM, user.id]);

  const hasResults = searchResults.tasks.length > 0 || searchResults.projects.length > 0;

  function goToTask(task) {
    setQuery("");
    setShowSearch(false);
    navigate(`/projects/${task.projectId}`);
  }

  function goToProject(project) {
    setQuery("");
    setShowSearch(false);
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="topbar">
      <div className="topbar-search-wrap" ref={searchRef}>
        <div className="topbar-search">
          <Search size={16} />
          <input
            placeholder="Search tasks or projects..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => query && setShowSearch(true)}
          />
        </div>

        {showSearch && query.trim() && (
          <div className="search-dropdown">
            {!hasResults ? (
              <p style={{ fontSize: 12.5, color: "var(--muted)", padding: "10px 6px" }}>
                No matches for "{query}".
              </p>
            ) : (
              <>
                {searchResults.tasks.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Tasks</div>
                    {searchResults.tasks.map((t) => (
                      <button key={t.id} className="search-result" onClick={() => goToTask(t)}>
                        <ListChecks size={14} />
                        <div>
                          <div className="search-result-title">
                            <span className="task-key" style={{ marginRight: 6 }}>{t.key}</span>
                            {t.title}
                          </div>
                          <div className="search-result-sub">{t.status} &middot; {t.priority}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.projects.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-label">Projects</div>
                    {searchResults.projects.map((p) => (
                      <button key={p.id} className="search-result" onClick={() => goToProject(p)}>
                        <FolderKanban size={14} />
                        <div>
                          <div className="search-result-title">{p.name}</div>
                          {p.description && <div className="search-result-sub">{p.description}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="topbar-right">
        {isWorking && (
          <button className="working-pill" onClick={() => setShowTimeClock(true)} title="Open Time Clock">
            <span className="working-dot" /> {workingLabel}
          </button>
        )}

        <button className="btn" onClick={() => setShowTimeClock(true)}>
          <Clock size={14} /> Time Clock
        </button>

        <div className="events-wrap" ref={eventsRef}>
          <button className="btn" onClick={() => setShowEvents((s) => !s)}>
            <CalendarDays size={14} /> Upcoming Events
          </button>

          {showEvents && (
            <div className="events-dropdown">
              <div className="events-dropdown-title">Upcoming holidays (India, 2026)</div>
              {upcomingHolidays.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--muted)", padding: "8px 4px" }}>
                  No more holidays this year.
                </p>
              ) : (
                upcomingHolidays.map((h) => (
                  <div key={h.date} className="events-dropdown-item">
                    <span className={`event-dot ${h.type === "national" ? "event-dot-national" : "event-dot-festival"}`} />
                    <div>
                      <div className="events-dropdown-name">{h.name}</div>
                      <div className="events-dropdown-date">
                        {new Date(h.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}
                        {h.daysUntil === 0 ? "Today" : `in ${h.daysUntil} day${h.daysUntil !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <span className="topbar-role-badge">{user.role}</span>

        <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
        </Link>

        <div className="topbar-user">
          <strong>{user.name}</strong>
          <span>My Workspace</span>
        </div>
      </div>

      {showTimeClock && <TimeClockModal user={user} onClose={handleCloseModal} />}
    </div>
  );
}