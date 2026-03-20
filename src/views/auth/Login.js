import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ceb from "../../assets/img/ceb.png";
import { ToastContainer, toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState(""); // changed from email
  const [password, setPassword] = useState("");
  const history = useHistory();

  const baseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8088/EV";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // match backend sample body
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        data = await response.text();
        throw new Error("Unexpected response format: " + data);
      }

      if (response.ok) {
        console.log("Login successful:", data);
        console.log("ROLES FROM BACKEND:", data.roles);

        // Store JWT token
        sessionStorage.setItem("token", data.token);

        // Store user details if backend sends them
        if (data.username) sessionStorage.setItem("username", data.username);
        if (data.roles) sessionStorage.setItem("Roles", data.roles[0]);
        const accNo = data.eAccountNo ?? data.eaccountNo ?? "";
        sessionStorage.setItem("eAccountNo", accNo);

        sessionStorage.setItem("sessionStart", Date.now().toString());

        const Roles = data.roles[0]; // remove prefix
        sessionStorage.setItem("userLevel", Roles);
        console.log("Session storage saved:", {
          token: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
          userLevel: sessionStorage.getItem("userLevel"),
          eAccountNo: sessionStorage.getItem("eAccountNo"),
          sessionStart: sessionStorage.getItem("sessionStart"),
        });

        // Redirect based on user level
        const role = (data.roles?.[0] || "").toUpperCase();
        console.log("FIRST ROLE:", role);


        if (role.includes("ADMIN")) {
          history.push("/admin/dashboard"); // change if your real admin route is different
        } else if (role.includes("EVOWNER")) {
          history.push("/admin/evdashboard");
        } else if (role.includes("SOLAROWNER")) {
          history.push("/admin/dashboardsolar");
        } else {
          console.log("Unknown role:", role);
          toast.error("Unknown role: " + role);
        }


        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        alert(
          "If you don't have an account, please register. If registered, verify your account. Otherwise, check your username and password."
        );
        console.error("Login failed:", data);
      }
    } catch (error) {
      console.error("Error:", error.message || error);
    }
  };

  return (
    <>
      <div className="container h-full px-4 mx-auto">
        <div className="flex items-center content-center justify-center h-full">
          <div className="w-full px-4 lg:w-4/12">
            <div className="relative flex flex-col w-full min-w-0 mb-6 break-words border-0 rounded-lg shadow-lg bg-blueGray-200">
              <div className="flex items-center justify-center mt-8">
                <img alt="ceb logo" className="w-20 h-20" src={ceb} />
              </div>
              <div className="flex-auto px-4 py-10 pt-0 mt-2 lg:px-10">
                <div className="text-sm text-center text-blueGray-400">
                  Sign In With Credentials
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3">
                    <label
                      className="block mb-2 text-sm text-blueGray-600"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block mb-2 text-sm text-blueGray-600"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="customCheckLogin"
                        type="checkbox"
                        className="w-5 h-5 ml-1 transition-all duration-150 ease-linear border-0 rounded form-checkbox text-blueGray-700"
                      />
                      <span className="ml-2 text-sm text-blueGray-600">
                        Remember Me
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      className="w-full px-6 py-2 mb-1 mr-1 text-sm text-white transition-all duration-150 ease-linear rounded shadow outline-none active:bg-red-200 hover:shadow-lg focus:outline-none"
                      type="submit"
                      style={{ backgroundColor: "#7c0000" }}
                    >
                      Sign In
                    </button>
                  </div>
                  <div className="text-xs text-blueGray-500 font-semibold py-1 text-center">
                    © {new Date().getFullYear()}{" "}
                    <a
                    // href="https://www.creative-tim.com?ref=nr-footer-admin"
                      className="text-blueGray-500 hover:text-blueGray-700 text-xs font-semibold py-1"
                    >
                    {/* Information Technology Branch Ceylon Electricity Board */}
                      Utility Solutions & Automation Branch, EDL.<br /> 
                      All Rights Reserved  Version 1.0.0
                    </a>
                </div>
                </form>
              </div>
            </div>
            <div className="relative flex flex-wrap mt-6">
              <div className="w-1/2">
                <Link to="/auth/forgot" className="text-sm text-blueGray-400">
                  Forgot password?
                </Link>
              </div>
              <div className="w-1/2 text-right">
                <Link to="/auth/register" className="text-sm text-blueGray-400">
                  Create new account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
