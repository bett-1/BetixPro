import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Trophy, DollarSign, TrendingUp, Shield,
  BarChart3, Settings, Bell, Search, ChevronDown, ChevronRight,
  ArrowUpRight, ArrowDownRight, Eye, EyeOff, MoreHorizontal,
  CheckCircle, XCircle, Clock, AlertTriangle, Filter, Download,
  RefreshCw, Plus, Edit, Trash2, Lock, Unlock, Flag, Zap,
  Activity, Globe, CreditCard, PieChart, Target, Layers,
  LogOut, Menu, X, Star, Hash, Calendar, SlidersHorizontal,
  TrendingDown, UserCheck, UserX, Flame
} from "lucide-react";

const COLORS = {
  bg: "#0a0e1a",
  bgCard: "#0f1425",
  bgElevated: "#161d35",
  bgHover: "#1c2540",
  accent: "#00e5a0",
  accentDim: "rgba(0,229,160,0.12)",
  accentGlow: "rgba(0,229,160,0.25)",
  gold: "#f5a623",
  goldDim: "rgba(245,166,35,0.12)",
  red: "#ff4d6a",
  redDim: "rgba(255,77,106,0.12)",
  blue: "#3d8ef8",
  blueDim: "rgba(61,142,248,0.12)",
  purple: "#9b59f5",
  purpleDim: "rgba(155,89,245,0.12)",
  textPrimary: "#e8eaf2",
  textSecondary: "#6b7a99",
  textMuted: "#3d4b6e",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.1)",
};

const navSections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "bets", label: "Bet Management", icon: Target },
  { id: "events", label: "Events & Sports", icon: Trophy },
  { id: "odds", label: "Odds Control", icon: SlidersHorizontal },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "risk", label: "Risk Management", icon: Shield },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const kpiData = [
  { label: "Total Revenue", value: "$2,847,392", change: "+12.4%", up: true, icon: DollarSign, color: COLORS.accent },
  { label: "Active Users", value: "48,291", change: "+8.7%", up: true, icon: Users, color: COLORS.blue },
  { label: "Open Bets", value: "12,847", change: "+3.2%", up: true, icon: Target, color: COLORS.gold },
  { label: "House Edge", value: "4.82%", change: "-0.3%", up: false, icon: TrendingUp, color: COLORS.purple },
  { label: "GGR Today", value: "$184,230", change: "+22.1%", up: true, icon: Zap, color: COLORS.accent },
  { label: "Flagged Bets", value: "23", change: "+5", up: false, icon: AlertTriangle, color: COLORS.red },
];

const recentBets = [
  { id: "#BT-9812", user: "alex_m", sport: "Football", event: "Man City vs Arsenal", market: "Match Winner", odds: "2.40", stake: "$500", status: "pending", time: "2m ago" },
  { id: "#BT-9811", user: "sarah_k", sport: "Tennis", event: "Djokovic vs Alcaraz", market: "Total Sets", odds: "1.85", stake: "$250", status: "won", time: "5m ago" },
  { id: "#BT-9810", user: "mike_t", sport: "Basketball", event: "Lakers vs Warriors", market: "Spread -3.5", odds: "1.91", stake: "$1,200", status: "lost", time: "8m ago" },
  { id: "#BT-9809", user: "priya_v", sport: "Football", event: "Real Madrid vs Barca", market: "Both Score", odds: "1.72", stake: "$300", status: "won", time: "12m ago" },
  { id: "#BT-9808", user: "chen_w", sport: "UFC", event: "Jones vs Miocic", market: "Method of Victory", odds: "3.50", stake: "$800", status: "flagged", time: "15m ago" },
  { id: "#BT-9807", user: "omar_a", sport: "Cricket", event: "IND vs AUS", market: "Top Batsman", odds: "5.00", stake: "$100", status: "pending", time: "18m ago" },
];

const users = [
  { id: "USR-001", name: "Alexander Mitchell", email: "alex_m@email.com", balance: "$4,200", totalBets: 342, won: 156, kyc: "verified", status: "active", risk: "low", joined: "Jan 2023" },
  { id: "USR-002", name: "Sarah Kowalski", email: "sarah_k@email.com", balance: "$12,800", totalBets: 891, won: 401, kyc: "verified", status: "active", risk: "medium", joined: "Mar 2022" },
  { id: "USR-003", name: "Mike Torres", email: "mike_t@email.com", balance: "$320", totalBets: 1204, won: 487, kyc: "pending", status: "active", risk: "high", joined: "Jun 2022" },
  { id: "USR-004", name: "Priya Vasquez", email: "priya_v@email.com", balance: "$7,550", totalBets: 203, won: 98, kyc: "verified", status: "active", risk: "low", joined: "Sep 2023" },
  { id: "USR-005", name: "Chen Wei", email: "chen_w@email.com", balance: "$28,400", totalBets: 2341, won: 1122, kyc: "verified", status: "suspended", risk: "high", joined: "Feb 2021" },
  { id: "USR-006", name: "Omar Ahmed", email: "omar_a@email.com", balance: "$1,100", totalBets: 87, won: 44, kyc: "failed", status: "active", risk: "low", joined: "Dec 2023" },
];

const events = [
  { id: "EVT-001", sport: "Football", league: "Premier League", home: "Man City", away: "Arsenal", date: "Apr 5, 2026 15:00", status: "upcoming", markets: 48, totalBets: 2841, exposure: "$84,200" },
  { id: "EVT-002", sport: "Tennis", league: "ATP Tour", home: "Djokovic", away: "Alcaraz", date: "Apr 3, 2026 13:00", status: "live", markets: 24, totalBets: 1203, exposure: "$42,100" },
  { id: "EVT-003", sport: "Basketball", league: "NBA", home: "Lakers", away: "Warriors", date: "Apr 3, 2026 20:30", status: "live", markets: 62, totalBets: 3892, exposure: "$128,400" },
  { id: "EVT-004", sport: "Football", league: "La Liga", home: "Real Madrid", away: "Barcelona", date: "Apr 6, 2026 20:00", status: "upcoming", markets: 56, totalBets: 4102, exposure: "$195,800" },
  { id: "EVT-005", sport: "UFC", league: "UFC 310", home: "Jones", away: "Miocic", date: "Apr 10, 2026 22:00", status: "upcoming", markets: 18, totalBets: 891, exposure: "$31,200" },
];

const transactions = [
  { id: "TXN-8821", user: "alex_m", type: "deposit", method: "Visa **4242", amount: "+$1,000", status: "completed", time: "10m ago" },
  { id: "TXN-8820", user: "sarah_k", type: "withdrawal", method: "Bank Transfer", amount: "-$3,500", status: "pending", time: "25m ago" },
  { id: "TXN-8819", user: "chen_w", type: "withdrawal", method: "Crypto BTC", amount: "-$10,000", status: "flagged", time: "1h ago" },
  { id: "TXN-8818", user: "priya_v", type: "deposit", method: "Mastercard **8891", amount: "+$500", status: "completed", time: "2h ago" },
  { id: "TXN-8817", user: "mike_t", type: "deposit", method: "PayPal", amount: "+$200", status: "completed", time: "3h ago" },
  { id: "TXN-8816", user: "omar_a", type: "withdrawal", method: "Bank Transfer", amount: "-$800", status: "completed", time: "4h ago" },
];

const riskAlerts = [
  { id: 1, type: "high", user: "chen_w", message: "Unusual betting pattern — 5 large bets on correlated outcomes", time: "15m ago" },
  { id: 2, type: "high", user: "TXN-8819", message: "Large crypto withdrawal flagged for AML review ($10,000)", time: "1h ago" },
  { id: 3, type: "medium", user: "mike_t", message: "Win rate deviation detected — 94% accuracy last 20 bets", time: "2h ago" },
  { id: 4, type: "medium", user: "System", message: "Exposure limit approaching for Man City vs Arsenal ($84k / $100k)", time: "3h ago" },
  { id: 5, type: "low", user: "priya_v", message: "Multiple accounts sharing same IP address detected", time: "5h ago" },
];

const oddsData = [
  { event: "Man City vs Arsenal", market: "Match Winner", sel1: "Man City", odds1: "1.95", sel2: "Draw", odds2: "3.80", sel3: "Arsenal", odds3: "4.20", margin: "4.8%", status: "active" },
  { event: "Djokovic vs Alcaraz", market: "Match Winner", sel1: "Djokovic", odds1: "2.10", sel2: "", odds2: "", sel3: "Alcaraz", odds3: "1.75", margin: "5.1%", status: "suspended" },
  { event: "Lakers vs Warriors", market: "Spread -3.5", sel1: "Lakers -3.5", odds1: "1.91", sel2: "", odds2: "", sel3: "Warriors +3.5", odds3: "1.91", margin: "4.7%", status: "active" },
  { event: "Real Madrid vs Barca", market: "Both Score", sel1: "Yes", odds1: "1.72", sel2: "", odds2: "", sel3: "No", odds3: "2.10", margin: "5.2%", status: "active" },
];

const chartBars = [
  { day: "Mon", revenue: 68, bets: 52 },
  { day: "Tue", revenue: 82, bets: 71 },
  { day: "Wed", revenue: 55, bets: 44 },
  { day: "Thu", revenue: 91, bets: 88 },
  { day: "Fri", revenue: 74, bets: 65 },
  { day: "Sat", revenue: 100, bets: 94 },
  { day: "Sun", revenue: 88, bets: 81 },
];

const sportShare = [
  { sport: "Football", pct: 38, color: COLORS.accent },
  { sport: "Basketball", pct: 24, color: COLORS.blue },
  { sport: "Tennis", pct: 18, color: COLORS.gold },
  { sport: "Cricket", pct: 12, color: COLORS.purple },
  { sport: "Other", pct: 8, color: COLORS.textMuted },
];

export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(7);
  const [selectedUser, setSelectedUser] = useState(null);
  const [oddsEdit, setOddsEdit] = useState(null);

  const s = {
    root: { display: "flex", height: "100vh", background: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden" },
    sidebar: { width: sidebarOpen ? 240 : 64, minWidth: sidebarOpen ? 240 : 64, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", transition: "all 0.25s cubic-bezier(.4,0,.2,1)", overflow: "hidden" },
    logo: { padding: "20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12, minHeight: 64 },
    logoMark: { width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, #00b37a)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 8, margin: "2px 8px", cursor: "pointer", transition: "all 0.15s", background: active ? COLORS.accentDim : "transparent", color: active ? COLORS.accent : COLORS.textSecondary, borderLeft: active ? `2px solid ${COLORS.accent}` : "2px solid transparent", whiteSpace: "nowrap", overflow: "hidden" }),
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: { height: 64, background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", flexShrink: 0 },
    searchBox: { flex: 1, maxWidth: 400, display: "flex", alignItems: "center", gap: 8, background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px" },
    content: { flex: 1, overflow: "auto", padding: 24 },
    card: { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 },
    kpiCard: (color) => ({ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }),
    badge: (color, bg) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: "0.03em" }),
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.border}` },
    td: { padding: "12px 12px", fontSize: 13, color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` },
    btn: (color = COLORS.accent, ghost = false) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", border: ghost ? `1px solid ${COLORS.border}` : "none", background: ghost ? "transparent" : color, color: ghost ? COLORS.textSecondary : "#000", transition: "all 0.15s", outline: "none" }),
    sectionTitle: { fontSize: 16, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 4 },
    sectionSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  };

  const StatusBadge = ({ status }) => {
    const map = {
      pending: [COLORS.gold, COLORS.goldDim, Clock],
      won: [COLORS.accent, COLORS.accentDim, CheckCircle],
      lost: [COLORS.red, COLORS.redDim, XCircle],
      flagged: [COLORS.red, COLORS.redDim, Flag],
      completed: [COLORS.accent, COLORS.accentDim, CheckCircle],
      active: [COLORS.accent, COLORS.accentDim, CheckCircle],
      suspended: [COLORS.red, COLORS.redDim, Lock],
      live: ["#ff6b35", "rgba(255,107,53,0.15)", Flame],
      upcoming: [COLORS.blue, COLORS.blueDim, Clock],
      verified: [COLORS.accent, COLORS.accentDim, UserCheck],
      failed: [COLORS.red, COLORS.redDim, UserX],
      high: [COLORS.red, COLORS.redDim, AlertTriangle],
      medium: [COLORS.gold, COLORS.goldDim, AlertTriangle],
      low: [COLORS.blue, COLORS.blueDim, CheckCircle],
    };
    const [color, bg, Icon] = map[status] || [COLORS.textMuted, COLORS.border, Clock];
    return <span style={s.badge(color, bg)}><Icon size={10} />{status}</span>;
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = activeNav === item.id;
    return (
      <div style={s.navItem(active)} onClick={() => setActiveNav(item.id)}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>}
      </div>
    );
  };

  const MiniChart = () => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48, marginTop: 12 }}>
      {chartBars.map((b, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: COLORS.accentDim, borderRadius: 3, height: `${b.bets * 0.44}px` }} />
          <div style={{ width: "100%", background: COLORS.accent, borderRadius: 3, height: `${b.revenue * 0.44}px`, opacity: 0.85 }} />
          <span style={{ fontSize: 9, color: COLORS.textMuted }}>{b.day}</span>
        </div>
      ))}
    </div>
  );

  const DonutChart = () => {
    let cumulative = 0;
    const radius = 36;
    const circ = 2 * Math.PI * radius;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width={90} height={90} viewBox="0 0 90 90">
          <circle cx={45} cy={45} r={radius} fill="none" stroke={COLORS.bgElevated} strokeWidth={14} />
          {sportShare.map((s, i) => {
            const dash = (s.pct / 100) * circ;
            const offset = circ - cumulative * circ / 100;
            cumulative += s.pct;
            return <circle key={i} cx={45} cy={45} r={radius} fill="none" stroke={s.color} strokeWidth={14} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset} style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />;
          })}
          <text x={45} y={49} textAnchor="middle" fill={COLORS.textPrimary} fontSize={11} fontWeight={600}>Bets</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sportShare.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{s.sport}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, marginLeft: "auto" }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Overview</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Friday, April 3, 2026 — Live Platform Snapshot</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpiData.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} style={s.kpiCard(k.color)}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 80% 20%, ${k.color}18, transparent 70%)`, borderRadius: "0 12px 0 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: COLORS.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{k.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary, margin: "6px 0 8px" }}>{k.value}</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: k.up ? COLORS.accent : COLORS.red, fontWeight: 600 }}>
                    {k.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{k.change}
                  </span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={k.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 24 }}>
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <p style={s.sectionTitle}>Revenue & Bet Volume</p>
              <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>Last 7 days</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}><span style={{ width: 8, height: 8, background: COLORS.accent, borderRadius: 2, display: "inline-block" }} />Revenue</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}><span style={{ width: 8, height: 8, background: COLORS.accentDim, borderRadius: 2, display: "inline-block" }} />Volume</span>
            </div>
          </div>
          <MiniChart />
        </div>
        <div style={s.card}>
          <p style={s.sectionTitle}>Sport Distribution</p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 16px" }}>By bet count</p>
          <DonutChart />
        </div>
      </div>

      {/* Live Bets */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={s.sectionTitle}>Recent Bets</p>
            <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>Live feed — auto-updating</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.btn(COLORS.accent, true)}><Filter size={13} />Filter</button>
            <button style={s.btn(COLORS.accent, true)}><Download size={13} />Export</button>
          </div>
        </div>
        <table style={s.table}>
          <thead><tr>
            {["Bet ID", "User", "Sport", "Event", "Market", "Odds", "Stake", "Status", "Time", "Action"].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {recentBets.map((b, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bgElevated}50` }}>
                <td style={{ ...s.td, color: COLORS.blue, fontWeight: 600, fontSize: 12 }}>{b.id}</td>
                <td style={s.td}><span style={{ color: COLORS.textPrimary, fontWeight: 500 }}>{b.user}</span></td>
                <td style={s.td}>{b.sport}</td>
                <td style={{ ...s.td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.event}</td>
                <td style={s.td}>{b.market}</td>
                <td style={{ ...s.td, color: COLORS.gold, fontWeight: 600 }}>{b.odds}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 500 }}>{b.stake}</td>
                <td style={s.td}><StatusBadge status={b.status} /></td>
                <td style={{ ...s.td, color: COLORS.textMuted, fontSize: 11 }}>{b.time}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...s.btn(COLORS.blue, true), padding: "4px 8px", fontSize: 11 }}><Eye size={11} /></button>
                    <button style={{ ...s.btn(COLORS.red, true), padding: "4px 8px", fontSize: 11 }}><Flag size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const UserManagement = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>User Management</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>48,291 registered accounts</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btn(COLORS.accent, true)}><Download size={13} />Export</button>
          <button style={s.btn(COLORS.accent)}><Plus size={13} />Add User</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Users", val: "48,291", color: COLORS.blue },
          { label: "Active Today", val: "8,420", color: COLORS.accent },
          { label: "Suspended", val: "134", color: COLORS.red },
          { label: "Pending KYC", val: "892", color: COLORS.gold },
        ].map((k, i) => (
          <div key={i} style={{ ...s.card, textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: k.color, margin: 0 }}>{k.val}</p>
            <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "4px 0 0" }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px" }}>
            <Search size={14} color={COLORS.textMuted} /><input placeholder="Search users..." style={{ background: "none", border: "none", outline: "none", color: COLORS.textPrimary, fontSize: 13, flex: 1 }} />
          </div>
          <button style={s.btn(COLORS.accent, true)}><Filter size={13} />KYC Status</button>
          <button style={s.btn(COLORS.accent, true)}><SlidersHorizontal size={13} />Risk Level</button>
        </div>
        <table style={s.table}>
          <thead><tr>
            {["User ID", "Name", "Email", "Balance", "Bets", "Win Rate", "KYC", "Risk", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bgElevated}50` }}>
                <td style={{ ...s.td, color: COLORS.blue, fontWeight: 600, fontSize: 12 }}>{u.id}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 500 }}>{u.name}</td>
                <td style={s.td}>{u.email}</td>
                <td style={{ ...s.td, color: COLORS.accent, fontWeight: 600 }}>{u.balance}</td>
                <td style={s.td}>{u.totalBets}</td>
                <td style={s.td}>{Math.round((u.won / u.totalBets) * 100)}%</td>
                <td style={s.td}><StatusBadge status={u.kyc} /></td>
                <td style={s.td}><StatusBadge status={u.risk} /></td>
                <td style={s.td}><StatusBadge status={u.status} /></td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...s.btn(COLORS.blue, true), padding: "4px 8px" }}><Eye size={11} /></button>
                    <button style={{ ...s.btn(COLORS.gold, true), padding: "4px 8px" }}><Edit size={11} /></button>
                    <button style={{ ...s.btn(COLORS.red, true), padding: "4px 8px" }}>{u.status === "active" ? <Lock size={11} /> : <Unlock size={11} />}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EventsManagement = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Events & Sports</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Manage live and upcoming events</p>
        </div>
        <button style={s.btn(COLORS.accent)}><Plus size={13} />Add Event</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "Live", "Upcoming", "Completed", "Suspended"].map(f => (
          <button key={f} style={{ ...s.btn(COLORS.accent, f !== "All"), ...(f === "All" ? {} : {}) }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((e, i) => (
          <div key={i} style={{ ...s.card, display: "flex", alignItems: "center", gap: 16 }}>
            {e.status === "live" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6b35", boxShadow: "0 0 6px #ff6b35", flexShrink: 0, animation: "pulse 1.5s infinite" }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <StatusBadge status={e.status} />
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{e.league}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>•</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{e.date}</span>
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: COLORS.textPrimary }}>{e.home} <span style={{ color: COLORS.textMuted }}>vs</span> {e.away}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 12, textAlign: "center" }}>
              <div><p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.blue }}>{e.markets}</p><p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Markets</p></div>
              <div><p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.gold }}>{e.totalBets.toLocaleString()}</p><p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Bets</p></div>
              <div><p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.red }}>{e.exposure}</p><p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Exposure</p></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...s.btn(COLORS.blue, true), padding: "6px 10px" }}><Eye size={13} /></button>
              <button style={{ ...s.btn(COLORS.gold, true), padding: "6px 10px" }}><Edit size={13} /></button>
              <button style={{ ...s.btn(COLORS.red, true), padding: "6px 10px" }}><XCircle size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const OddsControl = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Odds Control</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Manage markets, odds, and margins</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btn(COLORS.accent, true)}><RefreshCw size={13} />Sync Feed</button>
          <button style={s.btn(COLORS.accent)}><Plus size={13} />New Market</button>
        </div>
      </div>
      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>
            {["Event", "Market", "Selection 1", "Odds", "Selection 2", "Odds", "Selection 3", "Odds", "Margin", "Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {oddsData.map((o, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bgElevated}50` }}>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 500, fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.event}</td>
                <td style={s.td}>{o.market}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary }}>{o.sel1}</td>
                <td style={{ ...s.td }}><span style={{ background: COLORS.accentDim, color: COLORS.accent, padding: "2px 8px", borderRadius: 5, fontWeight: 700, fontSize: 13 }}>{o.odds1}</span></td>
                <td style={s.td}>{o.sel2 || "—"}</td>
                <td style={s.td}>{o.odds2 ? <span style={{ background: COLORS.accentDim, color: COLORS.accent, padding: "2px 8px", borderRadius: 5, fontWeight: 700, fontSize: 13 }}>{o.odds2}</span> : "—"}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary }}>{o.sel3}</td>
                <td style={s.td}><span style={{ background: COLORS.accentDim, color: COLORS.accent, padding: "2px 8px", borderRadius: 5, fontWeight: 700, fontSize: 13 }}>{o.odds3}</span></td>
                <td style={{ ...s.td, color: COLORS.gold, fontWeight: 600 }}>{o.margin}</td>
                <td style={s.td}><StatusBadge status={o.status} /></td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...s.btn(COLORS.gold, true), padding: "4px 8px" }}><Edit size={11} /></button>
                    <button style={{ ...s.btn(o.status === "active" ? COLORS.red : COLORS.accent, true), padding: "4px 8px" }}>{o.status === "active" ? <Lock size={11} /> : <Unlock size={11} />}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Transactions = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Transactions</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Deposits, withdrawals & payment review</p>
        </div>
        <button style={s.btn(COLORS.accent, true)}><Download size={13} />Export CSV</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Deposits Today", val: "$284,100", color: COLORS.accent },
          { label: "Withdrawals", val: "$142,800", color: COLORS.red },
          { label: "Pending Review", val: "14", color: COLORS.gold },
          { label: "Flagged AML", val: "3", color: COLORS.red },
        ].map((k, i) => (
          <div key={i} style={{ ...s.card, textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: k.color, margin: 0 }}>{k.val}</p>
            <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "4px 0 0" }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>
            {["TXN ID", "User", "Type", "Method", "Amount", "Status", "Time", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bgElevated}50` }}>
                <td style={{ ...s.td, color: COLORS.blue, fontWeight: 600, fontSize: 12 }}>{t.id}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 500 }}>{t.user}</td>
                <td style={s.td}><span style={s.badge(t.type === "deposit" ? COLORS.accent : COLORS.red, t.type === "deposit" ? COLORS.accentDim : COLORS.redDim)}>{t.type}</span></td>
                <td style={s.td}>{t.method}</td>
                <td style={{ ...s.td, color: t.amount.startsWith("+") ? COLORS.accent : COLORS.red, fontWeight: 700 }}>{t.amount}</td>
                <td style={s.td}><StatusBadge status={t.status} /></td>
                <td style={{ ...s.td, color: COLORS.textMuted, fontSize: 11 }}>{t.time}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...s.btn(COLORS.blue, true), padding: "4px 8px" }}><Eye size={11} /></button>
                    {t.status === "pending" && <><button style={{ ...s.btn(COLORS.accent, true), padding: "4px 8px" }}><CheckCircle size={11} /></button><button style={{ ...s.btn(COLORS.red, true), padding: "4px 8px" }}><XCircle size={11} /></button></>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RiskManagement = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Risk Management</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Fraud detection, AML & exposure monitoring</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Alerts */}
        <div style={s.card}>
          <p style={{ ...s.sectionTitle, marginBottom: 4 }}>Active Alerts</p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "0 0 16px" }}>{riskAlerts.length} alerts requiring attention</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {riskAlerts.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", background: COLORS.bgElevated, borderRadius: 8, borderLeft: `3px solid ${a.type === "high" ? COLORS.red : a.type === "medium" ? COLORS.gold : COLORS.blue}` }}>
                <AlertTriangle size={14} color={a.type === "high" ? COLORS.red : a.type === "medium" ? COLORS.gold : COLORS.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.textPrimary, fontWeight: 500 }}>{a.message}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{a.user}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>•</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{a.time}</span>
                  </div>
                </div>
                <StatusBadge status={a.type} />
              </div>
            ))}
          </div>
        </div>

        {/* Exposure */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={s.card}>
            <p style={{ ...s.sectionTitle, marginBottom: 16 }}>Event Exposure Limits</p>
            {[
              { event: "Man City vs Arsenal", used: 84, limit: 100, color: COLORS.gold },
              { event: "Real Madrid vs Barca", used: 196, limit: 250, color: COLORS.accent },
              { event: "Lakers vs Warriors", used: 128, limit: 150, color: COLORS.red },
            ].map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{e.event}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: e.color }}>${e.used}k / ${e.limit}k</span>
                </div>
                <div style={{ height: 6, background: COLORS.bgElevated, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${Math.min((e.used / e.limit) * 100, 100)}%`, background: e.color, borderRadius: 99, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <p style={{ ...s.sectionTitle, marginBottom: 16 }}>Risk Controls</p>
            {[
              { label: "Max Single Bet", value: "$10,000", active: true },
              { label: "Daily Withdrawal Limit", value: "$50,000", active: true },
              { label: "Auto-suspend on Suspicious Activity", value: "Enabled", active: true },
              { label: "AML Review Threshold", value: "$5,000", active: true },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{r.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{r.value}</span>
                  <button style={{ ...s.btn(COLORS.gold, true), padding: "3px 8px", fontSize: 11 }}><Edit size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Reports = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Reports & Analytics</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>Financial, operational & compliance reports</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { title: "Daily P&L Report", desc: "Revenue, GGR, margin breakdown", icon: DollarSign, color: COLORS.accent, last: "Apr 3, 2026" },
          { title: "User Activity Report", desc: "Registrations, sessions, retention", icon: Users, color: COLORS.blue, last: "Apr 3, 2026" },
          { title: "Bet Analysis Report", desc: "Volume, sport breakdown, markets", icon: Target, color: COLORS.gold, last: "Apr 2, 2026" },
          { title: "Risk & Fraud Report", desc: "Flags, alerts, suspicious users", icon: Shield, color: COLORS.red, last: "Apr 3, 2026" },
          { title: "AML Compliance Report", desc: "Transactions reviewed, escalated", icon: Flag, color: COLORS.purple, last: "Apr 1, 2026" },
          { title: "Odds & Margin Report", desc: "Margin analysis, odds movement", icon: TrendingUp, color: COLORS.gold, last: "Apr 2, 2026" },
        ].map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} style={{ ...s.card, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${r.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={r.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: COLORS.textPrimary }}>{r.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.textMuted }}>{r.desc}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>Last: {r.last}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ ...s.btn(COLORS.accent, true), padding: "4px 10px", fontSize: 11 }}><Eye size={11} />View</button>
                  <button style={{ ...s.btn(COLORS.accent, true), padding: "4px 10px", fontSize: 11 }}><Download size={11} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const BetManagement = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Bet Management</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>All bets, settlements & void management</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btn(COLORS.accent, true)}><RefreshCw size={13} />Refresh</button>
          <button style={s.btn(COLORS.accent, true)}><Download size={13} />Export</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Open", val: "12,847", color: COLORS.gold },
          { label: "Settled Today", val: "4,201", color: COLORS.accent },
          { label: "Voided", val: "23", color: COLORS.red },
          { label: "Flagged", val: "18", color: COLORS.red },
          { label: "Liability", val: "$2.1M", color: COLORS.purple },
        ].map((k, i) => (
          <div key={i} style={{ ...s.card, textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: k.color, margin: 0 }}>{k.val}</p>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: "4px 0 0" }}>{k.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["All Bets", "Pending", "Won", "Lost", "Flagged", "Voided"].map(f => (
          <button key={f} style={s.btn(COLORS.accent, f !== "All Bets")}>{f}</button>
        ))}
      </div>
      <div style={s.card}>
        <table style={s.table}>
          <thead><tr>
            {["Bet ID", "User", "Sport", "Event", "Market", "Odds", "Stake", "Potential Win", "Status", "Time", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {recentBets.map((b, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bgElevated}50` }}>
                <td style={{ ...s.td, color: COLORS.blue, fontWeight: 600, fontSize: 12 }}>{b.id}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 500 }}>{b.user}</td>
                <td style={s.td}>{b.sport}</td>
                <td style={{ ...s.td, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.event}</td>
                <td style={s.td}>{b.market}</td>
                <td style={{ ...s.td, color: COLORS.gold, fontWeight: 700 }}>{b.odds}</td>
                <td style={{ ...s.td, color: COLORS.textPrimary, fontWeight: 600 }}>{b.stake}</td>
                <td style={{ ...s.td, color: COLORS.accent, fontWeight: 600 }}>${(parseFloat(b.stake.replace("$", "").replace(",", "")) * parseFloat(b.odds)).toFixed(0)}</td>
                <td style={s.td}><StatusBadge status={b.status} /></td>
                <td style={{ ...s.td, fontSize: 11, color: COLORS.textMuted }}>{b.time}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ ...s.btn(COLORS.blue, true), padding: "4px 8px" }}><Eye size={11} /></button>
                    <button style={{ ...s.btn(COLORS.red, true), padding: "4px 8px" }}><XCircle size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdminSettings = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>Platform Settings</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "4px 0 0" }}>System configuration & admin preferences</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { title: "General", items: ["Platform name", "Default currency", "Supported languages", "Maintenance mode"] },
          { title: "Betting Rules", items: ["Min bet amount", "Max bet amount", "Max payout per bet", "Accumulator limit"] },
          { title: "KYC & Compliance", items: ["KYC provider", "Auto-verify threshold", "Document requirements", "Jurisdiction rules"] },
          { title: "Payment Gateways", items: ["Stripe integration", "Crypto wallets", "Bank transfer", "Withdrawal auto-approve"] },
        ].map((sec, i) => (
          <div key={i} style={s.card}>
            <p style={{ ...s.sectionTitle, marginBottom: 12 }}>{sec.title}</p>
            {sec.items.map((item, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: j < sec.items.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{item}</span>
                <button style={{ ...s.btn(COLORS.accent, true), padding: "4px 10px", fontSize: 11 }}><Edit size={10} />Edit</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activeNav) {
      case "dashboard": return <Dashboard />;
      case "users": return <UserManagement />;
      case "bets": return <BetManagement />;
      case "events": return <EventsManagement />;
      case "odds": return <OddsControl />;
      case "transactions": return <Transactions />;
      case "risk": return <RiskManagement />;
      case "reports": return <Reports />;
      case "settings": return <AdminSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity: 0.4; } }
        button:hover { opacity: 0.85; }
      `}</style>

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}><Zap size={16} color="#000" /></div>
          {sidebarOpen && <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, letterSpacing: "0.03em" }}>BetForge</p><p style={{ margin: 0, fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin Panel</p></div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {sidebarOpen && <p style={{ fontSize: 10, color: COLORS.textMuted, padding: "0 24px", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Navigation</p>}
          {navSections.map(item => <NavItem key={item.id} item={item} />)}
        </div>

        <div style={{ padding: "12px 0", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>SA</span>
            </div>
            {sidebarOpen && <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>Super Admin</p>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>admin@betforge.io</p>
            </div>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: COLORS.textSecondary }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={18} />
          </button>
          <div style={s.searchBox}>
            <Search size={14} color={COLORS.textMuted} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users, bets, events..." style={{ background: "none", border: "none", outline: "none", color: COLORS.textPrimary, fontSize: 13, flex: 1, minWidth: 0 }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: COLORS.accentDim, borderRadius: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>LIVE</span>
            </div>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setNotifications(0)}>
              <Bell size={18} color={COLORS.textSecondary} />
              {notifications > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: COLORS.red, fontSize: 8, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{notifications}</span>}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>SA</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={s.content}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}