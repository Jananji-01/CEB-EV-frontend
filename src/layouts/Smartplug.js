import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components

import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views

import RegisterSmartPlug from "views/smartplug/Register.js";
import QRscan from "views/smartplug/QRscan.js";
import ChargingEV from "views/smartplug/ChargingEV.js";
import Payment from "views/smartplug/Payment.js"; 

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full pt-20 md:pt-24">
          <Switch>
            <Route path="/smartplug/register" exact component={RegisterSmartPlug} />
            <Route path="/smartplug/qrscan" exact component={QRscan} />
            <Route path="/smartplug/charging" exact component={ChargingEV} />
            <Route path="/smartplug/payment" exact component={Payment} />

            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
