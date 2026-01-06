import React from "react";
import MapExample from "components/Maps/MapExample.js";

export default function DashboardEV() {
  const token = sessionStorage.getItem("token");
  const userLevel = sessionStorage.getItem("userLevel");
  console.log("Token in DashboardEV:", token);
  console.log("User Level in DashboardEV:", userLevel);
  return (
    <div className="flex flex-wrap">
      <div className="w-full px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <MapExample />
        </div>
      </div>
    </div>
  );
}
