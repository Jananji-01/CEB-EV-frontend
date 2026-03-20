import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Use html5-qrcode instead of react-qr-scanner for better React 18 compatibility
import { Html5QrcodeScanner } from "html5-qrcode";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Use Client from @stomp/stompjs
let SockJS;
let Client;

if (typeof window !== 'undefined') {
  SockJS = require('sockjs-client');
  Client = require('@stomp/stompjs').Client;
}

const ChargingEV = () => {
  const [idDevice, setIdDevice] = useState("");
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedDeviceId, setScannedDeviceId] = useState("");
  const [realTimeData, setRealTimeData] = useState({
    power: 0,
    voltage: 230,
    current: 0,
    energy: 0,
    status: "Disconnected",
    temperature: 25
  });
  
  const stompClient = useRef(null);
  const qrScannerRef = useRef(null);
  const preparedRef = useRef(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088/EV";

  // Connect to WebSocket when component mounts or idDevice changes
  useEffect(() => {
    if (idDevice && idDevice.trim() !== "" && typeof window !== 'undefined') {
      connectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
      stopQRScanner();
    };
  }, [idDevice]);

  // Initialize QR Scanner
  const initQRScanner = () => {
    if (!showQRScanner || qrScannerRef.current) return;

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
        stopQRScanner();
      },
      (error) => {
        console.log("QR Code scan error:", error);
      }
    );
  };

  // Stop QR Scanner
  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear();
      qrScannerRef.current = null;
    }
    setShowQRScanner(false);
  };

  // Handle scanned QR code
  const handleScannedQRCode = (qrData) => {
    try {
      // Try to parse JSON data from QR code
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.deviceId) {
        // QR code contains device ID in JSON format
        const deviceId = parsedData.deviceId;
        setScannedDeviceId(deviceId);
        setIdDevice(deviceId);
        toast.success(`Device ${deviceId} scanned successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Auto-connect after scanning
        setTimeout(() => {
          handleDeviceIdSubmit();
        }, 1000);
      } else {
        toast.error("Invalid QR code format - no device ID found", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      // If not JSON, treat as plain device ID
      if (qrData && qrData.trim() !== "") {
        setScannedDeviceId(qrData);
        setIdDevice(qrData);
        toast.success(`Device ${qrData} scanned successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Auto-connect after scanning
        setTimeout(() => {
          handleDeviceIdSubmit();
        }, 1000);
      } else {
        toast.error("Invalid QR code data", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Toggle QR Scanner
  const toggleQRScanner = () => {
    if (showQRScanner) {
      stopQRScanner();
    } else {
      setShowQRScanner(true);
      // Initialize scanner after state update
      setTimeout(initQRScanner, 100);
    }
  };

  // Initialize QR scanner when showQRScanner changes
  useEffect(() => {
    if (showQRScanner) {
      initQRScanner();
    }
  }, [showQRScanner]);

  const connectWebSocket = () => {
    if (!SockJS || !Client) {
      console.error("WebSocket libraries not available");
      return;
    }

    try {
      setIsConnecting(true);
      
      // Create new STOMP client with the STOMP endpoint
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(`${baseUrl}/ws-stomp`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: function(str) {
          console.log("STOMP Debug:", str);
        },
      });

      // Set up connection handlers
      stompClient.current.onConnect = (frame) => {
        console.log("WebSocket Connected:", frame);
        setIsWebSocketConnected(true);
        setIsConnecting(false);
        
        // Subscribe to device updates
        stompClient.current.subscribe(`/topic/device/${idDevice}`, (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log("WebSocket message received:", update);
            handleWebSocketMessage(update);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        });
        
        // Subscribe to general charging updates
        stompClient.current.subscribe("/topic/charging", (message) => {
          try {
            const update = JSON.parse(message.body);
            console.log("General charging update:", update);
            if (update.idDevice === idDevice) {
              handleWebSocketMessage(update);
            }
          } catch (error) {
            console.error("Error parsing general message:", error);
          }
        });
        
        // Load device details after successful connection
        fetchDeviceDetails();

        // Send prepare command (RemoteStartTransaction) to enable the Start button
        if (!preparedRef.current) {
            sendPrepareCommand();
            preparedRef.current = true;
        }
      };

      stompClient.current.onStompError = (frame) => {
        console.error("STOMP error:", frame);
        setIsWebSocketConnected(false);
        setIsConnecting(false);
        toast.error("WebSocket connection error", {
          position: "top-right",
          autoClose: 3000,
        });
      };

      stompClient.current.onWebSocketClose = () => {
        console.log("WebSocket closed");
        setIsWebSocketConnected(false);
        setIsConnecting(false);
      };

      stompClient.current.onDisconnect = () => {
        console.log("WebSocket disconnected");
        setIsWebSocketConnected(false);
        setIsConnecting(false);
      };

      // Activate the client
      stompClient.current.activate();
      
    } catch (error) {
      console.error("Error connecting WebSocket:", error);
      setIsWebSocketConnected(false);
      setIsConnecting(false);
      toast.error("Failed to connect to WebSocket", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsWebSocketConnected(false);
      toast.info("WebSocket disconnected", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const debugWebSocketMessages = (message) => {
    console.log("🔍 [FRONTEND DEBUG] WebSocket Message:", message);
    console.log("🔍 [FRONTEND DEBUG] Type:", message.type);
    console.log("🔍 [FRONTEND DEBUG] Full data:", JSON.stringify(message, null, 2));
 };

  const handleWebSocketMessage = (message) => {
    
    debugWebSocketMessages(message);
    
    if (!message || !message.type) {
        console.log("⚠️ [FRONTEND] No type in message:", message);
        return;
    }

    console.log("🔄 [FRONTEND] Processing WebSocket message type:", message.type);

    switch (message.type) {
      case "DEVICE_CONNECTION":
        setDeviceDetails(prev => ({
          ...prev,
          connected: message.connected
        }));
        
        setRealTimeData(prev => ({
          ...prev,
          status: message.connected ? "Available" : "Disconnected"
        }));
        
        toast.info(`Device ${message.connected ? 'connected' : 'disconnected'}`, {
          position: "top-right",
          autoClose: 3000,
        });
        break;
        
      case "TRANSACTION_STARTED":
          setIsCharging(true);

          //  Ensure transactionId is a number
        let transId = message.transactionId;
        if (typeof transId === 'string') {
          // Extract numbers from string
          const match = transId.match(/\d+/);
          if (match) {
            transId = parseInt(match[0]);
          }
        }
        
        console.log(`✅ Setting active session with transactionId: ${transId} (original: ${message.transactionId})`);
          
          // Use the transactionId from backend
          setActiveSession({
              transactionId: transId,  // This comes from backend
              startTime: message.timestamp || new Date().toISOString()
          });
          
          setRealTimeData(prev => ({
              ...prev,
              status: "Charging"
          }));
          
          
          toast.success("Charging started successfully!", {
              position: "top-right",
              autoClose: 3000,
          });
          break;
        
      case "TRANSACTION_STOPPED":
        setIsCharging(false);
        setActiveSession(null);
        
        setRealTimeData(prev => ({
          ...prev,
          status: "Available",
          power: 0,
          current: 0
        }));
        
        toast.success("Charging stopped successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        break;

      case "TRANSACTION_COMPLETED":
        console.log("✅ Transaction completed details:", message);
            
        // Store transaction details
        setTransactionDetails({
            transactionId: message.transactionId,
            powerConsumed: parseFloat(message.powerConsumed || 0).toFixed(2),
            durationMinutes: message.durationMinutes,
            cost: message.cost || "0.00",
            startTime: message.startTime,
            endTime: message.endTime,
            idDevice: message.idDevice
        });
            
        // Show the details section
        setShowTransactionDetails(true);
            
        // Update UI
        setIsCharging(false);
        setActiveSession(null);
            
        setRealTimeData(prev => ({
            ...prev,
            status: "Available",
            power: 0,
            current: 0
        }));
            
        toast.success("Charging completed! View transaction details below.", {
            position: "top-right",
            autoClose: 5000,
        });
        break;
        
      case "STATUS_CHANGED":
        const newStatus = message.status;
        setRealTimeData(prev => ({
          ...prev,
          status: newStatus
        }));
        
        // Update charging state based on status
        if (newStatus === "Charging" || newStatus === "Preparing") {
          setIsCharging(true);
        } else if (newStatus === "Available" || newStatus === "Finishing") {
          setIsCharging(false);
        }
        
        toast.info(`Device status: ${newStatus}`, {
          position: "top-right",
          autoClose: 2000,
        });
        break;
        
      case "METER_VALUES":
            console.log("🔋 [FRONTEND] Processing METER_VALUES:", message);
            
            // Check if meterValue exists
            if (!message.meterValue) {
                console.error("❌ [FRONTEND] No meterValue in METER_VALUES message");
                break;
            }
            
            // Check if sampledValue exists
            if (!message.meterValue.sampledValue) {
                console.error("❌ [FRONTEND] No sampledValue in meterValue");
                break;
            }
            
            console.log("🔋 [FRONTEND] Sampled values:", message.meterValue.sampledValue);
            
            // Process each sample
            message.meterValue.sampledValue.forEach(sample => {
                const value = parseFloat(sample.value) || 0;
                console.log(`🔋 [FRONTEND] Sample - Value: ${value}, Measurand: ${sample.measurand}, Unit: ${sample.unit}`);
                
                if (sample.measurand === "Power.Active.Import" || sample.measurand === "Power.Active.Import.Register") {
                    console.log(`🔋 [FRONTEND] Setting power to: ${value} kW`);
                    setRealTimeData(prev => ({ ...prev, power: value }));
                } else if (sample.measurand === "Voltage") {
                    console.log(`🔋 [FRONTEND] Setting voltage to: ${value} V`);
                    setRealTimeData(prev => ({ ...prev, voltage: value }));
                } else if (sample.measurand === "Current.Import") {
                    console.log(`🔋 [FRONTEND] Setting current to: ${value} A`);
                    setRealTimeData(prev => ({ ...prev, current: value }));
                } else if (sample.measurand === "Energy.Active.Import.Register") {
                    console.log(`🔋 [FRONTEND] Setting energy to: ${value} kWh`);
                    setRealTimeData(prev => ({ ...prev, energy: value }));
                } else if (sample.measurand === "Temperature") {
                    console.log(`🔋 [FRONTEND] Setting temperature to: ${value} °C`);
                    setRealTimeData(prev => ({ ...prev, temperature: value }));
                }
            });
            
            // Ensure charging state is true when we get meter values
            if (!isCharging) {
                console.log("🔋 [FRONTEND] Setting charging state to true");
                setIsCharging(true);
            }
            break;
        
      case "OPERATION_RESULT":
        if (message.result === "PENDING") {
          toast.info("Charging command sent to device...", {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (message.result === "SUCCESS") {
          toast.success(`Operation completed successfully`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
        break;
        
      case "OPERATION_ERROR":
        toast.error(`Operation failed: ${message.errorDescription}`, {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Reset charging state on error
        setIsCharging(false);
        setActiveSession(null);
        setRealTimeData(prev => ({
          ...prev,
          status: "Available",
          power: 0,
          current: 0
        }));
        break;
        
      default:
        console.log("Unknown WebSocket message:", message);
    }
  };

  const fetchDeviceDetails = async () => {
    if (!idDevice || idDevice.trim() === "") {
      toast.error("Please scan a QR code or enter a Device ID", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/charging/device/${idDevice}/details`);
      
      if (response.ok) {
        const details = await response.json();
        console.log("Device details loaded:", details);
        
        setDeviceDetails({
          ...details,
          connected: details.connected || isWebSocketConnected
        });
        
        // Set initial status
        if (details.isCharging) {
          setIsCharging(true);
          setRealTimeData(prev => ({
            ...prev,
            status: "Charging"
          }));
          
          if (details.activeSession) {
            setActiveSession(details.activeSession);
          }
        } else {
          setIsCharging(false);
          setRealTimeData(prev => ({
            ...prev,
            status: details.connected ? "Available" : "Disconnected"
          }));
        }
        
        toast.success("Device details loaded successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // If device not found, still show as connected for simulation
        console.warn("Device not found via REST API, using simulation mode");
        setDeviceDetails({
          idDevice: idDevice,
          cebSerialNo: "SIM-001",
          maximumOutput: 7.4,
          connected: true, // Always connected in simulation
          isCharging: false
        });
        
        setRealTimeData(prev => ({
          ...prev,
          status: "Available"
        }));
        
        setIsCharging(false);
        
        toast.info("Using simulation mode (device not in database)", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      console.error("Error fetching device details:", error);
      // Even on error, set up for simulation
      setDeviceDetails({
        idDevice: idDevice,
        cebSerialNo: "SIM-001",
        maximumOutput: 7.4,
        connected: true,
        isCharging: false
      });
      
      setRealTimeData(prev => ({
        ...prev,
        status: "Available"
      }));
      
      setIsCharging(false);
      
      toast.warning("Using simulation mode due to connection error", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceIdSubmit = async () => {
    if (!idDevice.trim()) {
      toast.error("Please scan a QR code or enter a Smart Plug Device ID", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    preparedRef.current = false;

    // Disconnect existing WebSocket if any
    disconnectWebSocket();
    
    // Fetch device details first
    await fetchDeviceDetails();
    
    // Then establish WebSocket connection
    if (!stompClient.current) {
      connectWebSocket();
    }
  };

  const sendPrepareCommand = async () => {
      try {
          const evOwnerAccountNo = sessionStorage.getItem("eAccountNo") || "";
          const response = await fetch(`${baseUrl}/api/charging/device/${idDevice}/prepare`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ evOwnerAccountNo: evOwnerAccountNo })
          });
          const result = await response.json();
          if (result.success) {
              console.log('✅ Prepare command sent, device is ready');
          } else {
              console.error('❌ Prepare failed:', result.message);
              toast.error('Failed to prepare device: ' + result.message);
          }
      } catch (error) {
          console.error('❌ Error sending prepare command:', error);
      }
  };

  // Add new function to fetch transaction details
  const fetchTransactionDetails = async (transactionId) => {
      try {
          const response = await fetch(`${baseUrl}/api/charging/session/${transactionId}`);
          
          if (response.ok) {
              const sessionData = await response.json();
              
              // Calculate duration
              const startTime = new Date(sessionData.startTime);
              const endTime = new Date(sessionData.endTime || new Date());
              const durationMs = endTime - startTime;
              const diffSeconds = Math.floor(durationMs / 1000);
              const hours = Math.floor(diffSeconds / 3600);
              const minutes = Math.floor((diffSeconds % 3600) / 60);
              const seconds = diffSeconds % 60;
              const durationFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              
              setTransactionDetails({
                  transactionId: sessionData.sessionId,
                  powerConsumed: parseFloat(sessionData.totalConsumption || 0).toFixed(2),
                  durationMinutes: Math.floor(durationMs / 60000),
                  durationFormatted: durationFormatted,
                  cost: sessionData.amount ? `$${parseFloat(sessionData.amount).toFixed(2)}` : "$0.00",
                  startTime: sessionData.startTime,
                  endTime: sessionData.endTime,
                  idDevice: sessionData.idDevice
              });
              
              setShowTransactionDetails(true);
          }
      } catch (error) {
          console.error("Error fetching transaction details:", error);
      }
  };

  // Add function to format duration nicely:
  const formatDuration = (minutes) => {
      if (!minutes) return "0m";
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0) {
          return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
  };

  // Add function to close transaction details:
  const closeTransactionDetails = () => {
      setShowTransactionDetails(false);
      setTransactionDetails(null);
  };

  const handlePaymentSettings = async () => {
      if (!transactionDetails || !transactionDetails.transactionId) {
          toast.error("No transaction to process", {
              position: "top-right",
              autoClose: 3000,
          });
          return;
      }

      toast.info("Sending billing information...", {
          position: "top-right",
          autoClose: 2000,
      });

      try {
          const billingResponse = await fetch(`${baseUrl}/api/billing/send-to-billing`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactionId: transactionDetails.transactionId })
          });
          const billingResult = await billingResponse.json();

          console.log("========== BILLING API CALL ==========");
          console.log("✅ Success:", billingResult.success);
          console.log("📦 Request Payload:", billingResult.payload);
          console.log("📨 Message:", billingResult.message);
          if (billingResult.statusCode) console.log("🔢 Status Code:", billingResult.statusCode);
          if (billingResult.error) console.log("❌ Error:", billingResult.error);
          console.log("======================================");

          if (billingResult.success) {
              toast.success("✅ Billing information sent to utility", {
                  position: "top-right",
                  autoClose: 5000,
              });
          } else {
              toast.warn("⚠️ Billing API temporarily unavailable – payment will be handled separately", {
                  position: "top-right",
                  autoClose: 7000,
              });
          }
      } catch (billingError) {
          console.error("❌ Billing API call error:", billingError);
          toast.error("❌ Could not reach billing service", {
              position: "top-right",
              autoClose: 5000,
          });
      }

      // Redirect to payment page after a short delay (existing behavior)
      setTimeout(() => {
          window.location.href = "/smartplug/payment";
      }, 2000);
  };

  const handleRefreshDevice = () => {
    fetchDeviceDetails();
    toast.info("Refreshing device details...", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return "00:00:00";
    
    try {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      
      // Get total seconds
      let diffSeconds = Math.floor((end - start) / 1000);
      
      // Handle negative duration (edge case)
      if (diffSeconds < 0) {
        console.warn("Negative duration detected, using 00:00:00");
        return "00:00:00";
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(diffSeconds / 3600);
      diffSeconds %= 3600;
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "00:00:00";
    }
  };

  const calculateCost = (energy) => {
    const ratePerKwh = 0.15; // $0.15 per kWh
    return (energy * ratePerKwh).toFixed(2);
  };

  // Replace the existing downloadTransactionReceipt function with this:
  const downloadTransactionReceipt = () => {
    if (!transactionDetails) return;

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `EV Charging Receipt - ${transactionDetails.transactionId}`,
        subject: 'Transaction Receipt',
        author: 'EV Charging System',
        keywords: 'receipt, ev, charging, transaction',
        creator: 'EV Charging System'
      });

      // Add logo/header
      doc.setFontSize(24);
      doc.setTextColor(40, 53, 147); // Blue color
      doc.text('EV CHARGING RECEIPT', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for choosing our EV Charging Service', 105, 28, { align: 'center' });
      
      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 35, 190, 35);
      
      // Transaction Information Section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('TRANSACTION INFORMATION', 20, 45);
      
      doc.setFontSize(10);
      const transactionInfo = [
        ['Transaction ID:', `#${transactionDetails.transactionId}`],
        ['Device ID:', transactionDetails.idDevice],
        ['Date:', new Date().toLocaleDateString()],
        ['Time:', new Date().toLocaleTimeString()],
        ['Status:', 'COMPLETED']
      ];
      
      // Use autoTable function directly, passing doc as first parameter
      autoTable(doc, {
        startY: 50,
        theme: 'grid',
        head: [['Field', 'Value']],
        body: transactionInfo,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: 20, right: 20 }
      });

      // Charging Details Section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('CHARGING DETAILS', 20, finalY);
      
      const chargingDetails = [
        ['Power Consumed:', `${transactionDetails.powerConsumed} kWh`],
        ['Duration:', transactionDetails.durationFormatted || 
          calculateDuration(transactionDetails.startTime, transactionDetails.endTime)],
        ['Start Time:', new Date(transactionDetails.startTime).toLocaleString()],
        ['End Time:', new Date(transactionDetails.endTime || new Date()).toLocaleString()],
        ['Charging Mode:', 'FAST']
      ];
      
      autoTable(doc, {
        startY: finalY + 5,
        theme: 'grid',
        head: [['Parameter', 'Value']],
        body: chargingDetails,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [33, 150, 243] }
      });

      // Billing Information Section
      const billingY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('BILLING INFORMATION', 20, billingY);
      
      const billingInfo = [
        ['Rate:', '$0.15 per kWh'],
        ['Total Energy:', `${transactionDetails.powerConsumed} kWh`],
        ['Subtotal:', transactionDetails.cost],
        ['Tax (0%):', '$0.00'],
        ['Total Amount:', transactionDetails.cost]
      ];
      
      autoTable(doc, {
        startY: billingY + 5,
        theme: 'grid',
        head: [['Description', 'Amount']],
        body: billingInfo,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [76, 175, 80] }
      });

      // Add total amount in bold
      const totalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL: ${transactionDetails.cost}`, 20, totalY);
      doc.setFont(undefined, 'normal');

      // Add separator line before footer
      doc.setDrawColor(200, 200, 200);
      doc.line(20, totalY + 10, 190, totalY + 10);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for charging with us!', 105, totalY + 20, { align: 'center' });
      doc.text('For inquiries, contact: support@evchargingsystem.com', 105, totalY + 25, { align: 'center' });
      doc.text('Terms & Conditions apply. Receipt ID: ' + transactionDetails.transactionId, 105, totalY + 30, { align: 'center' });
      
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.rect(10, 10, 190, 277); // A4 size border

      // Save the PDF
      doc.save(`EV-Charging-Receipt-${transactionDetails.transactionId}.pdf`);
      
      toast.success("Receipt downloaded as PDF!", {
        position: "top-right",
        autoClose: 3000,
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF receipt", {
        position: "top-right",
        autoClose: 3000,
      });
      
    }
  };

  const handleDeviceIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setIdDevice(value);
  };

  // Clear device and reset state
  const handleClearDevice = () => {
    setIdDevice("");
    setScannedDeviceId("");
    preparedRef.current = false;
    setDeviceDetails(null);
    setActiveSession(null);
    setIsCharging(false);
    setTransactionDetails(null);
    setShowTransactionDetails(false);
    setRealTimeData({
      power: 0,
      voltage: 230,
      current: 0,
      energy: 0,
      status: "Disconnected",
      temperature: 25
    });
    disconnectWebSocket();
    stopQRScanner();
    
    toast.info("Device cleared. Scan a new QR code.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="relative md:ml-64 bg-gray-50 min-h-screen">
      {/* Header - Updated to crimson gradient */}
      <div className="relative bg-gradient-to-r from-crimson to-crimson-dark md:pt-24 pb-16 md:pb-20 pt-12 shadow-lg">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                EV Charging Dashboard
              </h1>
              <p className="text-white text-lg">
                Scan QR code or enter Device ID to start charging
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex items-center px-4 py-3 rounded-lg shadow ${isWebSocketConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-semibold transition-all duration-300`}>
                <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${isWebSocketConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                {isWebSocketConnected ? 'Connected' : 'Disconnected'}
                {isConnecting && (
                  <span className="ml-2">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-10 mx-auto w-full -mt-16">
        {/* Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i className="fas fa-plug text-blue-500 mr-3"></i>
            Connect to Smart Plug
          </h2>
          
          {/* QR Scanner Section */}
          {showQRScanner && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Scan QR Code</h3>
                <button
                  onClick={stopQRScanner}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times"></i> Close Scanner
                </button>
              </div>
              <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
              <p className="text-center text-gray-600 mt-2">
                Point your camera at the QR code on the smart plug
              </p>
            </div>
          )}

          {/* Device Connection Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smart Plug Device ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <i className="fas fa-microchip absolute left-3 top-3 text-gray-400"></i>
                    <input
                      type="text"
                      value={idDevice}
                      onChange={handleDeviceIdChange}
                      placeholder="Scan QR code or enter Device ID (e.g., DEV-1001)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-300"
                    />
                  </div>
                  <button
                    onClick={toggleQRScanner}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-medium flex items-center transition duration-300 shadow-md"
                  >
                    <i className="fas fa-qrcode mr-2"></i>
                    {showQRScanner ? 'Hide Scanner' : 'Scan QR'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Scan the QR code from the smart plug or manually enter the device ID
                </p>
              </div>
              
              {deviceDetails && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Current Device</p>
                      <p className="font-bold text-blue-900">{deviceDetails.idDevice}</p>
                      {scannedDeviceId && (
                        <p className="text-sm text-blue-600 mt-1">
                          <i className="fas fa-qrcode mr-1"></i>
                          Scanned from QR code
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefreshDevice}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition duration-300"
                      >
                        <i className="fas fa-sync-alt mr-2"></i> Refresh
                      </button>
                      <button
                        onClick={handleClearDevice}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition duration-300"
                      >
                        <i className="fas fa-times mr-2"></i> Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Removed Connect and Disconnect buttons */}
          </div>
        </div>

        {/* Main Content Grid - Only show if device is connected */}
        {deviceDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Device Information Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-info-circle text-blue-500 mr-3"></i>
                    Device Information
                  </h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    deviceDetails.connected
                      ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
                      : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200'
                  }`}>
                    {deviceDetails.connected ? (
                      <><i className="fas fa-wifi mr-1"></i> Online</>
                    ) : (
                      <><i className="fas fa-wifi-slash mr-1"></i> Offline</>
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <i className="fas fa-microchip text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Device ID</p>
                        <p className="font-bold text-xl text-blue-900">{deviceDetails.idDevice}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <i className="fas fa-hashtag text-green-600"></i>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">CEB Serial No</p>
                        <p className="font-bold text-xl text-green-900">{deviceDetails.cebSerialNo || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <i className="fas fa-bolt text-purple-600"></i>
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Maximum Output</p>
                        <p className="font-bold text-xl text-purple-900">{deviceDetails.maximumOutput || '7.4'} kW</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl border ${
                    realTimeData.status === "Charging" 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                      : realTimeData.status === "Preparing"
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                      : realTimeData.status === "Finishing"
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                      : realTimeData.status === "Available"
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg mr-3 ${
                        realTimeData.status === "Charging" ? 'bg-green-100' :
                        realTimeData.status === "Preparing" ? 'bg-blue-100' :
                        realTimeData.status === "Finishing" ? 'bg-yellow-100' : 
                        realTimeData.status === "Available" ? 'bg-gray-100' : 'bg-red-100'
                      }`}>
                        <i className={`fas ${
                          realTimeData.status === "Charging" ? 'fa-bolt text-green-600' :
                          realTimeData.status === "Preparing" ? 'fa-clock text-blue-600' :
                          realTimeData.status === "Finishing" ? 'fa-stopwatch text-yellow-600' : 
                          realTimeData.status === "Available" ? 'fa-pause-circle text-gray-600' : 
                          'fa-wifi-slash text-red-600'
                        }`}></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Charging Status</p>
                        <p className={`font-bold text-xl ${
                          realTimeData.status === "Charging" ? 'text-green-700' :
                          realTimeData.status === "Preparing" ? 'text-blue-700' :
                          realTimeData.status === "Finishing" ? 'text-yellow-700' : 
                          realTimeData.status === "Available" ? 'text-gray-700' : 'text-red-700'
                        }`}>
                          {realTimeData.status ? realTimeData.status.toUpperCase() : 'DISCONNECTED'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Data Card */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 h-full">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-chart-line text-purple-500 mr-3"></i>
                  Real-time Charging Data
                </h3>
                
                {isCharging ? (
                  <>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Power</p>
                            <p className="text-2xl font-bold text-blue-900">{realTimeData.power.toFixed(2)} kW</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <i className="fas fa-bolt text-blue-600 text-xl"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-green-600 font-medium">Voltage</p>
                          <p className="text-xl font-bold text-green-900">{realTimeData.voltage.toFixed(1)} V</p>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                          <p className="text-sm text-yellow-600 font-medium">Current</p>
                          <p className="text-xl font-bold text-yellow-900">{realTimeData.current.toFixed(2)} A</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Energy Consumed</p>
                            <p className="text-2xl font-bold text-purple-900">{realTimeData.energy.toFixed(2)} kWh</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <i className="fas fa-battery-three-quarters text-purple-600 text-xl"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Temperature</p>
                            <p className="text-xl font-bold text-gray-900">{realTimeData.temperature.toFixed(1)} °C</p>
                          </div>
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <i className="fas fa-thermometer-half text-gray-600 text-xl"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-8">
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">Charging Progress</span>
                        <span className="text-gray-700 font-bold">
                          {Math.min(100, (realTimeData.energy / 50) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, (realTimeData.energy / 50) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0 kWh</span>
                        <span>25 kWh</span>
                        <span>50 kWh</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <i className="fas fa-chart-bar text-gray-400 text-4xl"></i>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Active Charging</h4>
                    <p className="text-gray-500 mb-6">Start a charging session to view real-time data</p>
                    <div className="animate-pulse">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 h-16 rounded-xl"></div>
                        <div className="bg-gray-100 h-16 rounded-xl"></div>
                        <div className="bg-gray-100 h-16 rounded-xl"></div>
                        <div className="bg-gray-100 h-16 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Session Card */}
        {activeSession && isCharging && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border border-green-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-green-800 flex items-center">
                <i className="fas fa-bolt text-green-600 mr-3"></i>
                Active Charging Session
              </h3>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                LIVE
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-bold text-lg text-gray-800">
                  {activeSession.transactionId && activeSession.transactionId !== 'Unknown' 
                    ? `#${activeSession.transactionId}` 
                    : '#---'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeSession.transactionId ? `Type: ${typeof activeSession.transactionId}` : 'Not set'}
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Start Time</p>
                <p className="font-bold text-lg text-gray-800">
                  {activeSession.startTime ? 
                    new Date(activeSession.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    '--:--'
                  }
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-bold text-lg text-gray-800">{calculateDuration(activeSession.startTime, null)}</p>
              </div>
              
              {/* Updated Cost card with modern gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-xl shadow-lg">
                <p className="text-sm text-white mb-1">Estimated Cost</p>
                <p className="font-bold text-2xl text-white">${calculateCost(realTimeData.energy)}</p>
                <p className="text-xs text-white mt-1">{realTimeData.energy.toFixed(2)} kWh @ $0.15/kWh</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details Section */}
        {showTransactionDetails && transactionDetails && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-200 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center">
                        <i className="fas fa-receipt text-blue-600 mr-3"></i>
                        Transaction Details
                    </h3>
                    <button
                        onClick={closeTransactionDetails}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <i className="fas fa-bolt text-blue-600"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Power Consumed</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {transactionDetails.powerConsumed} kWh
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                <i className="fas fa-clock text-green-600"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Duration</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {transactionDetails.durationFormatted || 
                                    formatDuration(transactionDetails.durationMinutes)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <i className="fas fa-dollar-sign text-purple-600"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Cost</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {transactionDetails.cost}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                <i className="fas fa-microchip text-yellow-600"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                <p className="text-xl font-bold text-yellow-900">
                                    #{transactionDetails.transactionId}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Start Time</p>
                        <p className="font-medium text-gray-800">
                            {transactionDetails.startTime ? 
                                new Date(transactionDetails.startTime).toLocaleString() : 
                                'N/A'}
                        </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">End Time</p>
                        <p className="font-medium text-gray-800">
                            {transactionDetails.endTime ? 
                                new Date(transactionDetails.endTime).toLocaleString() : 
                                new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={closeTransactionDetails}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-300"
                    >
                        Close
                    </button>
                    {/* Updated Download Receipt button */}
                    <button
                        onClick={downloadTransactionReceipt}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition duration-300 shadow-md"
                    >
                        <i className="fas fa-print mr-2"></i> Download Receipt
                    </button>
                    {/* Updated Proceed to Payment button */}
                    <button
                        onClick={handlePaymentSettings}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition duration-300 shadow-md"
                    >
                        <i className="fas fa-credit-card mr-2"></i> Proceed to Payment
                    </button>
                </div>
            </div>
        )}

        {/* Help Section */}
        {!deviceDetails && !showQRScanner && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-200 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-qrcode text-blue-500 text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">How to Get Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Scan QR Code</h4>
                <p className="text-gray-600 text-sm">Click "Scan QR" button and point camera at the QR code on the smart plug</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Connect Device</h4>
                <p className="text-gray-600 text-sm">System will automatically connect to the device and load details</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Start Charging</h4>
                <p className="text-gray-600 text-sm">Click "Start Charging" to begin charging your EV</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={toggleQRScanner}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <i className="fas fa-qrcode mr-3"></i>
                Start by Scanning QR Code
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200 inline-block">
              <p className="text-gray-700">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                <strong>Manual Option:</strong> You can also manually enter Device ID (e.g., DEV-1001, SP-001)
              </p>
            </div>
          </div>
        )}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ChargingEV;