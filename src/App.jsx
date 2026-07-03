import { useState, useEffect, useRef } from "react";

// ── API base URL ──
const API = "https://renttrack-backend-hdds.onrender.com/api";
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    return await res.json();
  } catch (e) {
    console.error("API error:", e);
    return null;
  }
}

function formatTime(t) {
  if (!t) return "-";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function calcHoursAndPay(start, end, ratePerHour) {
  if (!start || !end || !ratePerHour) return { minutes: 0, hours: 0, pay: 0 };
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMinutes <= 0) return { minutes: 0, hours: 0, pay: 0 };
  const pay = (totalMinutes / 60) * ratePerHour;
  return { minutes: totalMinutes, hours: (totalMinutes / 60).toFixed(2), pay: Math.round(pay) };
}

function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// ── Animated number counter ──
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = typeof value === "number" ? value : 0;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  if (typeof value !== "number") return <span>{value}</span>;
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ── Global styles injected once ──
const STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
  @keyframes excavator { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes bgMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes ripple { 0% { transform: scale(0); opacity: 0.5; } 100% { transform: scale(4); opacity: 0; } }
  @keyframes tabActive { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .tab-btn:active { transform: scale(0.92) !important; }
  .card-btn:active { transform: scale(0.96) !important; }
  input:focus, select:focus { outline: none !important; border-color: #2d5016 !important; box-shadow: 0 0 0 3px rgba(45,80,22,0.12) !important; }
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

// ── Loading Screen ──
function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => onDone(), 2400);
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + Math.random() * 8 + 2, 100);
      setProgress(Math.round(p));
      if (p >= 100) clearInterval(interval);
    }, 60);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearInterval(interval); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg, #0f1e2e 0%, #1a3a08 50%, #0f1e2e 100%)",
      backgroundSize: "400% 400%",
      animation: "bgMove 4s ease infinite",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Glow orbs */}
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,80,22,0.3) 0%, transparent 70%)", top: "20%", left: "10%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,46,68,0.4) 0%, transparent 70%)", bottom: "25%", right: "10%", filter: "blur(30px)" }} />

      {/* JCB icon with bounce */}
      <div style={{ fontSize: 72, animation: "bounce 1.4s ease-in-out infinite", marginBottom: 24, filter: "drop-shadow(0 8px 24px rgba(45,80,22,0.6))" }}>🏗️</div>

      {/* Brand name */}
      <div style={{
        fontSize: 32, fontWeight: 800, color: "#fff",
        letterSpacing: 2, marginBottom: 4,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>JCB Manager</div>

      <div style={{
        fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 1,
        marginBottom: 48,
        opacity: phase >= 2 ? 1 : 0,
        transition: "all 0.5s ease 0.2s",
      }}>Construction Equipment Manager</div>

      {/* Progress bar */}
      <div style={{ width: 220, marginBottom: 16 }}>
        <div style={{ height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: "linear-gradient(90deg, #2d5016, #5a9e28, #2d5016)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease infinite",
            width: `${progress}%`,
            transition: "width 0.15s ease",
          }} />
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          {progress < 100 ? `Loading... ${progress}%` : "Ready!"}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        {["📋 Data", "👷 Team", "🏗️ Jobs"].map((label, i) => (
          <div key={label} style={{
            fontSize: 11, color: phase >= i + 1 ? "#5a9e28" : "rgba(255,255,255,0.25)",
            fontWeight: 600, transition: "color 0.4s ease",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {phase >= i + 1 ? "✓" : "○"} {label}
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_CONFIG = {
  dashboard: { icon: "📊", label: "Dashboard" },
  attendance: { icon: "✅", label: "Attendance" },
  worklog:    { icon: "🏗️", label: "Work Log" },
  expenses:   { icon: "💸", label: "Expenses" },
  operators:  { icon: "👷", label: "Operators" },
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ operators: [], workLogs: [], advances: [] });
  const [tab, setTab] = useState("dashboard");
  const [prevTab, setPrevTab] = useState(null);
  const [toast, setToast] = useState(null);
  const [tabAnim, setTabAnim] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all data from MongoDB on start
  async function loadFromDB() {
    const [operators, workLogs, expenses] = await Promise.all([
      apiFetch("/operators"),
      apiFetch("/worklogs"),
      apiFetch("/expenses"),
    ]);
    setData({
      operators: operators || [],
      workLogs: (workLogs || []).map(l => ({ ...l, id: l._id, operatorId: l.operatorId })),
      advances: (expenses || []).map(e => ({ ...e, id: e._id, operatorId: e.operatorId })),
    });
  }

  useEffect(() => { loadFromDB(); }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateData(fn) {
    setData(prev => fn(prev));
    // Reload from DB after short delay to sync
    setTimeout(() => loadFromDB(), 500);
  }

  function switchTab(newTab) {
    if (newTab === tab) return;
    setPrevTab(tab);
    setTab(newTab);
    setTabAnim(true);
    setTimeout(() => setTabAnim(false), 400);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingPayments = data.workLogs.filter(l => !l.paid && !l.attendanceOnly).reduce((sum, l) => sum + (l.pay || 0), 0);
  const todayLogs = data.workLogs.filter(l => l.date === todayStr);
  const totalExpenses = data.advances.reduce((sum, a) => sum + (a.amount || 0), 0);

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <LoadingScreen onDone={() => setLoading(false)} />
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        minHeight: "100vh", background: "#f0f4f8",
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: 480, margin: "0 auto",
        position: "relative", paddingBottom: 76,
      }}>
        {/* Animated Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a2e44 0%, #2d5016 100%)",
          color: "#fff", padding: "18px 20px 14px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <span style={{ fontSize: 26, animation: "excavator 3s ease-in-out infinite" }}>🏗️</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>JCB Manager</div>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 0.3 }}>Construction Equipment Manager</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <button onClick={() => { setSearchOpen(o => !o); setSearchQuery(""); }} style={{
              background: searchOpen ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
              border: "none", borderRadius: 10, width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, transition: "all 0.2s ease",
              boxShadow: searchOpen ? "0 0 0 2px rgba(255,255,255,0.4)" : "none",
            }}>🔍</button>
          </div>
        </div>

        {/* Search bar — slides down when open */}
        <div style={{
          maxHeight: searchOpen ? 64 : 0, overflow: "hidden",
          transition: "max-height 0.3s ease",
          background: "rgba(0,0,0,0.2)",
        }}>
          <div style={{ padding: "10px 16px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.6 }}>🔍</span>
              <input
                autoFocus={searchOpen}
                type="text"
                placeholder="Search operators, locations, dates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "10px 36px 10px 38px",
                  borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 14, fontWeight: 500,
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "'Segoe UI', sans-serif",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "rgba(255,255,255,0.7)",
                  fontSize: 16, cursor: "pointer", padding: 0,
                }}>✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 70, left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success"
              ? "linear-gradient(135deg, #2d5016, #3d7a1a)"
              : "linear-gradient(135deg, #b91c1c, #dc2626)",
            color: "#fff", padding: "12px 22px", borderRadius: 12,
            fontSize: 14, fontWeight: 600, zIndex: 999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            animation: "toastIn 0.3s ease",
            display: "flex", alignItems: "center", gap: 8,
            whiteSpace: "nowrap",
          }}>
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.msg}
          </div>
        )}

        {/* Content with slide animation */}
        <div style={{
          padding: "16px 16px 0",
          animation: "fadeIn 0.35s ease",
          key: tab,
        }}>
          {searchOpen && searchQuery.trim().length > 0
            ? <GlobalSearchResults query={searchQuery} data={data} setTab={(t) => { switchTab(t); setSearchOpen(false); setSearchQuery(""); }} />
            : <>
                {tab === "dashboard" && <Dashboard data={data} todayStr={todayStr} todayLogs={todayLogs} pendingPayments={pendingPayments} totalExpenses={totalExpenses} setTab={switchTab} />}
                {tab === "attendance" && <AttendanceTab data={data} updateData={updateData} showToast={showToast} todayStr={todayStr} />}
                {tab === "worklog" && <WorkLogTab data={data} updateData={updateData} showToast={showToast} />}
                {tab === "expenses" && <ExpensesTab data={data} updateData={updateData} showToast={showToast} />}
                {tab === "operators" && <OperatorsTab data={data} updateData={updateData} showToast={showToast} />}
              </>
          }
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: "#fff",
          borderTop: "1px solid #e2e8f0",
          display: "flex", zIndex: 100,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
            <button key={key} className="tab-btn" onClick={() => switchTab(key)} style={{
              flex: 1, padding: "10px 0 8px",
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              transition: "all 0.2s ease",
              position: "relative",
            }}>
              <span style={{
                fontSize: tab === key ? 22 : 20,
                transition: "all 0.2s ease",
                filter: tab === key ? "none" : "grayscale(30%)",
              }}>{cfg.icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: tab === key ? "#2d5016" : "#94a3b8",
                transition: "color 0.2s ease",
                letterSpacing: 0.2,
              }}>{cfg.label}</span>
              {tab === key && (
                <div style={{
                  position: "absolute", bottom: 0, left: "20%", right: "20%",
                  height: 3, background: "linear-gradient(90deg, #2d5016, #5a9e28)",
                  borderRadius: "3px 3px 0 0",
                  animation: "tabActive 0.25s ease",
                }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── GLOBAL SEARCH RESULTS ─────────────────────────────────
function GlobalSearchResults({ query, data, setTab }) {
  const q = query.toLowerCase().trim();

  // Search operators
  const opResults = data.operators.filter(op =>
    op.name.toLowerCase().includes(q) || (op.phone && op.phone.includes(q))
  );

  // Search work logs
  const logResults = data.workLogs.filter(l => !l.attendanceOnly && (
    (l.location && l.location.toLowerCase().includes(q)) ||
    (l.date && l.date.includes(q)) ||
    (l.clientPhone && l.clientPhone.includes(q)) ||
    (l.notes && l.notes.toLowerCase().includes(q)) ||
    (l.pay && String(l.pay).includes(q)) ||
    data.operators.find(o => o.id === l.operatorId && o.name.toLowerCase().includes(q))
  ));

  // Search expenses
  const expResults = data.advances.filter(a =>
    (a.description && a.description.toLowerCase().includes(q)) ||
    (a.date && a.date.includes(q)) ||
    (a.category && a.category.toLowerCase().includes(q)) ||
    (a.amount && String(a.amount).includes(q)) ||
    data.operators.find(o => o.id === a.operatorId && o.name.toLowerCase().includes(q))
  );

  // Search attendance
  const attResults = data.workLogs.filter(l => l.attendanceOnly && (
    (l.date && l.date.includes(q)) ||
    (l.attendance && l.attendance.toLowerCase().includes(q)) ||
    data.operators.find(o => o.id === l.operatorId && o.name.toLowerCase().includes(q))
  ));

  const totalResults = opResults.length + logResults.length + expResults.length + attResults.length;

  const HL = ({ text }) => {
    if (!text) return null;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return <span>{text}</span>;
    return <span>{text.slice(0, idx)}<mark style={{ background: "#fef08a", borderRadius: 2, padding: "0 1px" }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</span>;
  };

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      {/* Results count */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
        padding: "10px 14px", background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <span style={{ fontSize: 18 }}>🔍</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#1a2e44" }}>
            {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Tap any result to open that section</div>
        </div>
      </div>

      {totalResults === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>No results found</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Try searching by name, location, date or amount</div>
        </div>
      )}

      {/* Operators results */}
      {opResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 0.5 }}>
            👷 OPERATORS ({opResults.length})
          </div>
          {opResults.map((op, i) => (
            <div key={op.id} onClick={() => setTab("operators")}
              style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                borderLeft: "4px solid #1a2e44", cursor: "pointer",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a2e44, #2d5016)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14,
                }}>{op.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e44" }}><HL text={op.name} /></div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>📞 <HL text={op.phone || "No phone"} /></div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Work log results */}
      {logResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 0.5 }}>
            🏗️ WORK LOGS ({logResults.length})
          </div>
          {logResults.map((log, i) => {
            const op = data.operators.find(o => o.id === log.operatorId);
            return (
              <div key={log.id} onClick={() => setTab("worklog")}
                style={{
                  background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  borderLeft: "4px solid " + (log.paid ? "#16a34a" : "#f59e0b"),
                  cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1a2e44" }}><HL text={op?.name || "Unknown"} /></span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                    background: log.paid ? "#dcfce7" : "#fef3c7",
                    color: log.paid ? "#16a34a" : "#d97706",
                  }}>{log.paid ? "✅ Paid" : "⏳ Pending"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                  <div>📅 <HL text={log.date} /> &nbsp;·&nbsp; 📍 <HL text={log.location} /></div>
                  <div>⏱ {formatMinutes(log.minutes)} &nbsp;·&nbsp; 💰 <strong>₹{log.pay?.toLocaleString()}</strong></div>
                  {log.notes && <div>📝 <HL text={log.notes} /></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expenses results */}
      {expResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 0.5 }}>
            💸 DAILY EXPENSES ({expResults.length})
          </div>
          {expResults.map((a, i) => {
            const op = data.operators.find(o => o.id === a.operatorId);
            const CATS = { general: "💸", petrol: "⛽", advance: "💵", repair: "🔧", food: "🍵", other: "📦" };
            return (
              <div key={a.id} onClick={() => setTab("expenses")}
                style={{
                  background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  borderLeft: "4px solid #db2777", cursor: "pointer",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{CATS[a.category] || "💸"}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e44" }}>
                      ₹<HL text={String(a.amount)} /> &nbsp;·&nbsp; <HL text={op?.name || "?"} />
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      📅 <HL text={a.date} />{a.description ? <> · <HL text={a.description} /></> : ""}
                    </div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>Open →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance results */}
      {attResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, letterSpacing: 0.5 }}>
            ✅ ATTENDANCE ({attResults.length})
          </div>
          {attResults.map((log, i) => {
            const op = data.operators.find(o => o.id === log.operatorId);
            const attColor = { "Full Day": "#16a34a", "Half Day": "#d97706", "Absent": "#dc2626" };
            return (
              <div key={log.id} onClick={() => setTab("attendance")}
                style={{
                  background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  borderLeft: "4px solid " + (attColor[log.attendance] || "#94a3b8"),
                  cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2e44" }}><HL text={op?.name || "?"} /></div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>📅 <HL text={log.date} /></div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: attColor[log.attendance] + "22",
                    color: attColor[log.attendance] || "#64748b",
                  }}>{log.attendance}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ data, todayStr, todayLogs, pendingPayments, totalExpenses, setTab }) {
  const recentLogs = [...data.workLogs].filter(l => !l.attendanceOnly).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredLog, setHoveredLog] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const todayJobCount = todayLogs.filter(l => !l.attendanceOnly).length;
  const totalWorkLogs = data.workLogs.filter(l => !l.attendanceOnly).length;

  const statCards = [
    { label: "Today's Jobs", value: todayJobCount, numVal: todayJobCount, icon: "🏗️", color: "#dbeafe", accent: "#1d4ed8", tab: "worklog", hint: "View logs →" },
    { label: "Pending Pay", value: pendingPayments, numVal: pendingPayments, prefix: "₹", icon: "⏳", color: "#fef3c7", accent: "#d97706", tab: "worklog", hint: "View pending →" },
    { label: "Total Logs", value: totalWorkLogs, numVal: totalWorkLogs, icon: "📋", color: "#dcfce7", accent: "#16a34a", tab: "worklog", hint: "All logs →" },
    { label: "Daily Expenses", value: totalExpenses, numVal: totalExpenses, prefix: "₹", icon: "💸", color: "#fce7f3", accent: "#db2777", tab: "expenses", hint: "View expenses →" },
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: "✅", tab: "attendance", desc: "Log today's presence", color: "#dcfce7", accent: "#16a34a" },
    { label: "Add Work Log", icon: "➕", tab: "worklog", desc: "Record a new job", color: "#dbeafe", accent: "#1d4ed8" },
    { label: "Add Expense", icon: "💸", tab: "expenses", desc: "Track daily spending", color: "#fce7f3", accent: "#db2777" },
    { label: "Manage Operators", icon: "👷", tab: "operators", desc: "Add or edit staff", color: "#fef3c7", accent: "#d97706" },
  ];

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#1a2e44", marginBottom: 14, opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
        Today's Overview
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {statCards.map((card, i) => (
          <div key={card.label} className="card-btn"
            onClick={() => setTab(card.tab)}
            onMouseEnter={() => setHoveredCard(card.label)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: card.color, borderRadius: 14, padding: "14px",
              borderLeft: `4px solid ${card.accent}`,
              cursor: "pointer",
              transform: hoveredCard === card.label ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
              boxShadow: hoveredCard === card.label ? `0 8px 24px ${card.accent}44` : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease",
              position: "relative", overflow: "hidden",
              opacity: visible ? 1 : 0,
              animation: visible ? `fadeIn 0.4s ease ${i * 0.08}s both` : "none",
            }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: card.accent }}>
              {card.prefix || ""}<AnimatedNumber value={card.numVal} />
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2, fontWeight: 500 }}>{card.label}</div>
            <div style={{
              position: "absolute", bottom: 7, right: 9,
              fontSize: 10, fontWeight: 700, color: card.accent,
              opacity: hoveredCard === card.label ? 0.9 : 0,
              transition: "opacity 0.2s ease",
            }}>{card.hint}</div>
            {hoveredCard === card.label && (
              <div style={{
                position: "absolute", inset: 0, borderRadius: 14,
                background: `linear-gradient(135deg, transparent 60%, ${card.accent}18)`,
                pointerEvents: "none",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ fontSize: 13, fontWeight: 800, color: "#1a2e44", marginBottom: 10 }}>Quick Actions</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {quickActions.map((a, i) => (
          <button key={a.label} className="card-btn"
            onClick={() => setTab(a.tab)}
            onMouseEnter={() => setHoveredAction(a.label)}
            onMouseLeave={() => setHoveredAction(null)}
            style={{
              background: hoveredAction === a.label ? a.color : "#fff",
              border: `1.5px solid ${hoveredAction === a.label ? a.accent : "#e2e8f0"}`,
              borderRadius: 12, padding: "12px 10px",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
              cursor: "pointer",
              transform: hoveredAction === a.label ? "translateY(-2px)" : "none",
              boxShadow: hoveredAction === a.label ? `0 6px 18px ${a.accent}30` : "0 1px 4px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease",
              animation: visible ? `slideUp 0.4s ease ${0.2 + i * 0.07}s both` : "none",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: hoveredAction === a.label ? a.accent : "#1a2e44" }}>{a.label}</span>
            </div>
            <span style={{ fontSize: 10, color: hoveredAction === a.label ? a.accent : "#94a3b8", paddingLeft: 24, fontWeight: 500 }}>{a.desc}</span>
          </button>
        ))}
      </div>

      {/* Recent Work Logs */}
      {recentLogs.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a2e44" }}>Recent Work Logs</div>
            <button onClick={() => setTab("worklog")} style={{
              fontSize: 11, fontWeight: 700, color: "#1d4ed8",
              background: "#dbeafe", border: "none", cursor: "pointer",
              padding: "4px 10px", borderRadius: 20,
            }}>View all →</button>
          </div>
          {recentLogs.map((log, i) => {
            const op = data.operators.find(o => o.id === log.operatorId);
            return (
              <div key={log.id} className="card-btn"
                onClick={() => setTab("worklog")}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
                style={{
                  background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  borderLeft: "4px solid " + (log.paid ? "#16a34a" : "#f59e0b"),
                  cursor: "pointer",
                  transform: hoveredLog === log.id ? "translateX(5px)" : "none",
                  boxShadow: hoveredLog === log.id ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.18s ease",
                  animation: `slideUp 0.4s ease ${0.4 + i * 0.06}s both`,
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{op?.name || "Unknown"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 700,
                      background: log.paid ? "#dcfce7" : "#fef3c7",
                      color: log.paid ? "#16a34a" : "#d97706"
                    }}>{log.paid ? "✅ Paid" : "⏳ Pending"}</span>
                    {hoveredLog === log.id && <span style={{ fontSize: 11, color: "#94a3b8" }}>Open →</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  📍 {log.location} · 📅 {log.date} · ⏱ {formatMinutes(log.minutes)} · <strong>₹{log.pay}</strong>
                </div>
              </div>
            );
          })}
        </>
      )}

      {recentLogs.length === 0 && (
        <div onClick={() => setTab("worklog")} className="card-btn"
          style={{
            background: "#fff", borderRadius: 14, padding: 28,
            textAlign: "center", cursor: "pointer",
            border: "2px dashed #cbd5e1", transition: "all 0.2s ease",
            animation: "fadeIn 0.5s ease 0.3s both",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#2d5016"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
        >
          <div style={{ fontSize: 40, marginBottom: 10, animation: "pulse 2s ease infinite" }}>🏗️</div>
          <div style={{ fontSize: 14, color: "#475569", fontWeight: 700 }}>No work logs yet</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Tap to add your first job</div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────
function SectionHeader({ title, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
      animation: "fadeIn 0.3s ease",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#1a2e44" }}>{title}</div>
    </div>
  );
}

// ─── INPUT STYLES ──────────────────────────────────────────
const IS = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14, marginTop: 4,
  background: "#fff", transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "'Segoe UI', sans-serif",
};
const LS = { fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginTop: 14 };

// ─── ATTENDANCE ─────────────────────────────────────────────
function AttendanceTab({ data, updateData, showToast, todayStr }) {
  const [date, setDate] = useState(todayStr);
  const [animKey, setAnimKey] = useState(0);
  const [attSearch, setAttSearch] = useState("");

  async function markAttendance(opId, type) {
    const existing = data.workLogs.find(l => l.date === date && l.operatorId === opId && l.attendanceOnly);
    if (existing) {
      await apiFetch(`/worklogs/${existing.id}`, {
        method: "DELETE",
      });
    }
    await apiFetch("/worklogs", {
      method: "POST",
      body: JSON.stringify({ operatorId: opId, date, attendanceOnly: true, attendance: type, paid: false, pay: 0, minutes: 0 }),
    });
    showToast(`${type} marked for ${data.operators.find(o => o.id === opId)?.name || "operator"}!`);
    updateData(d => d);
  }

  function getAttendance(opId) {
    return data.workLogs.find(l => l.date === date && l.operatorId === opId && l.attendanceOnly)?.attendance || null;
  }

  const todayCount = data.operators.filter(op => getAttendance(op.id) === "Full Day" || getAttendance(op.id) === "Half Day").length;

  return (
    <div>
      <SectionHeader title="Mark Attendance" icon="✅" />

      {/* Date picker card */}
      <div style={{ background: "linear-gradient(135deg, #1a2e44, #2d5016)", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>SELECT DATE</div>
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setAnimKey(k => k + 1); }}
          style={{ ...IS, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 15, marginTop: 0 }} />
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>
          {todayCount} of {data.operators.length} operators marked present
        </div>
      </div>

      {/* Attendance local search */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
        <input type="text" placeholder="Search operator name..."
          value={attSearch} onChange={e => setAttSearch(e.target.value)}
          style={{ ...IS, paddingLeft: 36, marginTop: 0, background: "#fff" }} />
        {attSearch && <button onClick={() => setAttSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#94a3b8" }}>✕</button>}
      </div>

      {data.operators.length === 0 && (
        <div style={{ background: "#fef3c7", borderRadius: 12, padding: 16, textAlign: "center", color: "#92400e", fontWeight: 600 }}>
          No operators yet. Go to Operators tab to add them.
        </div>
      )}

      {data.operators.filter(op => !attSearch.trim() || op.name.toLowerCase().includes(attSearch.toLowerCase())).map((op, i) => {
        const att = getAttendance(op.id);
        const typeColors = { "Full Day": { bg: "#16a34a", light: "#dcfce7" }, "Half Day": { bg: "#d97706", light: "#fef3c7" }, "Absent": { bg: "#dc2626", light: "#fee2e2" } };
        return (
          <div key={op.id} style={{
            background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
            boxShadow: att ? `0 2px 12px ${typeColors[att]?.bg}28` : "0 1px 6px rgba(0,0,0,0.06)",
            borderTop: att ? `3px solid ${typeColors[att]?.bg}` : "3px solid transparent",
            transition: "all 0.25s ease",
            animation: `slideUp 0.35s ease ${i * 0.06}s both`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: att ? typeColors[att]?.bg : "linear-gradient(135deg, #1a2e44, #2d5016)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, transition: "background 0.3s ease",
              }}>{op.name[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{op.name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>📞 {op.phone || "No phone"}</div>
              </div>
              {att && (
                <div style={{
                  marginLeft: "auto", fontSize: 11, padding: "4px 12px", borderRadius: 20,
                  fontWeight: 700, background: typeColors[att]?.light, color: typeColors[att]?.bg,
                  animation: "pulse 0.3s ease",
                }}>{att}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { type: "Full Day", emoji: "☀️" },
                { type: "Half Day", emoji: "🌤️" },
                { type: "Absent", emoji: "❌" },
              ].map(({ type, emoji }) => (
                <button key={type} onClick={() => markAttendance(op.id, type)} style={{
                  flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.18s ease",
                  background: att === type ? typeColors[type]?.bg : "#f1f5f9",
                  color: att === type ? "#fff" : "#64748b",
                  border: "none",
                  transform: att === type ? "scale(1.03)" : "scale(1)",
                  boxShadow: att === type ? `0 3px 10px ${typeColors[type]?.bg}44` : "none",
                }}>{emoji} {type}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── WORK LOG ─────────────────────────────────────────────
function WorkLogTab({ data, updateData, showToast }) {
  const [form, setForm] = useState({
    operatorId: "", date: new Date().toISOString().split("T")[0],
    location: "", clientPhone: "",
    startTime: "", endTime: "",
    startTime2: "", endTime2: "",
    ratePerHour: "", notes: "",
  });
  const [view, setView] = useState("add");
  const [filterOp, setFilterOp] = useState("all");
  const [hoveredLog, setHoveredLog] = useState(null);
  const [localSearch, setLocalSearch] = useState("");

  const slot1 = calcHoursAndPay(form.startTime, form.endTime, parseFloat(form.ratePerHour));
  const slot2 = calcHoursAndPay(form.startTime2, form.endTime2, parseFloat(form.ratePerHour));
  const minutes = slot1.minutes + slot2.minutes;
  const pay = slot1.pay + slot2.pay;
  const hours = (minutes / 60).toFixed(2);

  async function handleAdd() {
    if (!form.operatorId || !form.date || !form.location || !form.startTime || !form.endTime || !form.ratePerHour) {
      showToast("Please fill all required fields", "error"); return;
    }
    if (minutes <= 0) { showToast("End time must be after start time", "error"); return; }
    await apiFetch("/worklogs", {
      method: "POST",
      body: JSON.stringify({
        operatorId: form.operatorId, date: form.date,
        location: form.location, clientPhone: form.clientPhone,
        startTime: form.startTime, endTime: form.endTime,
        startTime2: form.startTime2, endTime2: form.endTime2,
        ratePerHour: parseFloat(form.ratePerHour), minutes, pay,
        notes: form.notes, paid: false, attendanceOnly: false,
      }),
    });
    showToast("Work log saved! 🏗️");
    setForm({ operatorId: "", date: new Date().toISOString().split("T")[0], location: "", clientPhone: "", startTime: "", endTime: "", startTime2: "", endTime2: "", ratePerHour: "", notes: "" });
    updateData(d => d);
    setView("list");
  }

  async function markPaid(id) {
    await apiFetch(`/worklogs/${id}/paid`, { method: "PATCH" });
    showToast("Marked as paid! 💰");
    updateData(d => d);
  }

  async function deleteLog(id) {
    await apiFetch(`/worklogs/${id}`, { method: "DELETE" });
    showToast("Deleted!");
    updateData(d => d);
  }

  function sendWhatsApp(log) {
    const op = data.operators.find(o => o.id === log.operatorId);
    const msg = `Hello! Payment reminder 🏗️\nOperator: ${op?.name}\nDate: ${log.date}\nLocation: ${log.location}\nWork: ${formatMinutes(log.minutes)} (${formatTime(log.startTime)} - ${formatTime(log.endTime)})\nAmount Due: ₹${log.pay}\nPlease arrange payment. Thank you!`;
    window.open(`https://wa.me/${log.clientPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function sendSMS(log) {
    const op = data.operators.find(o => o.id === log.operatorId);
    const msg = `Payment reminder: ${op?.name}, Date: ${log.date}, Location: ${log.location}, Work: ${formatMinutes(log.minutes)} (${formatTime(log.startTime)}-${formatTime(log.endTime)}), Amount due: Rs.${log.pay}`;
    const phone = log.clientPhone.startsWith("+") ? log.clientPhone : `+91${log.clientPhone}`;
    window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`;
  }

  const logs = data.workLogs.filter(l => !l.attendanceOnly)
    .filter(l => filterOp === "all" || l.operatorId === parseInt(filterOp))
    .filter(l => {
      if (!localSearch.trim()) return true;
      const s = localSearch.toLowerCase();
      const op = data.operators.find(o => o.id === l.operatorId);
      return (
        (l.location && l.location.toLowerCase().includes(s)) ||
        (l.date && l.date.includes(s)) ||
        (l.notes && l.notes.toLowerCase().includes(s)) ||
        (l.clientPhone && l.clientPhone.includes(s)) ||
        (String(l.pay).includes(s)) ||
        (op && op.name.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <SectionHeader title="Work Logs" icon="🏗️" />

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
        {[["add", "➕ Add New"], ["list", `📋 List (${logs.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            flex: 1, padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: view === key ? "#fff" : "none",
            color: view === key ? "#1a2e44" : "#94a3b8",
            border: "none", cursor: "pointer",
            boxShadow: view === key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease",
          }}>{label}</button>
        ))}
      </div>

      {view === "add" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", animation: "slideUp 0.3s ease" }}>
          <label style={LS}>Operator *</label>
          <select value={form.operatorId} onChange={e => setForm({ ...form, operatorId: e.target.value })} style={IS}>
            <option value="">Select Operator</option>
            {data.operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
          </select>

          <label style={LS}>Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={IS} />

          <label style={LS}>Location / Site Name *</label>
          <input type="text" placeholder="e.g. Naroda Road, Ahmedabad" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={IS} />

          <label style={LS}>Client Phone (for reminders)</label>
          <input type="tel" placeholder="e.g. 9876543210" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} style={IS} />

          <label style={LS}>Rate per Hour (₹) *</label>
          <input type="number" placeholder="e.g. 1500" value={form.ratePerHour} onChange={e => setForm({ ...form, ratePerHour: e.target.value })} style={IS} />

          {/* Slot 1 */}
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px", marginTop: 16, border: "1.5px solid #bbf7d0" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", marginBottom: 8, letterSpacing: 0.5 }}>🕐 WORKING HOURS — SLOT 1</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ ...LS, marginTop: 0 }}>Start Time *</label>
                <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} style={IS} />
              </div>
              <div>
                <label style={{ ...LS, marginTop: 0 }}>End Time *</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} style={IS} />
              </div>
            </div>
            {slot1.minutes > 0 && (
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginTop: 8 }}>
                ⏱ {formatMinutes(slot1.minutes)} = ₹{slot1.pay.toLocaleString()}
              </div>
            )}
          </div>

          {/* Slot 2 */}
          <div style={{ background: "#eff6ff", borderRadius: 12, padding: "12px 14px", marginTop: 10, border: "1.5px solid #bfdbfe" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8", marginBottom: 8, letterSpacing: 0.5 }}>🕑 WORKING HOURS — SLOT 2 <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ ...LS, marginTop: 0 }}>Start Time</label>
                <input type="time" value={form.startTime2} onChange={e => setForm({ ...form, startTime2: e.target.value })} style={IS} />
              </div>
              <div>
                <label style={{ ...LS, marginTop: 0 }}>End Time</label>
                <input type="time" value={form.endTime2} onChange={e => setForm({ ...form, endTime2: e.target.value })} style={IS} />
              </div>
            </div>
            {slot2.minutes > 0 && (
              <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700, marginTop: 8 }}>
                ⏱ {formatMinutes(slot2.minutes)} = ₹{slot2.pay.toLocaleString()}
              </div>
            )}
          </div>

          {/* Live total */}
          {minutes > 0 && (
            <div style={{ background: "linear-gradient(135deg, #1a2e44, #2d5016)", borderRadius: 12, padding: 14, marginTop: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 8 }}>📊 TOTAL CALCULATION</div>
              {slot1.minutes > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 3 }}>
                  <span>Slot 1: {formatTime(form.startTime)} → {formatTime(form.endTime)}</span>
                  <span>{formatMinutes(slot1.minutes)} = ₹{slot1.pay}</span>
                </div>
              )}
              {slot2.minutes > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 3 }}>
                  <span>Slot 2: {formatTime(form.startTime2)} → {formatTime(form.endTime2)}</span>
                  <span>{formatMinutes(slot2.minutes)} = ₹{slot2.pay}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Total</span>
                <span style={{ color: "#5aea2a", fontWeight: 800, fontSize: 16 }}>₹{pay.toLocaleString()} ({formatMinutes(minutes)})</span>
              </div>
            </div>
          )}

          <label style={LS}>Notes (optional)</label>
          <input type="text" placeholder="Any remarks..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={IS} />

          <button onClick={handleAdd} className="card-btn" style={{
            width: "100%", marginTop: 18, padding: "14px",
            background: "linear-gradient(135deg, #1a2e44, #2d5016)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(45,80,22,0.35)",
            letterSpacing: 0.3,
          }}>💾 Save Work Log</button>
        </div>
      )}

      {view === "list" && (
        <div style={{ animation: "slideUp 0.3s ease" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.5 }}>🔍</span>
              <input type="text" placeholder="Search location, date, notes..." value={filterOp === "search" ? "" : ""} 
                onChange={e => setLocalSearch(e.target.value)}
                style={{ ...IS, paddingLeft: 32, marginTop: 0 }} />
            </div>
            <select value={filterOp} onChange={e => setFilterOp(e.target.value)} style={{ ...IS, marginTop: 0, width: "auto", minWidth: 120 }}>
              <option value="all">All Operators</option>
              {data.operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
            </select>
          </div>

          {logs.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 40, animation: "fadeIn 0.4s ease" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600 }}>No work logs yet</div>
            </div>
          )}

          {logs.map((log, i) => {
            const op = data.operators.find(o => o.id === log.operatorId);
            return (
              <div key={log.id}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
                style={{
                  background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                  borderLeft: "4px solid " + (log.paid ? "#16a34a" : "#f59e0b"),
                  boxShadow: hoveredLog === log.id ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.18s ease",
                  animation: `slideUp 0.35s ease ${i * 0.05}s both`,
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#1a2e44" }}>{op?.name || "?"}</span>
                  <span style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: log.paid ? "#dcfce7" : "#fef3c7",
                    color: log.paid ? "#16a34a" : "#d97706"
                  }}>{log.paid ? "✅ Paid" : "⏳ Pending"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                  <div>📅 {log.date} &nbsp;·&nbsp; 📍 {log.location}</div>
                  <div>🕐 Slot 1: {formatTime(log.startTime)} → {formatTime(log.endTime)}</div>
                  {log.startTime2 && log.endTime2 && <div>🕑 Slot 2: {formatTime(log.startTime2)} → {formatTime(log.endTime2)}</div>}
                  <div>⏱ Total: {formatMinutes(log.minutes)} &nbsp;·&nbsp; 💰 ₹{log.ratePerHour}/hr</div>
                  {log.clientPhone && <div>📞 {log.clientPhone}</div>}
                  {log.notes && <div>📝 {log.notes}</div>}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>Total Pay</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#1a2e44" }}>₹{log.pay.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {!log.paid && (
                    <button onClick={() => markPaid(log.id)} style={{
                      padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: "#dcfce7", color: "#16a34a", border: "none", cursor: "pointer"
                    }}>✅ Mark Paid</button>
                  )}
                  {log.clientPhone && (
                    <>
                      <button onClick={() => sendWhatsApp(log)} style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: "#d1fae5", color: "#065f46", border: "none", cursor: "pointer"
                      }}>💬 WhatsApp</button>
                      <button onClick={() => sendSMS(log)} style={{
                        padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: "#dbeafe", color: "#1e40af", border: "none", cursor: "pointer"
                      }}>📱 SMS</button>
                    </>
                  )}
                  <button onClick={() => deleteLog(log.id)} style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer", marginLeft: "auto"
                  }}>🗑 Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DAILY EXPENSES ─────────────────────────────────────────
function ExpensesTab({ data, updateData, showToast }) {
  const [form, setForm] = useState({
    operatorId: "", date: new Date().toISOString().split("T")[0],
    amount: "", description: "", category: "general",
    amount2: "", category2: "general",
  });
  const [addSecond, setAddSecond] = useState(false);
  const [view, setView] = useState("add");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expSearch, setExpSearch] = useState("");

  const CATEGORIES = [
    { key: "general", label: "General", icon: "💸" },
    { key: "petrol", label: "Petrol/Diesel", icon: "⛽" },
    { key: "advance", label: "Salary Advance", icon: "💵" },
    { key: "repair", label: "Repair/Parts", icon: "🔧" },
    { key: "food", label: "Food/Tea", icon: "🍵" },
    { key: "other", label: "Other", icon: "📦" },
  ];

  async function handleAdd() {
    if (!form.operatorId || !form.amount || !form.date) {
      showToast("Fill all required fields", "error"); return;
    }
    const newEntries = [{
      id: Date.now(), operatorId: parseInt(form.operatorId),
      date: form.date, amount: parseFloat(form.amount),
      description: form.description, category: form.category,
    }];
    if (addSecond && form.amount2) {
      newEntries.push({
        id: Date.now() + 1, operatorId: parseInt(form.operatorId),
        date: form.date, amount: parseFloat(form.amount2),
        description: form.description, category: form.category2,
      });
    }
    updateData(prev => ({ ...prev, advances: [...prev.advances, ...newEntries] }));
    showToast(newEntries.length > 1 ? "2 expenses recorded! 💸" : "Expense recorded! 💸");
    setForm({ operatorId: "", date: new Date().toISOString().split("T")[0], amount: "", description: "", category: "general", amount2: "", category2: "general" });
    setAddSecond(false);
    setView("list");
  }

  async function deleteExpense(id) {
    await apiFetch(`/expenses/${id}`, { method: "DELETE" });
    showToast("Deleted!");
    updateData(d => d);
  }

  const expenses = [...data.advances]
    .filter(a => {
      if (!expSearch.trim()) return true;
      const s = expSearch.toLowerCase();
      const op = data.operators.find(o => o.id === a.operatorId);
      return (
        (a.description && a.description.toLowerCase().includes(s)) ||
        (a.date && a.date.includes(s)) ||
        (a.category && a.category.toLowerCase().includes(s)) ||
        (String(a.amount).includes(s)) ||
        (op && op.name.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = expenses.reduce((s, a) => s + a.amount, 0);

  const getCat = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  return (
    <div>
      <SectionHeader title="Daily Expenses" icon="💸" />

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
        {[["add", "➕ Add Expense"], ["list", `📋 All (${expenses.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            flex: 1, padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: view === key ? "#fff" : "none",
            color: view === key ? "#1a2e44" : "#94a3b8",
            border: "none", cursor: "pointer",
            boxShadow: view === key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease",
          }}>{label}</button>
        ))}
      </div>

      {view === "add" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", animation: "slideUp 0.3s ease" }}>

          <label style={LS}>Operator *</label>
          <select value={form.operatorId} onChange={e => setForm({ ...form, operatorId: e.target.value })} style={IS}>
            <option value="">Select Operator</option>
            {data.operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
          </select>

          <label style={LS}>Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={IS} />

          <label style={LS}>Category</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setForm({ ...form, category: cat.key })} style={{
                padding: "8px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                background: form.category === cat.key ? "#fce7f3" : "#f8fafc",
                color: form.category === cat.key ? "#db2777" : "#64748b",
                border: form.category === cat.key ? "2px solid #db2777" : "1.5px solid #e2e8f0",
                cursor: "pointer", transition: "all 0.15s ease",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <label style={LS}>Amount (₹) *</label>
          <input type="number" placeholder="e.g. 500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={IS} />

          {!addSecond ? (
            <button onClick={() => setAddSecond(true)} className="card-btn" style={{
              width: "100%", marginTop: 10, padding: "10px",
              background: "#fdf2f8", color: "#db2777",
              border: "1.5px dashed #f9a8d4", borderRadius: 10,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>➕ Add Another Expense Item</button>
          ) : (
            <div style={{ marginTop: 10, padding: 12, background: "#fdf2f8", borderRadius: 12, border: "1px solid #fbcfe8", animation: "fadeIn 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#9d174d" }}>Second Expense Item</div>
                <button onClick={() => { setAddSecond(false); setForm({ ...form, amount2: "", category2: "general" }); }} style={{
                  background: "none", border: "none", color: "#db2777", fontSize: 12, cursor: "pointer", fontWeight: 700,
                }}>✕ Remove</button>
              </div>

              <label style={{ ...LS, marginTop: 0 }}>Category</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => setForm({ ...form, category2: cat.key })} style={{
                    padding: "8px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: form.category2 === cat.key ? "#fce7f3" : "#fff",
                    color: form.category2 === cat.key ? "#db2777" : "#64748b",
                    border: form.category2 === cat.key ? "2px solid #db2777" : "1.5px solid #e2e8f0",
                    cursor: "pointer", transition: "all 0.15s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              <label style={LS}>Amount (₹)</label>
              <input type="number" placeholder="e.g. 200" value={form.amount2} onChange={e => setForm({ ...form, amount2: e.target.value })} style={{ ...IS, background: "#fff" }} />
            </div>
          )}

          <label style={LS}>Description</label>
          <input type="text" placeholder="e.g. Petrol for JCB, food advance..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={IS} />

          {form.amount && (
            <div style={{ background: "linear-gradient(135deg, #db2777, #9d174d)", borderRadius: 12, padding: 14, marginTop: 14, animation: "fadeIn 0.3s ease" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700 }}>EXPENSE PREVIEW</div>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                {addSecond && form.amount2
                  ? <>₹{parseFloat(form.amount || 0).toLocaleString()} + ₹{parseFloat(form.amount2 || 0).toLocaleString()} = ₹{(parseFloat(form.amount || 0) + parseFloat(form.amount2 || 0)).toLocaleString()}</>
                  : <>₹{parseFloat(form.amount || 0).toLocaleString()}</>
                }
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
                {getCat(form.category).icon} {getCat(form.category).label}
                {addSecond && form.amount2 ? <> &nbsp;+&nbsp; {getCat(form.category2).icon} {getCat(form.category2).label}</> : ""}
                {form.description ? ` · ${form.description}` : ""}
              </div>
            </div>
          )}

          <button onClick={handleAdd} className="card-btn" style={{
            width: "100%", marginTop: 18, padding: "14px",
            background: "linear-gradient(135deg, #db2777, #9d174d)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(219,39,119,0.3)",
          }}>💸 Record Expense</button>
        </div>
      )}

      {view === "list" && (
        <div style={{ animation: "slideUp 0.3s ease" }}>
          {/* Expenses search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
            <input type="text" placeholder="Search by name, date, amount, category..."
              value={expSearch} onChange={e => setExpSearch(e.target.value)}
              style={{ ...IS, paddingLeft: 36, marginTop: 0, background: "#fff" }} />
            {expSearch && <button onClick={() => setExpSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#94a3b8" }}>✕</button>}
          </div>
          {/* Total banner */}
          {expenses.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, #db2777, #9d174d)",
              borderRadius: 14, padding: "14px 18px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700 }}>TOTAL EXPENSES</div>
                <div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>₹<AnimatedNumber value={total} /></div>
              </div>
              <div style={{ fontSize: 36 }}>💸</div>
            </div>
          )}

          {/* Per operator */}
          {data.operators.map(op => {
            const opExp = expenses.filter(a => a.operatorId === op.id);
            const opTotal = opExp.reduce((s, a) => s + a.amount, 0);
            if (opExp.length === 0) return null;
            return (
              <div key={op.id} style={{ marginBottom: 14, animation: "slideUp 0.35s ease" }}>
                <div style={{
                  background: "linear-gradient(135deg, #fce7f3, #fdf2f8)", borderRadius: 12,
                  padding: "10px 14px", marginBottom: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: "1.5px solid #fbcfe8",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg, #db2777, #9d174d)",
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13,
                    }}>{op.name[0]}</div>
                    <span style={{ fontWeight: 700, color: "#9d174d" }}>{op.name}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: "#db2777", fontSize: 15 }}>₹{opTotal.toLocaleString()}</span>
                </div>

                {opExp.map((a, i) => {
                  const cat = getCat(a.category);
                  return (
                    <div key={a.id}
                      onMouseEnter={() => setHoveredItem(a.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        background: "#fff", borderRadius: 10, padding: "10px 14px",
                        marginBottom: 6, marginLeft: 10,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        boxShadow: hoveredItem === a.id ? "0 4px 14px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.05)",
                        transition: "all 0.18s ease",
                        transform: hoveredItem === a.id ? "translateX(3px)" : "none",
                        borderLeft: "3px solid #fbcfe8",
                        animation: `slideUp 0.3s ease ${i * 0.04}s both`,
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{cat.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a2e44" }}>₹{a.amount.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{a.date} · {cat.label}{a.description ? ` · ${a.description}` : ""}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteExpense(a.id)} style={{
                        padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer"
                      }}>🗑</button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {expenses.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: 40, animation: "fadeIn 0.4s ease" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💸</div>
              <div style={{ fontWeight: 600 }}>No expenses recorded yet</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── OPERATORS ─────────────────────────────────────────────
function OperatorsTab({ data, updateData, showToast }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [hoveredOp, setHoveredOp] = useState(null);
  const [opsSearch, setOpsSearch] = useState("");

  async function handleAdd() {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    await apiFetch("/operators", {
      method: "POST",
      body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
    });
    showToast(`${form.name} added! 👷`);
    setForm({ name: "", phone: "" });
    updateData(d => d);
  }

  async function deleteOp(id) {
    await apiFetch(`/operators/${id}`, { method: "DELETE" });
    showToast("Operator removed!");
    updateData(d => d);
  }

  const COLORS = ["#1a2e44", "#2d5016", "#9d174d", "#1e40af", "#b45309", "#065f46"];

  return (
    <div>
      <SectionHeader title="Operators" icon="👷" />

      {/* Add form */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", animation: "slideUp 0.3s ease" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1a2e44", marginBottom: 12 }}>➕ Add New Operator</div>
        <label style={{ ...LS, marginTop: 0 }}>Name *</label>
        <input type="text" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={IS}
          onKeyDown={e => e.key === "Enter" && handleAdd()} />
        <label style={LS}>Phone Number</label>
        <input type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={IS} />
        <button onClick={handleAdd} className="card-btn" style={{
          width: "100%", marginTop: 14, padding: "12px",
          background: "linear-gradient(135deg, #1a2e44, #2d5016)",
          color: "#fff", border: "none", borderRadius: 12,
          fontSize: 14, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(45,80,22,0.3)",
        }}>👷 Add Operator</button>
      </div>

      {/* Operators search */}
      {data.operators.length > 0 && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
          <input type="text" placeholder="Search operator by name or phone..."
            value={opsSearch} onChange={e => setOpsSearch(e.target.value)}
            style={{ ...IS, paddingLeft: 36, marginTop: 0, background: "#fff" }} />
          {opsSearch && <button onClick={() => setOpsSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#94a3b8" }}>✕</button>}
        </div>
      )}

      {/* Operators count */}
      {data.operators.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10, letterSpacing: 0.5 }}>
          {data.operators.filter(op => !opsSearch.trim() || op.name.toLowerCase().includes(opsSearch.toLowerCase()) || op.phone.includes(opsSearch)).length} OPERATOR{data.operators.length !== 1 ? "S" : ""} FOUND
        </div>
      )}

      {data.operators.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: 32, animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👷</div>
          <div style={{ fontWeight: 600 }}>No operators yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add your first team member above</div>
        </div>
      )}

      {data.operators.filter(op => !opsSearch.trim() || op.name.toLowerCase().includes(opsSearch.toLowerCase()) || op.phone.includes(opsSearch)).map((op, i) => {
        const logsCount = data.workLogs.filter(l => l.operatorId === op.id && !l.attendanceOnly).length;
        const totalPay = data.workLogs.filter(l => l.operatorId === op.id && !l.attendanceOnly).reduce((s, l) => s + l.pay, 0);
        const totalExp = data.advances.filter(a => a.operatorId === op.id).reduce((s, a) => s + a.amount, 0);
        const color = COLORS[i % COLORS.length];

        return (
          <div key={op.id}
            onMouseEnter={() => setHoveredOp(op.id)}
            onMouseLeave={() => setHoveredOp(null)}
            style={{
              background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
              boxShadow: hoveredOp === op.id ? "0 6px 20px rgba(0,0,0,0.10)" : "0 1px 6px rgba(0,0,0,0.05)",
              borderTop: `3px solid ${color}`,
              transition: "all 0.2s ease",
              animation: `slideUp 0.35s ease ${i * 0.07}s both`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: "50%",
                background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 800, fontSize: 18,
                boxShadow: `0 4px 12px ${color}40`,
              }}>{op.name[0]}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2e44" }}>{op.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>📞 {op.phone || "No phone added"}</div>
              </div>
              <button onClick={() => deleteOp(op.id)} style={{
                marginLeft: "auto", padding: "6px 12px", borderRadius: 8,
                fontSize: 12, background: "#fee2e2", color: "#dc2626",
                border: "none", cursor: "pointer", fontWeight: 700
              }}>Remove</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Jobs", value: logsCount, color: "#dbeafe", text: "#1d4ed8" },
                { label: "Earned", value: `₹${totalPay.toLocaleString()}`, color: "#dcfce7", text: "#16a34a" },
                { label: "Expenses", value: `₹${totalExp.toLocaleString()}`, color: "#fce7f3", text: "#db2777" },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, background: s.color, borderRadius: 10, padding: "9px 6px", textAlign: "center"
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.text }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: s.text, opacity: 0.7, marginTop: 1, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
