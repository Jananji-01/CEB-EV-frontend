// import { useState } from "react";
// import { QrReader } from "react-qr-reader";

// function QRscan() {
//   const [scanResult, setScanResult] = useState("");

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
//       <div className="w-full max-w-4xl px-4">
//         <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
//           <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
//             <div className="relative flex-1 flex flex-col">
//               <span className="text-xxl mt-2 font-bold">QR Code Scan</span>
//             </div>
//           </div>

//           <div className="ml-0 p-5 bg-blueGray-100">
//             <div className="p-5 mr-4 rounded bg-gray-100">
//               <QrReader
//                 className="w-full"
//                 constraints={{ facingMode: "environment" }}
//                 onResult={(result, error) => {
//                   if (result) {
//                     const data = result.text;
//                     setScanResult(data);

//                     fetch("http://127.0.0.1:8088/EV/api/qrcodes", {
//                       // use your backend url
//                       method: "POST",
//                       headers: {
//                         "Content-Type": "application/json",
//                       },
//                       body: JSON.stringify({ data }), // match your dto field name
//                     }).catch((err) =>
//                       console.error("failed to save qr code:", err)
//                     );
//                   }
//                 }}
//               />
//               {scanResult && (
//                 <div className="mt-4 p-2 bg-white shadow rounded text-center">
//                   <p className="text-lg font-semibold">Scanned QR Code:</p>
//                   <p className="break-words text-sm text-gray-700">
//                     {scanResult}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default QRscan;



import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function QRscan() {
  const [scanResult, setScanResult] = useState("");
  const [scannedDeviceId, setScannedDeviceId] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ✅ NEW: Handle QR logic (copied from your second code)
  const handleScannedQRCode = (qrData) => {
    try {
      const parsedData = JSON.parse(qrData);

      if (parsedData.deviceId) {
        const deviceId = parsedData.deviceId;

        setScanResult(JSON.stringify(parsedData, null, 2));
        setScannedDeviceId(deviceId);

        toast.success(`Device ${deviceId} scanned successfully!`);

        sendToBackend(qrData);

        setTimeout(() => {
          redirectToChargingPage(deviceId);
        }, 2000);
      } else {
        toast.error("Invalid QR code format - no device ID found");
      }
    } catch (error) {
      // if not JSON → treat as plain deviceId
      if (qrData && qrData.trim() !== "") {
        setScanResult(qrData);
        setScannedDeviceId(qrData);

        toast.success(`Device ${qrData} scanned successfully!`);

        sendToBackend(qrData);

        setTimeout(() => {
          redirectToChargingPage(qrData);
        }, 2000);
      } else {
        toast.error("Invalid QR code data");
      }
    }
  };

  const sendToBackend = async (data) => {
    try {
      await fetch("http://127.0.0.1:8088/EV/api/qrcodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
    } catch (err) {
      console.error("failed to save qr code:", err);
    }
  };

  const redirectToChargingPage = (deviceId) => {
    setIsRedirecting(true);

    toast.info(`Redirecting to charging page for device: ${deviceId}`);

    setTimeout(() => {
      window.location.href = `/smartplug/charging?deviceId=${encodeURIComponent(deviceId)}`;
    }, 2000);
  };

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
              
              {/* ✅ YOUR ORIGINAL QR READER (UNCHANGED) */}
              <QrReader
                className="w-full"
                constraints={{ facingMode: "environment" }}
                onResult={(result, error) => {
                  if (result) {
                    const data = result.text;

                    // 👇 only change: call new handler
                    handleScannedQRCode(data);
                  }
                }}
              />

              {/* ✅ Redirect message */}
              {isRedirecting && (
                <div className="mt-4 text-center text-blue-600 font-semibold">
                  Redirecting to charging page...
                </div>
              )}

              {/* ✅ Result UI */}
              {scanResult && !isRedirecting && (
                <div className="mt-4 p-4 bg-white shadow rounded text-center">
                  <p className="text-lg font-semibold">Device ID:</p>
                  <p className="text-blue-600 font-bold text-xl">
                    {scannedDeviceId}
                  </p>

                  <p className="mt-3 text-sm text-gray-600">QR Data:</p>
                  <pre className="text-xs text-gray-700 break-words">
                    {scanResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default QRscan;