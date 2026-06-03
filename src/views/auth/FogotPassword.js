// import React from "react";

// export default function FogotPassword() {
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
//         {/* Decorative ambient circles */}
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             overflow: "hidden",
//             pointerEvents: "none",
//             zIndex: 0,
//           }}
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
//           {/* Top crimson accent strip */}
//           <div
//             style={{
//               height: "6px",
//               background:
//                 "linear-gradient(90deg, #7c0000, #c0392b, #7c0000)",
//             }}
//           />

//           <div style={{ padding: "40px 40px 36px" }}>
//             {/* Icon + heading */}
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 marginBottom: "32px",
//               }}
//             >
//               {/* Lock icon badge */}
//               <div
//                 style={{
//                   width: "72px",
//                   height: "72px",
//                   borderRadius: "50%",
//                   background: "linear-gradient(135deg, #7c0000, #c0392b)",
//                   boxShadow: "0 8px 24px rgba(124,0,0,0.4)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   marginBottom: "20px",
//                 }}
//               >
//                 <svg
//                   width="32"
//                   height="32"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="#fff"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                   <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                 </svg>
//               </div>

//               <h1
//                 style={{
//                   fontSize: "22px",
//                   fontWeight: "700",
//                   color: "#1a0000",
//                   letterSpacing: "0.02em",
//                   marginBottom: "8px",
//                   textAlign: "center",
//                 }}
//               >
//                 Forgot Password?
//               </h1>
//               <p
//                 style={{
//                   fontSize: "13px",
//                   color: "#888",
//                   textAlign: "center",
//                   lineHeight: "1.6",
//                   maxWidth: "300px",
//                 }}
//               >
//                 Enter the 6-digit verification code we sent to your email
//                 address.
//               </p>
//             </div>

//             {/* OTP input info banner */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//                 background: "#fff8f8",
//                 border: "1.5px solid #fecaca",
//                 borderRadius: "10px",
//                 padding: "12px 14px",
//                 marginBottom: "24px",
//               }}
//             >
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#7c0000"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 style={{ flexShrink: 0 }}
//               >
//                 <circle cx="12" cy="12" r="10" />
//                 <line x1="12" y1="8" x2="12" y2="12" />
//                 <line x1="12" y1="16" x2="12.01" y2="16" />
//               </svg>
//               <span style={{ fontSize: "12px", color: "#7c0000", fontWeight: "500" }}>
//                 Check your inbox — the code expires in 10 minutes.
//               </span>
//             </div>

//             {/* Form */}
//             <form>
//               {/* OTP field */}
//               <div style={{ marginBottom: "24px" }}>
//                 <label
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
//                   Verification Code
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
//                     <svg
//                       width="16"
//                       height="16"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                     </svg>
//                   </span>
//                   <input
//                     type="text"
//                     maxLength="6"
//                     // value={otp}
//                     // onChange={(e) => setOtp(e.target.value)}
//                     placeholder="Enter 6-digit OTP"
//                     style={{
//                       width: "100%",
//                       padding: "12px 14px 12px 42px",
//                       fontSize: "18px",
//                       fontWeight: "600",
//                       letterSpacing: "0.3em",
//                       color: "#1a0000",
//                       background: "#f8f8f8",
//                       border: "1.5px solid #e8e8e8",
//                       borderRadius: "10px",
//                       outline: "none",
//                       transition: "border-color 0.2s, box-shadow 0.2s",
//                       boxSizing: "border-box",
//                       textAlign: "center",
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = "#7c0000";
//                       e.target.style.boxShadow =
//                         "0 0 0 3px rgba(124,0,0,0.1)";
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

//               {/* Submit button */}
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
//                   e.target.style.boxShadow =
//                     "0 10px 28px rgba(124,0,0,0.5)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.transform = "translateY(0)";
//                   e.target.style.boxShadow =
//                     "0 6px 20px rgba(124,0,0,0.4)";
//                 }}
//               >
//                 VERIFY OTP
//               </button>
//             </form>

//             {/* Back to login */}
//             <div
//               style={{
//                 borderTop: "1px solid #f0f0f0",
//                 paddingTop: "20px",
//                 marginTop: "24px",
//                 textAlign: "center",
//               }}
//             >
//               <a
//                 href="/auth/login"
//                 style={{
//                   fontSize: "13px",
//                   color: "#7c0000",
//                   textDecoration: "none",
//                   fontWeight: "500",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "6px",
//                 }}
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <line x1="19" y1="12" x2="5" y2="12" />
//                   <polyline points="12 19 5 12 12 5" />
//                 </svg>
//                 Back to Sign In
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



import React from "react";

export default function FogotPassword() {
  return (
    <>
      {/* Full-page background */}
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{
          background: "#f5f5f5", // Simple neutral background
        }}
      >
        {/* Decorative ambient circles - removed */}
        
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
            {/* Icon + heading */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              {/* Lock icon badge */}
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c0000, #c0392b)",
                  boxShadow: "0 8px 24px rgba(124,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
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
                Forgot Password?
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
                Enter the 6-digit verification code we sent to your email
                address.
              </p>
            </div>

            {/* OTP input info banner */}
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
              <span style={{ fontSize: "12px", color: "#7c0000", fontWeight: "500" }}>
                Check your inbox — the code expires in 10 minutes.
              </span>
            </div>

            {/* Form */}
            <form>
              {/* OTP field */}
              <div style={{ marginBottom: "24px" }}>
                <label
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
                    maxLength="6"
                    // value={otp}
                    // onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      fontSize: "18px",
                      fontWeight: "600",
                      letterSpacing: "0.3em",
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
              </div>

              {/* Submit button */}
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

            {/* Back to login */}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: "20px",
                marginTop: "24px",
                textAlign: "center",
              }}
            >
              <a
                href="/auth/login"
                style={{
                  fontSize: "13px",
                  color: "#7c0000",
                  textDecoration: "none",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}