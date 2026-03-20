#!/usr/bin/env python3
"""
Smart Plug Simulator for EV Charging System
This simulator connects to your backend via WebSocket and acts as a smart plug.
Updated to fix concurrency issues.
"""

import asyncio
import websockets
import json
import time
from datetime import datetime, timezone
import uuid

class SmartPlugSimulator:
    def __init__(self, device_id, server_url):
        self.device_id = device_id
        self.server_url = f"{server_url}/{device_id}"
        self.ws = None
        self.transaction_id = None
        self.is_charging = False
        self.meter_value = 0.0
        self.connector_id = 1
        self.running = True
        self.message_queue = asyncio.Queue()
        self.receiver_task = None
        self.processor_task = None
        
    async def connect(self):
        """Connect to WebSocket server"""
        print(f"🔌 Connecting to: {self.server_url}")
        try:
            self.ws = await websockets.connect(self.server_url, ping_interval=30)
            print("✅ Connected successfully!")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def send_ocpp_message(self, message_type, action, payload=None):
        """Send OCPP-compliant message"""
        message = [
            message_type,  # 2 = CALL, 3 = CALLRESULT, 4 = CALLERROR
            str(uuid.uuid4())[:8],  # Unique message ID
            action
        ]
        
        if payload:
            message.append(payload)
        
        message_json = json.dumps(message)
        await self.ws.send(message_json)
        
        print(f"📤 Sent: {action}")
        if payload:
            print(f"   Payload: {json.dumps(payload, indent=2)}")
        
        return message[1]  # Return message ID
    
    async def receiver_loop(self):
        """Dedicated task for receiving messages"""
        print("🔄 Starting receiver loop...")
        while self.running and self.ws:
            try:
                response = await self.ws.recv()
                data = json.loads(response)
                print(f"📥 Received raw: {json.dumps(data, indent=2)}")
                
                # Put message in queue for processing
                await self.message_queue.put(data)
                
            except asyncio.CancelledError:
                print("🔄 Receiver loop cancelled")
                break
            except websockets.exceptions.ConnectionClosed:
                print("🔌 Connection closed by server")
                self.running = False
                break
            except Exception as e:
                if not self.running:
                    break
                print(f"❌ Receiver error: {e}")
                await asyncio.sleep(0.1)
    
    # Update the processor_loop to properly handle StartTransaction response
    async def processor_loop(self):
        """Dedicated task for processing messages from queue"""
        print("🔄 Starting processor loop...")
        while self.running:
            try:
                # Get message from queue with timeout
                try:
                    message = await asyncio.wait_for(self.message_queue.get(), timeout=0.5)
                    
                    # Process the message
                    await self.process_incoming_message(message)
                    
                    # Mark task as done
                    self.message_queue.task_done()
                    
                except asyncio.TimeoutError:
                    # No message in queue, continue
                    continue
                    
            except asyncio.CancelledError:
                print("🔄 Processor loop cancelled")
                break
            except Exception as e:
                print(f"❌ Processor error: {e}")
                import traceback
                traceback.print_exc()
    
    # Update the process_incoming_message to properly set transaction_id
    async def process_incoming_message(self, message):
        """Process any incoming message"""
        if not isinstance(message, list) or len(message) < 3:
            print(f"⚠️  Invalid message format: {message}")
            return
        
        message_type = message[0]
        message_id = message[1]
        action = message[2] if isinstance(message[2], str) else str(message[2])
        payload = message[3] if len(message) > 3 else {}
        
        print(f"🔧 Processing: {action} (type: {message_type})")
        
        # Handle commands from backend
        if message_type == 2:  # CALL
            if action == "RemoteStartTransaction":
                await self.handle_remote_start(message_id, payload)
            elif action == "RemoteStopTransaction":
                await self.handle_remote_stop(message_id, payload)
        elif message_type == 3:  # CALLRESULT
            # Handle responses to our calls
            print(f"✅ Received response for message {message_id}")
            
            # If this is a StartTransaction response, extract transaction_id
            if isinstance(payload, dict) and "transactionId" in payload:
                self.transaction_id = payload["transactionId"]
                print(f"💾 Set transaction_id to: {self.transaction_id}")
    
    async def send_boot_notification(self):
        """Send BootNotification to register device"""
        payload = {
            "chargePointVendor": "TestVendor",
            "chargePointModel": "TestModel",
            "chargePointSerialNumber": self.device_id,
            "firmwareVersion": "1.0.0",
            "meterSerialNumber": f"METER-{self.device_id}",
            "meterType": "DC"
        }
        return await self.send_ocpp_message(2, "BootNotification", payload)
    
    async def send_status_notification(self, status, connector_id=1):
        """Send StatusNotification with given status"""
        payload = {
            "connectorId": connector_id,
            "status": status,
            "errorCode": "NoError",
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        }
        return await self.send_ocpp_message(2, "StatusNotification", payload)
    
    async def send_authorize(self, id_tag):
        """Send Authorize message"""
        payload = {"idTag": id_tag}
        return await self.send_ocpp_message(2, "Authorize", payload)
    
    async def send_start_transaction(self, id_tag, connector_id=1):
        """Send StartTransaction message"""
        payload = {
            "connectorId": connector_id,
            "idTag": id_tag,
            "meterStart": 0,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "reservationId": None
        }
        return await self.send_ocpp_message(2, "StartTransaction", payload)
    
    async def send_meter_values(self, transaction_id):
        """Send MeterValues with simulated data"""
        self.meter_value += 0.5  # Increase by 0.5 kWh each time

        # Calculate power (kW) = Voltage × Current ÷ 1000
        voltage = 230.0
        current = 10.0
        power = (voltage * current) / 1000  # 2.3 kW
        
        payload = {
            "connectorId": self.connector_id,
            "transactionId": transaction_id,
            "meterValue": [{
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "sampledValue": [
                    {
                        "value": str(round(self.meter_value, 2)),
                        "measurand": "Energy.Active.Import.Register",
                        "unit": "kWh"
                    },
                    {
                        "value": "230.0",
                        "measurand": "Voltage",
                        "unit": "V"
                    },
                    {
                        "value": "10.0",
                        "measurand": "Current.Import",
                        "unit": "A"
                    }
                ]
            }]
        }
        return await self.send_ocpp_message(2, "MeterValues", payload)
    
    async def send_stop_transaction(self, transaction_id):
        """Send StopTransaction message"""
        payload = {
            "transactionId": transaction_id,
            "meterStop": int(self.meter_value),
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "reason": "Remote"
        }
        return await self.send_ocpp_message(2, "StopTransaction", payload)
    
    async def handle_remote_start(self, message_id, payload):
        """Handle RemoteStartTransaction from backend"""
        print("🎯 Received RemoteStartTransaction command")
        
        # Extract data
        id_tag = payload.get('idTag', f'IDT-{self.device_id}')
        connector_id = payload.get('connectorId', 1)
        self.connector_id = connector_id
        
        # Send acceptance response
        response = [3, message_id, {"status": "Accepted"}]
        await self.ws.send(json.dumps(response))
        print("✅ Sent RemoteStartTransaction.conf")
        
        # Start the actual charging process
        await self.start_charging_sequence(id_tag, connector_id)
    
    async def handle_remote_stop(self, message_id, payload):
        """Handle RemoteStopTransaction from backend"""
        print("🛑 Received RemoteStopTransaction command")
        
        transaction_id = payload.get('transactionId', self.transaction_id)
        
        # Send acceptance response
        response = [3, message_id, {"status": "Accepted"}]
        await self.ws.send(json.dumps(response))
        print("✅ Sent RemoteStopTransaction.conf")
        
        # Stop charging
        await self.stop_charging_sequence(transaction_id)
    
    # Also update the start_charging_sequence method to properly set transaction_id
    async def start_charging_sequence(self, id_tag, connector_id):
        """Complete sequence to start charging"""
        try:
            print(f"\n🚀 Starting charging sequence...")
            self.is_charging = True
            
            # 1. Authorize
            await self.send_authorize(id_tag)
            await asyncio.sleep(1)
            
            # 2. Status: Preparing
            await self.send_status_notification("Preparing", connector_id)
            await asyncio.sleep(1)
            
            # 3. StartTransaction
            await self.send_start_transaction(id_tag, connector_id)
            await asyncio.sleep(2)  # Wait longer for response
            
            # 4. Status: Charging
            await self.send_status_notification("Charging", connector_id)
            
            # Start sending meter values
            asyncio.create_task(self.meter_value_loop())
                
        except Exception as e:
            print(f"❌ Error in charging sequence: {e}")
            import traceback
            traceback.print_exc()
    
    # Update the meter_value_loop method in smartplug_test.py
    async def meter_value_loop(self):
        """Send meter values periodically while charging"""
        print("🔋 Starting meter value loop...")
        loop_count = 0
        
        # Set is_charging to True before loop starts
        self.is_charging = True
        
        while self.is_charging and self.running:
            try:
                await asyncio.sleep(3)  # Send every 3 seconds
                
                # Check if transaction_id is set
                if not self.transaction_id:
                    print("⚠️  No transaction ID, will try to use last known")
                    # Try to find transaction ID from active session
                    await self.send_meter_values(50)  # Use default transaction ID
                else:
                    print(f"📊 Sending meter value: {self.meter_value:.2f} kWh")
                    await self.send_meter_values(self.transaction_id)
                
                # Safety: stop after 100 iterations to prevent infinite loop
                loop_count += 1
                if loop_count > 100:
                    print("⚠️  Meter loop safety limit reached")
                    break
                    
            except Exception as e:
                print(f"❌ Error in meter loop: {e}")
                import traceback
                traceback.print_exc()
                break
    
    async def stop_charging_sequence(self, transaction_id):
        """Complete sequence to stop charging"""
        try:
            print(f"\n🛑 Stopping charging...")
            self.is_charging = False
            
            # Use provided ID or stored one
            stop_id = transaction_id or self.transaction_id
            
            if not stop_id:
                print("❌ No transaction ID to stop")
                return
            
            # 1. Status: Finishing
            await self.send_status_notification("Finishing", self.connector_id)
            await asyncio.sleep(0.5)
            
            # 2. StopTransaction
            await self.send_stop_transaction(stop_id)
            await asyncio.sleep(0.5)
            
            # 3. Status: Available
            await self.send_status_notification("Available", self.connector_id)
            await asyncio.sleep(0.5)
            
            print(f"✅ Charging stopped. Total energy: {self.meter_value:.2f} kWh")
            self.transaction_id = None
            self.meter_value = 0.0
            
        except Exception as e:
            print(f"❌ Error stopping charging: {e}")
    
    async def main_loop(self):
        """Main simulator loop with queue-based architecture"""
        try:
            # Start receiver and processor loops
            self.receiver_task = asyncio.create_task(self.receiver_loop())
            self.processor_task = asyncio.create_task(self.processor_loop())
            
            # Initial setup
            print("\n📡 Sending initial setup...")
            await self.send_boot_notification()
            await asyncio.sleep(1)  # Wait for response
            
            await self.send_status_notification("Available")
            await asyncio.sleep(1)
            
            print(f"\n✅ Device '{self.device_id}' is ready!")
            print("   Go to your frontend and click 'Start Charging'")
            print("   Press Ctrl+C to exit\n")
            
            # Keep the main task running
            while self.running:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            print("\n👋 Stopping simulator...")
        except Exception as e:
            print(f"❌ Error in main loop: {e}")
        finally:
            self.running = False
            
            # Cancel tasks
            if self.receiver_task:
                self.receiver_task.cancel()
            if self.processor_task:
                self.processor_task.cancel()
            
            # Close WebSocket
            if self.ws:
                await self.ws.close()
                print("🔌 Connection closed")

async def main():
    print("=" * 50)
    print("SMART PLUG SIMULATOR (QUEUE-BASED)")
    print("=" * 50)
    
    # Get inputs
    device_id = input("Device ID [DEV-1001]: ").strip() or "DEV-1001"
    server_url = input("WebSocket URL [ws://localhost:8088/EV/ws-ocpp]: ").strip() or "ws://localhost:8088/EV/ws-ocpp"
    
    # Create and run simulator
    simulator = SmartPlugSimulator(device_id, server_url)
    
    if await simulator.connect():
        await simulator.main_loop()
    else:
        print("❌ Failed to connect. Exiting.")

if __name__ == "__main__":
    # Check if websockets is installed
    try:
        import websockets
    except ImportError:
        print("Installing websockets module...")
        import subprocess
        subprocess.check_call(["pip", "install", "websockets"])
        import websockets
    
    # Run the simulator
    asyncio.run(main())