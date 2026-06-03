import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function CardLineChart() {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    // Fetch monthly consumption data
    fetch("http://localhost:8080/api/monthly-consumption")
      .then((res) => res.json())
      .then((data) => {
        // Assume API returns: { labels: ["Jan", "Feb", ...], consumption: [100, 200, ...] }

        const config = {
          type: "line",
          data: {
            labels: data.labels, // months
            datasets: [
              {
                label: "Monthly Consumption",
                backgroundColor: "#4c51bf",
                borderColor: "#4c51bf",
                data: data.consumption,
                fill: false,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                labels: {
                  color: "white",
                },
                position: "bottom",
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              x: {
                ticks: { color: "rgba(255,255,255,.7)" },
                grid: { display: false },
              },
              y: {
                ticks: { color: "rgba(255,255,255,.7)" },
                grid: { color: "rgba(255, 255, 255, 0.15)" },
              },
            },
          },
        };

        // Destroy old chart if it exists
        if (chartInstance) chartInstance.destroy();

        // Create new chart
        const newChartInstance = new Chart(chartRef.current, config);
        setChartInstance(newChartInstance);
      })
      .catch((err) => console.error("Error fetching monthly consumption:", err));
  }, []);

  return (
    <div className="relative flex flex-col w-full min-w-0 mb-6 break-words rounded shadow-lg bg-blueGray-700">
      <div className="px-4 py-3 mb-0 bg-transparent rounded-t">
        <div className="flex flex-wrap items-center">
          <div className="relative flex-1 flex-grow w-full max-w-full">
            <h6 className="mb-1 text-xs font-semibold uppercase text-blueGray-100">
              Overview
            </h6>
            <h2 className="text-xl font-semibold text-white">Monthly Consumption</h2>
          </div>
        </div>
      </div>
      <div className="flex-auto p-4">
        <div className="relative h-350-px">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}