import { useState } from "react";
import { QrReader } from "react-qr-reader";

function QRscan() {
  const [scanResult, setScanResult] = useState("");

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
          <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
            <div className="relative flex-1 flex flex-col">
              <span className="text-xxl mt-2 font-bold">QR Code Scan</span>
            </div>
          </div>

          <div className="ml-0 p-5 bg-blueGray-100">
            <div className="p-5 mr-4 rounded bg-gray-100">
              <QrReader
                className="w-full"
                constraints={{ facingMode: "environment" }}
                onResult={(result, error) => {
                  if (result) {
                    const data = result.text;
                    setScanResult(data);

                    fetch("http://127.0.0.1:8088/EV/api/qrcodes", {
                      // use your backend url
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ data }), // match your dto field name
                    }).catch((err) =>
                      console.error("failed to save qr code:", err)
                    );
                  }
                }}
              />
              {scanResult && (
                <div className="mt-4 p-2 bg-white shadow rounded text-center">
                  <p className="text-lg font-semibold">Scanned QR Code:</p>
                  <p className="break-words text-sm text-gray-700">
                    {scanResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRscan;
