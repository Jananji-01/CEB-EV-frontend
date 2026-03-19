import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom/cjs/react-router-dom";
import ceb from "../../assets/img/ceb.png";

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
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088/EV";

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
                  Sign Up With Credentials
                </div>
                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="relative w-full mb-3">
                    {/* Role */}
                    <div className="relative w-full mb-3">
                      <label className="block text-blueGray-600 text-sm mb-2">
                        Select Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="EVOWNER">Vehicle Owner</option>
                        <option value="SOLAROWNER">SmartPlug Owner</option>
                      </select>
                    </div>

                    <label className="block text-blueGray-600 text-sm mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="User Name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="relative w-full mb-3">
                    <label className="block text-blueGray-600 text-sm mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* E-account number */}
                  <div className="relative w-full mb-3">
                    <label className="block text-blueGray-600 text-sm mb-2">
                      Electricity Account Number
                    </label>
                    <input
                      type="text"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Electricity Account Number"
                      value={e_account_number}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) setEaccountNo(value);
                      }}
                    />
                    {e_account_number.length < 10 &&
                      e_account_number.length > 0 && (
                        <p className="text-red-500 text-xs mt-1">
                          10 digit account number required. eg:1234567890
                        </p>
                      )}
                  </div>

                  {/* Password */}
                  <div className="relative w-full mb-3">
                    <label className="block text-blueGray-600 text-sm mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {!validatePassword(password) && password.length > 0 && (
                      <p className="text-red-500 text-xs mt-1">
                        Password must be at least 6 characters, include one
                        uppercase letter, one lowercase letter, one number, and
                        one special character.
                      </p>
                    )}
                  </div>

                  {/* EVOWNER fields */}
                  {role === "EVOWNER" && (
                    <>
                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-sm mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="0771234567"
                          maxLength={10}
                          value={mobile_number}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-sm mb-2">
                          No. of Vehicles
                        </label>
                        <input
                          type="number"
                          className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          min={1}
                          value={no_of_vehicles_owned}
                          onChange={(e) =>
                            setNoOfVehiclesOwned(parseInt(e.target.value))
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* SOLAROWNER fields */}
                  {role === "SOLAROWNER" && (
                    <>
                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-sm mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="0771234567"
                          maxLength={10}
                          value={mobile_number}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                      </div>
                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-sm mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full mb-3">
                        <label className="block text-blueGray-600 text-sm mb-2">
                          Solar Capacity (kW)
                        </label>
                        <input
                          type="number"
                          className="border-0 px-3 h-0.5 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          min={0}
                          value={solarCapacity}
                          onChange={(e) =>
                            setSolarCapacity(parseFloat(e.target.value))
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="text-center mt-6">
                    <button
                      className="text-white active:bg-red-600 text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                      style={{ backgroundColor: "#7c0000" }}
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex flex-wrap mt-6 justify-center relative">
              <div className="w-1/2 text-blueGray-400 text-sm">
                Have an account?{" "}
                <Link to="/auth/login" className="text-blueGray-600 text-sm">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
