/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import ceb from "../../assets/img/ceb.png";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";

const sidebarStyle = {
  background: "linear-gradient(180deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)",
  borderRight: "1px solid rgba(255,255,255,0.06)",
};

const logoRingStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  padding: "3px",
  background: "linear-gradient(135deg, #7c0000, #c0392b)",
  boxShadow: "0 4px 16px rgba(124,0,0,0.5)",
  margin: "0 auto",
};

const logoInnerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const dividerStyle = {
  height: "1px",
  background: "rgba(255,255,255,0.08)",
  margin: "16px 0",
};

function NavItem({ to, icon, label, active }) {
  return (
    <li style={{ marginBottom: "4px" }}>
      <Link
        to={to}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 16px",
          borderRadius: "10px",
          fontSize: "13px",
          fontWeight: active ? "600" : "400",
          color: active ? "#fff" : "rgba(255,255,255,0.55)",
          background: active
            ? "linear-gradient(135deg, rgba(124,0,0,0.8), rgba(160,0,0,0.6))"
            : "transparent",
          boxShadow: active ? "0 4px 12px rgba(124,0,0,0.4)" : "none",
          borderLeft: active ? "3px solid #ff6b6b" : "3px solid transparent",
          transition: "all 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
          }
        }}
      >
        <span
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <i className={`${icon} text-sm`} style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}></i>
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function SectionLabel({ children }) {
  return (
    <li>
      <span
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          padding: "8px 16px 6px",
          marginTop: "8px",
        }}
      >
        {children}
      </span>
    </li>
  );
}

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const userLevel = sessionStorage.getItem("userLevel");
  const href = window.location.href;

  const isActive = (path) => href.indexOf(path) !== -1;

  const NavContent = ({ children }) => (
    <nav
      style={{
        ...sidebarStyle,
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        width: "256px",
        zIndex: 10,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
      className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap" style={{ padding: "0 16px" }}>
        {/* Mobile toggler */}
        <button
          className="px-3 py-1 text-xl leading-none bg-transparent border border-transparent rounded cursor-pointer md:hidden"
          style={{ color: "rgba(255,255,255,0.7)" }}
          type="button"
          onClick={() => setCollapseShow("bg-transparent m-2 py-3 px-6")}
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Logo */}
        <Link to="/" style={{ display: "block", padding: "28px 0 20px", textDecoration: "none" }}>
          <div style={logoRingStyle}>
            <div style={logoInnerStyle}>
              <img alt="ceb logo" src={ceb} style={{ width: "60px", height: "60px", objectFit: "contain" }} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              EV Management
            </span>
          </div>
        </Link>

        <div style={dividerStyle} />

        {/* Mobile user icons */}
        <ul className="flex flex-wrap items-center list-none md:hidden">
          <li className="relative inline-block"><NotificationDropdown /></li>
          <li className="relative inline-block"><UserDropdown /></li>
        </ul>

        {/* Nav collapse */}
        <div className={`md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded ${collapseShow === "hidden" ? "hidden md:flex" : collapseShow}`}>
          {/* Mobile close */}
          <div className="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-3 py-1 text-xl leading-none bg-transparent border border-transparent rounded cursor-pointer md:hidden"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onClick={() => setCollapseShow("hidden")}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </nav>
  );

  if (userLevel === "ROLE_EVOWNER") {
    return (
      <NavContent>
        <ul className="flex flex-col list-none md:flex-col md:min-w-full">
          <SectionLabel>Navigation</SectionLabel>
          <NavItem to="/admin/evdashboard" icon="fas fa-tachometer-alt" label="Dashboard" active={isActive("/admin/evdashboard")} />
          <NavItem to="/admin/maps" icon="fas fa-map-marked-alt" label="Charging Map" active={isActive("/admin/maps")} />
          <SectionLabel>Charging</SectionLabel>
          <NavItem to="/smartplug/charging" icon="fas fa-bolt" label="Charging EV" active={isActive("/smartplug/charging")} />
          <NavItem to="/admin/payment" icon="fas fa-credit-card" label="Payments" active={isActive("/admin/payment")} />
        </ul>
      </NavContent>
    );
  }

  if (userLevel === "ROLE_SOLAROWNER") {
    return (
      <NavContent>
        <ul className="flex flex-col list-none md:flex-col md:min-w-full">
          <SectionLabel>Navigation</SectionLabel>
          <NavItem to="/admin/maps" icon="fas fa-map-marked-alt" label="Maps" active={isActive("/admin/maps")} />
          <SectionLabel>SmartPlug</SectionLabel>
          <NavItem to="/smartplug/register" icon="fas fa-plug" label="Smart Plug Registration" active={isActive("/smartplug/register")} />
          <NavItem to="/admin/payment" icon="fas fa-credit-card" label="Payments" active={isActive("/admin/payment")} />
        </ul>
      </NavContent>
    );
  }

  if (userLevel === "ROLE_ADMIN") {
    return (
      <NavContent>
        <ul className="flex flex-col list-none md:flex-col md:min-w-full">
          <SectionLabel>Overview</SectionLabel>
          <NavItem to="/admin/dashboard" icon="fas fa-chart-line" label="Admin Dashboard" active={isActive("/admin/dashboard")} />
          <SectionLabel>Users</SectionLabel>
          <NavItem to="/admin/evowners" icon="fas fa-car" label="EV Owner Details" active={isActive("/admin/evowners")} />
          <NavItem to="/admin/solarowners" icon="fas fa-solar-panel" label="Solar Owner Details" active={isActive("/admin/solarowners")} />
          <SectionLabel>Devices</SectionLabel>
          <NavItem to="/smartplug/register" icon="fas fa-plug" label="Smart Plug Registration" active={isActive("/smartplug/register")} />
          <NavItem to="/admin/smartplugs" icon="fas fa-network-wired" label="Smart Plug Monitoring" active={isActive("/admin/smartplugs")} />
          <SectionLabel>Finance</SectionLabel>
          <NavItem to="/admin/billing-history" icon="fas fa-history" label="Billing History" active={isActive("/admin/billing-history")} />
        </ul>
      </NavContent>
    );
  }

  return null;
}