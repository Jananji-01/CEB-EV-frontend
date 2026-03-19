import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator() {
  const [formData, setFormData] = useState({
    deviceId: "",
    serial: "",
    maxOutput: "",
    stationId: "",
  });

  const [qrData, setQrData] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateQR = () => {
    if (!formData.deviceId || !formData.serial) {
      alert("Please enter Device ID and Serial Number");
      return;
    }
    const data = {
      ...formData,
      timestamp: new Date().toISOString(),
    };
    setQrData(JSON.stringify(data));
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full h-16 bg-orange-700 text-white flex items-center px-6 shadow-md z-10">
        <h1 className="text-xl font-bold">QR Generator Dashboard</h1>
      </header>

      {/* Main Content overlaps header */}
      <main className="absolute top-0 left-0 w-full p-4 z-20">
        <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-4xl mt-4">
          <h2 className="text-xl font-bold mb-4">Generate QR Code</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Inputs */}
            <div className="flex flex-col">
              <input
                type="text"
                name="deviceId"
                placeholder="Device ID"
                className="border p-2 rounded mb-3"
                onChange={handleChange}
              />
              <input
                type="text"
                name="serial"
                placeholder="Serial Number"
                className="border p-2 rounded mb-3"
                onChange={handleChange}
              />
              <input
                type="number"
                name="maxOutput"
                placeholder="Max Output (kW)"
                className="border p-2 rounded mb-3"
                onChange={handleChange}
              />
              <input
                type="number"
                name="stationId"
                placeholder="Station ID"
                className="border p-2 rounded mb-3"
                onChange={handleChange}
              />
              <button
                onClick={generateQR}
                className="bg-orange-700 text-white py-2 rounded mt-2 hover:bg-orange-600 transition"
              >
                Generate QR
              </button>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center">
              {qrData && (
                <>
                  <QRCodeCanvas value={qrData} size={200} />
                  <p className="text-sm mt-2 break-words">{qrData}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}