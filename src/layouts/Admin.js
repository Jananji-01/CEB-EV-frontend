import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views
import Dashboard from "views/admin/Dashboard.js";
import DashboardCE from "views/admin/DashboardCE";
import DashboardEE from "views/admin/DashboardEE";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";
import EvDashboard from "views/admin/DashboardEV.js";
import DashboardSOLAR from "views/admin/DashboardSOLAR";
import Payment from "views/admin/Payment";
import EVOwnerDetails from "views/admin/EVOwnerDetails";
import SolarOwnerDetails from "views/admin/SolarOwnerDetails";
import SmartPlugMonitor from "views/admin/SmartPlugMonitor.js";
import CreateNewAdmin from "views/admin/CreateNewAdmin.js";

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div
        className="relative md:ml-64"
        style={{ background: "#f4f5f7", minHeight: "100vh" }}
      >
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div
          className="w-full px-4 mx-auto md:px-10"
          style={{ marginTop: "-48px", position: "relative", zIndex: 2 }}
        >
          <Switch>
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/admin/dashboardCE" exact component={DashboardCE} />
            <Route path="/admin/dashboardEE" exact component={DashboardEE} />
            <Route path="/admin/maps" exact component={Maps} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/tables" exact component={Tables} />
            <Route path="/admin/evdashboard" exact component={EvDashboard} />
            <Route path="/admin/payment" exact component={Payment} />
            <Route path="/admin/dashboardsolar" exact component={DashboardSOLAR} />
            <Route path="/admin/evowners" exact component={EVOwnerDetails} />
            <Route path="/admin/solarowners" exact component={SolarOwnerDetails} />
            <Route path="/admin/smartplugs" exact component={SmartPlugMonitor} />
            <Route path="/admin/create-new-admin" exact component={CreateNewAdmin} />
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}