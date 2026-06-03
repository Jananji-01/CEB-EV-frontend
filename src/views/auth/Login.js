// import React, { useState } from "react";
// import { Link, useHistory } from "react-router-dom";
// import EDL from "../../assets/img/EDL.jpeg";
// import { ToastContainer, toast } from "react-toastify";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const history = useHistory();

//   const baseUrl =
//     process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8088/EV";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${baseUrl}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const contentType = response.headers.get("content-type");
//       let data;
//       if (contentType && contentType.indexOf("application/json") !== -1) {
//         data = await response.json();
//       } else {
//         data = await response.text();
//         throw new Error("Unexpected response format: " + data);
//       }

//       if (response.ok) {
//         console.log("Login successful:", data);
//         console.log("ROLES FROM BACKEND:", data.roles);

//         sessionStorage.setItem("token", data.token);

//         if (data.username) sessionStorage.setItem("username", data.username);
//         if (data.roles) sessionStorage.setItem("Roles", data.roles[0]);
//         const accNo = data.eAccountNo ?? data.eaccountNo ?? "";
//         sessionStorage.setItem("eAccountNo", accNo);

//         sessionStorage.setItem("sessionStart", Date.now().toString());

//         const Roles = data.roles[0];
//         sessionStorage.setItem("userLevel", Roles);
//         console.log("Session storage saved:", {
//           token: sessionStorage.getItem("token"),
//           username: sessionStorage.getItem("username"),
//           userLevel: sessionStorage.getItem("userLevel"),
//           eAccountNo: sessionStorage.getItem("eAccountNo"),
//           sessionStart: sessionStorage.getItem("sessionStart"),
//         });

//         const role = (data.roles?.[0] || "").toUpperCase();
//         console.log("FIRST ROLE:", role);

//         if (role.includes("ADMIN")) {
//           history.push("/admin/dashboard");
//         } else if (role.includes("EVOWNER")) {
//           history.push("/admin/evdashboard");
//         } else if (role.includes("SOLAROWNER")) {
//           history.push("/admin/dashboardsolar");
//         } else {
//           console.log("Unknown role:", role);
//           toast.error("Unknown role: " + role);
//         }

//         toast.success("Login successful!", {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       } else {
//         alert(
//           "If you don't have an account, please register. If registered, verify your account. Otherwise, check your username and password."
//         );
//         console.error("Login failed:", data);
//       }
//     } catch (error) {
//       console.error("Error:", error.message || error);
//     }
//   };

//   return (
//     <>
//       {/* Full-page background */}
//       <div
//         className="min-h-screen w-full flex items-center justify-center px-4"
//         style={{
//           background:
//             "linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6b0000 70%, #1a0000 100%)",
//         }}
//       >
//         {/* Decorative circles */}
//         <div
//           className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
//           style={{ zIndex: 0 }}
//         >
//           <div
//             style={{
//               position: "absolute",
//               top: "-120px",
//               right: "-120px",
//               width: "400px",
//               height: "400px",
//               borderRadius: "50%",
//               background:
//                 "radial-gradient(circle, rgba(124,0,0,0.35) 0%, transparent 70%)",
//             }}
//           />
//           <div
//             style={{
//               position: "absolute",
//               bottom: "-80px",
//               left: "-80px",
//               width: "300px",
//               height: "300px",
//               borderRadius: "50%",
//               background:
//                 "radial-gradient(circle, rgba(160,0,0,0.25) 0%, transparent 70%)",
//             }}
//           />
//         </div>

//         {/* Card */}
//         <div
//           className="w-full relative"
//           style={{
//             maxWidth: "420px",
//             zIndex: 1,
//             background: "rgba(255,255,255,0.97)",
//             borderRadius: "20px",
//             boxShadow:
//               "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
//             overflow: "hidden",
//           }}
//         >
//           {/* Top crimson strip */}
//           <div style={{ height: "6px", background: "linear-gradient(90deg, #7c0000, #c0392b, #7c0000)" }} />

//           <div className="px-10 py-10">
//             {/* Logo */}
//             <div className="flex flex-col items-center mb-8">
//               <div
//                 style={{
//                   width: "88px",
//                   height: "88px",
//                   borderRadius: "50%",
//                   padding: "4px",
//                   background: "linear-gradient(135deg, #7c0000, #c0392b)",
//                   boxShadow: "0 8px 24px rgba(124,0,0,0.4)",
//                   marginBottom: "16px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     borderRadius: "50%",
//                     background: "#fff",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     overflow: "hidden",
//                   }}
//                 >
//                   <img
//                     alt="EDL logo"
//                     src={EDL}
//                     style={{ width: "72px", height: "72px", objectFit: "contain" }}
//                   />
//                 </div>
//               </div>
//               <h1
//                 style={{
//                   fontSize: "22px",
//                   fontWeight: "700",
//                   color: "#1a0000",
//                   letterSpacing: "0.02em",
//                   marginBottom: "2px",
//                 }}
//               >
//                 Welcome Back
//               </h1>
//               <p style={{ fontSize: "13px", color: "#888", fontWeight: "400" }}>
//                 Sign in to your account
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit}>
//               {/* Username */}
//               <div className="mb-5">
//                 <label
//                   htmlFor="username"
//                   style={{
//                     display: "block",
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     color: "#555",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.08em",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   Username
//                 </label>
//                 <div style={{ position: "relative" }}>
//                   <span
//                     style={{
//                       position: "absolute",
//                       left: "14px",
//                       top: "50%",
//                       transform: "translateY(-50%)",
//                       color: "#aaa",
//                       fontSize: "16px",
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//                       <circle cx="12" cy="7" r="4"/>
//                     </svg>
//                   </span>
//                   <input
//                     type="text"
//                     id="username"
//                     placeholder="Enter your username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     style={{
//                       width: "100%",
//                       padding: "12px 14px 12px 42px",
//                       fontSize: "14px",
//                       color: "#222",
//                       background: "#f8f8f8",
//                       border: "1.5px solid #e8e8e8",
//                       borderRadius: "10px",
//                       outline: "none",
//                       transition: "border-color 0.2s, box-shadow 0.2s",
//                       boxSizing: "border-box",
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = "#7c0000";
//                       e.target.style.boxShadow = "0 0 0 3px rgba(124,0,0,0.1)";
//                       e.target.style.background = "#fff";
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = "#e8e8e8";
//                       e.target.style.boxShadow = "none";
//                       e.target.style.background = "#f8f8f8";
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div className="mb-5">
//                 <label
//                   htmlFor="password"
//                   style={{
//                     display: "block",
//                     fontSize: "12px",
//                     fontWeight: "600",
//                     color: "#555",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.08em",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   Password
//                 </label>
//                 <div style={{ position: "relative" }}>
//                   <span
//                     style={{
//                       position: "absolute",
//                       left: "14px",
//                       top: "50%",
//                       transform: "translateY(-50%)",
//                       color: "#aaa",
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
//                       <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//                     </svg>
//                   </span>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     style={{
//                       width: "100%",
//                       padding: "12px 42px 12px 42px",
//                       fontSize: "14px",
//                       color: "#222",
//                       background: "#f8f8f8",
//                       border: "1.5px solid #e8e8e8",
//                       borderRadius: "10px",
//                       outline: "none",
//                       transition: "border-color 0.2s, box-shadow 0.2s",
//                       boxSizing: "border-box",
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = "#7c0000";
//                       e.target.style.boxShadow = "0 0 0 3px rgba(124,0,0,0.1)";
//                       e.target.style.background = "#fff";
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = "#e8e8e8";
//                       e.target.style.boxShadow = "none";
//                       e.target.style.background = "#f8f8f8";
//                     }}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={{
//                       position: "absolute",
//                       right: "14px",
//                       top: "50%",
//                       transform: "translateY(-50%)",
//                       background: "none",
//                       border: "none",
//                       cursor: "pointer",
//                       color: "#aaa",
//                       padding: "0",
//                     }}
//                   >
//                     {showPassword ? (
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
//                         <line x1="1" y1="1" x2="23" y2="23"/>
//                       </svg>
//                     ) : (
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//                         <circle cx="12" cy="12" r="3"/>
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember me */}
//               <div className="flex items-center mb-6">
//                 <input
//                   id="customCheckLogin"
//                   type="checkbox"
//                   style={{
//                     width: "16px",
//                     height: "16px",
//                     accentColor: "#7c0000",
//                     cursor: "pointer",
//                   }}
//                 />
//                 <label
//                   htmlFor="customCheckLogin"
//                   style={{
//                     marginLeft: "8px",
//                     fontSize: "13px",
//                     color: "#666",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Remember me
//                 </label>
//               </div>

//               {/* Sign In Button */}
//               <button
//                 type="submit"
//                 style={{
//                   width: "100%",
//                   padding: "13px",
//                   background: "linear-gradient(135deg, #7c0000, #a00000)",
//                   color: "#fff",
//                   fontWeight: "700",
//                   fontSize: "14px",
//                   letterSpacing: "0.06em",
//                   border: "none",
//                   borderRadius: "10px",
//                   cursor: "pointer",
//                   boxShadow: "0 6px 20px rgba(124,0,0,0.4)",
//                   transition: "transform 0.15s, box-shadow 0.15s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.transform = "translateY(-1px)";
//                   e.target.style.boxShadow = "0 10px 28px rgba(124,0,0,0.5)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.transform = "translateY(0)";
//                   e.target.style.boxShadow = "0 6px 20px rgba(124,0,0,0.4)";
//                 }}
//               >
//                 SIGN IN
//               </button>
//             </form>


// {/* Footer Info */}
// <div
//   style={{
//     textAlign: "center",
//     marginTop: "18px",
//     fontSize: "12px",
//     color: "#888",
//     lineHeight: "1.6",
//   }}
// >
//   Utility Solutions & Automation Branch, EDL.<br />
//   All Rights Reserved &nbsp; Version 1.0.0
// </div>




//             {/* Footer links */}
//             <div
//               className="flex justify-between mt-6"
//               style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}
//             >
//               <Link
//                 to="/auth/forgot"
//                 style={{
//                   fontSize: "13px",
//                   color: "#7c0000",
//                   textDecoration: "none",
//                   fontWeight: "500",
//                 }}
//               >
//                 Forgot password?
//               </Link>
//               <Link
//                 to="/auth/register"
//                 style={{
//                   fontSize: "13px",
//                   color: "#7c0000",
//                   textDecoration: "none",
//                   fontWeight: "500",
//                 }}
//               >
//                 Create account →
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer />
//     </>
//   );
// }



import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import EDL from "../../assets/img/EDL.jpeg";
import { ToastContainer, toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        sessionStorage.setItem("token", data.token);

        if (data.username) sessionStorage.setItem("username", data.username);
        if (data.roles) sessionStorage.setItem("Roles", data.roles[0]);
        const accNo = data.eAccountNo ?? data.eaccountNo ?? "";
        sessionStorage.setItem("eAccountNo", accNo);

        sessionStorage.setItem("sessionStart", Date.now().toString());

        const Roles = data.roles[0];
        sessionStorage.setItem("userLevel", Roles);
        console.log("Session storage saved:", {
          token: sessionStorage.getItem("token"),
          username: sessionStorage.getItem("username"),
          userLevel: sessionStorage.getItem("userLevel"),
          eAccountNo: sessionStorage.getItem("eAccountNo"),
          sessionStart: sessionStorage.getItem("sessionStart"),
        });

        const role = (data.roles?.[0] || "").toUpperCase();
        console.log("FIRST ROLE:", role);

        if (role.includes("ADMIN")) {
          history.push("/admin/dashboard");
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
      {/* Full-page background - changed to white */}
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{
          background: "#ffffff",
        }}
      >
        {/* Decorative circles removed for clean white background */}

        {/* Card */}
        <div
          className="w-full relative"
          style={{
            maxWidth: "420px",
            zIndex: 1,
            background: "rgba(255,255,255,0.97)",
            borderRadius: "20px",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Top crimson strip - kept as original */}
          <div style={{ height: "6px", background: "linear-gradient(90deg, #7c0000, #c0392b, #7c0000)" }} />

          <div className="px-10 py-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "linear-gradient(135deg, #7c0000, #c0392b)",
                  boxShadow: "0 8px 24px rgba(124,0,0,0.2)",
                  marginBottom: "16px",
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
                    style={{ width: "72px", height: "72px", objectFit: "contain" }}
                  />
                </div>
              </div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1a0000",
                  letterSpacing: "0.02em",
                  marginBottom: "2px",
                }}
              >
                Welcome Back
              </h1>
              <p style={{ fontSize: "13px", color: "#888", fontWeight: "400" }}>
                Sign in to your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-5">
                <label
                  htmlFor="username"
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
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#aaa",
                      fontSize: "16px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      fontSize: "14px",
                      color: "#222",
                      background: "#f8f8f8",
                      border: "1.5px solid #e8e8e8",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                    }}
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
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label
                  htmlFor="password"
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
                  Password
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 42px",
                      fontSize: "14px",
                      color: "#222",
                      background: "#f8f8f8",
                      border: "1.5px solid #e8e8e8",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                    }}
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#aaa",
                      padding: "0",
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center mb-6">
                <input
                  id="customCheckLogin"
                  type="checkbox"
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#7c0000",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="customCheckLogin"
                  style={{
                    marginLeft: "8px",
                    fontSize: "13px",
                    color: "#666",
                    cursor: "pointer",
                  }}
                >
                  Remember me
                </label>
              </div>

              {/* Sign In Button */}
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
                  boxShadow: "0 6px 20px rgba(124,0,0,0.3)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 10px 28px rgba(124,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(124,0,0,0.3)";
                }}
              >
                SIGN IN
              </button>
            </form>

            {/* Footer Info */}
            <div
              style={{
                textAlign: "center",
                marginTop: "18px",
                fontSize: "12px",
                color: "#888",
                lineHeight: "1.6",
              }}
            >
              Utility Solutions & Automation Branch, EDL.<br />
              All Rights Reserved &nbsp; Version 1.0.0
            </div>

            {/* Footer links */}
            <div
              className="flex justify-between mt-6"
              style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}
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