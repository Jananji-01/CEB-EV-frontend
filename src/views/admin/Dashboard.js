import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── API Base URL ──────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_API_BASE_URL;

// ─── API Endpoints (corrected to admin endpoints) ─────────────────────────
const API = {
  sessions: "/api/charging-sessions",
  stations: "/api/charging-stations",
  evOwners: "/api/admins/ev-owners",        // ✅ fixed
  solarOwners: "/api/admins/solar-owners",  // ✅ fixed
  smartPlugs: "/api/smart-plugs",
};

// ─── Auth-aware fetch helper ───────────────────────────────────────────────
const authFetch = (path) =>
  fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatNumber = (n, decimals = 0) =>
  n == null || isNaN(n)
    ? "—"
    : Number(n).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (start, end) => {
  if (!start) return "—";
  const endTime = end ? new Date(end) : new Date();
  const diffSec = Math.floor((endTime - new Date(start)) / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// ─── Color palette for charts ──────────────────────────────────────────────
const PIE_COLORS = ["#16a34a", "#1d4ed8", "#f59e0b", "#dc2626", "#8b5cf6", "#0891b2"];

// ─── Status badge styles (Tailwind classes) ────────────────────────────────
const statusBadgeClasses = {
  Available: "bg-green-100 text-green-700",
  Occupied: "bg-blue-100 text-blue-700",
  Charging: "bg-yellow-100 text-yellow-700",
  Unplugged: "bg-red-100 text-red-700",
  Faulted: "bg-pink-100 text-pink-700",
  Unknown: "bg-gray-100 text-gray-600",
};

// ─── Custom Tooltip for AreaChart ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="mb-0.5">
          {p.name}:{" "}
          <span className="font-medium">
            {p.dataKey === "revenue"
              ? `LKR ${formatNumber(p.value, 2)}`
              : `${formatNumber(p.value, 2)} kWh`}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card Component (Tailwind) ────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "crimson", loading }) => {
  const colorMap = {
    crimson: "from-red-700 to-red-500",
    amber: "from-amber-600 to-amber-400",
    blue: "from-blue-600 to-blue-400",
    green: "from-green-600 to-green-400",
    purple: "from-purple-600 to-purple-400",
    teal: "from-teal-600 to-teal-400",
  };
  const gradient = colorMap[color] || colorMap.crimson;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
        <i className={`${icon} text-white text-lg`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Skeleton Loader for Table ─────────────────────────────────────────────
const SkeletonRow = ({ cols }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-100 rounded w-20" />
      </td>
    ))}
  </tr>
);

// ─── Empty State ───────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="text-center py-12 text-gray-400">
    <i className="fas fa-database text-4xl mb-3 block" />
    <p className="text-sm">{message}</p>
  </div>
);

// ─── Main Dashboard Component ──────────────────────────────────────────────
export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [stations, setStations] = useState([]);
  const [evOwners, setEvOwners] = useState([]);
  const [solarOwners, setSolarOwners] = useState([]);
  const [smartPlugs, setSmartPlugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        authFetch(API.sessions),
        authFetch(API.stations),
        authFetch(API.evOwners),
        authFetch(API.solarOwners),
        authFetch(API.smartPlugs),
      ]);

      const [sessRes, statRes, evRes, solarRes, plugRes] = results;

      if (sessRes.status === "fulfilled") setSessions(Array.isArray(sessRes.value) ? sessRes.value : []);
      else setErrors((prev) => ({ ...prev, sessions: sessRes.reason?.message }));

      if (statRes.status === "fulfilled") setStations(Array.isArray(statRes.value) ? statRes.value : []);
      else setErrors((prev) => ({ ...prev, stations: statRes.reason?.message }));

      if (evRes.status === "fulfilled") setEvOwners(Array.isArray(evRes.value) ? evRes.value : []);
      else setErrors((prev) => ({ ...prev, evOwners: evRes.reason?.message }));

      if (solarRes.status === "fulfilled") setSolarOwners(Array.isArray(solarRes.value) ? solarRes.value : []);
      else setErrors((prev) => ({ ...prev, solarOwners: solarRes.reason?.message }));

      if (plugRes.status === "fulfilled") setSmartPlugs(Array.isArray(plugRes.value) ? plugRes.value : []);
      else setErrors((prev) => ({ ...prev, smartPlugs: plugRes.reason?.message }));

      setLoading(false);
    };

    fetchAll();
  }, []);

  // Derived metrics
  const activeSessions = sessions.filter((s) => !s.endTime);
  const totalRevenue = sessions.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalEnergy = sessions.reduce((sum, s) => sum + (s.totalConsumption || 0), 0);
  const availablePlugs = smartPlugs.filter((p) => p.status?.toLowerCase() === "available").length;

  // Last 30 days trend data
  const trendData = useMemo(() => {
    const dateMap = new Map();
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateMap.set(key, { date: key, revenue: 0, energy: 0 });
    }

    sessions.forEach((s) => {
      if (!s.startTime) return;
      const dateKey = new Date(s.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dateMap.has(dateKey)) {
        const entry = dateMap.get(dateKey);
        entry.revenue += s.amount || 0;
        entry.energy += s.totalConsumption || 0;
      }
    });

    return Array.from(dateMap.values());
  }, [sessions]);

  // Station status pie data
  const stationPieData = useMemo(() => {
    const counts = {};
    stations.forEach((s) => {
      const status = s.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stations]);

  // Smart plug status pie data
  const plugPieData = useMemo(() => {
    const counts = {};
    smartPlugs.forEach((p) => {
      const status = p.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [smartPlugs]);

  // Recent 10 sessions
  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0))
        .slice(0, 10),
    [sessions]
  );

  // Charging mode breakdown
  const modeData = useMemo(() => {
    const counts = {};
    sessions.forEach((s) => {
      const mode = s.chargingMode || "Unknown";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  // Summary stats for grid (themed)
  const summaryStats = [
    { label: "Total Sessions", value: formatNumber(sessions.length), icon: "fas fa-history", color: "crimson" },
    { label: "Avg. Session (kWh)", value: sessions.length ? formatNumber(totalEnergy / sessions.length, 2) : "—", icon: "fas fa-bolt", color: "crimson" },
    { label: "Avg. Revenue (LKR)", value: sessions.length ? formatNumber(totalRevenue / sessions.length, 2) : "—", icon: "fas fa-coins", color: "crimson" },
    { label: "Total Stations", value: formatNumber(stations.length), icon: "fas fa-map-marker-alt", color: "crimson" },
  ];

  return (
    <div className="font-sans pb-8">
      {/* ✅ Duplicate header REMOVED – parent layout already provides title */}

      {/* API Error Notice */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 text-xs mb-6 flex items-center gap-2">
          <i className="fas fa-exclamation-triangle" />
          <span>
            Some data could not be loaded — check API endpoints or authentication. ({Object.keys(errors).join(", ")})
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon="fas fa-car" label="EV Owners" value={formatNumber(evOwners.length)} sub="Registered users" color="crimson" loading={loading} />
        <StatCard icon="fas fa-solar-panel" label="Solar Owners" value={formatNumber(solarOwners.length)} sub="Solar contributors" color="amber" loading={loading} />
        <StatCard icon="fas fa-plug" label="Smart Plugs" value={formatNumber(smartPlugs.length)} sub={`${availablePlugs} available`} color="blue" loading={loading} />
        <StatCard icon="fas fa-bolt" label="Active Sessions" value={formatNumber(activeSessions.length)} sub="Currently charging" color="green" loading={loading} />
        <StatCard icon="fas fa-money-bill-wave" label="Total Revenue" value={`LKR ${formatNumber(totalRevenue, 0)}`} sub={`${formatNumber(sessions.length)} sessions`} color="purple" loading={loading} />
        <StatCard icon="fas fa-tachometer-alt" label="Energy Delivered" value={`${formatNumber(totalEnergy, 1)} kWh`} sub="All-time total" color="teal" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fas fa-chart-area text-red-700 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700">Revenue & Energy — Last 30 Days</h3>
              <p className="text-xs text-gray-400">Daily totals from charging sessions</p>
            </div>
          </div>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : sessions.length === 0 ? (
            <EmptyState message="No session data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue (LKR)" stroke="#b91c1c" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#b91c1c" }} />
                <Area type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#1d4ed8" strokeWidth={2} fill="url(#engGrad)" dot={false} activeDot={{ r: 4, fill: "#1d4ed8" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Charts Column */}
        <div className="space-y-5">
          {/* Station Status Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <i className="fas fa-charging-station text-green-700 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Station Status</h3>
                <p className="text-xs text-gray-400">{stations.length} total</p>
              </div>
            </div>
            {loading ? (
              <div className="h-36 bg-gray-50 rounded-lg animate-pulse" />
            ) : stationPieData.length === 0 ? (
              <EmptyState message="No station data" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stationPieData} cx="35%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                    {stationPieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, "Stations"]} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Smart Plug Status Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <i className="fas fa-plug text-blue-700 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Plug Status</h3>
                <p className="text-xs text-gray-400">{smartPlugs.length} devices</p>
              </div>
            </div>
            {loading ? (
              <div className="h-36 bg-gray-50 rounded-lg animate-pulse" />
            ) : plugPieData.length === 0 ? (
              <EmptyState message="No plug data" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={plugPieData} cx="35%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                    {plugPieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, "Plugs"]} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Charging Modes + Summary */}
      {!loading && modeData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Charging Modes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <i className="fas fa-sliders-h text-purple-700 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700">Charging Modes</h3>
                <p className="text-xs text-gray-400">Session distribution</p>
              </div>
            </div>
            <div className="space-y-3">
              {modeData.map((mode, idx) => {
                const pct = sessions.length > 0 ? Math.round((mode.value / sessions.length) * 100) : 0;
                return (
                  <div key={mode.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{mode.name}</span>
                      <span className="text-gray-400">
                        {mode.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Summary – Themed with crimson accents */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <i className="fas fa-info-circle text-red-700 text-sm" />
              </div>
              <h3 className="text-sm font-bold text-gray-700">System Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {summaryStats.map((stat) => (
                <div key={stat.label} className="bg-red-50 rounded-lg p-4 flex items-center gap-3 border border-red-100">
                  <i className={`${stat.icon} text-red-700 text-lg`} />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-red-600 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <i className="fas fa-list-alt text-indigo-700 text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700">Recent Charging Sessions</h3>
            <p className="text-xs text-gray-400">Last 10 sessions by start time</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Device", "EV Account", "Start", "End", "Duration", "Energy (kWh)", "Amount (LKR)", "Mode", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                : recentSessions.length === 0
                ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-400">
                        <i className="fas fa-inbox text-3xl mb-2 block" />
                        No charging sessions found
                      </td>
                    </tr>
                  )
                : recentSessions.map((session) => {
                    const status = session.endTime ? "Completed" : "Charging";
                    const statusClass = session.endTime ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
                    return (
                      <tr key={session.sessionId} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">#{session.sessionId}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{session.idDevice || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{session.evOwnerAccountNo || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(session.startTime)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(session.endTime)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDuration(session.startTime, session.endTime)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatNumber(session.totalConsumption, 2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{session.amount ? formatNumber(session.amount, 2) : "—"}</td>
                        <td className="px-4 py-3">
                          {session.chargingMode ? (
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md font-medium">{session.chargingMode}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}