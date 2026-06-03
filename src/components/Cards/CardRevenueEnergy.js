import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088";

const authFetch = (path) =>
  fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

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
              ? `LKR ${p.value?.toFixed(2) || 0}`
              : `${p.value?.toFixed(2) || 0} kWh`}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function CardRevenueEnergy() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await authFetch("/api/charging-sessions");
        setSessions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const trendData = React.useMemo(() => {
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

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-gray-500 mb-1 text-xs font-semibold">
                Revenue & Energy
              </h6>
              <h2 className="text-gray-800 text-xl font-semibold">
                Last 30 Days Trend
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4 flex-auto">
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-database text-4xl mb-3 block" />
              <p className="text-sm">No session data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
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
      </div>
    </>
  );
}