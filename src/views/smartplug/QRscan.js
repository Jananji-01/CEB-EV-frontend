import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function QRscan() {
  const [scanResult, setScanResult] = useState("");
  const [scannedDeviceId, setScannedDeviceId] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const qrScannerRef = useRef(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Initialize QR scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      },
      false
    );

    qrScannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        console.log("QR Code scanned:", decodedText);
        handleScannedQRCode(decodedText);
      },
      (error) => {
        console.log("QR Code scan error:", error);
      }
    );

    // Cleanup function
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
      }
    };
  }, []);

  const handleScannedQRCode = (qrData) => {
    try {
      // Try to parse JSON data from QR code
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.deviceId) {
        // QR code contains device ID in JSON format
        const deviceId = parsedData.deviceId;
        setScanResult(JSON.stringify(parsedData, null, 2));
        setScannedDeviceId(deviceId);
        
        toast.success(`Device ${deviceId} scanned successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Send to backend for logging (optional)
        sendToBackend(qrData);
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          redirectToChargingPage(deviceId);
        }, 2000);
      } else {
        toast.error("Invalid QR code format - no device ID found", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      // If not JSON, treat as plain device ID
      if (qrData && qrData.trim() !== "") {
        setScanResult(qrData);
        setScannedDeviceId(qrData);
        
        toast.success(`Device ${qrData} scanned successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Send to backend for logging (optional)
        sendToBackend(qrData);
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          redirectToChargingPage(qrData);
        }, 2000);
      } else {
        toast.error("Invalid QR code data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const sendToBackend = async (data) => {
    try {
      await fetch(`${baseUrl}/api/qrcodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
    } catch (err) {
      console.error("Failed to save QR code:", err);
    }
  };

  const redirectToChargingPage = (deviceId) => {
    setIsRedirecting(true);
    toast.info(`Redirecting to charging page for device: ${deviceId}`, {
      position: "top-right",
      autoClose: 2000,
    });
    
    setTimeout(() => {
      window.location.href = `/smartplug/charging?deviceId=${encodeURIComponent(deviceId)}`;
    }, 2000);
  };

  const handleManualRedirect = () => {
    if (scannedDeviceId) {
      redirectToChargingPage(scannedDeviceId);
    } else {
      toast.error("Please scan a QR code first", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
          <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
            <div className="relative flex-1 flex flex-col">
              <span className="text-2xl mt-2 font-bold text-black">QR Code Scanner</span>
              <span className="text-sm text-gray-600 mt-2">
                Scan the QR code from your smart plug to start charging
              </span>
            </div>
          </div>

          <div className="ml-0 p-5 bg-blueGray-100">
            <div className="p-5 mr-4 rounded bg-gray-100">
              {/* QR Scanner Container */}
              <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
              
              {isRedirecting && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Redirecting to charging page...
                  </div>
                </div>
              )}
              
              {scanResult && !isRedirecting && (
                <div className="mt-6 p-6 bg-white shadow rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Scanned QR Code Details</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-1">Device ID</p>
                    <p className="text-xl font-bold text-blue-600">{scannedDeviceId}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-1">QR Code Data</p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {scanResult}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleManualRedirect}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-300 flex-1"
                    >
                      <i className="fas fa-bolt mr-2"></i>
                      Go to Charging Page
                    </button>
                    
                    <button
                      onClick={() => {
                        setScanResult("");
                        setScannedDeviceId("");
                        if (qrScannerRef.current) {
                          qrScannerRef.current.clear();
                          const scanner = new Html5QrcodeScanner(
                            "qr-reader",
                            {
                              fps: 10,
                              qrbox: { width: 250, height: 250 },
                              rememberLastUsedCamera: true,
                              supportedScanTypes: []
                            },
                            false
                          );
                          qrScannerRef.current = scanner;
                          scanner.render(
                            (decodedText) => handleScannedQRCode(decodedText),
                            (error) => console.log("QR Code scan error:", error)
                          );
                        }
                      }}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition duration-300"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Scan Another
                    </button>
                  </div>
                </div>
              )}
              
              {!scanResult && !isRedirecting && (
                <div className="mt-6 text-center">
                  <div className="inline-block p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <i className="fas fa-info-circle text-blue-500 text-2xl mb-2"></i>
                    <p className="text-gray-700">
                      Point your camera at the QR code on the smart plug
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      The QR code should contain the device identification information
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">How to use:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                <li>Point your camera at the QR code on the smart plug</li>
                <li>Wait for the scanner to automatically detect the QR code</li>
                <li>System will extract the device ID and show details</li>
                <li>Auto-redirect to charging page will occur in 2 seconds</li>
                <li>You can also manually click "Go to Charging Page" button</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>Note:</strong> Make sure you have camera permissions enabled in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default QRscan;