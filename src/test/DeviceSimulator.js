class DeviceSimulator {
    constructor(deviceId) {
        this.deviceId = deviceId;
        this.ws = null;
        this.transactionId = null;
        this.meterValue = 0;
    }
    
    connect() {
        const wsUrl = `ws://localhost:8080/EV/ws-ocpp/${this.deviceId}`;
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log(`✅ Device ${this.deviceId} connected`);
            this.sendBootNotification();
        };
        
        this.ws.onmessage = (event) => {
            console.log(`📥 ${this.deviceId} received:`, event.data);
            this.handleServerResponse(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
            console.log(`❌ Device ${this.deviceId} disconnected`);
        };
    }
    
    sendBootNotification() {
        const message = [
            2,
            "boot-001",
            "BootNotification",
            {
                chargePointVendor: "Tesla",
                chargePointModel: "Wall Connector",
                chargePointSerialNumber: this.deviceId,
                firmwareVersion: "2.0.1"
            }
        ];
        this.sendMessage(message);
    }
    
    sendAuthorize(idTag = "TEST123") {
        const message = [
            2,
            "auth-001",
            "Authorize",
            { idTag: idTag }
        ];
        this.sendMessage(message);
    }
    
    sendStartTransaction(idTag = "TEST123") {
        const message = [
            2,
            "start-001",
            "StartTransaction",
            {
                connectorId: 1,
                idTag: idTag,
                meterStart: 0,
                timestamp: new Date().toISOString()
            }
        ];
        this.sendMessage(message);
    }
    
    sendMeterValues() {
        if (!this.transactionId) return;
        
        this.meterValue += 1.5;
        
        const message = [
            2,
            `meter-${Date.now()}`,
            "MeterValues",
            {
                connectorId: 1,
                transactionId: this.transactionId,
                meterValue: [{
                    timestamp: new Date().toISOString(),
                    sampledValue: [{
                        value: this.meterValue.toString(),
                        measurand: "Energy.Active.Import.Register",
                        unit: "kWh"
                    }]
                }]
            }
        ];
        this.sendMessage(message);
    }
    
    sendStopTransaction() {
        if (!this.transactionId) return;
        
        const message = [
            2,
            "stop-001",
            "StopTransaction",
            {
                transactionId: this.transactionId,
                meterStop: Math.round(this.meterValue),
                timestamp: new Date().toISOString(),
                reason: "Local"
            }
        ];
        this.sendMessage(message);
    }
    
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            console.log(`📤 ${this.deviceId} sent:`, message);
        }
    }
    
    handleServerResponse(response) {
        const [messageType, messageId, action, payload] = response;
        
        if (messageType === 3) { // CALLRESULT
            if (action === "StartTransaction" && payload.transactionId) {
                this.transactionId = payload.transactionId;
                console.log(`🔋 Transaction started: ${this.transactionId}`);
                
                // Start sending meter values every 5 seconds
                setInterval(() => this.sendMeterValues(), 5000);
            }
        }
    }
}

// Usage:
// const device = new DeviceSimulator("DEV-1001");
// device.connect();