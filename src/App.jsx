import { useState, useCallback, useRef, useEffect } from "react";

// ─── GOOGLE FONTS ────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root {
  --radius:16px;
  --radius-sm:10px;
  --shadow:0 8px 32px rgba(0,0,0,0.4);

  --font-display:'Playfair Display',serif;
  --font-body:'DM Sans',sans-serif;
  --font-mono:'DM Mono',monospace;
}
  * {
  transition: background 0.3s ease, color 0.3s ease, border 0.3s ease;
}
  body[data-theme="dark"] {
  --bg:#0b0f1a;
  --bg2:#111827;
  --bg3:#1a2236;

  --glass:rgba(255,255,255,0.04);
  --glass-border:rgba(255,255,255,0.08);

  --gold:#c9a84c;
  --gold-light:#e8c97a;
  --gold-dim:rgba(201,168,76,0.15);

  --green:#3ecf8e;
  --green-dim:rgba(62,207,142,0.12);

  --red:#f05c6e;
  --red-dim:rgba(240,92,110,0.12);

  --blue:#5b9cf6;
  --blue-dim:rgba(91,156,246,0.12);

  --purple:#a78bfa;
  --purple-dim:rgba(167,139,250,0.12);

  --text:#e8ecf4;
  --text2:#8893a8;
  --text3:#4a5568;
}
  body[data-theme="light"] {
  --bg: #f3eda3;              /* soft butter white */
  --bg2: #f7f7ee;             /* cards */
  --bg3: #fbf3d4;             /* light yellow panels */

  --glass: rgba(221, 215, 194, 0.15);
  --glass-border: rgba(255, 200, 80, 0.25);

  --gold: #d4a017;            /* rich butter gold */
  --gold-light: #f4d03f;
  --gold-dim: rgba(212,160,23,0.15);

  --green: #22c55e;
  --green-dim: rgba(34,197,94,0.12);

  --red: #ef4444;
  --red-dim: rgba(239,68,68,0.12);

  --blue: #3b82f6;
  --blue-dim: rgba(59,130,246,0.12);

  --purple: #8b5cf6;
  --purple-dim: rgba(139,92,246,0.12);

  --text: #2b2b2b;            /* dark grey for readability */
  --text2: #6b7280;
  --text3: #9ca3af;
  
}
    body{background:var(--bg);color:var(--text);font-family:var(--font-body);min-height:100vh;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--glass-border);border-radius:3px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    .anim-fade-up{animation:fadeUp .45s ease both}
    .anim-fade-up-2{animation:fadeUp .55s ease both}
    .anim-fade-up-3{animation:fadeUp .65s ease both}
    .anim-slide-down{animation:slideDown .35s ease both}
    .anim-slide-up{animation:slideUp .3s ease both}
    .anim-fade-in{animation:fadeIn .2s ease both}
    .chart-dot{transition:r .15s,fill .15s;cursor:pointer}
    .mini-bar-fill{transition:width .7s ease}
    .progress-fill{transition:width .8s ease}
  `}</style>
);

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CAT = {
  salary:        { label: "Salary",        emoji: "💼", color: "#3ecf8e", bg: "rgba(62,207,142,.1)",  border: "rgba(62,207,142,.25)" },
  freelance:     { label: "Freelance",     emoji: "🖥",  color: "#5b9cf6", bg: "rgba(91,156,246,.1)", border: "rgba(91,156,246,.25)" },
  food:          { label: "Food",          emoji: "🍜", color: "#f09d5c", bg: "rgba(240,157,92,.1)", border: "rgba(240,157,92,.25)" },
  shopping:      { label: "Shopping",      emoji: "🛍",  color: "#c084fc", bg: "rgba(192,132,252,.1)",border: "rgba(192,132,252,.25)" },
  rent:          { label: "Rent",          emoji: "🏠", color: "#f05c6e", bg: "rgba(240,92,110,.1)", border: "rgba(240,92,110,.25)" },
  travel:        { label: "Travel",        emoji: "✈️", color: "#22d3ee", bg: "rgba(34,211,238,.1)", border: "rgba(34,211,238,.25)" },
  entertainment: { label: "Entertainment", emoji: "🎮", color: "#a78bfa", bg: "rgba(167,139,250,.1)",border: "rgba(167,139,250,.25)" },
  health:        { label: "Health",        emoji: "❤️", color: "#fb7185", bg: "rgba(251,113,133,.1)",border: "rgba(251,113,133,.25)" },
  investment:    { label: "Investment",    emoji: "📈", color: "#c9a84c", bg: "rgba(201,168,76,.1)", border: "rgba(201,168,76,.25)" },
  utilities:     { label: "Utilities",     emoji: "⚡", color: "#fbbf24", bg: "rgba(251,191,36,.1)", border: "rgba(251,191,36,.25)" },
};

const MN  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MNF = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED = [
  {id:1,date:"2024-01-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:2,date:"2024-01-03",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:3,date:"2024-01-05",desc:"Grocery Store",cat:"food",type:"expense",amount:3800},
  {id:4,date:"2024-01-08",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1700},
  {id:5,date:"2024-01-12",desc:"Online Shopping",cat:"shopping",type:"expense",amount:4200},
  {id:6,date:"2024-01-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:7,date:"2024-01-18",desc:"Restaurant",cat:"food",type:"expense",amount:2200},
  {id:8,date:"2024-01-22",desc:"Gym Membership",cat:"health",type:"expense",amount:2500},
  {id:9,date:"2024-01-25",desc:"Freelance Logo Design",cat:"freelance",type:"income",amount:12000},
  {id:10,date:"2024-01-28",desc:"Netflix + Spotify",cat:"entertainment",type:"expense",amount:1200},
  {id:11,date:"2024-02-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:12,date:"2024-02-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:13,date:"2024-02-05",desc:"Groceries",cat:"food",type:"expense",amount:3400},
  {id:14,date:"2024-02-08",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1550},
  {id:15,date:"2024-02-10",desc:"Valentine Dinner",cat:"food",type:"expense",amount:3500},
  {id:16,date:"2024-02-14",desc:"Gift Shopping",cat:"shopping",type:"expense",amount:5800},
  {id:17,date:"2024-02-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:18,date:"2024-02-18",desc:"Medical Checkup",cat:"health",type:"expense",amount:1800},
  {id:19,date:"2024-02-22",desc:"Weekend Movie",cat:"entertainment",type:"expense",amount:900},
  {id:20,date:"2024-02-25",desc:"UI Project",cat:"freelance",type:"income",amount:18000},
  {id:21,date:"2024-03-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:22,date:"2024-03-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:23,date:"2024-03-04",desc:"Groceries",cat:"food",type:"expense",amount:3600},
  {id:24,date:"2024-03-07",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1600},
  {id:25,date:"2024-03-10",desc:"Holi Trip Flights",cat:"travel",type:"expense",amount:14000},
  {id:26,date:"2024-03-12",desc:"Hotel Stay",cat:"travel",type:"expense",amount:8000},
  {id:27,date:"2024-03-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:28,date:"2024-03-18",desc:"Clothing Store",cat:"shopping",type:"expense",amount:6200},
  {id:29,date:"2024-03-22",desc:"Pharmacy",cat:"health",type:"expense",amount:1100},
  {id:30,date:"2024-03-28",desc:"App Dev Freelance",cat:"freelance",type:"income",amount:22000},
  {id:31,date:"2024-04-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:32,date:"2024-04-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:33,date:"2024-04-04",desc:"Groceries",cat:"food",type:"expense",amount:3200},
  {id:34,date:"2024-04-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1900},
  {id:35,date:"2024-04-09",desc:"Stock Purchase",cat:"investment",type:"expense",amount:15000},
  {id:36,date:"2024-04-12",desc:"Dinner with Friends",cat:"food",type:"expense",amount:2800},
  {id:37,date:"2024-04-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:38,date:"2024-04-18",desc:"Amazon Shopping",cat:"shopping",type:"expense",amount:3900},
  {id:39,date:"2024-04-22",desc:"Streaming Services",cat:"entertainment",type:"expense",amount:1500},
  {id:40,date:"2024-04-26",desc:"Freelance Dashboard",cat:"freelance",type:"income",amount:16000},
  {id:41,date:"2024-05-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:42,date:"2024-05-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:43,date:"2024-05-05",desc:"Groceries",cat:"food",type:"expense",amount:4100},
  {id:44,date:"2024-05-07",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:2200},
  {id:45,date:"2024-05-10",desc:"Goa Trip Flights",cat:"travel",type:"expense",amount:18000},
  {id:46,date:"2024-05-11",desc:"Goa Hotel",cat:"travel",type:"expense",amount:12000},
  {id:47,date:"2024-05-13",desc:"Beach Activities",cat:"travel",type:"expense",amount:5000},
  {id:48,date:"2024-05-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:49,date:"2024-05-20",desc:"Medical Bills",cat:"health",type:"expense",amount:3500},
  {id:50,date:"2024-05-25",desc:"Brand Identity Project",cat:"freelance",type:"income",amount:28000},
  {id:51,date:"2024-06-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:52,date:"2024-06-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:53,date:"2024-06-04",desc:"Groceries",cat:"food",type:"expense",amount:3400},
  {id:54,date:"2024-06-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:2800},
  {id:55,date:"2024-06-09",desc:"New Laptop",cat:"shopping",type:"expense",amount:72000},
  {id:56,date:"2024-06-12",desc:"Gym Membership",cat:"health",type:"expense",amount:2500},
  {id:57,date:"2024-06-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:58,date:"2024-06-18",desc:"Dining Out",cat:"food",type:"expense",amount:2900},
  {id:59,date:"2024-06-22",desc:"Concert Tickets",cat:"entertainment",type:"expense",amount:4500},
  {id:60,date:"2024-06-26",desc:"Freelance Logo",cat:"freelance",type:"income",amount:9000},
  {id:61,date:"2024-07-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:62,date:"2024-07-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:63,date:"2024-07-05",desc:"Groceries",cat:"food",type:"expense",amount:3700},
  {id:64,date:"2024-07-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:3100},
  {id:65,date:"2024-07-10",desc:"Gaming Console",cat:"entertainment",type:"expense",amount:35000},
  {id:66,date:"2024-07-12",desc:"Weekend Trip",cat:"travel",type:"expense",amount:8500},
  {id:67,date:"2024-07-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:68,date:"2024-07-18",desc:"Medical Checkup",cat:"health",type:"expense",amount:1800},
  {id:69,date:"2024-07-22",desc:"Clothes Shopping",cat:"shopping",type:"expense",amount:6800},
  {id:70,date:"2024-07-26",desc:"App Dev Project",cat:"freelance",type:"income",amount:24000},
  {id:71,date:"2024-08-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:72,date:"2024-08-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:73,date:"2024-08-04",desc:"Groceries",cat:"food",type:"expense",amount:3500},
  {id:74,date:"2024-08-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:2900},
  {id:75,date:"2024-08-09",desc:"Independence Day Shopping",cat:"shopping",type:"expense",amount:4100},
  {id:76,date:"2024-08-14",desc:"Raksha Bandhan Gifts",cat:"shopping",type:"expense",amount:3200},
  {id:77,date:"2024-08-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:78,date:"2024-08-18",desc:"Restaurant",cat:"food",type:"expense",amount:2400},
  {id:79,date:"2024-08-22",desc:"Pharmacy",cat:"health",type:"expense",amount:800},
  {id:80,date:"2024-08-27",desc:"Web Design Freelance",cat:"freelance",type:"income",amount:20000},
  {id:81,date:"2024-09-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:82,date:"2024-09-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:83,date:"2024-09-04",desc:"Groceries",cat:"food",type:"expense",amount:3600},
  {id:84,date:"2024-09-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:2100},
  {id:85,date:"2024-09-09",desc:"Ganesh Chaturthi",cat:"food",type:"expense",amount:4500},
  {id:86,date:"2024-09-12",desc:"New Furniture",cat:"shopping",type:"expense",amount:18000},
  {id:87,date:"2024-09-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:88,date:"2024-09-18",desc:"Movies & OTT",cat:"entertainment",type:"expense",amount:1200},
  {id:89,date:"2024-09-22",desc:"Annual Health Checkup",cat:"health",type:"expense",amount:4200},
  {id:90,date:"2024-09-27",desc:"Content Writing",cat:"freelance",type:"income",amount:14000},
  {id:91,date:"2024-10-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:92,date:"2024-10-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:93,date:"2024-10-04",desc:"Groceries",cat:"food",type:"expense",amount:3900},
  {id:94,date:"2024-10-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1800},
  {id:95,date:"2024-10-09",desc:"Dussehra Shopping",cat:"shopping",type:"expense",amount:9500},
  {id:96,date:"2024-10-12",desc:"Diwali Decorations",cat:"shopping",type:"expense",amount:7200},
  {id:97,date:"2024-10-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:98,date:"2024-10-18",desc:"Diwali Firecrackers",cat:"entertainment",type:"expense",amount:3000},
  {id:99,date:"2024-10-22",desc:"Sweets & Gifts",cat:"food",type:"expense",amount:5500},
  {id:100,date:"2024-10-28",desc:"Freelance UI Kit",cat:"freelance",type:"income",amount:32000},
  {id:101,date:"2024-11-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:102,date:"2024-11-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:103,date:"2024-11-04",desc:"Groceries",cat:"food",type:"expense",amount:3300},
  {id:104,date:"2024-11-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:1600},
  {id:105,date:"2024-11-09",desc:"Black Friday Shopping",cat:"shopping",type:"expense",amount:12000},
  {id:106,date:"2024-11-12",desc:"Travel Insurance",cat:"travel",type:"expense",amount:2800},
  {id:107,date:"2024-11-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:108,date:"2024-11-18",desc:"Dentist Visit",cat:"health",type:"expense",amount:3500},
  {id:109,date:"2024-11-22",desc:"Streaming + Games",cat:"entertainment",type:"expense",amount:2200},
  {id:110,date:"2024-11-27",desc:"Mobile App Project",cat:"freelance",type:"income",amount:38000},
  {id:111,date:"2024-12-01",desc:"Monthly Salary",cat:"salary",type:"income",amount:85000},
  {id:112,date:"2024-12-02",desc:"Apartment Rent",cat:"rent",type:"expense",amount:22000},
  {id:113,date:"2024-12-04",desc:"Groceries",cat:"food",type:"expense",amount:4200},
  {id:114,date:"2024-12-06",desc:"Electricity Bill",cat:"utilities",type:"expense",amount:2000},
  {id:115,date:"2024-12-09",desc:"Year-End Trip",cat:"travel",type:"expense",amount:25000},
  {id:116,date:"2024-12-11",desc:"Hotel Booking",cat:"travel",type:"expense",amount:15000},
  {id:117,date:"2024-12-15",desc:"Mutual Fund SIP",cat:"investment",type:"expense",amount:10000},
  {id:118,date:"2024-12-18",desc:"Christmas Gifts",cat:"shopping",type:"expense",amount:14000},
  {id:119,date:"2024-12-22",desc:"New Year Party",cat:"entertainment",type:"expense",amount:6000},
  {id:120,date:"2024-12-27",desc:"Year-End Bonus Project",cat:"freelance",type:"income",amount:45000},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");
const fmtD = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtY = (v) => v >= 100000 ? (v / 100000).toFixed(1) + "L" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : "" + v;

function buildMonthly(transactions) {
  const map = {};
  for (let m = 1; m <= 12; m++) {
    const k = `2024-${String(m).padStart(2, "0")}`;
    map[k] = { key: k, label: MN[m - 1], full: MNF[m - 1], income: 0, expenses: 0, txs: [] };
  }
  transactions.forEach((t) => {
    const k = t.date.slice(0, 7);
    if (map[k]) {
      map[k][t.type === "income" ? "income" : "expenses"] += t.amount;
      map[k].txs.push(t);
    }
  });
  let cum = 0;
  return Object.values(map).map((m) => { cum += m.income - m.expenses; return { ...m, net: m.income - m.expenses, cum }; });
}

function derived(transactions) {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const savings = income > 0 ? Math.round((balance / income) * 100) : 0;
  const catMap = {};
  transactions.filter((t) => t.type === "expense").forEach((t) => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const catData = Object.entries(catMap).map(([k, v]) => ({ name: CAT[k]?.label || k, key: k, value: v, color: CAT[k]?.color || "#888" })).sort((a, b) => b.value - a.value);
  const monthly = buildMonthly(transactions);
  return { income, expenses, balance, savings, catData, monthly };
}

// ─── STAT CARDS ──────────────────────────────────────────────────────────────
function StatCards({ d }) {
  const rat = d.income > 0 ? Math.round((d.expenses / d.income) * 100) : 0;
  const cards = [
    { cls: "balance", icon: "💰", label: "Net Balance", value: fmt(d.balance), change: `↑ ${d.savings}% savings rate`, changeColor: "var(--green)", valueColor: "var(--gold)" },
    { cls: "income",  icon: "↑",  label: "Total Income",   value: fmt(d.income),   change: "↑ FY 2024",        changeColor: "var(--green)", valueColor: "var(--green)" },
    { cls: "expense", icon: "↓",  label: "Total Expenses", value: fmt(d.expenses), change: `↓ ${rat}% of income`, changeColor: "var(--red)",  valueColor: "var(--red)" },
    { cls: "savings", icon: "🏦", label: "Transactions", value: d.txCount, change: "◎ 12-month entries", changeColor: "var(--text3)", valueColor: "var(--blue)" },
  ];
  const iconBg = { balance: "var(--gold-dim)", income: "var(--green-dim)", expense: "var(--red-dim)", savings: "var(--blue-dim)" };
  const glowColors = { balance: "rgba(201,168,76,.06)", income: "rgba(62,207,142,.06)", expense: "rgba(240,92,110,.06)", savings: "rgba(91,156,246,.06)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <div key={c.cls} className="anim-fade-up" style={{
          background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)",
          padding: 22, position: "relative", overflow: "hidden", animationDelay: `${i * 0.08}s`
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: glowColors[c.cls], pointerEvents: "none" }} />
          <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, background: iconBg[c.cls], marginBottom: 14 }}>{c.icon}</div>
          <div style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>{c.label}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, color: c.valueColor, lineHeight: 1 }}>{c.value}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginTop: 10, fontWeight: 500, color: c.changeColor }}>{c.change}</div>
        </div>
      ))}
    </div>
  );
}

// ─── TREND CHART ─────────────────────────────────────────────────────────────
function TrendChart({ monthly, selectedMonth, onMonthClick }) {
  const [tooltip, setTooltip] = useState(null);
  const wrapRef = useRef(null);

  const PL = 52, PR = 16, PT = 14, PB = 40;
  const VW = 860, VH = 250;
  const pw = VW - PL - PR, ph = VH - PT - PB;

  const allVals = monthly.flatMap((m) => [m.income, m.expenses, Math.max(0, m.cum)]);
  const maxV = Math.max(...allVals, 1);
  const xS = (i) => PL + (i / 11) * pw;
  const yS = (v) => PT + ph - (v / maxV) * ph;

  const yticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: Math.round(maxV * f), y: yS(maxV * f) }));

  const lp = (vals) => vals.map((v, i) => `${i ? "L" : "M"}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(" ");
  const ap = (vals, base) => `${lp(vals)} L${xS(11).toFixed(1)},${yS(base)} L${xS(0).toFixed(1)},${yS(base)} Z`;

  const incV = monthly.map((m) => m.income);
  const expV = monthly.map((m) => m.expenses);
  const cumV = monthly.map((m) => Math.max(0, m.cum));

  const hint = selectedMonth
    ? `Viewing ${monthly.find((m) => m.key === selectedMonth)?.full} — click same or another month`
    : "Click any month on the chart to see its breakdown";

  const handleMouseEnter = (e, idx) => {
    const m = monthly[idx];
    if (!m || !wrapRef.current) return;
    const wr = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - wr.left, y = e.clientY - wr.top;
    setTooltip({ m, x, y });
  };
  const handleMouseMove = (e) => {
    if (!tooltip || !wrapRef.current) return;
    const wr = wrapRef.current.getBoundingClientRect();
    setTooltip((t) => t ? { ...t, x: e.clientX - wr.left, y: e.clientY - wr.top } : t);
  };

  return (
    <div className="anim-fade-up-2" ref={wrapRef} onMouseMove={handleMouseMove}
      style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 24, marginBottom: 20, position: "relative", overflow: "visible" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--text)" }}>Balance Trend — FY 2024</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
            {selectedMonth ? <><span style={{ color: "var(--gold)", fontWeight: 600 }}>{monthly.find((m) => m.key === selectedMonth)?.full}</span> — click same or another month</> : <><span style={{ color: "var(--gold)" }}>↑</span> Click any month on the chart to see its breakdown</>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {[["#3ecf8e", "Income"], ["#f05c6e", "Expenses"]].map(([color, label]) => (
            <div key={label} style={{ fontSize: 12, color: "var(--text2)", display: "inline-flex", alignItems: "center" }}>
              <span style={{ width: 18, height: 2, borderRadius: 1, background: color, display: "inline-block", marginRight: 5 }} />{label}
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--text2)", display: "inline-flex", alignItems: "center" }}>
            <span style={{ width: 18, display: "inline-block", marginRight: 5, borderTop: "2px dashed #c9a84c" }} />Cum. Balance
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ overflowX: "auto", marginTop: 6 }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", minWidth: 480, height: "auto", overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ecf8e" stopOpacity=".22" />
              <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f05c6e" stopOpacity=".16" />
              <stop offset="100%" stopColor="#f05c6e" stopOpacity="0" />
            </linearGradient>
          </defs>
          {yticks.map((t) => (
            <g key={t.v}>
              <line x1={PL} y1={t.y.toFixed(1)} x2={VW - PR} y2={t.y.toFixed(1)} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
              <text x={PL - 6} y={t.y.toFixed(1)} textAnchor="end" dominantBaseline="middle" fill="#4a5568" fontSize="10" fontFamily="'DM Mono',monospace">{fmtY(t.v)}</text>
            </g>
          ))}
          <path d={ap(incV, yS(0))} fill="url(#gI)" />
          <path d={ap(expV, yS(0))} fill="url(#gE)" />
          <path d={lp(incV)} fill="none" stroke="#3ecf8e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={lp(expV)} fill="none" stroke="#f05c6e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d={lp(cumV)} fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeDasharray="7 4" strokeLinecap="round" />
          {monthly.map((m, i) => {
            const active = selectedMonth === m.key;
            const xi = xS(i).toFixed(1);
            return (
              <g key={m.key}>
                {active && <line x1={xi} y1={PT} x2={xi} y2={PT + ph} stroke="rgba(201,168,76,.4)" strokeWidth="1.5" strokeDasharray="5 3" />}
                {active && <rect x={(xS(i) - 22).toFixed(1)} y={PT - 4} width="44" height={ph + 8} rx="4" fill="rgba(201,168,76,.06)" stroke="rgba(201,168,76,.15)" strokeWidth="1" />}
                <circle className="chart-dot" cx={xi} cy={yS(m.income).toFixed(1)} r={active ? 7 : 5} fill={active ? "#c9a84c" : "#3ecf8e"} stroke={active ? "#e8c97a" : "var(--bg2)"} strokeWidth="2"
                  onClick={() => onMonthClick(m.key)} onMouseEnter={(e) => handleMouseEnter(e, i)} onMouseLeave={() => setTooltip(null)} />
                <circle className="chart-dot" cx={xi} cy={yS(m.expenses).toFixed(1)} r={active ? 7 : 5} fill={active ? "#c9a84c" : "#f05c6e"} stroke={active ? "#e8c97a" : "var(--bg2)"} strokeWidth="2"
                  onClick={() => onMonthClick(m.key)} onMouseEnter={(e) => handleMouseEnter(e, i)} onMouseLeave={() => setTooltip(null)} />
                <rect x={(xS(i) - 20).toFixed(1)} y={PT} width="40" height={ph} fill="transparent" style={{ cursor: "pointer" }}
                  onClick={() => onMonthClick(m.key)} onMouseEnter={(e) => handleMouseEnter(e, i)} onMouseLeave={() => setTooltip(null)} />
                <text x={xi} y={VH - 8} textAnchor="middle" fill={active ? "#c9a84c" : "#4a5568"} fontSize={active ? 11.5 : 10} fontFamily="'DM Sans',sans-serif" fontWeight={active ? 600 : 400}>{m.label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (() => {
        const { m, x, y } = tooltip;
        const net = m.income - m.expenses;
        const tw = 215;
        return (
          <div style={{
            position: "absolute", background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 12,
            padding: "14px 16px", width: tw, fontSize: 12, pointerEvents: "none", zIndex: 30,
            boxShadow: "var(--shadow)", left: Math.min(x + 16, (wrapRef.current?.offsetWidth || 800) - tw - 8), top: Math.max(8, y - 140)
          }}>
            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 9, fontSize: 13, borderBottom: "1px solid var(--glass-border)", paddingBottom: 7 }}>{m.full} 2024</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[["↑ Income", "#3ecf8e", fmt(m.income)], ["↓ Expenses", "#f05c6e", fmt(m.expenses)]].map(([label, color, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span style={{ color }}>{label}</span><span style={{ fontFamily: "var(--font-mono)", color }}>{val}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", margin: "3px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ color: "var(--text2)" }}>Monthly Net</span>
                <span style={{ fontFamily: "var(--font-mono)", color: net >= 0 ? "#c9a84c" : "#f05c6e" }}>{net >= 0 ? "+" : ""}{fmt(net)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ color: "var(--text2)" }}>Cum. Balance</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#c9a84c" }}>{fmt(m.cum)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                <span style={{ color: "var(--text2)" }}>Transactions</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>{m.txs.length}</span>
              </div>
            </div>
            <div style={{ marginTop: 9, fontSize: 10, letterSpacing: ".5px", color: "var(--gold)" }}>▶ Click to see full breakdown</div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── MONTH DETAIL PANEL ───────────────────────────────────────────────────────
function MonthPanel({ monthly, selectedMonth, onClose }) {
  const m = monthly.find((x) => x.key === selectedMonth);
  if (!m) return null;
  const net = m.income - m.expenses;
  const txs = [...m.txs].sort((a, b) => b.amount - a.amount);
  const catMap = {};
  txs.filter((t) => t.type === "expense").forEach((t) => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const cats = Object.entries(catMap).map(([k, v]) => ({ key: k, ...CAT[k], value: v })).sort((a, b) => b.value - a.value);
  const maxCat = cats[0]?.value || 1;
  const savPct = m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0;

  return (
    <div className="anim-slide-down" id="month-panel" style={{
      background: "var(--bg2)", border: "1px solid rgba(201,168,76,.3)", borderRadius: "var(--radius)",
      marginBottom: 20, overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.03))",
        borderBottom: "1px solid rgba(201,168,76,.2)", padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--gold)" }}>{m.full} 2024</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{txs.length} transactions · {savPct >= 0 ? savPct + "% saved" : "overspent"}</div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["var(--green)", fmt(m.income), "Income"], ["var(--red)", fmt(m.expenses), "Expenses"],
            [net >= 0 ? "var(--gold)" : "var(--red)", (net >= 0 ? "+" : "") + fmt(net), "Net"],
            ["var(--blue)", fmt(m.cum), "Cum. Balance"]].map(([color, val, lbl]) => (
            <div key={lbl} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color }}>{val}</div>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          padding: "7px 14px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
          cursor: "pointer", border: "1px solid var(--glass-border)", background: "var(--glass)", color: "var(--text2)", flexShrink: 0
        }}>✕ Close</button>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Spending Breakdown */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>Spending Breakdown</div>
            {cats.length ? cats.map((c) => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <div style={{ fontSize: 12, color: "var(--text2)", width: 84, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.emoji} {c.label}</div>
                <div style={{ flex: 1, height: 6, background: "var(--glass-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div className="mini-bar-fill" style={{ width: `${Math.round((c.value / maxCat) * 100)}%`, height: "100%", borderRadius: 3, background: c.color }} />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)", width: 64, textAlign: "right", flexShrink: 0 }}>{fmt(c.value)}</div>
              </div>
            )) : <div style={{ color: "var(--text3)", fontSize: 13 }}>No expenses this month</div>}
            {cats.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>
                  <span>Top category</span><span style={{ color: cats[0].color, fontWeight: 600 }}>{cats[0].label} · {fmt(cats[0].value)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)" }}>
                  <span>Savings rate</span>
                  <span style={{ color: savPct >= 20 ? "var(--green)" : savPct >= 0 ? "var(--gold)" : "var(--red)", fontWeight: 600 }}>{savPct}%</span>
                </div>
              </div>
            )}
          </div>

          {/* All Transactions */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>All Transactions</div>
            {txs.length ? (
              <div style={{ overflowY: "auto", maxHeight: 290 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Description", "Cat", "Date", "Amount"].map((h) => (
                        <th key={h} style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", padding: "8px 0", textAlign: h === "Amount" ? "right" : "left", borderBottom: "1px solid var(--glass-border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => {
                      const c = CAT[t.cat] || {};
                      return (
                        <tr key={t.id}>
                          <td style={{ padding: "8px 0", fontSize: 12.5, borderBottom: "1px solid rgba(255,255,255,.03)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.desc}>{t.desc}</td>
                          <td style={{ padding: "8px 0", fontSize: 12.5, borderBottom: "1px solid rgba(255,255,255,.03)" }} title={c.label || t.cat}>{c.emoji || "•"}</td>
                          <td style={{ padding: "8px 0", fontSize: 11, color: "var(--text3)", borderBottom: "1px solid rgba(255,255,255,.03)" }}>{fmtD(t.date)}</td>
                          <td style={{ padding: "8px 0", textAlign: "right", borderBottom: "1px solid rgba(255,255,255,.03)", fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 500, color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                            {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div style={{ color: "var(--text3)", fontSize: 13 }}>No transactions</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECENT TRANSACTIONS ─────────────────────────────────────────────────────
function RecentTx({ transactions, onViewAll }) {
  const txs = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  return (
    <div className="anim-fade-up-3" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Recent Transactions</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Latest 7 entries</div>
        </div>
        <button onClick={onViewAll} style={{ padding: "9px 18px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid var(--glass-border)", background: "var(--glass)", color: "var(--text2)" }}>View All →</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {["Description", "Category", "Date", "Amount"].map((h) => (
              <th key={h} style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", padding: "12px 20px", textAlign: "left", borderBottom: "1px solid var(--glass-border)" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {txs.length ? txs.map((t) => <TxRow key={t.id} t={t} showActions={false} />) : (
              <tr><td colSpan={4}><div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text3)" }}><div style={{ fontSize: 36, marginBottom: 12 }}>📭</div><div>No transactions yet</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TX ROW ───────────────────────────────────────────────────────────────────
function TxRow({ t, showActions, isAdmin, onEdit, onDelete }) {
  const c = CAT[t.cat] || {};
  return (
    <tr style={{ cursor: "default" }} onMouseEnter={(e) => { Array.from(e.currentTarget.cells).forEach((td) => (td.style.background = "var(--glass)")); }}
      onMouseLeave={(e) => { Array.from(e.currentTarget.cells).forEach((td) => (td.style.background = "")); }}>
      <td style={{ padding: "11px 20px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.03)" }}><span style={{ fontWeight: 500 }}>{t.desc}</span></td>
      <td style={{ padding: "11px 20px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.03)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1px solid ${c.border || "#555"}`, color: c.color, background: c.bg }}>
          {c.emoji || "•"} {c.label || t.cat}
        </span>
      </td>
      <td style={{ padding: "11px 20px", fontSize: 12, color: "var(--text3)", borderBottom: "1px solid rgba(255,255,255,.03)" }}>{fmtD(t.date)}</td>
      <td style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,.03)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
        {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
      </td>
      {showActions && (
        <td style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,.03)" }}>
          {isAdmin && (
            <div style={{ display: "flex", gap: 6 }}>
              {[{ icon: "✎", handler: () => onEdit(t), isDel: false }, { icon: "✕", handler: () => onDelete(t.id), isDel: true }].map(({ icon, handler, isDel }) => (
                <button key={icon} onClick={handler} style={{
                  width: 28, height: 28, borderRadius: 6, border: "1px solid var(--glass-border)", background: "var(--glass)",
                  color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all .2s"
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isDel ? "var(--red-dim)" : "var(--bg3)"; e.currentTarget.style.color = isDel ? "var(--red)" : "var(--text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass)"; e.currentTarget.style.color = "var(--text2)"; }}>
                  {icon}
                </button>
              ))}
            </div>
          )}
        </td>
      )}
    </tr>
  );
}

// ─── QUICK INSIGHTS ───────────────────────────────────────────────────────────
function QuickInsights({ d }) {
  const top = d.catData[0];
  const best = d.monthly.reduce((a, b) => a.net > b.net ? a : b, d.monthly[0]);
  const items = [
    { label: "Top Spending", value: top?.name || "—", sub: top ? fmt(top.value) : "No data", bar: top ? { pct: Math.min(100, (top.value / d.expenses) * 100), color: top.color } : null },
    { label: "Savings Rate", value: d.savings + "%", valueColor: d.savings > 20 ? "var(--green)" : d.savings > 0 ? "var(--gold)" : "var(--red)", sub: d.savings > 30 ? "🌟 Excellent!" : d.savings > 15 ? "👍 Good pace" : d.savings > 0 ? "⚠ Improve" : "❌ Overspending" },
    { label: "Best Month", value: best?.full || "—", sub: best ? "+" + fmt(best.net) : "", subColor: "var(--green)" },
    { label: "Avg Monthly Spend", value: fmt(Math.round(d.expenses / 12)), sub: "across 12 months" },
  ];
  return (
    <div className="anim-fade-up-3" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 22 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, marginBottom: 16 }}>Quick Insights</div>
      {items.map((item, i) => (
        <div key={i} style={{ padding: "13px 0", borderBottom: i < items.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
          <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "var(--text3)", marginBottom: 6 }}>{item.label}</div>
          <div style={{ fontSize: 17, fontFamily: "var(--font-display)", color: item.valueColor || "var(--text)" }}>{item.value}</div>
          <div style={{ fontSize: 12, color: item.subColor || "var(--text3)", marginTop: 3 }}>{item.sub}</div>
          {item.bar && <div style={{ height: 4, background: "var(--glass-border)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
            <div className="progress-fill" style={{ width: `${item.bar.pct}%`, height: "100%", borderRadius: 2, background: item.bar.color }} />
          </div>}
        </div>
      ))}
    </div>
  );
}

// ─── TRANSACTIONS VIEW ────────────────────────────────────────────────────────
const FILTERS = ["all", "income", "expense", "food", "shopping", "travel", "health", "rent", "investment", "entertainment", "utilities", "salary", "freelance"];

function TransactionsView({ transactions, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = (() => {
    let t = [...transactions];
    if (filter !== "all") t = t.filter((x) => x.type === filter || x.cat === filter);
    if (search) { const q = search.toLowerCase(); t = t.filter((x) => x.desc.toLowerCase().includes(q) || (CAT[x.cat]?.label || "").toLowerCase().includes(q) || x.amount.toString().includes(q)); }
    t.sort((a, b) => { let va = a[sortKey], vb = b[sortKey]; if (sortKey === "amount") { va = +va; vb = +vb; } return sortDir === "asc" ? (va < vb ? -1 : va > vb ? 1 : 0) : (va < vb ? 1 : va > vb ? -1 : 0); });
    return t;
  })();

  const handleSort = (k) => { if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("asc"); } };
  const sa = (k) => sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="anim-fade-up-3" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 22px 16px", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, padding: "8px 12px", flex: 1, maxWidth: 260 }}>
            <span>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, width: "100%" }} autoFocus />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <button onClick={onAdd} style={{ padding: "9px 18px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: "var(--gold)", color: "#0b0f1a", display: "inline-flex", alignItems: "center", gap: 7 }}>＋ Add</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 500, transition: "all .2s",
              background: filter === f ? "var(--gold-dim)" : "none", color: filter === f ? "var(--gold)" : "var(--text2)",
              border: filter === f ? "1px solid rgba(201,168,76,.3)" : "1px solid var(--glass-border)"
            }}>{f === "all" ? "All" : CAT[f]?.label || f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            {[["desc", "Description"], ["", "Category"], ["type", "Type"], ["date", "Date"], ["amount", "Amount"]].map(([key, label]) => (
              <th key={label} onClick={key ? () => handleSort(key) : undefined}
                style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", padding: "12px 20px", textAlign: "left", borderBottom: "1px solid var(--glass-border)", cursor: key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}>
                {label}{key ? sa(key) : ""}
              </th>
            ))}
            <th style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)", padding: "12px 20px", textAlign: "left", borderBottom: "1px solid var(--glass-border)" }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length ? filtered.map((t) => <TxRow key={t.id} t={t} showActions isAdmin onEdit={onEdit} onDelete={onDelete} />) : (
              <tr><td colSpan={6}><div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text3)" }}><div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div><div>No results</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── INSIGHTS VIEW ────────────────────────────────────────────────────────────
function InsightsView({ d, selectedMonth, onMonthClick }) {
  const top = d.catData[0];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
      {/* Spending by Category */}
      <div className="anim-fade-up" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 22 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Spending by Category</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, marginTop: 3 }}>All-time totals</div>
        {d.catData.map((c) => (
          <div key={c.key} style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13 }}>{CAT[c.key]?.emoji || ""} {c.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)" }}>{fmt(c.value)}</span>
            </div>
            <div style={{ height: 4, background: "var(--glass-border)", borderRadius: 2, overflow: "hidden" }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, (c.value / d.catData[0].value) * 100)}%`, height: "100%", borderRadius: 2, background: c.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Comparison */}
      <div className="anim-fade-up" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 22, animationDelay: ".1s" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Monthly Comparison</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, marginTop: 3 }}>Click a month to drill in →</div>
        {d.monthly.map((m) => (
          <div key={m.key} onClick={() => onMonthClick(m.key)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", margin: "0 -10px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass)")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
            <span style={{ color: selectedMonth === m.key ? "var(--gold)" : "var(--text2)", fontWeight: selectedMonth === m.key ? 600 : 400, minWidth: 80 }}>{m.full}</span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)" }}>+{fmt(m.income)}</span>
              <span style={{ fontSize: 12, color: "var(--red)", fontFamily: "var(--font-mono)" }}>−{fmt(m.expenses)}</span>
              <span style={{ fontSize: 12, color: m.net >= 0 ? "var(--gold)" : "var(--red)", fontFamily: "var(--font-mono)", minWidth: 72, textAlign: "right" }}>{m.net >= 0 ? "+" : ""}{fmt(m.net)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Observations */}
      <div className="anim-fade-up" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 22, animationDelay: ".2s" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>Key Observations</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, marginTop: 3 }}>Insights from your data</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {top && <ObCard bg="var(--gold-dim)" border="rgba(201,168,76,.2)" labelColor="var(--gold)" label="💡 Top Category" text={<>{ top.name} at <strong style={{ color: "var(--gold)" }}>{fmt(top.value)}</strong> ({Math.round((top.value / d.expenses) * 100)}% of spending)</>} />}
          {d.savings > 20
            ? <ObCard bg="var(--green-dim)" border="rgba(62,207,142,.2)" labelColor="var(--green)" label="🌟 Healthy Savings" text={<>Saved <strong style={{ color: "var(--green)" }}>{d.savings}%</strong> of income this year</>} />
            : d.expenses > d.income
              ? <ObCard bg="var(--red-dim)" border="rgba(240,92,110,.2)" labelColor="var(--red)" label="⚠ Overspending" text={<>Expenses exceed income by <strong style={{ color: "var(--red)" }}>{fmt(d.expenses - d.income)}</strong></>} />
              : null}
          <ObCard bg="var(--blue-dim)" border="rgba(91,156,246,.2)" labelColor="var(--blue)" label="📊 Activity" text={<><strong style={{ color: "var(--blue)" }}>{d.txCount} transactions</strong> across 12 months</>} />
          <ObCard bg="var(--purple-dim)" border="rgba(167,139,250,.2)" labelColor="var(--purple)" label="📅 Avg Monthly" text={<>Avg spend <strong style={{ color: "var(--purple)" }}>{fmt(Math.round(d.expenses / 12))}</strong>/month</>} />
        </div>
      </div>
    </div>
  );
}

function ObCard({ bg, border, labelColor, label, text }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: labelColor, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ modal, form, setForm, onSave, onClose }) {
  const isEdit = modal === "edit";
  const field = (label, children) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text3)" }}>{label}</label>
      {children}
    </div>
  );
  const inputStyle = { background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", outline: "none", width: "100%" };

  return (
    <div className="anim-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="anim-slide-up" style={{ background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 28, width: 420, maxWidth: "95vw", boxShadow: "var(--shadow)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 22 }}>{isEdit ? "Edit Transaction" : "New Transaction"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            {field("Description", <input style={inputStyle} type="text" placeholder="e.g. Monthly Salary" value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />)}
          </div>
          {field("Amount (₹)", <input style={inputStyle} type="number" placeholder="0" value={form.amount} min="1" onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />)}
          {field("Date", <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />)}
          {field("Type", (
            <select style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          ))}
          {field("Category", (
            <select style={inputStyle} value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}>
              {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "var(--glass)", color: "var(--text2)", border: "1px solid var(--glass-border)" }}>Cancel</button>
          <button onClick={onSave} style={{ padding: "9px 18px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "var(--gold)", color: "#0b0f1a", border: "none" }}>{isEdit ? "Update" : "Add Transaction"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="anim-slide-up" style={{
      position: "fixed", bottom: 24, right: 24, background: "var(--bg2)",
      border: `1px solid ${toast.type === "success" ? "rgba(62,207,142,.3)" : "rgba(240,92,110,.3)"}`,
      color: "var(--text)", padding: "12px 18px", borderRadius: "var(--radius-sm)", fontSize: 13,
      boxShadow: "var(--shadow)", zIndex: 300, display: "flex", alignItems: "center", gap: 10
    }}>
      {toast.type === "success" ? "✓" : "✕"} {toast.msg}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ desc: "", amount: "", cat: "food", type: "expense", date: "" });
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("aurum_token") || "");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const toastTimer = useRef(null);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const apiRequest = useCallback(async (path, options = {}, authToken = token) => {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "") + "/api";
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch {
      throw new Error("Cannot connect to API server.");
    }
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }, [token]);

  const loadTransactions = useCallback(async (authToken = token) => {
    const data = await apiRequest("/transactions", {}, authToken);
    setTransactions(data.transactions || []);
  }, [apiRequest, token]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const meData = await apiRequest("/auth/me", {}, token);
        if (cancelled) return;
        setUser(meData.user);
        await loadTransactions(token);
      } catch (error) {
        localStorage.removeItem("aurum_token");
        if (!cancelled) {
          setToken("");
          setUser(null);
          setTransactions([]);
          showToast(error.message || "Session expired", "error");
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [token, apiRequest, loadTransactions, showToast]);

  const login = async (e) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      }, "");

      localStorage.setItem("aurum_token", data.token);
      setToken(data.token);
      setUser(data.user);
      await loadTransactions(data.token);
      setTab("dashboard");
      showToast("Logged in successfully");
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();

    const name = registerForm.name.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setAuthLoading(true);
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }, "");

      localStorage.setItem("aurum_token", data.token);
      setToken(data.token);
      setUser(data.user);
      await loadTransactions(data.token);
      setTab("dashboard");
      setRegisterForm({ name: "", email: "", password: "", confirmPassword: "" });
      showToast("Account created. You are logged in.");
    } catch (error) {
      showToast(error.message || "Failed to create account", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("aurum_token");
    setToken("");
    setUser(null);
    setTransactions([]);
    setSelectedMonth(null);
    setModal(null);
    showToast("Logged out");
  };

  const d = { ...derived(transactions), txCount: transactions.length };

  const openAdd = () => {
    const td = new Date().toISOString().split("T")[0];
    setForm({ desc: "", amount: "", cat: "food", type: "expense", date: td });
    setEditing(null);
    setModal("add");
  };

  const openEdit = (t) => {
    setForm({ desc: t.desc, amount: t.amount, cat: t.cat, type: t.type, date: t.date });
    setEditing(t.id);
    setModal("edit");
  };

  const saveTx = async () => {
    const desc = form.desc.trim();
    const amount = parseFloat(form.amount);
    if (!desc || !amount || amount <= 0 || !form.date) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      if (modal === "edit" && editing) {
        await apiRequest(`/transactions/${editing}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, desc, amount }),
        });
        showToast("Transaction updated");
      } else {
        await apiRequest("/transactions", {
          method: "POST",
          body: JSON.stringify({ ...form, desc, amount }),
        });
        showToast("Transaction added");
      }

      await loadTransactions();
      setModal(null);
    } catch (error) {
      showToast(error.message || "Failed to save transaction", "error");
    }
  };

  const deleteTx = async (id) => {
    try {
      await apiRequest(`/transactions/${id}`, { method: "DELETE" });
      await loadTransactions();
      showToast("Transaction deleted");
    } catch (error) {
      showToast(error.message || "Failed to delete transaction", "error");
    }
  };

  const handleMonthClick = (key) => {
    setSelectedMonth((prev) => prev === key ? null : key);
    if (selectedMonth !== key) {
      setTimeout(() => { document.getElementById("month-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 80);
    }
  };

  const navItems = [["dashboard", "◈", "Dashboard"], ["transactions", "⊟", "Transactions"], ["insights", "◉", "Insights"]];
  const tabTitles = { dashboard: "", transactions: "Transactions", insights: "Insights" };
  const tabSubs = { dashboard: "", transactions: "All income & expenses", insights: "Patterns and performance" };

  if (authLoading && !user) {
    return (
      <>
        <FontLink />
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
          <div style={{ color: "var(--text2)" }}>Loading…</div>
        </div>
      </>
    );
  }

  if (!token || !user) {
    return (
      <>
        <FontLink />
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "var(--bg)" }}>
          <form onSubmit={authMode === "login" ? login : register} style={{ width: 360, maxWidth: "92vw", background: "var(--bg2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--gold)", marginBottom: 4 }}>AURUM</div>
            <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 12 }}>{authMode === "login" ? "Login to continue" : "Create your account"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <button type="button" onClick={() => setAuthMode("login")}
                style={{ padding: "8px 10px", borderRadius: 8, border: authMode === "login" ? "1px solid rgba(201,168,76,.3)" : "1px solid var(--glass-border)", background: authMode === "login" ? "var(--gold-dim)" : "var(--glass)", color: authMode === "login" ? "var(--gold)" : "var(--text2)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)" }}>
                Login
              </button>
              <button type="button" onClick={() => setAuthMode("register")}
                style={{ padding: "8px 10px", borderRadius: 8, border: authMode === "register" ? "1px solid rgba(201,168,76,.3)" : "1px solid var(--glass-border)", background: authMode === "register" ? "var(--gold-dim)" : "var(--glass)", color: authMode === "register" ? "var(--gold)" : "var(--text2)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)" }}>
                Create account
              </button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {authMode === "register" && (
                <input type="text" value={registerForm.name} placeholder="Full name" onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", outline: "none", width: "100%" }} />
              )}

              <input type="email" value={authMode === "login" ? loginForm.email : registerForm.email} placeholder="Email" onChange={(e) => authMode === "login" ? setLoginForm((f) => ({ ...f, email: e.target.value })) : setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                style={{ background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", outline: "none", width: "100%" }} />

              <input type="password" value={authMode === "login" ? loginForm.password : registerForm.password} placeholder="Password" onChange={(e) => authMode === "login" ? setLoginForm((f) => ({ ...f, password: e.target.value })) : setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                style={{ background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", outline: "none", width: "100%" }} />

              {authMode === "register" && (
                <input type="password" value={registerForm.confirmPassword} placeholder="Confirm password" onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  style={{ background: "var(--bg3)", border: "1px solid var(--glass-border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 12px", outline: "none", width: "100%" }} />
              )}

              <button type="submit" style={{ marginTop: 8, padding: "10px 14px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--gold)", color: "#0b0f1a", border: "none" }}>
                {authMode === "login" ? "Login" : "Create Account"}
              </button>
            </div>
            <div style={{ marginTop: 14, color: "var(--text3)", fontSize: 11 }}>
              You can create a new account and log in immediately.
            </div>
          </form>
          <Toast toast={toast} />
        </div>
      </>
    );
  }

  return (
    <>
      <FontLink />
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 90 }} />}

        <aside style={{
          width: 240, background: "var(--bg2)", borderRight: "1px solid var(--glass-border)",
          display: "flex", flexDirection: "column", padding: "28px 0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
          transform: sidebarOpen ? "translateX(0)" : undefined, transition: "transform .3s ease"
        }}>
          <div style={{ padding: "0 24px 28px", borderBottom: "1px solid var(--glass-border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--gold)", letterSpacing: 2 }}>AURUM</div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--text3)", textTransform: "uppercase", marginTop: 2 }}>Finance Dashboard</div>
          </div>
          <nav style={{ flex: 1, padding: "20px 12px" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text3)", padding: "0 12px", margin: "16px 0 8px" }}>Navigation</div>
            {navItems.map(([id, ic, lb]) => (
              <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: "var(--radius-sm)",
                  cursor: "pointer", transition: "all .2s", color: tab === id ? "var(--gold)" : "var(--text2)", fontSize: 14, fontWeight: 500,
                  border: tab === id ? "1px solid rgba(201,168,76,.2)" : "1px solid transparent",
                  background: tab === id ? "var(--gold-dim)" : "none", width: "100%", textAlign: "left", fontFamily: "var(--font-body)", marginBottom: 2
                }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{ic}</span>{lb}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 12px", borderTop: "1px solid var(--glass-border)" }}>
            <div style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>Logged In</div>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{user.email}</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: "var(--gold-dim)",
                color: "var(--gold)",
                border: "1px solid rgba(201,168,76,.25)"
              }}>✦ Full Access</div>
            </div>
          </div>
        </aside>

        <div style={{ marginLeft: 240, flex: 1, minHeight: "100vh" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px",
            borderBottom: "1px solid var(--glass-border)", background: "var(--bg2)", backdropFilter: "blur(12px)",
            position: "sticky", top: 0, zIndex: 50
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ display: "none", background: "none", border: "none", color: "var(--text)", fontSize: 20, cursor: "pointer", padding: 4 }}>☰</button>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{tabTitles[tab]}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{tabSubs[tab]}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text)", fontSize: 14, cursor: "pointer" }}>
                {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
              <button onClick={openAdd} style={{ padding: "9px 18px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: "var(--gold)", color: "#0b0f1a", display: "inline-flex", alignItems: "center", gap: 7 }}>＋ Add Transaction</button>
              <button onClick={logout} style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text2)", fontSize: 13, cursor: "pointer" }}>Logout</button>
            </div>
          </div>

          <div style={{ padding: "28px 32px" }}>
            {tab === "dashboard" && (
              <>
                <StatCards d={d} />
                <TrendChart monthly={d.monthly} selectedMonth={selectedMonth} onMonthClick={handleMonthClick} />
                {selectedMonth && <MonthPanel monthly={d.monthly} selectedMonth={selectedMonth} onClose={() => setSelectedMonth(null)} />}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 16 }}>
                  <RecentTx transactions={transactions} onViewAll={() => setTab("transactions")} />
                  <QuickInsights d={d} />
                </div>
              </>
            )}
            {tab === "transactions" && (
              <TransactionsView transactions={transactions} onAdd={openAdd} onEdit={openEdit} onDelete={deleteTx} />
            )}
            {tab === "insights" && (
              <InsightsView d={d} selectedMonth={selectedMonth} onMonthClick={(key) => { handleMonthClick(key); setTab("dashboard"); }} />
            )}
          </div>
        </div>

        {modal && <Modal modal={modal} form={form} setForm={setForm} onSave={saveTx} onClose={() => setModal(null)} />}
        <Toast toast={toast} />
      </div>
    </>
  );
}
