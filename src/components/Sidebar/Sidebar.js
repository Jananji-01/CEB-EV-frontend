/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import ceb from "../../assets/img/ceb.png";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const userLevel = sessionStorage.getItem("userLevel");

  return (
    <>
      {userLevel === "ROLE_SOLAROWNER" && (
        <nav className="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-xl md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden md:w-64">
          <div className="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap">
            {/* Toggler */}
            <button
              className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
              type="button"
              onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
            >
              <i className="fas fa-bars"></i>
            </button>
            {/* Brand */}
            <Link
              className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
              to="/"
            >
              <div className="sticky flex items-center justify-center">
                <img alt="ceb logo" className="w-20 h-20" src={ceb} />
              </div>
            </Link>
            {/* User */}
            <ul className="flex flex-wrap items-center list-none md:hidden">
              <li className="relative inline-block">
                <NotificationDropdown />
              </li>
              <li className="relative inline-block">
                <UserDropdown />
              </li>
            </ul>
            {/* Collapse */}
            <div
              className={
                "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
                collapseShow
              }
            >
              {/* Collapse header */}
              <div className="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden border-blueGray-200">
                <div className="flex flex-wrap">
                  <div className="w-6/12">
                    <Link
                      className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
                      to="/"
                    >
                      Notus React
                    </Link>
                  </div>
                  <div className="flex justify-end w-6/12">
                    <button
                      type="button"
                      className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
                      onClick={() => setCollapseShow("hidden")}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              {/* Form */}
              <form className="mt-6 mb-4 md:hidden">
                <div className="pt-0 mb-3">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-12 px-3 py-2 text-base font-normal leading-snug bg-white border border-0 border-solid rounded shadow-none outline-none border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 focus:outline-none"
                  />
                </div>
              </form>

              <ul className="flex flex-col list-none md:flex-col md:min-w-full">
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/maps") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/maps"
                    style={
                      window.location.href.indexOf("/admin/maps") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-map-marked mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/maps") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Maps
                  </Link>
                </li>
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/smartplug/register") !==
                      -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/smartplug/register"
                    style={
                      window.location.href.indexOf("/smartplug/register") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-plug mr-3 text-sm " +
                        (window.location.href.indexOf("/smartplug/register") !==
                        -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Smart Plug Registration
                  </Link>
                </li>

                <li className="items-center">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/payment") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/payment"
                    style={
                      window.location.href.indexOf("/smartplug/qrscan") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-qrcode mr-2 text-sm " +
                        (window.location.href.indexOf("/smartplug/qrscan") !==
                        -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    QR Scan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
      {userLevel === "ROLE_EVOWNER" && (
        <nav className="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-xl md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden md:w-64">
          <div className="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap">
            {/* Toggler */}
            <button
              className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
              type="button"
              onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
            >
              <i className="fas fa-bars"></i>
            </button>
            {/* Brand */}
            <Link
              className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
              to="/"
            >
              <div className="sticky flex items-center justify-center">
                <img alt="ceb logo" className="w-20 h-20" src={ceb} />
              </div>
            </Link>
            {/* User */}
            <ul className="flex flex-wrap items-center list-none md:hidden">
              <li className="relative inline-block">
                <NotificationDropdown />
              </li>
              <li className="relative inline-block">
                <UserDropdown />
              </li>
            </ul>
            {/* Collapse */}
            <div
              className={
                "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
                collapseShow
              }
            >
              {/* Collapse header */}
              <div className="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden border-blueGray-200">
                <div className="flex flex-wrap">
                  <div className="w-6/12">
                    <Link
                      className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
                      to="/"
                    >
                      Notus React
                    </Link>
                  </div>
                  <div className="flex justify-end w-6/12">
                    <button
                      type="button"
                      className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
                      onClick={() => setCollapseShow("hidden")}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              {/* Form */}
              <form className="mt-6 mb-4 md:hidden">
                <div className="pt-0 mb-3">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-12 px-3 py-2 text-base font-normal leading-snug bg-white border border-0 border-solid rounded shadow-none outline-none border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 focus:outline-none"
                  />
                </div>
              </form>

              <ul className="flex flex-col list-none md:flex-col md:min-w-full">
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/maps") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/maps"
                    style={
                      window.location.href.indexOf("/admin/maps") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-map-marked mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/maps") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Maps
                  </Link>
                </li>
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/smartplug/register") !==
                      -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/smartplug/register"
                    style={
                      window.location.href.indexOf("/smartplug/register") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-plug mr-3 text-sm " +
                        (window.location.href.indexOf("/smartplug/register") !==
                        -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Charging EV
                  </Link>
                </li>

                <li className="items-center">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/payment") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/payment"
                    style={
                      window.location.href.indexOf("/admin/payment") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-credit-card mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/payment") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Payments
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
      {userLevel === "ROLE_ADMIN" && (
        <nav className="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-xl md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden md:w-64">
          <div className="flex flex-wrap items-center justify-between w-full px-0 mx-auto md:flex-col md:items-stretch md:min-h-full md:flex-nowrap">
            {/* Toggler */}
            <button
              className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
              type="button"
              onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
            >
              <i className="fas fa-bars"></i>
            </button>

            {/* Brand */}
            <Link
              className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
              to="/admin/dashboard"
            >
              <div className="sticky flex items-center justify-center">
                <img alt="ceb logo" className="w-20 h-20" src={ceb} />
              </div>
            </Link>

            {/* User (mobile only) */}
            <ul className="flex flex-wrap items-center list-none md:hidden">
              <li className="relative inline-block">
                <NotificationDropdown />
              </li>
              <li className="relative inline-block">
                <UserDropdown />
              </li>
            </ul>

            {/* Collapse */}
            <div
              className={
                "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
                collapseShow
              }
            >
              {/* Collapse header (mobile) */}
              <div className="block pb-4 mb-4 border-b border-solid md:min-w-full md:hidden border-blueGray-200">
                <div className="flex flex-wrap">
                  <div className="w-6/12">
                    <Link
                      className="inline-block p-4 px-0 mr-0 text-sm font-bold text-left uppercase md:block md:pb-2 text-blueGray-600 whitespace-nowrap"
                      to="/admin/dashboard"
                    >
                      CEB Admin
                    </Link>
                  </div>
                  <div className="flex justify-end w-6/12">
                    <button
                      type="button"
                      className="px-3 py-1 text-xl leading-none text-black bg-transparent border border-transparent border-solid rounded opacity-50 cursor-pointer md:hidden"
                      onClick={() => setCollapseShow("hidden")}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <ul className="flex flex-col list-none md:flex-col md:min-w-full">
                {/* Admin Dashboard */}
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/dashboard") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/dashboard"
                    style={
                      window.location.href.indexOf("/admin/dashboard") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-chart-line mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/dashboard") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Admin Dashboard
                  </Link>
                </li>

                {/* EV Owner Details */}
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/evowners") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/evowners"
                    style={
                      window.location.href.indexOf("/admin/evowners") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-car mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/evowners") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    EV Owner Details
                  </Link>
                </li>

                {/* Solar Owner Details */}
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/solarowners") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/solarowners"
                    style={
                      window.location.href.indexOf("/admin/solarowners") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-solar-panel mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/solarowners") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Solar Owner Details
                  </Link>
                </li>

                {/* Smart Plug Registration */}
                <li className="items-center mb-2">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/smartplug/register") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/smartplug/register"
                    style={
                      window.location.href.indexOf("/smartplug/register") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-plug mr-2 text-sm " +
                        (window.location.href.indexOf("/smartplug/register") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Smart Plug Registration
                  </Link>
                </li>

                {/* History (optional but good) */}
                <li className="items-center">
                  <Link
                    className={
                      "text-sm py-3 " +
                      (window.location.href.indexOf("/admin/billing-history") !== -1
                        ? ""
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/billing-history"
                    style={
                      window.location.href.indexOf("/admin/billing-history") !== -1
                        ? { color: "#b23200" }
                        : {}
                    }
                  >
                    <i
                      className={
                        "fas fa-history mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/billing-history") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Billing History
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

    </>
  );
}
