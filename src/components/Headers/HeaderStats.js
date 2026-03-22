import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CardStats from "components/Cards/CardStats.js";

export default function HeaderStats() {
  const location = useLocation();
  const isSmartPlugPage =
    location.pathname === "/smartplug/register" ||
    location.pathname === "/smartplug/charging";

  // ✅ check role
  const userLevel = sessionStorage.getItem("userLevel");
  const isAdmin = userLevel === "ROLE_ADMIN" || userLevel === "ADMIN";

  const [totalSessions, setTotalSessions] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState("0.000");
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [totalExpense, setTotalExpense] = useState("N/A");

  useEffect(() => {
    // ✅ admin no need to call monthly api
    if (isAdmin) return;

    const username = sessionStorage.getItem("username");
    const accountNumber = sessionStorage.getItem("eAccountNo");

    if (!username || !accountNumber) {
      console.log("Session not ready");
      return;
    }

    fetch("http://localhost:8088/EV/api/consumption/monthly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        accountNumber: accountNumber,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTotalSessions(data.totalSessions || 0);

        setTotalConsumption(
          data.totalConsumption !== undefined
            ? Number(data.totalConsumption).toFixed(3)
            : "0.000"
        );

        const minutes = data.totalDurationMinutes || 0;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        setTotalDuration(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
        setTotalExpense(
          data.totalAmount !== undefined
            ? Number(data.totalAmount).toFixed(2)
            : "N/A"
        );
      })
      .catch((err) => {
        console.error("Monthly API error", err);
      });
  }, [isAdmin]);

  // ✅ don't show header in smart plug page
  if (isSmartPlugPage) return null;

  // Get current month label
  const monthLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #1a0000 0%, #3d0000 45%, #6b0000 75%, #1a0000 100%)",
        position: "relative",
        overflow: "hidden",
        paddingTop: "80px",
        paddingBottom: isAdmin ? "48px" : "80px",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,0,0,0.4) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "30%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(160,0,0,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="w-full px-4 mx-auto md:px-10"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Header title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isAdmin ? "0" : "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-0.01em",
                marginBottom: "4px",
              }}
            >
              {isAdmin ? "Admin Overview" : "My EV Summary"}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                fontWeight: "400",
              }}
            >
              {isAdmin
                ? "System-wide statistics and management"
                : `Monthly stats for ${monthLabel}`}
            </p>
          </div>

          {/* Month pill badge (non-admin only) */}
          {!isAdmin && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.75)",
                fontWeight: "500",
              }}
            >
              <i className="fas fa-calendar-alt" style={{ fontSize: "11px" }}></i>
              {monthLabel}
            </div>
          )}
        </div>

        {/* ✅ show cards ONLY if not admin */}
        {!isAdmin && (
          <div className="flex flex-wrap" style={{ margin: "0 -8px" }}>
            {/* Sessions */}
            <div className="w-full px-2 lg:w-6/12 xl:w-3/12" style={{ padding: "0 8px" }}>
              <CardStats
                statSubtitle="Sessions"
                statTitle={totalSessions.toString()}
                statIconName="far fa-chart-bar"
                statIconColor="bg-red-500"
              />
            </div>

            {/* Consumption */}
            <div className="w-full px-2 lg:w-6/12 xl:w-3/12" style={{ padding: "0 8px" }}>
              <CardStats
                statSubtitle="Total Consumption"
                statTitle={`${totalConsumption} kWh`}
                statIconName="fas fa-bolt"
                statIconColor="bg-lightBlue-500"
              />
            </div>

            {/* Duration */}
            <div className="w-full px-2 lg:w-6/12 xl:w-3/12" style={{ padding: "0 8px" }}>
              <CardStats
                statSubtitle="Total Duration"
                statTitle={totalDuration}
                statIconName="fas fa-clock"
                statIconColor="bg-pink-500"
              />
            </div>

            {/* Expense */}
            <div className="w-full px-2 lg:w-6/12 xl:w-3/12" style={{ padding: "0 8px" }}>
              <CardStats
                statSubtitle="Total Expense"
                statTitle={totalExpense !== "N/A" ? `Rs. ${totalExpense}` : "N/A"}
                statIconName="fas fa-wallet"
                statIconColor="bg-orange-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}