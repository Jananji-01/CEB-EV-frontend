import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom/cjs/react-router-dom";
import EDL from "../../assets/img/EDL.jpeg";

// Reusable styled input component
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: "600",
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  fontSize: "14px",
  color: "#222",
  background: "#f8f8f8",
  border: "1.5px solid #e8e8e8",
  borderRadius: "10px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

function StyledInput(props) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={(e) => {
        e.target.style.borderColor = "#7c0000";
        e.target.style.boxShadow = "0 0 0 3px rgba(124,0,0,0.1)";
        e.target.style.background = "#fff";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#e8e8e8";
        e.target.style.boxShadow = "none";
        e.target.style.background = "#f8f8f8";
      }}
    />
  );
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [e_account_number, setEaccountNo] = useState("");
  const [role, setRole] = useState("USER");
  const [mobile_number, setMobileNumber] = useState("");
  const [no_of_vehicles_owned, setNoOfVehiclesOwned] = useState(1);
  const [address, setAddress] = useState("");
  const [solarCapacity, setSolarCapacity] = useState("");

  const history = useHistory();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert(
        "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          e_account_number,
          password,
          role,
          mobile_number:
            role === "EVOWNER" || role === "SOLAROWNER"
              ? mobile_number
              : undefined,
          no_of_vehicles_owned:
            role === "EVOWNER" ? no_of_vehicles_owned : undefined,
          address: role === "SOLAROWNER" ? address : undefined,
          solarCapacity: role === "SOLAROWNER" ? solarCapacity : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "Registration failed");
        history.push("/auth/login");
        return;
      }

      const data = await response.json();
      console.log("Registration successful", data);
      alert("Registration successful. Please verify OTP.");
      sessionStorage.setItem("pendingUser", username);
      sessionStorage.setItem("pendingRole", role);
      history.push("/auth/otp");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  // Role badge colour helper
  const roleColors = {
    USER: "#2563eb",
    ADMIN: "#7c0000",
    EVOWNER: "#065f46",
    SOLAROWNER: "#92400e",
  };

  return (
    <>
      {/* Full-page background */}
      <div
        className="min-h-screen w-full flex items-center justify-center px-4 py-8"
        style={{
          background:
            "linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6b0000 70%, #1a0000 100%)",
        }}
      >
        {/* Decorative circles */}
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
            maxWidth: "460px",
            zIndex: 1,
            background: "rgba(255,255,255,0.97)",
            borderRadius: "20px",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Top crimson strip */}
          <div
            style={{
              height: "6px",
              background: "linear-gradient(90deg, #7c0000, #c0392b, #7c0000)",
            }}
          />

          <div className="px-10 py-8">
            {/* Logo + title */}
            <div className="flex flex-col items-center mb-7">
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "linear-gradient(135deg, #7c0000, #c0392b)",
                  boxShadow: "0 8px 24px rgba(124,0,0,0.4)",
                  marginBottom: "14px",
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
                    alt="EDL logo"
                    src={EDL}
                    style={{
                      width: "66px",
                      height: "66px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a0000",
                  letterSpacing: "0.02em",
                  marginBottom: "2px",
                }}
              >
                Create Account
              </h1>
              <p style={{ fontSize: "13px", color: "#888", fontWeight: "400" }}>
                Sign up with your credentials
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Role selector */}
              <FormField label="Account Type">
                <div style={{ position: "relative" }}>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      paddingRight: "36px",
                      fontWeight: "600",
                      color: roleColors[role] || "#222",
                      cursor: "pointer",
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
                      e.target.style.color = roleColors[role] || "#222";
                    }}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EVOWNER">Vehicle Owner</option>
                    <option value="SOLAROWNER">SmartPlug Owner</option>
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#aaa",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
              </FormField>

              {/* Username */}
              <FormField label="Username">
                <StyledInput
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormField>

              {/* Email */}
              <FormField label="Email Address">
                <StyledInput
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              {/* Electricity Account Number */}
              <FormField label="Electricity Account Number">
                <StyledInput
                  type="text"
                  placeholder="10-digit account number"
                  value={e_account_number}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setEaccountNo(value);
                  }}
                />
                {e_account_number.length < 10 &&
                  e_account_number.length > 0 && (
                    <p
                      style={{
                        color: "#e53e3e",
                        fontSize: "11px",
                        marginTop: "5px",
                      }}
                    >
                      10 digit account number required. eg: 1234567890
                    </p>
                  )}
              </FormField>

              {/* Password */}
              <FormField label="Password">
                <StyledInput
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {!validatePassword(password) && password.length > 0 && (
                  <p
                    style={{
                      color: "#e53e3e",
                      fontSize: "11px",
                      marginTop: "5px",
                      lineHeight: "1.5",
                    }}
                  >
                    Must be 6+ characters with uppercase, lowercase, number &
                    special character.
                  </p>
                )}
              </FormField>

              {/* EVOWNER fields */}
              {role === "EVOWNER" && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "#f0fdf4",
                    border: "1.5px solid #bbf7d0",
                    borderRadius: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#065f46",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "12px",
                    }}
                  >
                    Vehicle Owner Details
                  </p>
                  <FormField label="Mobile Number">
                    <StyledInput
                      type="text"
                      placeholder="0771234567"
                      maxLength={10}
                      value={mobile_number}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Number of Vehicles">
                    <StyledInput
                      type="number"
                      min={1}
                      value={no_of_vehicles_owned}
                      onChange={(e) =>
                        setNoOfVehiclesOwned(parseInt(e.target.value))
                      }
                    />
                  </FormField>
                </div>
              )}

              {/* SOLAROWNER fields */}
              {role === "SOLAROWNER" && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "12px",
                    }}
                  >
                    SmartPlug Owner Details
                  </p>
                  <FormField label="Mobile Number">
                    <StyledInput
                      type="text"
                      placeholder="0771234567"
                      maxLength={10}
                      value={mobile_number}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Address">
                    <StyledInput
                      type="text"
                      placeholder="Your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Solar Capacity (kW)">
                    <StyledInput
                      type="number"
                      min={0}
                      value={solarCapacity}
                      onChange={(e) =>
                        setSolarCapacity(parseFloat(e.target.value))
                      }
                    />
                  </FormField>
                </div>
              )}

              {/* Submit */}
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
                  marginTop: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 10px 28px rgba(124,0,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(124,0,0,0.4)";
                }}
              >
                CREATE ACCOUNT
              </button>
            </form>

            {/* Footer */}
            <div
              className="flex justify-center mt-5"
              style={{ borderTop: "1px solid #f0f0f0", paddingTop: "18px" }}
            >
              <span style={{ fontSize: "13px", color: "#888" }}>
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  style={{
                    color: "#7c0000",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Sign In →
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}