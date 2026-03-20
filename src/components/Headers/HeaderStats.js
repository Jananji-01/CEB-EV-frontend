import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CardStats from "components/Cards/CardStats.js";

export default function HeaderStats() {
  const location = useLocation();
  const isSmartPlugPage = location.pathname === "/smartplug/register" || location.pathname === "/smartplug/charging";

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
        setTotalExpense(data.totalAmount !== undefined ? Number(data.totalAmount).toFixed(2) : "N/A");
      })
      .catch((err) => {
        console.error("Monthly API error", err);
      });
  }, [isAdmin]);

  // ✅ don’t show header in smart plug page
  if (isSmartPlugPage) return null;

  return (
    <div
      style={{ backgroundColor: "#b23200" }}
      className="relative z-0 pt-12 pb-32 md:pt-32"
    >
      <div className="w-full px-4 mx-auto md:px-10">
        {/* ✅ show cards ONLY if not admin */}
        {!isAdmin && (
          <div className="flex flex-wrap">
            {/* Sessions */}
            <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
              <CardStats
                statSubtitle="Sessions"
                statTitle={totalSessions.toString()}
                statIconName="far fa-chart-bar"
                statIconColor="bg-red-500"
              />
            </div>

            {/* Consumption */}
            <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
              <CardStats
                statSubtitle="Total Consumption"
                statTitle={`${totalConsumption} kWh`}
                statIconName="fas fa-chart-pie"
                statIconColor="bg-lightBlue-500"
                statBgColor="#0fafb8"
              />
            </div>

            {/* Duration */}
            <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
              <CardStats
                statSubtitle="Total Duration"
                statTitle={totalDuration}
                statIconName="fas fa-clock"
                statIconColor="bg-pink-500"
                statBgColor="#910fb8"
              />
            </div>

            {/* Expense */}
            <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
              <CardStats
                statSubtitle="Total Expense"
                statTitle={totalExpense}
                statIconName="fas fa-percent"
                statIconColor="bg-orange-500"
                statBgColor="#b80f"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
