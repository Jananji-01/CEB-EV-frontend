// views/admin/SmartPlugMonitor.js
import React, { useState, useEffect } from "react";

export default function SmartPlugMonitor() {
  const [viewMode, setViewMode] = useState('all');
  const [smartPlugs, setSmartPlugs] = useState([]);
  const [stations, setStations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlug, setSelectedPlug] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [error, setError] = useState(null);

  // Get base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8088/EV';
  
  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8088/EV/ws-stomp');
    
    ws.onopen = () => {
      console.log('WebSocket Connected for real-time updates');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Update real-time data for the specific device
        if (data.idDevice) {
          setRealTimeData(prev => ({
            ...prev,
            [data.idDevice]: {
              ...prev[data.idDevice],
              ...data,
              lastUpdate: new Date().toISOString()
            }
          }));
        }

        // Handle specific message types for UI feedback
        if (data.type === 'TRANSACTION_STARTED') {
          // Optionally trigger a re-fetch to get session details
          fetchData();
        } else if (data.type === 'TRANSACTION_COMPLETED') {
          fetchData(); // Refresh to update session end
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error. Real-time updates may not work.');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => ws.close();
  }, []);

  // Fetch data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [viewMode]);

  const fetchData = async () => {
    try {
      let endpoint = `${API_BASE_URL}/api/admin/smartplugs/all`;
      if (viewMode === 'stations') endpoint = `${API_BASE_URL}/api/admin/smartplugs/stations`;
      else if (viewMode === 'connected') endpoint = `${API_BASE_URL}/api/admin/smartplugs/connected`;
      else if (viewMode === 'charging') endpoint = `${API_BASE_URL}/api/admin/smartplugs/charging`;

      console.log('Fetching from:', endpoint);
      
      const [dataResponse, summaryResponse] = await Promise.all([
        fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/admin/smartplugs/dashboard-summary`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);
      
      if (!dataResponse.ok) {
        throw new Error(`HTTP error! status: ${dataResponse.status}`);
      }
      
      if (!summaryResponse.ok) {
        throw new Error(`HTTP error! status: ${summaryResponse.status}`);
      }
      
      const contentType = dataResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await dataResponse.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error("Response was not JSON");
      }
      
      const data = await dataResponse.json();
      const summaryData = await summaryResponse.json();
      
      if (viewMode === 'stations') {
        setStations(data);
      } else {
        setSmartPlugs(data);
      }
      setSummary(summaryData);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to fetch data: ${error.message}. Please check if the backend server is running.`);
      setLoading(false);
    }
  };

  const handlePlugClick = async (deviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/smartplugs/${deviceId}/details`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedPlug(data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching plug details:', error);
      alert(`Error loading plug details: ${error.message}`);
    }
  };

  const getStatusColor = (isConnected, isCharging) => {
    if (!isConnected) return 'bg-red-100 text-red-800';
    if (isCharging) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isConnected, isCharging) => {
    if (!isConnected) return 'Offline';
    if (isCharging) return 'Charging';
    return 'Available';
  };

  const getStatusIcon = (isConnected, isCharging) => {
    if (!isConnected) return <i className="fas fa-plug text-red-500 mr-1"></i>;
    if (isCharging) return <i className="fas fa-bolt text-amber-500 mr-1"></i>;
    return <i className="fas fa-check-circle text-green-500 mr-1"></i>;
  };

  // Helper to format duration from start time
  const formatDuration = (startTime) => {
    if (!startTime) return '00:00:00';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const seconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAllPlugsView = () => {
    if (smartPlugs.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-plug text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600">No smart plugs found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {smartPlugs.map((item, index) => {
          const plug = item.smartPlug;
          const isConnected = item.connected;
          const isCharging = item.isCharging;
          const realTime = realTimeData[plug?.idDevice];
          
          // Determine consumption to display: real-time energy if available, else from session
          const consumption = realTime?.energy !== undefined ? realTime.energy : (item.activeSession?.totalConsumption || 0);
          // For active sessions, use real-time power if available
          const power = realTime?.power;

          if (!plug) return null;

          return (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h6 className="font-bold text-blueGray-700 flex items-center">
                      {getStatusIcon(isConnected, isCharging)}
                      {plug.idDevice}
                    </h6>
                    <p className="text-sm text-blueGray-600 flex items-center">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {plug.stationId ? `Station ${plug.stationId}` : 'Unassigned'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(isConnected, isCharging)}`}>
                    {getStatusText(isConnected, isCharging)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">CEB Serial:</span>
                    <span className="text-sm font-semibold">{plug.cebSerialNo || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">Max Output:</span>
                    <span className="text-sm font-semibold">{plug.maximumOutput || 0} kW</span>
                  </div>

                  {/* Real-time power if available */}
                  {power !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blueGray-600">Current Power:</span>
                      <span className="text-sm font-semibold text-green-600">{power} kW</span>
                    </div>
                  )}

                  {/* Active session info with real-time consumption */}
                  {isCharging && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="text-xs font-bold text-blue-800">Active Session</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-blueGray-600">Started:</span>
                        <span className="text-xs">
                          {item.activeSession?.startTime ? new Date(item.activeSession.startTime).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-blueGray-600">Duration:</span>
                        <span className="text-xs">
                          {item.activeSession?.startTime ? formatDuration(item.activeSession.startTime) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-blueGray-600">Consumption:</span>
                        <span className="text-xs font-semibold text-blue-800">{consumption} kWh</span>
                      </div>
                      {power !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-xs text-blueGray-600">Power:</span>
                          <span className="text-xs font-semibold text-blue-800">{power} kW</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                    onClick={() => handlePlugClick(plug.idDevice)}
                  >
                    <i className="fas fa-eye mr-1"></i> View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStationsView = () => {
    if (stations.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-home text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600">No stations found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station, index) => (
          <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h6 className="font-bold text-blueGray-700 flex items-center">
                    <i className="fas fa-home mr-2 text-blue-500"></i>
                    {station.name || `Station ${station.stationId}`}
                  </h6>
                  <p className="text-sm text-blueGray-600">ID: {station.stationId}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  station.status === 'Charging' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>
                  {station.status || 'Unknown'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-blueGray-600">Location:</span>
                  <span className="text-sm font-semibold">{station.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blueGray-600">Smart Plugs:</span>
                  <span className="text-sm font-semibold">{station.smartPlugCount || 0}</span>
                </div>
              </div>

              {station.smartPlugs && station.smartPlugs.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-bold text-blueGray-700 mb-2">Smart Plugs in Station:</p>
                  <div className="space-y-2">
                    {station.smartPlugs.map((plug, plugIndex) => {
                      const realTime = realTimeData[plug?.idDevice];
                      return (
                        <div key={plugIndex} className="flex justify-between items-center p-2 bg-blueGray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{plug.idDevice}</p>
                            <p className="text-xs text-blueGray-600">{plug.cebSerialNo || 'N/A'}</p>
                            {plug.isCharging && realTime?.energy !== undefined && (
                              <p className="text-xs text-blue-600">{realTime.energy} kWh</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(plug.connected, plug.isCharging)}`}>
                            {getStatusText(plug.connected, plug.isCharging)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConnectedView = () => {
    const connectedPlugs = smartPlugs.filter(item => item.connected);
    
    if (connectedPlugs.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-wifi text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600">No connected smart plugs found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectedPlugs.map((item, index) => {
          const plug = item.smartPlug;
          const realTime = realTimeData[plug?.idDevice];

          if (!plug) return null;

          return (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-green-500 border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h6 className="font-bold text-blueGray-700 flex items-center">
                      <i className="fas fa-wifi mr-2 text-green-500"></i>
                      {plug.idDevice}
                    </h6>
                    <p className="text-sm text-blueGray-600">Online - Ready</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.isCharging ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isCharging ? 'Charging' : 'Available'}
                  </span>
                </div>

                {realTime && (
                  <div className="mb-3 p-2 bg-green-50 rounded border border-green-100">
                    <p className="text-xs font-bold text-green-800 mb-1">Live Data</p>
                    {realTime.power && (
                      <div className="flex justify-between">
                        <span className="text-xs text-blueGray-600">Power:</span>
                        <span className="text-xs font-bold">{realTime.power} kW</span>
                      </div>
                    )}
                    {realTime.energy !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-xs text-blueGray-600">Energy:</span>
                        <span className="text-xs font-bold">{realTime.energy} kWh</span>
                      </div>
                    )}
                  </div>
                )}

                {item.isCharging && item.activeSession && (
                  <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100">
                    <p className="text-xs font-bold text-blue-800">Session Info</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-blueGray-600">Started:</span>
                      <span className="text-xs">{new Date(item.activeSession.startTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-blueGray-600">Duration:</span>
                      <span className="text-xs">{formatDuration(item.activeSession.startTime)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
                  onClick={() => handlePlugClick(plug.idDevice)}
                >
                  <i className="fas fa-eye mr-1"></i> View Live Status
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChargingView = () => {
    const chargingPlugs = smartPlugs.filter(item => item.isCharging);
    
    if (chargingPlugs.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-bolt text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-600">No charging smart plugs found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chargingPlugs.map((item, index) => {
          const plug = item.smartPlug;
          const realTime = realTimeData[plug?.idDevice];
          const consumption = realTime?.energy !== undefined ? realTime.energy : (item.totalConsumption || 0);
          const power = realTime?.power;

          if (!plug) return null;

          return (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-amber-500 border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h6 className="font-bold text-blueGray-700 flex items-center">
                      <i className="fas fa-bolt mr-2 text-amber-500"></i>
                      {plug.idDevice}
                    </h6>
                    <p className="text-sm text-blueGray-600">Charging in progress</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">Charging</span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">Session ID:</span>
                    <span className="text-sm font-semibold">#{item.sessionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">Started:</span>
                    <span className="text-sm font-semibold">
                      {item.startTime ? new Date(item.startTime).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">Duration:</span>
                    <span className="text-sm font-semibold">
                      {item.startTime ? formatDuration(item.startTime) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blueGray-600">Consumption:</span>
                    <span className="text-sm font-semibold">{consumption} kWh</span>
                  </div>
                  {power !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blueGray-600">Current Power:</span>
                      <span className="text-sm font-semibold text-amber-600">{power} kW</span>
                    </div>
                  )}
                </div>

                {realTime && realTime.power && (
                  <div className="mb-3 p-2 bg-amber-50 rounded border border-amber-100">
                    <p className="text-xs font-bold text-amber-800 mb-1">Current Power</p>
                    <h5 className="text-center font-bold text-amber-600">{realTime.power} kW</h5>
                  </div>
                )}

                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors"
                  onClick={() => handlePlugClick(plug.idDevice)}
                >
                  <i className="fas fa-chart-bar mr-1"></i> Monitor Live
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-blueGray-600">Loading smart plug data...</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 mx-auto w-full -m-24">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-plug text-2xl mr-3"></i>
            <div>
              <p className="text-sm opacity-80">Total Smart Plugs</p>
              <h4 className="text-2xl font-bold">{summary.totalSmartPlugs || 0}</h4>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-wifi text-2xl mr-3"></i>
            <div>
              <p className="text-sm opacity-80">Connected</p>
              <h4 className="text-2xl font-bold">{summary.connectedPlugs || 0}</h4>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-bolt text-2xl mr-3"></i>
            <div>
              <p className="text-sm opacity-80">Charging Now</p>
              <h4 className="text-2xl font-bold">{summary.chargingPlugs || 0}</h4>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blueGray-500 to-blueGray-600 text-white rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-home text-2xl mr-3"></i>
            <div>
              <p className="text-sm opacity-80">Active Stations</p>
              <h4 className="text-2xl font-bold">{summary.stationsWithPlugs || 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Plug Monitoring */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h6 className="text-lg font-bold">
            <i className="fas fa-tv mr-2"></i>Smart Plug Monitoring
          </h6>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm"
              onClick={fetchData}
            >
              <i className="fas fa-sync-alt mr-1"></i> Refresh
            </button>
            <div className="text-xs opacity-80">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Tabs */}
          <div className="border-b border-blueGray-200 mb-4">
            <div className="flex flex-wrap space-x-4">
              <button
                className={`px-4 py-2 font-medium ${viewMode === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-blueGray-600 hover:text-blueGray-800'}`}
                onClick={() => setViewMode('all')}
              >
                <i className="fas fa-th-large mr-2"></i>All Plugs
              </button>
              <button
                className={`px-4 py-2 font-medium ${viewMode === 'stations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-blueGray-600 hover:text-blueGray-800'}`}
                onClick={() => setViewMode('stations')}
              >
                <i className="fas fa-home mr-2"></i>By Station
              </button>
              <button
                className={`px-4 py-2 font-medium ${viewMode === 'connected' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-blueGray-600 hover:text-blueGray-800'}`}
                onClick={() => setViewMode('connected')}
              >
                <i className="fas fa-wifi mr-2"></i>Connected
              </button>
              <button
                className={`px-4 py-2 font-medium ${viewMode === 'charging' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-blueGray-600 hover:text-blueGray-800'}`}
                onClick={() => setViewMode('charging')}
              >
                <i className="fas fa-bolt mr-2"></i>Charging Now
              </button>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'all' && renderAllPlugsView()}
          {viewMode === 'stations' && renderStationsView()}
          {viewMode === 'connected' && renderConnectedView()}
          {viewMode === 'charging' && renderChargingView()}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedPlug && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-blueGray-200">
              <h3 className="text-lg font-bold text-blueGray-700">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                Smart Plug Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-blueGray-400 hover:text-blueGray-600 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Real-time status section */}
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h6 className="font-bold text-blue-800 mb-2">
                  <i className="fas fa-clock mr-2"></i>Real-time Status
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">Connection</p>
                    <span className={`px-3 py-1 rounded text-sm ${
                      selectedPlug.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPlug.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">Charging Status</p>
                    <span className={`px-3 py-1 rounded text-sm ${
                      selectedPlug.isCharging ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPlug.isCharging ? 'Charging' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="border border-blueGray-200 rounded p-4">
                <h6 className="font-bold text-blueGray-700 mb-3">
                  <i className="fas fa-microchip mr-2"></i>Device Information
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">Device ID</p>
                    <p className="text-sm font-semibold">{selectedPlug.deviceInfo?.idDevice || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">CEB Serial</p>
                    <p className="text-sm font-semibold">{selectedPlug.deviceInfo?.cebSerialNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">Maximum Output</p>
                    <p className="text-sm font-semibold">{selectedPlug.deviceInfo?.maximumOutput || 0} kW</p>
                  </div>
                  <div>
                    <p className="text-sm text-blueGray-600 mb-1">Firmware</p>
                    <p className="text-sm font-semibold">{selectedPlug.deviceInfo?.firmwareVersion || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Active Session */}
              {selectedPlug.activeSession && (
                <div className="bg-amber-50 p-4 rounded border border-amber-100">
                  <h6 className="font-bold text-amber-800 mb-3">
                    <i className="fas fa-play-circle mr-2"></i>Active Charging Session
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Session ID</p>
                      <p className="text-sm font-semibold">#{selectedPlug.activeSession.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Duration</p>
                      <p className="text-sm font-semibold">
                        {selectedPlug.activeSession.startTime ? formatDuration(selectedPlug.activeSession.startTime) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Consumption</p>
                      <p className="text-sm font-semibold">
                        {realTimeData[selectedPlug.deviceInfo?.idDevice]?.energy !== undefined 
                          ? realTimeData[selectedPlug.deviceInfo?.idDevice].energy 
                          : (selectedPlug.activeSession.totalConsumption || 0)} kWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Charging Mode</p>
                      <p className="text-sm font-semibold">{selectedPlug.activeSession.chargingMode || 'N/A'}</p>
                    </div>
                  </div>
                  {realTimeData[selectedPlug.deviceInfo?.idDevice]?.power && (
                    <div className="mt-2">
                      <p className="text-sm text-blueGray-600">Current Power: <span className="font-semibold text-amber-600">{realTimeData[selectedPlug.deviceInfo?.idDevice].power} kW</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Station Information */}
              {selectedPlug.stationInfo && (
                <div className="bg-green-50 p-4 rounded border border-green-100">
                  <h6 className="font-bold text-green-800 mb-3">
                    <i className="fas fa-charging-station mr-2"></i>Charging Station
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Station Name</p>
                      <p className="text-sm font-semibold">{selectedPlug.stationInfo.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Location</p>
                      <p className="text-sm font-semibold">{selectedPlug.stationInfo.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Solar Power</p>
                      <p className="text-sm font-semibold">{selectedPlug.stationInfo.solarPowerAvailable || 0} kW</p>
                    </div>
                    <div>
                      <p className="text-sm text-blueGray-600 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded text-sm ${
                        selectedPlug.stationInfo.status === 'Charging' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedPlug.stationInfo.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-blueGray-200 flex justify-end">
              <button
                className="px-4 py-2 bg-blueGray-500 hover:bg-blueGray-600 text-white rounded transition-colors"
                onClick={() => setShowDetails(false)}
              >
                <i className="fas fa-times mr-1"></i> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}