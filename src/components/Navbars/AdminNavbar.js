/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import UserDropdown from "components/Dropdowns/UserDropdown.js";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/admin/dashboard": { label: "Admin Dashboard", icon: "fas fa-chart-line" },
  "/admin/evdashboard": { label: "EV Dashboard", icon: "fas fa-bolt" },
  "/admin/dashboardsolar": { label: "Solar Dashboard", icon: "fas fa-solar-panel" },
  "/admin/maps": { label: "Charging Map", icon: "fas fa-map-marked-alt" },
  "/admin/evowners": { label: "EV Owner Details", icon: "fas fa-car" },
  "/admin/solarowners": { label: "Solar Owner Details", icon: "fas fa-solar-panel" },
  "/smartplug/register": { label: "Smart Plug Registration", icon: "fas fa-plug" },
  "/admin/smartplugs": { label: "Smart Plug Monitoring", icon: "fas fa-network-wired" },
  "/admin/payment": { label: "Payments", icon: "fas fa-credit-card" },
  "/admin/billing-history": { label: "Billing History", icon: "fas fa-history" },
  "/admin/create-new-admin": { label: "Create New Admin", icon: "fas fa-user-plus" },
};

export default function Navbar() {
  const location = useLocation();

  const pageInfo = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  );
  const { label = "Dashboard", icon = "fas fa-home" } = pageInfo?.[1] || {};

  return (
    <>
      <nav
        className="absolute top-0 left-0 z-10 flex items-center w-full md:flex-row md:flex-nowrap md:justify-start"
        style={{
          background: "transparent",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          padding: "0 24px",
          height: "64px",
          boxShadow: "0 2px 12px rgba(124,0,0,0.25)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between w-full px-4 mx-auto md:flex-nowrap md:px-10">

          {/* Page title with icon */}
          <div className="items-center hidden gap-3 lg:flex">
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className={`${icon} text-sm`} style={{ color: "rgba(255,255,255,0.95)" }}></i>
            </div>
            <span
              style={{
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </span>
          </div>

        </div>
      </nav>
    </>
  );
}