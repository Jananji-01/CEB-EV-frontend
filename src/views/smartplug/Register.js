import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "qrcode";

const RegisterSmartPlug = () => {
  const [formData, setFormData] = useState({
    idDevice: "",
    cebSerialNo: "",
    maximumOutput: "",
    stationId: "",
    chargePointModel: "",
    chargePointVendor: "",
    firmwareVersion: ""
  });

  const [qrCodeImage, setQrCodeImage] = useState("");
  const [registeredDevice, setRegisteredDevice] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8088";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/smart-plugs/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maximumOutput: formData.maximumOutput ? parseFloat(formData.maximumOutput) : null,
          stationId: formData.stationId ? parseInt(formData.stationId) : null
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register smart plug");
      }

      // Store the registered device
      setRegisteredDevice(data);

      // Generate QR code from the qrCodeData
      if (data.qrCodeData) {
        const qrImage = await QRCode.toDataURL(data.qrCodeData);
        setQrCodeImage(qrImage);
      }

      toast.success(data.message || "Smart plug registered successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error registering smart plug:", error);
      toast.error(error.message || "Failed to register smart plug", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!registeredDevice) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/smart-plugs/${registeredDevice.idDevice}/regenerate-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate QR code");
      }

      // Update registered device with new QR data
      setRegisteredDevice(data);

      // Regenerate QR code image
      if (data.qrCodeData) {
        const qrImage = await QRCode.toDataURL(data.qrCodeData);
        setQrCodeImage(qrImage);
      }

      toast.success("QR code regenerated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error regenerating QR code:", error);
      toast.error(error.message || "Failed to regenerate QR code", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      idDevice: "",
      cebSerialNo: "",
      maximumOutput: "",
      stationId: "",
      chargePointModel: "",
      chargePointVendor: "",
      firmwareVersion: ""
    });
    setQrCodeImage("");
    setRegisteredDevice(null);
  };

  const downloadQRCode = () => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `smartplug-${registeredDevice?.idDevice || 'qr'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-6xl px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
          <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
            <div className="relative flex-1 flex flex-col">
              <span className="text-xxl mt-8 font-bold text-black">
                Smart Plug Registration
              </span>
              <span className="text-sm text-gray-600 mt-2">
                Register a new smart plug and generate its QR code
              </span>
            </div>
          </div>

          <div className="ml-0 p-5 bg-blueGray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Form */}
              <div className="p-5 rounded bg-white shadow">
                <h3 className="text-lg font-semibold mb-4">Smart Plug Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Device ID *
                    </label>
                    <input
                      type="text"
                      name="idDevice"
                      value={formData.idDevice}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      required
                      placeholder="e.g., SP-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CEB Serial Number
                    </label>
                    <input
                      type="text"
                      name="cebSerialNo"
                      value={formData.cebSerialNo}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., CEB123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Output (kW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="maximumOutput"
                      value={formData.maximumOutput}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., 7.4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Station ID (Optional)
                    </label>
                    <input
                      type="number"
                      name="stationId"
                      value={formData.stationId}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Charge Point Model
                    </label>
                    <input
                      type="text"
                      name="chargePointModel"
                      value={formData.chargePointModel}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., CP-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Charge Point Vendor
                    </label>
                    <input
                      type="text"
                      name="chargePointVendor"
                      value={formData.chargePointVendor}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., ABB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Firmware Version
                    </label>
                    <input
                      type="text"
                      name="firmwareVersion"
                      value={formData.firmwareVersion}
                      onChange={handleInputChange}
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="e.g., v1.2.3"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 rounded-lg ${loading ? 'bg-yellow-500' : 'bg-red-500 hover:bg-red-600'} text-white font-medium`}
                    >
                      {loading ? 'Registering...' : 'Register Smart Plug'}
                    </button>
                    
                    {registeredDevice && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                      >
                        Register Another
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* QR Code Display */}
              <div className="p-5 rounded bg-white shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">QR Code</h3>
                  {registeredDevice && (
                    <button
                      onClick={handleRegenerateQR}
                      className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                    >
                      Regenerate QR
                    </button>
                  )}
                </div>

                {qrCodeImage ? (
                  <div className="text-center">
                    <div className="bg-gray-50 p-4 rounded-lg inline-block">
                      <img 
                        src={qrCodeImage} 
                        alt="Smart Plug QR Code" 
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    
                    {registeredDevice && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Device Information</h4>
                        <div className="text-left space-y-1 text-sm">
                          <p><strong>Device ID:</strong> {registeredDevice.idDevice}</p>
                          <p><strong>CEB Serial:</strong> {registeredDevice.cebSerialNo || 'N/A'}</p>
                          <p><strong>Maximum Output:</strong> {registeredDevice.maximumOutput || 'N/A'} kW</p>
                          <p><strong>Registered:</strong> {new Date(registeredDevice.qrCodeGeneratedAt).toLocaleString()}</p>
                        </div>
                        
                        <div className="mt-4 flex justify-center space-x-3">
                          <button
                            onClick={downloadQRCode}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                          >
                            Download QR Code
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                          >
                            Print
                          </button>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This QR code should be attached to the physical smart plug. 
                            EV owners will scan this code to start charging sessions.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      QR code will appear here after successful registration
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      The QR code contains device identification for charging sessions
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Registration Instructions:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
                <li>Fill in all required fields (marked with *)</li>
                <li>Click "Register Smart Plug" to create the device record</li>
                <li>The system will generate a unique QR code automatically</li>
                <li>Download and print the QR code to attach to the physical device</li>
                <li>EV owners can scan this QR code to initiate charging sessions</li>
                <li>Use "Regenerate QR" if the code needs to be recreated</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterSmartPlug;