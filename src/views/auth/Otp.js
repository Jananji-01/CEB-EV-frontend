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
        body: JSON.stringify({ username, otp }),
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
          history.push("/auth/login");
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
      {/* Full-page background */}
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6b0000 70%, #1a0000 100%)",
        }}
      >
        {/* Decorative ambient circles */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-120px",
              right: "-120px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,0,0,0.35) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              left: "-80px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(160,0,0,0.25) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Card */}
        <div
          className="w-full relative"
          style={{
            maxWidth: "420px",
            zIndex: 1,
            background: "rgba(255,255,255,0.97)",
            borderRadius: "20px",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Top crimson accent strip */}
          <div
            style={{
              height: "6px",
              background:
                "linear-gradient(90deg, #7c0000, #c0392b, #7c0000)",
            }}
          />

          <div style={{ padding: "40px 40px 36px" }}>
            {/* Logo + heading */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "linear-gradient(135deg, #7c0000, #c0392b)",
                  boxShadow: "0 8px 24px rgba(124,0,0,0.4)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    alt="ceb logo"
                    src={ceb}
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1a0000",
                  letterSpacing: "0.02em",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                Verify Your Account
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  textAlign: "center",
                  lineHeight: "1.6",
                  maxWidth: "300px",
                }}
              >
                We've sent a 6-digit code to your email address. Enter it
                below to activate your account.
              </p>
            </div>

            {/* Info banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#fff8f8",
                border: "1.5px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "24px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7c0000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span
                style={{ fontSize: "12px", color: "#7c0000", fontWeight: "500" }}
              >
                The code expires in 10 minutes. Check your spam folder if you
                don't see it.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleOtpSubmit}>
              {/* OTP field */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="otp"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "8px",
                  }}
                >
                  Verification Code
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#aaa",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="otp"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "14px 14px 14px 42px",
                      fontSize: "22px",
                      fontWeight: "700",
                      letterSpacing: "0.4em",
                      color: "#1a0000",
                      background: "#f8f8f8",
                      border: "1.5px solid #e8e8e8",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#7c0000";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(124,0,0,0.1)";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e8e8e8";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "#f8f8f8";
                    }}
                  />
                </div>

                {/* Character counter */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: otp.length === 6 ? "#16a34a" : "#aaa",
                      fontWeight: "500",
                      transition: "color 0.2s",
                    }}
                  >
                    {otp.length}/6
                  </span>
                </div>
              </div>

              {/* Verify button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "linear-gradient(135deg, #7c0000, #a00000)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "14px",
                  letterSpacing: "0.06em",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(124,0,0,0.4)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow =
                    "0 10px 28px rgba(124,0,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 6px 20px rgba(124,0,0,0.4)";
                }}
              >
                VERIFY OTP
              </button>
            </form>

            {/* Footer links */}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: "20px",
                marginTop: "24px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link
                to="/auth/forgot"
                style={{
                  fontSize: "13px",
                  color: "#7c0000",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Forgot password?
              </Link>
              <Link
                to="/auth/register"
                style={{
                  fontSize: "13px",
                  color: "#7c0000",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Create account →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}