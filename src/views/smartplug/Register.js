import { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "qrcode";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";
import "leaflet-routing-machine";

/* ── Shared input helpers ───────────────────────────────────────────────── */
const inputCls =
  "w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 outline-none placeholder-gray-400";

const inputFocus = (e) => {
  e.target.style.borderColor = "#7c0000";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,0,0,0.08)";
  e.target.style.background = "#fff";
};
const inputBlur = (e) => {
  e.target.style.borderColor = "#e5e7eb";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#f9fafb";
};

/* ── Field wrapper ──────────────────────────────────────────────────────── */
function Field({ label, required, helper, children }) {
  return (
    <div className="mb-4">
      <label
        className="block text-xs font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: "#6b5e54" }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: "#7c0000" }}>*</span>}
      </label>
      {children}
      {helper && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "#9e8f86" }}>
          <i className="fas fa-info-circle"></i>
          {helper}
        </p>
      )}
    </div>
  );
}

/* ── Crimson gradient constant ──────────────────────────────────────────── */
const crimsonGrad = { background: "linear-gradient(135deg, #7c0000, #b71c1c)" };

/* ── Step progress indicator ────────────────────────────────────────────── */
function StepIndicator({ currentStep }) {
  const steps = [
    { n: 1, label: "Smart Plug Details", icon: "fas fa-microchip" },
    { n: 2, label: "Station Assignment", icon: "fas fa-map-marker-alt" },
    { n: 3, label: "QR Code",            icon: "fas fa-qrcode" },
  ];

  return (
    <div className="flex items-start justify-center mb-8">
      {steps.map((step, idx) => {
        const done   = currentStep > step.n;
        const active = currentStep === step.n;

        return (
          <div key={step.n} className="flex items-start">
            {/* Circle + label */}
            <div className="flex flex-col items-center" style={{ minWidth: "100px" }}>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all"
                style={
                  done
                    ? { ...crimsonGrad, borderColor: "#7c0000" }
                    : active
                    ? { background: "#fff", borderColor: "#7c0000", boxShadow: "0 0 0 4px rgba(124,0,0,0.12)" }
                    : { background: "#f3f4f6", borderColor: "#d1d5db" }
                }
              >
                {done ? (
                  <i className="fas fa-check text-white text-xs"></i>
                ) : (
                  <i
                    className={`${step.icon} text-sm`}
                    style={{ color: active ? "#7c0000" : "#9ca3af" }}
                  ></i>
                )}
              </div>
              <span
                className="mt-2 text-xs font-semibold text-center leading-tight px-1"
                style={{ color: active ? "#7c0000" : done ? "#374151" : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 rounded-full mt-5 mx-1 transition-all"
                style={{
                  background: currentStep > step.n
                    ? "linear-gradient(90deg, #7c0000, #b71c1c)"
                    : "#e5e7eb",
                  minWidth: "48px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
const RegisterSmartPlug = () => {
  const history = useHistory();

  /* ── State ── */
  const [currentStep, setCurrentStep] = useState(1);

  const [regForm, setRegForm] = useState({
    idDevice: "", cebSerialNo: "", maximumOutput: "",
    accountNumber: "", chargePointModel: "", chargePointVendor: "", firmwareVersion: "",
  });

  const [assignmentType, setAssignmentType]     = useState("new");
  const [assignForm, setAssignForm]             = useState({
    stationName: "", accountNumber: "", latitude: "",
    longitude: "", solarPowerAvailable: "", existingStationId: "",
  });

  const [stationsList, setStationsList]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [registeredDevice, setRegisteredDevice] = useState(null);
  const [qrCodeImage, setQrCodeImage]           = useState("");

  const mapRef          = useRef(null);
  const [map, setMap]   = useState(null);
  const [marker, setMarker] = useState(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8088";

  /* ── Fetch existing stations ── */
  useEffect(() => {
    if (assignmentType === "existing") {
      fetch(`${baseUrl}/api/charging-stations`)
        .then(res => res.json())
        .then(data => setStationsList(data))
        .catch(err => console.error("Error fetching stations:", err));
    }
  }, [assignmentType, baseUrl]);

  /* ── Init map when entering step 2 with "new" selected ── */
  useEffect(() => {
    if (currentStep === 2 && assignmentType === "new" && !map && mapRef.current) {
      const newMap = L.map(mapRef.current).setView([6.9271, 79.8612], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(newMap);
      newMap.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setAssignForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        if (marker) newMap.removeLayer(marker);
        setMarker(L.marker([lat, lng]).addTo(newMap));
      });
      setMap(newMap);
    }
  }, [currentStep, assignmentType, map, marker]);

  /* ── Handlers ── */
  const handleRegChange    = (e) => { const { name, value } = e.target; setRegForm(prev => ({ ...prev, [name]: value })); };
  const handleAssignChange = (e) => { const { name, value } = e.target; setAssignForm(prev => ({ ...prev, [name]: value })); };

  /* ── Submit (from step 2) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const regPayload = {
        ...regForm,
        maximumOutput: regForm.maximumOutput ? parseFloat(regForm.maximumOutput) : null,
        stationId: null,
      };
      const regResponse = await fetch(`${baseUrl}/api/smart-plugs/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regPayload),
        credentials: "include",
      });
      const regData = await regResponse.json();
      if (!regResponse.ok) throw new Error(regData.error || "Failed to register smart plug");

      setRegisteredDevice(regData);
      if (regData.qrCodeData) {
        const qrImage = await QRCode.toDataURL(regData.qrCodeData, { margin: 2, width: 200 });
        setQrCodeImage(qrImage);
      }
      toast.success(regData.message || "Smart plug registered successfully!");

      const assignPayload = {
        assignmentType,
        ...(assignmentType === "new"
          ? {
              stationName: assignForm.stationName,
              accountNumber: regForm.accountNumber,
              latitude: parseFloat(assignForm.latitude),
              longitude: parseFloat(assignForm.longitude),
              solarPowerAvailable: assignForm.solarPowerAvailable ? parseFloat(assignForm.solarPowerAvailable) : null,
            }
          : { existingStationId: parseInt(assignForm.existingStationId) }),
      };

      const assignResponse = await fetch(`${baseUrl}/api/smart-plugs/${regData.idDevice}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignPayload),
        credentials: "include",
      });
      const assignData = await assignResponse.json();
      if (!assignResponse.ok) throw new Error(assignData.error || "Assignment failed");

      toast.success("Smart plug assigned to station successfully!");
      setCurrentStep(3);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset ── */
  const resetForm = () => {
    setRegForm({ idDevice: "", cebSerialNo: "", maximumOutput: "", accountNumber: "", chargePointModel: "", chargePointVendor: "", firmwareVersion: "" });
    setAssignForm({ stationName: "", accountNumber: "", latitude: "", longitude: "", solarPowerAvailable: "", existingStationId: "" });
    setRegisteredDevice(null);
    setQrCodeImage("");
    setAssignmentType("new");
    setMarker(null);
    if (map) { map.remove(); setMap(null); }
    setCurrentStep(1);
  };

  /* ════════════════════════════════════════════════════════════════════════
     Render
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen pb-16" style={{ background: "#f7f5f3" }}>

      {/* ── Crimson page header ──────────────────────────────────────────── */}
      <div
        className="px-8 py-5 mb-6"
        style={{
          background: "linear-gradient(135deg, #7c0000 0%, #b71c1c 100%)",
          boxShadow: "0 4px 20px rgba(124,0,0,0.2)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <i className="fas fa-plug text-white text-base"></i>
          </div>
          <div>
            <h1 className="text-base font-bold text-white m-0 leading-tight">
              Smart Plug Registration &amp; Station Assignment
            </h1>
            <p className="text-xs mt-0.5 m-0" style={{ color: "rgba(255,255,255,0.7)" }}>
              Register a new smart plug, generate a QR code, and assign it to a charging station
            </p>
          </div>
        </div>
      </div>

      {/* ── Wizard ──────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4">

        <StepIndicator currentStep={currentStep} />

        {/* ════════════════════════════════════════════════════════════════
            STEP 1 — Smart Plug Details
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ ...crimsonGrad, boxShadow: "0 4px 12px rgba(124,0,0,0.25)" }}
              >
                <i className="fas fa-microchip text-white text-sm"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 m-0">Smart Plug Details</h2>
                <p className="text-xs m-0" style={{ color: "#9e8f86" }}>
                  Device identification &amp; hardware specifications
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-5">
                <Field label="Device ID" required>
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="text" name="idDevice" value={regForm.idDevice}
                    onChange={handleRegChange} required placeholder="e.g., SP-001" />
                </Field>
                <Field label="CEB Serial Number">
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="text" name="cebSerialNo" value={regForm.cebSerialNo}
                    onChange={handleRegChange} placeholder="e.g., CEB123456" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-x-5">
                <Field label="Maximum Output (kW)">
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="number" step="0.1" name="maximumOutput" value={regForm.maximumOutput}
                    onChange={handleRegChange} placeholder="e.g., 7.4" />
                </Field>
                <Field label="Account No. (Solar Owner)" required helper="Rooftop solar owner's account">
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="text" name="accountNumber" value={regForm.accountNumber}
                    onChange={handleRegChange} required placeholder="e.g., 7786535625" />
                </Field>
              </div>

              <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#b8a99e" }}>
                Hardware Info
              </p>

              <div className="grid grid-cols-2 gap-x-5">
                <Field label="Charge Point Model">
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="text" name="chargePointModel" value={regForm.chargePointModel}
                    onChange={handleRegChange} placeholder="e.g., CP-500" />
                </Field>
                <Field label="Charge Point Vendor">
                  <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                    type="text" name="chargePointVendor" value={regForm.chargePointVendor}
                    onChange={handleRegChange} placeholder="e.g., ABB" />
                </Field>
              </div>

              <Field label="Firmware Version">
                <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                  type="text" name="firmwareVersion" value={regForm.firmwareVersion}
                  onChange={handleRegChange} placeholder="e.g., v1.2.3" />
              </Field>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl border-none cursor-pointer"
                  style={{ ...crimsonGrad, boxShadow: "0 4px 14px rgba(124,0,0,0.35)" }}
                >
                  Next: Station Assignment
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 2 — Station Assignment
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                  style={{ ...crimsonGrad, boxShadow: "0 4px 12px rgba(124,0,0,0.25)" }}
                >
                  <i className="fas fa-map-marker-alt text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 m-0">Station Assignment</h2>
                  <p className="text-xs m-0" style={{ color: "#9e8f86" }}>
                    Link this plug to a new or existing charging station
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* Tab switcher */}
                <div className="flex gap-2 mb-5">
                  {[
                    { type: "new",      icon: "fas fa-plus-circle", label: "New Station" },
                    { type: "existing", icon: "fas fa-list",        label: "Existing Station" },
                  ].map(tab => (
                    <button
                      key={tab.type}
                      type="button"
                      onClick={() => setAssignmentType(tab.type)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-none cursor-pointer"
                      style={
                        assignmentType === tab.type
                          ? { ...crimsonGrad, color: "#fff", boxShadow: "0 4px 12px rgba(124,0,0,0.3)" }
                          : { background: "#f7f5f3", color: "#7c6b60", border: "1.5px solid #e2ddd9" }
                      }
                    >
                      <i className={tab.icon}></i>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* New Station */}
                {assignmentType === "new" && (
                  <div>
                    <div className="grid grid-cols-2 gap-x-5">
                      <Field label="Station Name" required>
                        <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                          type="text" name="stationName" value={assignForm.stationName}
                          onChange={handleAssignChange} required placeholder="e.g., Colombo South" />
                      </Field>
                      <Field label="Solar Owner Account" required helper="Must match registration above">
                        <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                          type="text" name="accountNumber" value={assignForm.accountNumber}
                          onChange={handleAssignChange} required placeholder="e.g., 7786535625" />
                      </Field>
                    </div>

                    <Field label="Solar Power Available (kW)">
                      <input className={inputCls} onFocus={inputFocus} onBlur={inputBlur}
                        type="number" step="0.1" name="solarPowerAvailable" value={assignForm.solarPowerAvailable}
                        onChange={handleAssignChange} placeholder="e.g., 15" />
                    </Field>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#6b5e54" }}>
                        Station Location <span style={{ color: "#7c0000" }}>*</span>
                      </label>
                      <p className="text-xs flex items-center gap-1 mb-2" style={{ color: "#9e8f86" }}>
                        <i className="fas fa-mouse-pointer"></i>
                        Click on the map to pin the station location
                      </p>
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        <div ref={mapRef} style={{ height: "260px", width: "100%" }} />
                      </div>
                      {assignForm.latitude && assignForm.longitude && (
                        <div className="flex items-center gap-2 mt-2">
                          <i className="fas fa-check-circle text-sm" style={{ color: "#16a34a" }}></i>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                            style={{
                              background: "rgba(124,0,0,0.06)",
                              borderColor: "rgba(124,0,0,0.15)",
                              color: "#7c0000",
                              fontFamily: "monospace",
                            }}
                          >
                            {Number(assignForm.latitude).toFixed(5)}, {Number(assignForm.longitude).toFixed(5)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Existing Station */}
                {assignmentType === "existing" && (
                  <Field label="Select Station" required helper="Choose from registered charging stations">
                    <div className="relative mt-1">
                      <select
                        name="existingStationId"
                        value={assignForm.existingStationId}
                        onChange={handleAssignChange}
                        required
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 outline-none appearance-none cursor-pointer"
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      >
                        <option value="">— Choose a charging station —</option>
                        {stationsList.map(station => (
                          <option key={station.stationId} value={station.stationId}>
                            {station.stationName || `Station ${station.stationId}`} · ID: {station.stationId}
                          </option>
                        ))}
                      </select>
                      <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
                    </div>
                  </Field>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300"
                    style={{ color: "#6b5e54" }}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ ...crimsonGrad, boxShadow: "0 4px 14px rgba(124,0,0,0.35)" }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-opacity-40 border-t-white rounded-full animate-spin flex-shrink-0"></span>
                        Processing…
                      </>
                    ) : (
                      <>
                        <i className="fas fa-bolt"></i>
                        Register &amp; Assign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 3 — QR Code
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                style={{ ...crimsonGrad, boxShadow: "0 4px 12px rgba(124,0,0,0.25)" }}
              >
                <i className="fas fa-qrcode text-white text-sm"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 m-0">QR Code Generated</h2>
                <p className="text-xs m-0" style={{ color: "#9e8f86" }}>
                  Attach this QR code to the physical smart plug device
                </p>
              </div>
              <span
                className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{ background: "rgba(22,163,74,0.08)", borderColor: "rgba(22,163,74,0.2)", color: "#15803d" }}
              >
                <i className="fas fa-check-circle"></i>
                Registered: {registeredDevice?.idDevice}
              </span>
            </div>

            <div className="p-8 flex flex-col items-center gap-5">
              {qrCodeImage ? (
                <>
                  <div
                    className="p-4 rounded-2xl border-2"
                    style={{ borderColor: "#7c0000", boxShadow: "0 12px 40px rgba(124,0,0,0.15)" }}
                  >
                    <img src={qrCodeImage} alt="Smart Plug QR Code" className="w-48 h-48 block" />
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold text-gray-900 m-0">{registeredDevice?.idDevice}</p>
                    <p className="text-xs mt-1 m-0" style={{ color: "#9e8f86" }}>
                      Generated {new Date(registeredDevice?.qrCodeGeneratedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = qrCodeImage;
                        link.download = `smartplug-${registeredDevice?.idDevice || "qr"}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl border-none cursor-pointer"
                      style={{ ...crimsonGrad, boxShadow: "0 4px 12px rgba(124,0,0,0.3)" }}
                    >
                      <i className="fas fa-download"></i>
                      Download QR
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300"
                      style={{ color: "#7c0000" }}
                    >
                      <i className="fas fa-print"></i>
                      Print
                    </button>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300"
                    style={{ color: "#6b5e54" }}
                  >
                    <i className="fas fa-plus-circle" style={{ color: "#7c0000" }}></i>
                    Register Another Smart Plug
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
                    style={{ background: "rgba(124,0,0,0.07)" }}
                  >
                    <i className="fas fa-qrcode text-3xl" style={{ color: "rgba(124,0,0,0.35)" }}></i>
                  </div>
                  <p className="text-sm font-semibold m-0" style={{ color: "#7c6b60" }}>No QR data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Instructions (steps 1 & 2 only) ── */}
        {currentStep < 3 && (
          <div
            className="mt-6 p-5 rounded-2xl border"
            style={{
              background: "linear-gradient(135deg, rgba(124,0,0,0.03), rgba(183,28,28,0.04))",
              borderColor: "rgba(124,0,0,0.12)",
            }}
          >
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 m-0" style={{ color: "#7c0000" }}>
              <i className="fas fa-lightbulb"></i>
              Registration Guide
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pl-5 m-0">
              {[
                "Fill in all required smart plug details (marked with *)",
                "Choose to create a new station or assign to an existing one",
                "For a new station: provide name, solar account, and pin on map",
                "For an existing station: select from the dropdown list",
                'Click "Register & Assign" to complete the process',
                "Download or print the QR code and attach it to the device",
              ].map((step, i) => (
                <li key={i} className="text-xs" style={{ color: "#6b5e54", lineHeight: "1.7" }}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default RegisterSmartPlug;
