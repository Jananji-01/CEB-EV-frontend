// import React, { useEffect, useState } from "react";
// import Chart from "chart.js/auto";
// import axios from "axios";

// export default function UserDashboard() {
//   const [counts, setCounts] = useState({
//     admins: 0,
//     evOwners: 0,
//     solarOwners: 0,
//   });

//   useEffect(() => {
//     axios
//       .get(`${process.env.REACT_APP_API_BASE_URL}/api/user-role-counts`)
//       .then((res) => {
//         setCounts(res.data);
//         createChart(res.data);
//       })
//       .catch((err) => console.error(err));
//   }, []);

//   const createChart = (data) => {
//     const ctx = document.getElementById("pie-chart");

//     new Chart(ctx, {
//       type: "pie",
//       data: {
//         labels: ["Admins", "EV Owners", "Solar Owners"],
//         datasets: [
//           {
//             data: [data.admins, data.evOwners, data.solarOwners],
//             backgroundColor: ["#D45113", "#7A0000", "#FDB913"],
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: {
//             position: "bottom",
//           },
//         },
//       },
//     });
//   };

//   return (
//     <>
//       {/* CARDS */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <div className="flex-1 p-4 bg-white rounded shadow-lg">
//           <h6 className="text-sm "style={{ color: "#D45113" }}>Admins</h6>
//           <h2 className="text-2xl font-bold" style={{ color: "#D45113" }}>
//             {counts.admins}
//           </h2>
//         </div>

//         <div className="flex-1 p-4 bg-white rounded shadow-lg">
//           <h6 className="text-sm "style={{ color: "#7A0000" }}>EV Owners</h6>
//           <h2 className="text-2xl font-bold" style={{ color: "#7A0000" }}>
//             {counts.evOwners}
//           </h2>
//         </div>
    
//         <div className="flex-1 p-4 bg-white rounded shadow-lg">
//           <h6 className="text-sm "style={{ color: "#FDB913" }}>Solar Owners</h6>
//           <h2 className="text-2xl font-bold " style={{ color: "#FDB913" }}>
//             {counts.solarOwners}
//           </h2>
//         </div>
//       </div>

//       {/* PIE CHART */}
//       <div className="bg-white rounded shadow-lg">
//         <div className="px-4 py-3">
//           <h6 className="text-xs font-semibold text-gray-400 uppercase">
//             Users Overview
//           </h6>
//           <h2 className="text-xl font-semibold">
//             User Role Distribution
//           </h2>
//         </div>

//         <div className="p-4">
//           <div className="h-96">
//             <canvas id="pie-chart"></canvas>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }







import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

export default function UserDashboard() {
  const [counts, setCounts] = useState({
    admins: 0,
    evOwners: 0,
    solarOwners: 0,
  });
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/user-role-counts`)
      .then((res) => {
        console.log("API Response:", res.data);
        setCounts(res.data);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  useEffect(() => {
    // Only create chart when we have data and canvas is available
    if (counts.admins + counts.evOwners + counts.solarOwners > 0 && canvasRef.current) {
      console.log("Creating chart with data:", counts);
      
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      
      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Admins', 'EV Owners', 'Solar Owners'],
          datasets: [{
            data: [counts.admins, counts.evOwners, counts.solarOwners],
            backgroundColor: ['#D45113', '#7A0000', '#FDB913'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
      
      console.log("Chart created:", chartRef.current);
    }
  }, [counts]);

  // Add a resize observer to handle container size changes
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 p-4 bg-white rounded shadow-lg">
          <h6 className="text-sm" style={{ color: "#D45113" }}>Admins</h6>
          <h2 className="text-2xl font-bold" style={{ color: "#D45113" }}>
            {counts.admins}
          </h2>
        </div>

        <div className="flex-1 p-4 bg-white rounded shadow-lg">
          <h6 className="text-sm" style={{ color: "#7A0000" }}>EV Owners</h6>
          <h2 className="text-2xl font-bold" style={{ color: "#7A0000" }}>
            {counts.evOwners}
          </h2>
        </div>
    
        <div className="flex-1 p-4 bg-white rounded shadow-lg">
          <h6 className="text-sm" style={{ color: "#FDB913" }}>Solar Owners</h6>
          <h2 className="text-2xl font-bold" style={{ color: "#FDB913" }}>
            {counts.solarOwners}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded shadow-lg">
        <div className="px-4 py-3">
          <h6 className="text-xs font-semibold text-gray-400 uppercase">
            Users Overview
          </h6>
          <h2 className="text-xl font-semibold">
            User Role Distribution
          </h2>
        </div>

        <div className="p-4">
          <div style={{ height: '400px', position: 'relative' }}>
            <canvas 
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}