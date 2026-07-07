import { useEffect, useState } from "react";
import { X, Clock, Calendar as CalendarIcon } from "lucide-react";
import { getTodayAttendance, getAttendanceRecords, checkIn, checkOut } from "../lib/store";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// India — Gazetted Holidays 2026 (source: Govt. of India holiday calendar)
// type: "national" = the 3 holidays observed nationwide without exception
// type: "festival" = other gazetted religious/cultural holidays
const HOLIDAYS_2026 = {
  "2026-01-01": { name: "New Year's Day", type: "festival" },
  "2026-01-26": { name: "Republic Day", type: "national" },
  "2026-03-04": { name: "Holi", type: "festival" },
  "2026-03-21": { name: "Id-ul-Fitr", type: "festival" },
  "2026-03-26": { name: "Ram Navami", type: "festival" },
  "2026-03-31": { name: "Mahavir Jayanti", type: "festival" },
  "2026-04-03": { name: "Good Friday", type: "festival" },
  "2026-05-01": { name: "Buddha Purnima", type: "festival" },
  "2026-05-27": { name: "Id-ul-Zuha (Bakrid)", type: "festival" },
  "2026-06-26": { name: "Muharram", type: "festival" },
  "2026-08-15": { name: "Independence Day", type: "national" },
  "2026-08-26": { name: "Id-e-Milad", type: "festival" },
  "2026-09-04": { name: "Janmashtami", type: "festival" },
  "2026-10-02": { name: "Gandhi Jayanti", type: "national" },
  "2026-10-20": { name: "Dussehra", type: "festival" },
  "2026-11-08": { name: "Diwali", type: "festival" },
  "2026-11-24": { name: "Guru Nanak Jayanti", type: "festival" },
  "2026-12-25": { name: "Christmas", type: "festival" },
};

function formatHMS(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

function dateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function isLate(checkInAt) {
  const d = new Date(checkInAt);
  return d.getHours() > 9 || (d.getHours() === 9 && d.getMinutes() > 30);
}

export default function TimeClockModal({ user, onClose }) {
  const [now, setNow] = useState(Date.now());
  const [todayRecord, setTodayRecord] = useState(() => getTodayAttendance(user.id));
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleCheckIn() {
    const rec = checkIn(user.id);
    setTodayRecord(rec);
  }

  function handleCheckOut() {
    const rec = checkOut(user.id);
    setTodayRecord(rec);
  }

  function changeMonth(delta) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  const records = getAttendanceRecords(user.id);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);

  let presents = 0, lateLogins = 0, halfDays = 0, absents = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day);
    if (key > todayKey) continue;
    const rec = records.find((r) => r.date === key);
    const dow = new Date(year, month, day).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = !!HOLIDAYS_2026[key];

    if (rec) {
      presents++;
      if (isLate(rec.checkInAt)) lateLogins++;
      if (rec.checkOutAt && rec.hours < 6) halfDays++;
    } else if (!isWeekend && !isHoliday) {
      absents++;
    }
  }
  const lop = absents + halfDays * 0.5;

  const liveShiftMs = todayRecord && !todayRecord.checkOutAt ? now - todayRecord.checkInAt : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card timeclock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="timeclock-header">
          <h2><CalendarIcon size={20} style={{ verticalAlign: "-3px", marginRight: 8 }} />Time Clock & Attendance Dashboard</h2>
          <button className="btn" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 20 }}>
          Punch in/out, monitor working hours, and track payroll Loss of Pay (LOP) calculations.
        </p>

        <div className="timeclock-grid">
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 4 }}><Clock size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />Time Clock</h3>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>Track login activity for today</p>

            <div className="timeclock-currenttime">
              <div className="timeclock-label">CURRENT TIME</div>
              <div className="timeclock-time">{new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
              <div className="timeclock-date">{new Date(now).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
            </div>

            {todayRecord && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, margin: "14px 0" }}>
                <span>Check-in time:</span>
                <strong>{new Date(todayRecord.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
              </div>
            )}

            {todayRecord && !todayRecord.checkOutAt && (
              <div className="timeclock-liveshift">
                <div className="timeclock-label" style={{ color: "var(--success)" }}>LIVE SHIFT HOURS</div>
                <div className="timeclock-live-value">{formatHMS(liveShiftMs)}</div>
              </div>
            )}

            {todayRecord && todayRecord.checkOutAt && (
              <div className="timeclock-liveshift">
                <div className="timeclock-label">SHIFT COMPLETE</div>
                <div className="timeclock-live-value">{todayRecord.hours}h logged today</div>
              </div>
            )}

            {!todayRecord ? (
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={handleCheckIn}>
                <Clock size={15} /> Check In
              </button>
            ) : !todayRecord.checkOutAt ? (
              <button className="btn timeclock-checkout-btn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={handleCheckOut}>
                <Clock size={15} /> Check Out
              </button>
            ) : (
              <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled>
                Done for today
              </button>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15 }}><CalendarIcon size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />Attendance Logs & Payroll</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <button className="btn" style={{ padding: "3px 8px" }} onClick={() => changeMonth(-1)}>&larr; Prev</button>
                <strong>{MONTH_NAMES[month]} {year}</strong>
                <button className="btn" style={{ padding: "3px 8px" }} onClick={() => changeMonth(1)}>Next &rarr;</button>
              </div>
            </div>

            <div className="timeclock-cal-grid">
              {WEEKDAYS.map((d) => <div key={d} className="timeclock-cal-weekday">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = dateKey(year, month, day);
                const rec = records.find((r) => r.date === key);
                const dow = new Date(year, month, day).getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isFuture = key > todayKey;
                const holiday = HOLIDAYS_2026[key];

                let cellClass = "timeclock-cal-day";
                let content = null;

                if (holiday) {
                  cellClass += holiday.type === "national" ? " holiday-national" : " holiday-festival";
                  content = holiday.name;
                } else if (rec) {
                  cellClass += rec.hours >= 6 ? " present" : " halfday";
                  content = rec.checkOutAt ? `${rec.hours}h` : "active";
                } else if (isWeekend) {
                  cellClass += " off";
                  content = "Off";
                } else if (!isFuture) {
                  cellClass += " absent";
                }

                return (
                  <div key={day} className={cellClass} title={holiday ? holiday.name : undefined}>
                    <div className="timeclock-cal-daynum">{day}</div>
                    {content && <div className="timeclock-cal-hours">{content}</div>}
                  </div>
                );
              })}
            </div>

            <div className="timeclock-legend">
              <span><i className="dot dot-present" /> Present</span>
              <span><i className="dot dot-halfday" /> Half day</span>
              <span><i className="dot dot-absent" /> Absent</span>
              <span><i className="dot dot-off" /> Weekend</span>
              <span><i className="dot dot-holiday-national" /> National holiday</span>
              <span><i className="dot dot-holiday-festival" /> Festival holiday</span>
            </div>

            <div className="timeclock-stats">
              <div><span>Presents:</span><strong>{presents} days</strong></div>
              <div><span>Late Logins:</span><strong>{lateLogins} days</strong></div>
              <div><span>Half Days:</span><strong>{halfDays} days</strong></div>
              <div><span>Absents:</span><strong>{absents} days</strong></div>
            </div>

            <div className="timeclock-lop">
              <div>DYNAMIC PAYROLL LOP</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Loss of Pay<br />absences</span>
                <strong style={{ fontSize: 24 }}>{lop} days</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}