// // import React from "react";

// // // components
// // import MapExample from "components/Maps/MapExample.js";
// // // import CardLineChart from "components/Cards/CardLineChart.js";
// // import CardBarChart from "components/Cards/CardBarChart.js";
// // import CardPageVisits from "components/Cards/CardPageVisits.js";
// // import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";
// // import CardLineChart from "components/Cards/CardLineChart.js";

// // export default function Dashboard() {
// //   const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
// //       <div className="container px-4 py-8 mx-auto">
// //         {/* Header with Title */}
// //         <div className="mb-8">
// //           <h1 style={{
// //                   fontSize: "28px",
// //                   fontWeight: "700",
// //                   background: BASE_GRADIENT,
// //                   WebkitBackgroundClip: "text",
// //                   WebkitTextFillColor: "transparent",
// //                   backgroundClip: "text",
// //                   marginBottom: "6px",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   gap: "12px",
// //                 }}>
// //             <i className="text-red-500 fas fa-chart-line" style={{ background: BASE_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} ></i>
// //             Admin Dashboard
// //           </h1>
// //           <p className="text-gray-600">
// //             <i className="fas fa-chart-pie" style={{ marginRight: "6px", fontSize: "12px" }}></i>
// //             Overview of analytics and user statistics
// //           </p>
// //         </div>
// //          <button>Sessions</button>

// //         <div className="flex flex-wrap">
// //           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
// //             <MapExample/>
// //           </div>
// //           <div className="w-full px-4 xl:w-4/12">
// //             <CardBarChart />
// //           </div>
// //         </div>
// //         <div className="flex flex-wrap mt-4">
// //           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
// //             <CardPageVisits />
// //           </div>
// //           <div className="w-full px-4 xl:w-4/12">
// //             <CardSocialTraffic />
// //           </div>
// //           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
// //             <CardLineChart />
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import React from "react";

// // components
// import MapExample from "components/Maps/MapExample.js";
// // import CardLineChart from "components/Cards/CardLineChart.js";
// import CardBarChart from "components/Cards/CardBarChart.js";
// import CardPageVisits from "components/Cards/CardPageVisits.js";
// import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";
// import CardLineChart from "components/Cards/CardLineChart.js";
// import SessionManagement from "../components/SessionManagement/SessionManagement.js";

// export default function Dashboard() {
//   const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
//   const MAROON_BUTTON_STYLE = {
//     backgroundColor: "#7c0000",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     padding: "8px 20px",
//     fontSize: "14px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div className="container px-4 py-8 mx-auto">
//         {/* Header with Title and Buttons */}
//         <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <h1 style={{
//               fontSize: "28px",
//               fontWeight: "700",
//               background: BASE_GRADIENT,
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               backgroundClip: "text",
//               marginBottom: "6px",
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//             }}>
//               <i className="text-red-500 fas fa-chart-line" style={{ background: BASE_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} ></i>
//               Admin Dashboard
//               {/* <button 
//                 className="session-btn"
//                 style={{
//                   ...MAROON_BUTTON_STYLE,
//                   fontSize: "13px",
//                   padding: "6px 16px",
//                   marginLeft: "16px",
//                   fontWeight: "500"
//                 }}
//                 onMouseEnter={(e) => e.target.style.backgroundColor = "#9e0000"}
//                 onMouseLeave={(e) => e.target.style.backgroundColor = "#7c0000"}
//                 onClick={() => console.log("Sessions button clicked")}
//               >
//                 <i className="fas fa-calendar-alt mr-2" style={{ fontSize: "12px" }}></i>
//                 Sessions
//               </button> */}
//             </h1>
//             <p className="text-gray-600">
//               <i className="fas fa-chart-pie" style={{ marginRight: "6px", fontSize: "12px" }}></i>
//               Overview of analytics and user statistics
//             </p>
//           </div>
//           <button 
//             className="maroon-btn"
//             style={MAROON_BUTTON_STYLE}
//             onMouseEnter={(e) => e.target.style.backgroundColor = "#9e0000"}
//             onMouseLeave={(e) => e.target.style.backgroundColor = "#7c0000"}
//             onClick={() => console.log("Maroon button clicked")}
//           >
//             {/* <i className="fas fa-cog mr-2"></i> */}
//             Sessions
//           </button>
//         </div>

//         <div className="flex flex-wrap">
//           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
//             <MapExample/>
//           </div>
//           <div className="w-full px-4 xl:w-4/12">
//             <CardBarChart />
//           </div>
//         </div>
//         <div className="flex flex-wrap mt-4">
//           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
//             <CardPageVisits />
//           </div>
//           <div className="w-full px-4 xl:w-4/12">
//             <CardSocialTraffic />
//           </div>
//           <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
//             <CardLineChart />
//           </div>
//         </div>
//       </div>
//     </div>
//     );
// }
import React, { useState } from "react";

// components
import MapExample from "components/Maps/MapExample.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import SessionManagement from "../../components/SessionManagement"; 
// Corrected import path
import CardRevenueEnergy from "components/Cards/CardRevenueEnergy.js";
import CardStationStatus from "components/Cards/CardStationStatus.js";
import CardChargingModes from "components/Cards/CardChargingModes";

export default function Dashboard() {
  const [showSessions, setShowSessions] = useState(false);
  
  const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
  const MAROON_BUTTON_STYLE = {
    backgroundColor: "#7c0000",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const handleOpenSessions = () => {
    setShowSessions(true);
  };

  const handleCloseSessions = () => {
    setShowSessions(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container px-4 py-8 mx-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                background: BASE_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <i className="text-red-500 fas fa-chart-line"></i>
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                <i className="fas fa-chart-pie" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                Overview of analytics and user statistics
              </p>
            </div>
            <button 
              style={MAROON_BUTTON_STYLE}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#9e0000"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#7c0000"}
              onClick={handleOpenSessions}
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Sessions
            </button>
          </div>

          {/* <div className="flex flex-wrap">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <MapExample/>
            </div>
            <div className="w-full px-4 xl:w-4/12">
              <CardBarChart />
            </div>
          </div> */}
          
          {/* <div className="flex flex-wrap mt-4">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <CardLineChart />
            </div>
          </div> */}
          
          <div className="flex flex-wrap">
            <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <MapExample/>
            </div>
            <div className="w-full px-4 xl:w-4/12">
              <CardBarChart />
            </div>
          </div>
          
          <div className="flex flex-wrap mt-4">
            {/* <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <CardPageVisits />
            </div>
            <div className="w-full px-4 xl:w-4/12">
              <CardSocialTraffic />
            </div> */}
            {/* <div className="w-full px-4 mb-12 xl:w-8/12 xl:mb-0">
              <CardLineChart />
            </div> */}
            {/* ✅ NEW: Revenue & Energy Chart - Full Width */}
            <div className="w-full px-4 mb-12 2xl:w-8/12 xl:mb-0">
              <CardRevenueEnergy />
            </div>
            <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
              <CardStationStatus />
            </div>
            <div className="w-full px-4 mb-12 xl:w-6/12 xl:mb-0">
              <CardChargingModes />
            </div>
          </div>
        </div> {/* This closes the container div */}
      </div> {/* This closes the main background div */}

      {showSessions && (
        <SessionManagement onClose={handleCloseSessions} />
      )}
    </>
  );
}