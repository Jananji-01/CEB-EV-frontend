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
        className="absolute top-0 left-0 w-full z-10 md:flex-row md:flex-nowrap md:justify-start flex items-center"
        style={{
          background: "rgba(0,0,0,0.18)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 24px",
          height: "64px",
        }}
      >
        <div className="w-full mx-auto items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">

          {/* Page title with icon */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className={`${icon} text-sm`} style={{ color: "rgba(255,255,255,0.8)" }}></i>
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

          {/* Search bar */}
          <form className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div
              style={{ position: "relative", display: "flex", alignItems: "center" }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                  zIndex: 1,
                }}
              >
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  padding: "8px 16px 8px 36px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  width: "220px",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.16)";
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              />
            </div>
          </form>

          {/* User dropdown */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <UserDropdown />
          </ul>
        </div>
      </nav>
    </>
  );
}