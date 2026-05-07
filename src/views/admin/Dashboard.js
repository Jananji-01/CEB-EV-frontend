import React, { useState } from "react";

// components
import MapExample from "components/Maps/MapExample.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import SessionManagement from "../../components/SessionManagement"; 
import CardRevenueEnergy from "components/Cards/CardRevenueEnergy.js";
import CardStationStatus from "components/Cards/CardStationStatus.js";
import CardChargingModes from "components/Cards/CardChargingModes";

export default function Dashboard() {
  const [showSessions, setShowSessions] = useState(false);
  
  const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
  const MAROON_BUTTON_STYLE = {
    backgroundColor: "#7c0000",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const handleOpenSessions = () => {
    setShowSessions(true);
  };

  const handleCloseSessions = () => {
    setShowSessions(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
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
                <i className="text-red-500 fas fa-chart-line"></i>
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                <i className="fas fa-chart-pie" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                Overview of analytics and user statistics
              </p>
            </div>
            <button 
              style={MAROON_BUTTON_STYLE}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#9e0000"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#7c0000"}
              onClick={handleOpenSessions}
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Sessions
            </button>
          </div>

          {/* <div className="flex flex-wrap">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <MapExample/>
            </div>
            <div className="w-full px-4 xl:w-4/12">
              <CardBarChart />
            </div>
          </div> */}
          
          {/* <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <CardLineChart />
            </div>
          </div> */}
          
          <div className="flex flex-wrap">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <MapExample/>
            </div>
            <div className="w-full px-4 xl:w-4/12">
              <CardBarChart />
            </div>
          </div>
          
          <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12 2xl:w-1/2 xl:mb-0">
              <CardRevenueEnergy />
            </div>
            <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
              <CardStationStatus />
            </div>
            <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
              <CardChargingModes />
            </div>
          </div>
        </div> {/* Close container div */}
      </div> {/* Close main div */}

      {showSessions && (
        <SessionManagement onClose={handleCloseSessions} />
      )}
    </>
  );
}