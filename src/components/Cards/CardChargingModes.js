import React, { useEffect, useState } from "react";

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

export default function CardChargingModes() {
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

  const modeData = React.useMemo(() => {
    const counts = {};
    sessions.forEach((s) => {
      const mode = s.chargingMode || "Unknown";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const colors = ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a"];

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-gray-500 mb-1 text-xs font-semibold">
                Charging Modes
              </h6>
              <h2 className="text-gray-800 text-xl font-semibold">
                Session Distribution
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4 flex-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : modeData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-charging-station text-4xl mb-3 block" />
              <p className="text-sm">No session data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modeData.map((mode, idx) => {
                const pct = sessions.length > 0 ? Math.round((mode.value / sessions.length) * 100) : 0;
                return (
                  <div key={mode.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{mode.name}</span>
                      <span className="text-gray-500">
                        {mode.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sessions</span>
                  <span className="font-semibold text-gray-800">{sessions.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}