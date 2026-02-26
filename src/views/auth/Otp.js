import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ceb from "../../assets/img/ceb.png";
import { ToastContainer, toast } from "react-toastify";

export default function Login() {
  const [otp, setOtp] = useState("");
  const history = useHistory();

  const baseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8088/EV";

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const username = sessionStorage.getItem("pendingUser");
    if (!username) {
      toast.error("Session expired. Please register again.", {
        position: "top-right",
        autoClose: 3000,
      });
      history.push("/auth/register");
      return;
    }

    if (!otp) {
      toast.error("Please enter your OTP", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, otp }), // send OTP in request body
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
        throw new Error("Unexpected response format: " + data);
      }

      if (response.ok) {
        toast.success("OTP verified successfully!", {
          position: "top-right",
          autoClose: 2000,
        });

        sessionStorage.removeItem("pendingUser");

        setTimeout(() => {
          history.push("/auth/login"); // redirect to login page
        }, 6000);
      } else {
        toast.error(data.message || "OTP verification failed", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Error verifying OTP. Try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-4/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="flex justify-center items-center mt-8">
                <img alt="ceb logo" className="w-20 h-20" src={ceb} />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0 mt-2">
                <div className="text-blueGray-400 text-center text-sm">
                  Enter Verification Code
                </div>
                <form onSubmit={handleOtpSubmit}>
                  <div className="relative w-full mb-3 mt-4">
                    <label
                      className="block text-blueGray-600 text-sm mb-2"
                      htmlFor="otp"
                    >
                      We've sent a 6-digit code to your email.
                    </label>
                    <input
                      type="text"
                      id="otp"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <div className="text-center mt-6">
                    <button
                      className="text-white active:bg-red-200 text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      style={{ backgroundColor: "#7c0000" }}
                    >
                      Verify OTP
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex flex-wrap mt-6 relative">
              <div className="w-1/2">
                <Link to="/auth/forgot" className="text-blueGray-400 text-sm">
                  Forgot password?
                </Link>
              </div>
              <div className="w-1/2 text-right">
                <Link to="/auth/register" className="text-blueGray-400 text-sm">
                  Create new account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
