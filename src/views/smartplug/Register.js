import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "qrcode";
import { QrReader } from "react-qr-reader";

// import custom location icon
const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", // custom location pin
  iconSize: [32, 32], // adjust size
  iconAnchor: [16, 32], // positioning of the icon
  popupAnchor: [0, -32], // popup position
});

// component to handle location picking
const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      console.log("clicked location:", e.latlng); // log the location
      setLocation([e.latlng.lat, e.latlng.lng]); // set latitude and longitude
    },
  });
  return null;
};

const Tabs = () => {
  const [stationName, setStationName] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [stationStatus, setStationStatus] = useState("Unplugged"); // default status
  const [location, setLocation] = useState([6.9271, 79.8612]); // default location (colombo)

  const [email, setEmail] = useState(sessionStorage.getItem("email"));
  const [eaccountNo, seteaccountNo] = useState(
    sessionStorage.getItem("eAccountNo")
  );

  const [scannedData, setScannedData] = useState(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scannedData || !scannedData.id) {
      toast.error("Please scan a valid QR code before submitting.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const stationData = {
      name: stationName,
      status: stationStatus,
      latitude: location[0],
      longitude: location[1],
      email: email,
      eaccountNo: eaccountNo,
      identificationNumber: identificationNumber,
      qrId: scannedData.id, // include scanned QR code id
    };

    console.log("station data:", stationData);

    try {
      const response = await fetch(`${baseUrl}/api/charging-stations`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(stationData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to register the charging station");
      }

      const data = await response.json();
      console.log("charging station registered:", data);

      toast.success("Charging station registered successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // reset form
      setStationName("");
      setIdentificationNumber("");
      setStationStatus("Available");
      setLocation([6.9271, 79.8612]);
      setScannedData(null); // reset QR data
    } catch (error) {
      console.error("error registering charging station:", error);
      toast.error("failed to register charging station!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const jsonData = JSON.parse(data);
        setScannedData(jsonData);
        console.log("scanned data:", jsonData);

        toast.success("QR code scanned successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error("invalid QR code:", err);
        toast.error("Invalid QR code", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleError = (err) => {
    console.error("qr scan error:", err);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
          <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
            <div className="relative flex-1 flex flex-col ">
              <span className="text-xxl mt-8 font-bold text-black">
                Charging Station Registration
              </span>
            </div>
          </div>

          <div className="ml-0 p-5 bg-blueGray-100">
            <div className="p-5 mr-4 rounded bg-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-m font-medium text-gray-700">
                    Station Name
                  </label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-m font-medium text-gray-700">
                    Identification Number
                  </label>
                  <input
                    type="text"
                    value={identificationNumber}
                    onChange={(e) => setIdentificationNumber(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>

                <div className="mt-8">
                  <label className="block text-m font-medium text-gray-700">
                    Scan QR Code
                  </label>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      onResult={(result, error) => {
                        if (!!result) {
                          handleScan(result.getText());
                        }

                        if (!!error) {
                          handleError(error);
                        }
                      }}
                      style={{ width: "100%" }}
                    />
                  </div>

                  {scannedData && (
                    <div className="mt-4 p-2 bg-white border rounded">
                      <p>
                        <strong>ID:</strong> {scannedData.id}
                      </p>
                      <p>
                        <strong>Name:</strong> {scannedData.name}
                      </p>
                      <p>
                        <strong>Latitude:</strong> {scannedData.lat}
                      </p>
                      <p>
                        <strong>Longitude:</strong> {scannedData.lng}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mt-4 mb-1 block text-m font-medium text-gray-700">
                    select location
                  </label>
                  <div className="h-80 w-full border rounded-md overflow-hidden">
                    <MapContainer
                      center={location}
                      zoom={13}
                      className="h-full w-full"
                      style={{ height: "320px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker setLocation={setLocation} />
                      {location && (
                        <Marker position={location} icon={locationIcon} />
                      )}
                    </MapContainer>
                  </div>
                  {location && (
                    <p className="mt-2 text-sm text-gray-600">
                      selected: {location[0].toFixed(6)},{" "}
                      {location[1].toFixed(6)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`mt-4 px-4 py-2 rounded-lg ${
                    location
                      ? "bg-lightBlue-500 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed "
                  }`}
                  disabled={!location}
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Tabs;
