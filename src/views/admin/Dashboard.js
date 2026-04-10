import React from "react";

// components
import MapExample from "components/Maps/MapExample.js";
// import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import CardRevenueEnergy from "components/Cards/CardRevenueEnergy.js";
import CardStationStatus from "components/Cards/CardStationStatus.js";
import CardChargingModes from "components/Cards/CardChargingModes";

export default function Dashboard() {
  const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container px-4 py-8 mx-auto">
        {/* Header with Title */}
        <div className="mb-8">
          <h1 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  background: BASE_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
            <i className="text-red-500 fas fa-chart-line" style={{ background: BASE_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} ></i>
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            <i className="fas fa-chart-pie" style={{ marginRight: "6px", fontSize: "12px" }}></i>
            Overview of analytics and user statistics
          </p>
        </div>

        <div className="flex flex-wrap">
          <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
            <MapExample/>
          </div>
          <div className="w-full px-4 xl:w-4/12">
            <CardBarChart />
          </div>
        </div>
        <div className="flex flex-wrap mt-4">
          {/* <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
            <CardPageVisits />
          </div>
          <div className="w-full px-4 xl:w-4/12">
            <CardSocialTraffic />
          </div> */}
          {/* <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
            <CardLineChart />
          </div> */}
          {/* ✅ NEW: Revenue & Energy Chart - Full Width */}
          <div className="w-full px-4 mb-12 2xl:w-8/12 xl:mb-0">
              <CardRevenueEnergy />
          </div>
          <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
            <CardStationStatus />
          </div>
          <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
            <CardChargingModes />
          </div>
        </div>
      </div>
    </div>
  );
}