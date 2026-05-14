// // views/admin/SmartPlugMonitor.js
// import React, { useState, useEffect, useCallback } from "react";

// export default function SmartPlugMonitor() {
//   const [viewMode, setViewMode] = useState('all');
//   const [allSmartPlugs, setAllSmartPlugs] = useState([]);
//   const [stations, setStations] = useState([]);
//   const [summary, setSummary] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [selectedPlug, setSelectedPlug] = useState(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [realTimeData, setRealTimeData] = useState({});
//   const [error, setError] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [expandedStations, setExpandedStations] = useState({}); // Track expanded stations
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(12);

//   // Get base URL from environment or use default
//   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8088/EV';
  
//   // Build WebSocket URL from API_BASE_URL
//   const getWebSocketUrl = () => {
//     const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     let baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
//     baseUrl = baseUrl.replace(/\/$/, '');
//     return `${wsProtocol}//${baseUrl}/ws-stomp`;
//   };

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const wsUrl = getWebSocketUrl();
//     console.log('Connecting to WebSocket:', wsUrl);
//     const ws = new WebSocket(wsUrl);
    
//     ws.onopen = () => {
//       console.log('WebSocket Connected for real-time updates');
//       setError(null);
//     };

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('WebSocket message received:', data);
        
//         if (data.idDevice) {
//           setRealTimeData(prev => ({
//             ...prev,
//             [data.idDevice]: {
//               ...prev[data.idDevice],
//               ...data,
//               lastUpdate: new Date().toISOString()
//             }
//           }));
//         }

//         if (data.type === 'TRANSACTION_STARTED' || data.type === 'TRANSACTION_COMPLETED') {
//           fetchData();
//         }
//       } catch (error) {
//         console.error('WebSocket message error:', error);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       setError('WebSocket connection error. Real-time updates may not work.');
//     };

//     ws.onclose = () => {
//       console.log('WebSocket disconnected');
//     };

//     return () => ws.close();
//   }, []);

//   // Fetch all data once
//   const fetchData = useCallback(async (showLoading = true) => {
//     if (showLoading) {
//       setIsRefreshing(true);
//     }
    
//     try {
//       // Fetch all smart plugs data
//       const allPlugsEndpoint = `${API_BASE_URL}/api/admin/smartplugs/all`;
//       const stationsEndpoint = `${API_BASE_URL}/api/admin/smartplugs/stations`;
//       const summaryEndpoint = `${API_BASE_URL}/api/admin/smartplugs/dashboard-summary`;
      
//       console.log('Fetching all data...');
      
//       const [allPlugsResponse, stationsResponse, summaryResponse] = await Promise.all([
//         fetch(allPlugsEndpoint, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         }),
//         fetch(stationsEndpoint, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         }),
//         fetch(summaryEndpoint, {
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//           }
//         })
//       ]);
      
//       if (!allPlugsResponse.ok || !stationsResponse.ok || !summaryResponse.ok) {
//         throw new Error('Failed to fetch data');
//       }
      
//       const allPlugsData = await allPlugsResponse.json();
//       const stationsData = await stationsResponse.json();
//       const summaryData = await summaryResponse.json();
      
//       // Process all plugs data
//       let plugsArray = [];
//       if (Array.isArray(allPlugsData)) {
//         plugsArray = allPlugsData;
//       } else if (allPlugsData.data && Array.isArray(allPlugsData.data)) {
//         plugsArray = allPlugsData.data;
//       } else if (allPlugsData.smartPlugs && Array.isArray(allPlugsData.smartPlugs)) {
//         plugsArray = allPlugsData.smartPlugs;
//       } else {
//         plugsArray = [];
//       }
      
//       console.log('All plugs fetched:', plugsArray.length);
//       setAllSmartPlugs(plugsArray);
//       setStations(stationsData);
//       setSummary(summaryData);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError(`Failed to fetch data: ${error.message}. Please check if the backend server is running.`);
//     } finally {
//       if (showLoading) {
//         setIsRefreshing(false);
//       }
//       setLoading(false);
//     }
//   }, [API_BASE_URL]);

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchData(true);
//   }, [fetchData]);

//   // Reset to first page when view mode changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [viewMode]);

//   // Manual refresh function
//   const handleManualRefresh = () => {
//     fetchData(true);
//   };

//   // Toggle show more for stations
//   const toggleShowMore = (stationId) => {
//     setExpandedStations(prev => ({
//       ...prev,
//       [stationId]: !prev[stationId]
//     }));
//   };

//   // Get filtered data based on view mode
//   const getFilteredData = () => {
//     if (viewMode === 'all') {
//       return allSmartPlugs;
//     } else if (viewMode === 'connected') {
//       return allSmartPlugs.filter(item => {
//         const isConnected = item.connected !== undefined ? item.connected : item.smartPlug?.connected;
//         return isConnected === true;
//       });
//     } else if (viewMode === 'charging') {
//       return allSmartPlugs.filter(item => {
//         const isCharging = item.isCharging !== undefined ? item.isCharging : item.smartPlug?.isCharging;
//         return isCharging === true;
//       });
//     }
//     return [];
//   };

//   // Get current page data (client-side pagination)
//   const getCurrentPageData = (data) => {
//     if (!data || !Array.isArray(data)) return [];
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     return data.slice(startIndex, endIndex);
//   };

//   // Get total pages
//   const getTotalPages = (dataLength) => {
//     return Math.ceil(dataLength / itemsPerPage);
//   };

//   // Pagination handlers
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleNextPage = (totalPages) => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handlePlugClick = async (deviceId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/admin/smartplugs/${deviceId}/details`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setSelectedPlug(data);
//       setShowDetails(true);
//     } catch (error) {
//       console.error('Error fetching plug details:', error);
//       alert(`Error loading plug details: ${error.message}`);
//     }
//   };

//   const getStatusColor = (isConnected, isCharging) => {
//     if (!isConnected) return '#fee2e2';
//     if (isCharging) return '#fffbeb';
//     return '#f0fdf4';
//   };

//   const getStatusTextColor = (isConnected, isCharging) => {
//     if (!isConnected) return '#dc2626';
//     if (isCharging) return '#d97706';
//     return '#10b981';
//   };

//   const getStatusText = (isConnected, isCharging) => {
//     if (!isConnected) return 'Offline';
//     if (isCharging) return 'Charging';
//     return 'Available';
//   };

//   const getStatusIcon = (isConnected, isCharging) => {
//     if (!isConnected) return <i className="fas fa-plug" style={{ color: '#dc2626', marginRight: '8px' }}></i>;
//     if (isCharging) return <i className="fas fa-bolt" style={{ color: '#d97706', marginRight: '8px' }}></i>;
//     return <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i>;
//   };

//   const formatDuration = (startTime) => {
//     if (!startTime) return '00:00:00';
//     const start = new Date(startTime);
//     const now = new Date();
//     const diffMs = now - start;
//     const seconds = Math.floor(diffMs / 1000);
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Pagination component
//   const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, onPrevious, onNext, totalPages }) => {
//     if (totalPages <= 1) return null;
    
//     const getPageNumbers = () => {
//       const pages = [];
//       const maxVisible = 5;
//       let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
//       let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
//       if (endPage - startPage + 1 < maxVisible) {
//         startPage = Math.max(1, endPage - maxVisible + 1);
//       }
      
//       for (let i = startPage; i <= endPage; i++) {
//         pages.push(i);
//       }
      
//       return pages;
//     };
    
//     return (
//       <div style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         gap: "8px",
//         marginTop: "32px",
//         paddingTop: "24px",
//         borderTop: "1px solid #e5e7eb",
//         flexWrap: "wrap",
//       }}>
//         <button
//           onClick={onPrevious}
//           disabled={currentPage === 1}
//           style={{
//             padding: "8px 12px",
//             background: currentPage === 1 ? "#f3f4f6" : "white",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             cursor: currentPage === 1 ? "not-allowed" : "pointer",
//             color: currentPage === 1 ? "#9ca3af" : "#6b7280",
//             transition: "all 0.2s ease",
//             display: "flex",
//             alignItems: "center",
//             gap: "4px",
//           }}
//         >
//           <i className="fas fa-chevron-left"></i> Previous
//         </button>
        
//         {getPageNumbers().map(pageNum => (
//           <button
//             key={pageNum}
//             onClick={() => onPageChange(pageNum)}
//             style={{
//               padding: "8px 14px",
//               background: currentPage === pageNum ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "white",
//               border: "1px solid #e5e7eb",
//               borderRadius: "8px",
//               cursor: "pointer",
//               color: currentPage === pageNum ? "white" : "#6b7280",
//               fontWeight: currentPage === pageNum ? "600" : "400",
//               transition: "all 0.2s ease",
//             }}
//           >
//             {pageNum}
//           </button>
//         ))}
        
//         <button
//           onClick={() => onNext(totalPages)}
//           disabled={currentPage === totalPages}
//           style={{
//             padding: "8px 12px",
//             background: currentPage === totalPages ? "#f3f4f6" : "white",
//             border: "1px solid #e5e7eb",
//             borderRadius: "8px",
//             cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//             color: currentPage === totalPages ? "#9ca3af" : "#6b7280",
//             transition: "all 0.2s ease",
//             display: "flex",
//             alignItems: "center",
//             gap: "4px",
//           }}
//         >
//           Next <i className="fas fa-chevron-right"></i>
//         </button>
        
//         <div style={{
//           marginLeft: "16px",
//           fontSize: "13px",
//           color: "#6b7280",
//         }}>
//           Page {currentPage} of {totalPages} ({totalItems} items)
//         </div>
//       </div>
//     );
//   };

//   // Render all plugs view
//   const renderAllPlugsView = () => {
//     const filteredData = getFilteredData();
    
//     if (filteredData.length === 0) {
//       return (
//         <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
//           <i className="fas fa-plug" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
//           <p style={{ marginTop: "16px", color: "#6b7280" }}>No smart plugs found</p>
//         </div>
//       );
//     }

//     const currentPageData = getCurrentPageData(filteredData);
//     const totalPages = getTotalPages(filteredData.length);

//     return (
//       <>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
//           {currentPageData.map((item, index) => {
//             const plug = item.smartPlug || item;
//             const isConnected = item.connected !== undefined ? item.connected : plug?.connected;
//             const isCharging = item.isCharging !== undefined ? item.isCharging : plug?.isCharging;
//             const realTime = realTimeData[plug?.idDevice];
//             const consumption = realTime?.energy !== undefined ? realTime.energy : (item.activeSession?.totalConsumption || 0);
//             const power = realTime?.power;

//             if (!plug) return null;

//             return (
//               <div
//                 key={plug.idDevice || index}
//                 style={{
//                   background: "white",
//                   borderRadius: "16px",
//                   padding: "20px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s ease",
//                   border: "1px solid #f0f0f0",
//                   position: "relative",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//                   <div style={{
//                     width: "48px",
//                     height: "48px",
//                     background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "24px",
//                     color: "white",
//                   }}>
//                     <i className="fas fa-plug"></i>
//                   </div>
//                   <span style={{
//                     padding: "4px 12px",
//                     borderRadius: "20px",
//                     fontSize: "12px",
//                     fontWeight: "500",
//                     background: getStatusColor(isConnected, isCharging),
//                     color: getStatusTextColor(isConnected, isCharging),
//                   }}>
//                     {getStatusText(isConnected, isCharging)}
//                   </span>
//                 </div>

//                 <div>
//                   <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px", display: "flex", alignItems: "center" }}>
//                     {getStatusIcon(isConnected, isCharging)}
//                     {plug.idDevice}
//                   </h3>
//                   <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
//                     <i className="fas fa-map-marker-alt" style={{ fontSize: "12px" }}></i>
//                     {plug.stationId ? `Station ${plug.stationId}` : 'Unassigned'}
//                   </p>
//                 </div>

//                 <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>CEB Serial:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{plug.cebSerialNo || 'N/A'}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>Max Output:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{plug.maximumOutput || 0} kW</span>
//                   </div>
//                   {power !== undefined && (
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                       <span style={{ fontSize: "12px", color: "#6b7280" }}>Current Power:</span>
//                       <span style={{ fontSize: "13px", fontWeight: "600", color: "#7c0000" }}>{power} kW</span>
//                     </div>
//                   )}
//                 </div>

//                 {isCharging && (
//                   <div style={{ marginTop: "12px", padding: "12px", background: "#fffbeb", borderRadius: "12px", border: "1px solid #fde68a" }}>
//                     <p style={{ fontSize: "11px", fontWeight: "600", color: "#d97706", marginBottom: "8px", textTransform: "uppercase" }}>
//                       <i className="fas fa-bolt" style={{ marginRight: "4px" }}></i> Active Session
//                     </p>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                       <span style={{ fontSize: "11px", color: "#6b7280" }}>Started:</span>
//                       <span style={{ fontSize: "11px", fontWeight: "500" }}>{item.activeSession?.startTime ? new Date(item.activeSession.startTime).toLocaleTimeString() : 'N/A'}</span>
//                     </div>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                       <span style={{ fontSize: "11px", color: "#6b7280" }}>Duration:</span>
//                       <span style={{ fontSize: "11px", fontWeight: "500" }}>{item.activeSession?.startTime ? formatDuration(item.activeSession.startTime) : 'N/A'}</span>
//                     </div>
//                     <div style={{ display: "flex", justifyContent: "space-between" }}>
//                       <span style={{ fontSize: "11px", color: "#6b7280" }}>Consumption:</span>
//                       <span style={{ fontSize: "11px", fontWeight: "600", color: "#d97706" }}>{consumption} kWh</span>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={() => handlePlugClick(plug.idDevice)}
//                   style={{
//                     width: "100%",
//                     marginTop: "16px",
//                     padding: "10px",
//                     background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "10px",
//                     fontWeight: "600",
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     fontSize: "13px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     gap: "8px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = "translateY(-2px)";
//                     e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = "translateY(0)";
//                     e.currentTarget.style.boxShadow = "none";
//                   }}
//                 >
//                   <i className="fas fa-eye"></i> View Details
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//         <Pagination 
//           currentPage={currentPage}
//           totalItems={filteredData.length}
//           itemsPerPage={itemsPerPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//           onPrevious={handlePreviousPage}
//           onNext={handleNextPage}
//         />
//       </>
//     );
//   };

//   // Render stations view with show more functionality
//   const renderStationsView = () => {
//     if (!stations || stations.length === 0) {
//       return (
//         <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
//           <i className="fas fa-home" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
//           <p style={{ marginTop: "16px", color: "#6b7280" }}>No stations found</p>
//         </div>
//       );
//     }

//     const currentPageData = getCurrentPageData(stations);
//     const totalPages = getTotalPages(stations.length);

//     return (
//       <>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
//           {currentPageData.map((station, index) => {
//             const isExpanded = expandedStations[station.stationId] || false;
//             const smartPlugsList = station.smartPlugs || [];
//             const totalPlugs = smartPlugsList.length;
//             const displayPlugs = isExpanded ? smartPlugsList : smartPlugsList.slice(0, 1);
//             const remainingCount = totalPlugs - 1;

//             return (
//               <div
//                 key={station.stationId || index}
//                 style={{
//                   background: "white",
//                   borderRadius: "16px",
//                   padding: "20px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s ease",
//                   border: "1px solid #f0f0f0",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//                   <div style={{
//                     width: "48px",
//                     height: "48px",
//                     background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "24px",
//                     color: "white",
//                   }}>
//                     <i className="fas fa-home"></i>
//                   </div>
//                   <span style={{
//                     padding: "4px 12px",
//                     borderRadius: "20px",
//                     fontSize: "12px",
//                     fontWeight: "500",
//                     background: station.status === 'Charging' ? '#fffbeb' : '#f0fdf4',
//                     color: station.status === 'Charging' ? '#d97706' : '#10b981',
//                   }}>
//                     {station.status || 'Available'}
//                   </span>
//                 </div>

//                 <div>
//                   <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>
//                     {station.name || `Station ${station.stationId}`}
//                   </h3>
//                   <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>ID: {station.stationId}</p>
//                 </div>

//                 <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "13px", color: "#6b7280" }}>Location:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{station.location || 'N/A'}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
//                     <span style={{ fontSize: "13px", color: "#6b7280" }}>Smart Plugs:</span>
//                     <span style={{ fontSize: "14px", fontWeight: "700", color: "#7c0000" }}>{totalPlugs}</span>
//                   </div>
//                 </div>

//                 {smartPlugsList.length > 0 && (
//                   <div style={{ marginTop: "12px", padding: "16px", background: "#f9fafb", borderRadius: "12px" }}>
//                     <p style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
//                       <i className="fas fa-plug" style={{ marginRight: "6px" }}></i> Smart Plugs:
//                     </p>
//                     <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//                       {displayPlugs.map((plug, plugIndex) => {
//                         const isConnected = plug.connected !== undefined ? plug.connected : false;
//                         const isCharging = plug.isCharging !== undefined ? plug.isCharging : false;
//                         const realTime = realTimeData[plug?.idDevice];
                        
//                         return (
//                           <div 
//                             key={plugIndex} 
//                             style={{ 
//                               display: "flex", 
//                               justifyContent: "space-between", 
//                               alignItems: "center", 
//                               padding: "12px", 
//                               background: "white", 
//                               borderRadius: "10px",
//                               border: "1px solid #e5e7eb",
//                               cursor: "pointer",
//                               transition: "all 0.2s ease",
//                             }}
//                             onClick={() => handlePlugClick(plug.idDevice)}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.background = "#fef3f2";
//                               e.currentTarget.style.borderColor = "#7c0000";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.background = "white";
//                               e.currentTarget.style.borderColor = "#e5e7eb";
//                             }}
//                           >
//                             <div style={{ flex: 1 }}>
//                               <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
//                                 <p style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{plug.idDevice}</p>
//                                 {realTime?.power !== undefined && (
//                                   <span style={{ 
//                                     fontSize: "11px", 
//                                     fontWeight: "600", 
//                                     color: "#d97706",
//                                     background: "#fffbeb",
//                                     padding: "2px 6px",
//                                     borderRadius: "12px"
//                                   }}>
//                                     {realTime.power} kW
//                                   </span>
//                                 )}
//                               </div>
//                               <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
//                                 CEB: {plug.cebSerialNo || 'N/A'}
//                               </p>
//                               {realTime?.energy !== undefined && (
//                                 <p style={{ fontSize: "10px", color: "#059669" }}>
//                                   Energy: {realTime.energy} kWh
//                                 </p>
//                               )}
//                             </div>
//                             <div style={{ textAlign: "right" }}>
//                               <span style={{
//                                 display: "inline-block",
//                                 padding: "4px 10px",
//                                 borderRadius: "20px",
//                                 fontSize: "11px",
//                                 fontWeight: "600",
//                                 background: getStatusColor(isConnected, isCharging),
//                                 color: getStatusTextColor(isConnected, isCharging),
//                               }}>
//                                 {getStatusText(isConnected, isCharging)}
//                               </span>
//                               <i 
//                                 className="fas fa-chevron-right" 
//                                 style={{ 
//                                   fontSize: "12px", 
//                                   color: "#9ca3af", 
//                                   marginLeft: "10px",
//                                   opacity: 0.6
//                                 }}
//                               ></i>
//                             </div>
//                           </div>
//                         );
//                       })}
                      
//                       {totalPlugs > 1 && !isExpanded && (
//                         <button
//                           onClick={() => toggleShowMore(station.stationId)}
//                           style={{
//                             width: "100%",
//                             marginTop: "8px",
//                             padding: "10px",
//                             background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
//                             color: "#7c0000",
//                             border: "none",
//                             borderRadius: "10px",
//                             fontWeight: "600",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                             fontSize: "13px",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             gap: "8px",
//                           }}
//                           onMouseEnter={(e) => {
//                             e.currentTarget.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.background = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
//                           }}
//                         >
//                           <i className="fas fa-chevron-down"></i> Show {remainingCount} More Plug{remainingCount > 1 ? 's' : ''}
//                         </button>
//                       )}
                      
//                       {isExpanded && totalPlugs > 1 && (
//                         <button
//                           onClick={() => toggleShowMore(station.stationId)}
//                           style={{
//                             width: "100%",
//                             marginTop: "8px",
//                             padding: "10px",
//                             background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
//                             color: "#6b7280",
//                             border: "none",
//                             borderRadius: "10px",
//                             fontWeight: "500",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                             fontSize: "13px",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             gap: "8px",
//                           }}
//                           onMouseEnter={(e) => {
//                             e.currentTarget.style.background = "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.background = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
//                           }}
//                         >
//                           <i className="fas fa-chevron-up"></i> Show Less
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//         <Pagination 
//           currentPage={currentPage}
//           totalItems={stations.length}
//           itemsPerPage={itemsPerPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//           onPrevious={handlePreviousPage}
//           onNext={handleNextPage}
//         />
//       </>
//     );
//   };

//   // Render connected view
//   const renderConnectedView = () => {
//     const filteredData = getFilteredData();
    
//     if (filteredData.length === 0) {
//       return (
//         <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
//           <i className="fas fa-wifi" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
//           <p style={{ marginTop: "16px", color: "#6b7280" }}>No connected smart plugs found</p>
//         </div>
//       );
//     }

//     const currentPageData = getCurrentPageData(filteredData);
//     const totalPages = getTotalPages(filteredData.length);

//     return (
//       <>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
//           {currentPageData.map((item, index) => {
//             const plug = item.smartPlug || item;
//             const isConnected = item.connected !== undefined ? item.connected : plug?.connected;
//             const isCharging = item.isCharging !== undefined ? item.isCharging : plug?.isCharging;
//             const realTime = realTimeData[plug?.idDevice];

//             if (!plug) return null;

//             return (
//               <div
//                 key={plug.idDevice || index}
//                 style={{
//                   background: "white",
//                   borderRadius: "16px",
//                   padding: "20px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s ease",
//                   border: "1px solid #f0f0f0",
//                   borderLeft: "4px solid #10b981",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//                   <div style={{
//                     width: "48px",
//                     height: "48px",
//                     background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "24px",
//                     color: "white",
//                   }}>
//                     <i className="fas fa-wifi"></i>
//                   </div>
//                   <span style={{
//                     padding: "4px 12px",
//                     borderRadius: "20px",
//                     fontSize: "12px",
//                     fontWeight: "500",
//                     background: isCharging ? '#fffbeb' : '#f0fdf4',
//                     color: isCharging ? '#d97706' : '#10b981',
//                   }}>
//                     {isCharging ? 'Charging' : 'Available'}
//                   </span>
//                 </div>

//                 <div>
//                   <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
//                     {plug.idDevice}
//                   </h3>
//                   <p style={{ fontSize: "12px", color: "#10b981", marginBottom: "12px" }}>
//                     <i className="fas fa-circle" style={{ fontSize: "8px", marginRight: "6px" }}></i> Online - Ready
//                   </p>
//                   <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
//                     <i className="fas fa-map-marker-alt" style={{ fontSize: "11px", marginRight: "4px" }}></i>
//                     {plug.stationId ? `Station: ${plug.stationId}` : 'Unassigned'}
//                   </p>
//                 </div>

//                 {realTime && (
//                   <div style={{ marginTop: "12px", padding: "12px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #86efac" }}>
//                     <p style={{ fontSize: "11px", fontWeight: "600", color: "#059669", marginBottom: "8px" }}>
//                       <i className="fas fa-chart-line" style={{ marginRight: "4px" }}></i> Live Data
//                     </p>
//                     {realTime.power !== undefined && (
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//                         <span style={{ fontSize: "11px", color: "#6b7280" }}>Power:</span>
//                         <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>{realTime.power} kW</span>
//                       </div>
//                     )}
//                     {realTime.energy !== undefined && (
//                       <div style={{ display: "flex", justifyContent: "space-between" }}>
//                         <span style={{ fontSize: "11px", color: "#6b7280" }}>Energy:</span>
//                         <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>{realTime.energy} kWh</span>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <button
//                   onClick={() => handlePlugClick(plug.idDevice)}
//                   style={{
//                     width: "100%",
//                     marginTop: "16px",
//                     padding: "10px",
//                     background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "10px",
//                     fontWeight: "600",
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     fontSize: "13px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = "translateY(-2px)";
//                     e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = "translateY(0)";
//                     e.currentTarget.style.boxShadow = "none";
//                   }}
//                 >
//                   <i className="fas fa-eye" style={{ marginRight: "6px" }}></i> View Live Status
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//         <Pagination 
//           currentPage={currentPage}
//           totalItems={filteredData.length}
//           itemsPerPage={itemsPerPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//           onPrevious={handlePreviousPage}
//           onNext={handleNextPage}
//         />
//       </>
//     );
//   };

//   // Render charging view
//   const renderChargingView = () => {
//     const filteredData = getFilteredData();
    
//     if (filteredData.length === 0) {
//       return (
//         <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
//           <i className="fas fa-bolt" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
//           <p style={{ marginTop: "16px", color: "#6b7280" }}>No charging smart plugs found</p>
//         </div>
//       );
//     }

//     const currentPageData = getCurrentPageData(filteredData);
//     const totalPages = getTotalPages(filteredData.length);

//     return (
//       <>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
//           {currentPageData.map((item, index) => {
//             const plug = item.smartPlug || item;
//             const realTime = realTimeData[plug?.idDevice];
//             const consumption = realTime?.energy !== undefined ? realTime.energy : (item.totalConsumption || 0);
//             const power = realTime?.power;
//             const sessionStartTime = item.startTime || item.activeSession?.startTime;

//             if (!plug) return null;

//             return (
//               <div
//                 key={plug.idDevice || index}
//                 style={{
//                   background: "white",
//                   borderRadius: "16px",
//                   padding: "20px",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s ease",
//                   border: "1px solid #f0f0f0",
//                   borderLeft: "4px solid #d97706",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-4px)";
//                   e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//                   <div style={{
//                     width: "48px",
//                     height: "48px",
//                     background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "24px",
//                     color: "white",
//                   }}>
//                     <i className="fas fa-bolt"></i>
//                   </div>
//                   <span style={{
//                     padding: "4px 12px",
//                     borderRadius: "20px",
//                     fontSize: "12px",
//                     fontWeight: "500",
//                     background: "#fffbeb",
//                     color: "#d97706",
//                   }}>
//                     Charging
//                   </span>
//                 </div>

//                 <div>
//                   <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
//                     {plug.idDevice}
//                   </h3>
//                   <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
//                     <i className="fas fa-map-marker-alt" style={{ fontSize: "11px", marginRight: "4px" }}></i>
//                     {plug.stationId ? `Station: ${plug.stationId}` : 'Unassigned'}
//                   </p>
//                 </div>

//                 <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>Session ID:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>#{item.sessionId || item.activeSession?.sessionId || 'N/A'}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>Started:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500" }}>{sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString() : 'N/A'}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>Duration:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "500" }}>{sessionStartTime ? formatDuration(sessionStartTime) : 'N/A'}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                     <span style={{ fontSize: "12px", color: "#6b7280" }}>Consumption:</span>
//                     <span style={{ fontSize: "13px", fontWeight: "600", color: "#d97706" }}>{typeof consumption === 'number' ? consumption.toFixed(2) : consumption} kWh</span>
//                   </div>
//                   {power !== undefined && (
//                     <div style={{ display: "flex", justifyContent: "space-between" }}>
//                       <span style={{ fontSize: "12px", color: "#6b7280" }}>Current Power:</span>
//                       <span style={{ fontSize: "13px", fontWeight: "600", color: "#d97706" }}>{power} kW</span>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => handlePlugClick(plug.idDevice)}
//                   style={{
//                     width: "100%",
//                     marginTop: "16px",
//                     padding: "10px",
//                     background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "10px",
//                     fontWeight: "600",
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     fontSize: "13px",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = "translateY(-2px)";
//                     e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = "translateY(0)";
//                     e.currentTarget.style.boxShadow = "none";
//                   }}
//                 >
//                   <i className="fas fa-chart-bar" style={{ marginRight: "6px" }}></i> Monitor Live
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//         <Pagination 
//           currentPage={currentPage}
//           totalItems={filteredData.length}
//           itemsPerPage={itemsPerPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//           onPrevious={handlePreviousPage}
//           onNext={handleNextPage}
//         />
//       </>
//     );
//   };

//   if (loading) {
//     return (
//       <div style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//       }}>
//         <div style={{ textAlign: "center" }}>
//           <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>🔄</div>
//           <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading smart plug data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)",
//       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//     }}>
//       <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
//         {/* Header */}
//         <div style={{ marginBottom: "40px" }}>
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             marginBottom: "12px",
//             flexWrap: "wrap",
//             gap: "16px",
//           }}>
//             <div>
//               <h1 style={{
//                 fontSize: "28px",
//                 fontWeight: "700",
//                 background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//                 marginBottom: "6px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//               }}>
//                 <i className="fas fa-tachometer-alt" style={{ background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}></i>
//                 Smart Plug Monitor
//               </h1>
//               <p style={{ color: "#6b7280", fontSize: "14px" }}>
//                 <i className="fas fa-plug" style={{ marginRight: "6px", fontSize: "12px" }}></i>
//                 Monitor and manage all smart plugs in real-time
//               </p>
//             </div>
//             <button
//               onClick={handleManualRefresh}
//               disabled={isRefreshing}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 padding: "8px 16px",
//                 background: "white",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: "10px",
//                 cursor: isRefreshing ? "not-allowed" : "pointer",
//                 transition: "all 0.2s ease",
//                 fontWeight: "500",
//                 fontSize: "13px",
//                 opacity: isRefreshing ? 0.6 : 1,
//               }}
//               onMouseEnter={(e) => {
//                 if (!isRefreshing) {
//                   e.currentTarget.style.background = "#f9fafb";
//                   e.currentTarget.style.borderColor = "#7c0000";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isRefreshing) {
//                   e.currentTarget.style.background = "white";
//                   e.currentTarget.style.borderColor = "#e5e7eb";
//                 }
//               }}
//             >
//               <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`} style={{ fontSize: "12px" }}></i>
//               {isRefreshing ? 'Refreshing...' : 'Refresh'}
//             </button>
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <div style={{
//             background: "#fee2e2",
//             border: "1px solid #fecaca",
//             color: "#dc2626",
//             padding: "12px 16px",
//             borderRadius: "12px",
//             marginBottom: "20px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}>
//             <div>
//               <i className="fas fa-exclamation-triangle" style={{ marginRight: "8px" }}></i>
//               <strong>Error!</strong> {error}
//             </div>
//             <button
//               onClick={() => setError(null)}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: "#dc2626",
//                 cursor: "pointer",
//                 fontSize: "18px",
//               }}
//             >
//               <i className="fas fa-times"></i>
//             </button>
//           </div>
//         )}

//         {/* Dashboard Summary Cards */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//           gap: "20px",
//           marginBottom: "32px",
//         }}>
//           <div style={{
//             background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
//             borderRadius: "16px",
//             padding: "20px",
//             color: "white",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//               <i className="fas fa-plug" style={{ fontSize: "28px" }}></i>
//               <div>
//                 <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Total Smart Plugs</p>
//                 <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.totalSmartPlugs || 0}</h4>
//               </div>
//             </div>
//           </div>

//           <div style={{
//             background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//             borderRadius: "16px",
//             padding: "20px",
//             color: "white",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//               <i className="fas fa-wifi" style={{ fontSize: "28px" }}></i>
//               <div>
//                 <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Connected</p>
//                 <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.connectedPlugs || 0}</h4>
//               </div>
//             </div>
//           </div>

//           <div style={{
//             background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
//             borderRadius: "16px",
//             padding: "20px",
//             color: "white",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//               <i className="fas fa-bolt" style={{ fontSize: "28px" }}></i>
//               <div>
//                 <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Charging Now</p>
//                 <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.chargingPlugs || 0}</h4>
//               </div>
//             </div>
//           </div>

//           <div style={{
//             background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
//             borderRadius: "16px",
//             padding: "20px",
//             color: "white",
//             boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//               <i className="fas fa-home" style={{ fontSize: "28px" }}></i>
//               <div>
//                 <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Active Stations</p>
//                 <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.stationsWithPlugs || 0}</h4>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Monitoring Section */}
//         <div style={{
//           background: "white",
//           borderRadius: "24px",
//           padding: "28px",
//           boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
//         }}>
//           {/* Tabs */}
//           <div style={{
//             display: "flex",
//             gap: "8px",
//             borderBottom: "2px solid #f0f0f0",
//             marginBottom: "24px",
//             flexWrap: "wrap",
//           }}>
//             <button
//               onClick={() => setViewMode('all')}
//               style={{
//                 padding: "10px 20px",
//                 background: viewMode === 'all' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
//                 color: viewMode === 'all' ? "white" : "#6b7280",
//                 border: "none",
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//                 fontWeight: "500",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//               }}
//               onMouseEnter={(e) => {
//                 if (viewMode !== 'all') {
//                   e.currentTarget.style.background = "#f3f4f6";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (viewMode !== 'all') {
//                   e.currentTarget.style.background = "transparent";
//                 }
//               }}
//             >
//               <i className="fas fa-th-large"></i> All Plugs
//             </button>
//             <button
//               onClick={() => setViewMode('stations')}
//               style={{
//                 padding: "10px 20px",
//                 background: viewMode === 'stations' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
//                 color: viewMode === 'stations' ? "white" : "#6b7280",
//                 border: "none",
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//                 fontWeight: "500",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//               }}
//               onMouseEnter={(e) => {
//                 if (viewMode !== 'stations') {
//                   e.currentTarget.style.background = "#f3f4f6";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (viewMode !== 'stations') {
//                   e.currentTarget.style.background = "transparent";
//                 }
//               }}
//             >
//               <i className="fas fa-home"></i> By Station
//             </button>
//             <button
//               onClick={() => setViewMode('connected')}
//               style={{
//                 padding: "10px 20px",
//                 background: viewMode === 'connected' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
//                 color: viewMode === 'connected' ? "white" : "#6b7280",
//                 border: "none",
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//                 fontWeight: "500",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//               }}
//               onMouseEnter={(e) => {
//                 if (viewMode !== 'connected') {
//                   e.currentTarget.style.background = "#f3f4f6";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (viewMode !== 'connected') {
//                   e.currentTarget.style.background = "transparent";
//                 }
//               }}
//             >
//               <i className="fas fa-wifi"></i> Connected
//             </button>
//             <button
//               onClick={() => setViewMode('charging')}
//               style={{
//                 padding: "10px 20px",
//                 background: viewMode === 'charging' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
//                 color: viewMode === 'charging' ? "white" : "#6b7280",
//                 border: "none",
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//                 fontWeight: "500",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//               }}
//               onMouseEnter={(e) => {
//                 if (viewMode !== 'charging') {
//                   e.currentTarget.style.background = "#f3f4f6";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (viewMode !== 'charging') {
//                   e.currentTarget.style.background = "transparent";
//                 }
//               }}
//             >
//               <i className="fas fa-bolt"></i> Charging Now
//             </button>
//           </div>

//           {/* Content based on view mode */}
//           {viewMode === 'all' && renderAllPlugsView()}
//           {viewMode === 'stations' && renderStationsView()}
//           {viewMode === 'connected' && renderConnectedView()}
//           {viewMode === 'charging' && renderChargingView()}
//         </div>
//       </div>

//       {/* Details Modal */}
//       {showDetails && selectedPlug && (
//         <div style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: "rgba(0, 0, 0, 0.5)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 1000,
//           padding: "20px",
//         }}>
//           <div style={{
//             background: "white",
//             borderRadius: "24px",
//             maxWidth: "800px",
//             width: "100%",
//             maxHeight: "90vh",
//             overflow: "auto",
//             boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: "20px 24px",
//               borderBottom: "2px solid #f0f0f0",
//             }}>
//               <h3 style={{
//                 fontSize: "20px",
//                 fontWeight: "600",
//                 color: "#1f2937",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//               }}>
//                 <i className="fas fa-info-circle" style={{ color: "#7c0000" }}></i>
//                 Smart Plug Details
//               </h3>
//               <button
//                 onClick={() => setShowDetails(false)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "20px",
//                   cursor: "pointer",
//                   color: "#9ca3af",
//                   transition: "color 0.2s ease",
//                 }}
//                 onMouseEnter={(e) => e.currentTarget.style.color = "#7c0000"}
//                 onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
//               >
//                 <i className="fas fa-times"></i>
//               </button>
//             </div>

//             <div style={{ padding: "24px" }}>
//               {/* Real-time status section */}
//               <div style={{
//                 background: "linear-gradient(135deg, #fef3f2 0%, #fff5f5 100%)",
//                 padding: "20px",
//                 borderRadius: "16px",
//                 marginBottom: "20px",
//                 border: "1px solid #fed7d7",
//               }}>
//                 <h6 style={{
//                   fontSize: "14px",
//                   fontWeight: "600",
//                   color: "#7c0000",
//                   marginBottom: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                 }}>
//                   <i className="fas fa-clock"></i> Real-time Status
//                 </h6>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
//                   <div>
//                     <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Connection</p>
//                     <span style={{
//                       padding: "4px 12px",
//                       borderRadius: "20px",
//                       fontSize: "13px",
//                       fontWeight: "500",
//                       background: selectedPlug.connected ? "#f0fdf4" : "#fee2e2",
//                       color: selectedPlug.connected ? "#10b981" : "#dc2626",
//                     }}>
//                       {selectedPlug.connected ? 'Connected' : 'Disconnected'}
//                     </span>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Charging Status</p>
//                     <span style={{
//                       padding: "4px 12px",
//                       borderRadius: "20px",
//                       fontSize: "13px",
//                       fontWeight: "500",
//                       background: selectedPlug.isCharging ? "#fffbeb" : "#f0fdf4",
//                       color: selectedPlug.isCharging ? "#d97706" : "#10b981",
//                     }}>
//                       {selectedPlug.isCharging ? 'Charging' : 'Available'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Device Information */}
//               <div style={{
//                 background: "#f9fafb",
//                 padding: "20px",
//                 borderRadius: "16px",
//                 marginBottom: "20px",
//                 border: "1px solid #e5e7eb",
//               }}>
//                 <h6 style={{
//                   fontSize: "14px",
//                   fontWeight: "600",
//                   color: "#1f2937",
//                   marginBottom: "16px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                 }}>
//                   <i className="fas fa-microchip"></i> Device Information
//                 </h6>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                   <div>
//                     <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Device ID</p>
//                     <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.idDevice || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>CEB Serial</p>
//                     <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.cebSerialNo || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Maximum Output</p>
//                     <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.maximumOutput || 0} kW</p>
//                   </div>
//                   <div>
//                     <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Firmware</p>
//                     <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.firmwareVersion || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Active Session */}
//               {selectedPlug.activeSession && (
//                 <div style={{
//                   background: "#fffbeb",
//                   padding: "20px",
//                   borderRadius: "16px",
//                   marginBottom: "20px",
//                   border: "1px solid #fde68a",
//                 }}>
//                   <h6 style={{
//                     fontSize: "14px",
//                     fontWeight: "600",
//                     color: "#d97706",
//                     marginBottom: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                   }}>
//                     <i className="fas fa-play-circle"></i> Active Charging Session
//                   </h6>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Session ID</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>#{selectedPlug.activeSession.sessionId}</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Duration</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>{selectedPlug.activeSession.startTime ? formatDuration(selectedPlug.activeSession.startTime) : 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Consumption</p>
//                       <p style={{ fontSize: "14px", fontWeight: "600", color: "#d97706" }}>
//                         {realTimeData[selectedPlug.deviceInfo?.idDevice]?.energy !== undefined 
//                           ? realTimeData[selectedPlug.deviceInfo?.idDevice].energy 
//                           : (selectedPlug.activeSession.totalConsumption || 0)} kWh
//                       </p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Charging Mode</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>{selectedPlug.activeSession.chargingMode || 'N/A'}</p>
//                     </div>
//                   </div>
//                   {realTimeData[selectedPlug.deviceInfo?.idDevice]?.power && (
//                     <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #fde68a" }}>
//                       <p style={{ fontSize: "12px", color: "#6b7280" }}>Current Power: <span style={{ fontWeight: "600", color: "#d97706" }}>{realTimeData[selectedPlug.deviceInfo?.idDevice].power} kW</span></p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Station Information */}
//               {selectedPlug.stationInfo && (
//                 <div style={{
//                   background: "#f0fdf4",
//                   padding: "20px",
//                   borderRadius: "16px",
//                   border: "1px solid #86efac",
//                 }}>
//                   <h6 style={{
//                     fontSize: "14px",
//                     fontWeight: "600",
//                     color: "#059669",
//                     marginBottom: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                   }}>
//                     <i className="fas fa-charging-station"></i> Charging Station
//                   </h6>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Station Name</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.name || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Location</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.location || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Solar Power</p>
//                       <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.solarPowerAvailable || 0} kW</p>
//                     </div>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Status</p>
//                       <span style={{
//                         padding: "4px 12px",
//                         borderRadius: "20px",
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         background: selectedPlug.stationInfo.status === 'Charging' ? '#fffbeb' : '#f0fdf4',
//                         color: selectedPlug.stationInfo.status === 'Charging' ? '#d97706' : '#10b981',
//                       }}>
//                         {selectedPlug.stationInfo.status || 'Unknown'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div style={{
//               padding: "20px 24px",
//               borderTop: "2px solid #f0f0f0",
//               display: "flex",
//               justifyContent: "flex-end",
//             }}>
//               <button
//                 onClick={() => setShowDetails(false)}
//                 style={{
//                   padding: "10px 20px",
//                   background: "#f3f4f6",
//                   color: "#6b7280",
//                   border: "none",
//                   borderRadius: "10px",
//                   fontWeight: "500",
//                   cursor: "pointer",
//                   transition: "all 0.2s ease",
//                   fontSize: "13px",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = "#e5e7eb";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = "#f3f4f6";
//                 }}
//               >
//                 <i className="fas fa-times" style={{ marginRight: "6px" }}></i> Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>
//         {`
//           @keyframes spin {
//             from { transform: rotate(0deg); }
//             to { transform: rotate(360deg); }
//           }
//           * {
//             box-sizing: border-box;
//           }
//         `}
//       </style>
//     </div>
//   );
// }








// views/admin/SmartPlugMonitor.js
import React, { useState, useEffect, useCallback } from "react";

export default function SmartPlugMonitor() {
  const [viewMode, setViewMode] = useState('all');
  const [allSmartPlugs, setAllSmartPlugs] = useState([]);
  const [stations, setStations] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlug, setSelectedPlug] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedStations, setExpandedStations] = useState({}); // Track expanded stations
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [stationsCurrentPage, setStationsCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Show 6 stations per page

  // Get base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8088/EV';
  
  // Build WebSocket URL from API_BASE_URL
  const getWebSocketUrl = () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let baseUrl = API_BASE_URL.replace(/^https?:\/\//, '');
    baseUrl = baseUrl.replace(/\/$/, '');
    return `${wsProtocol}//${baseUrl}/ws-stomp`;
  };

  // WebSocket for real-time updates
  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket Connected for real-time updates');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
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

        if (data.type === 'TRANSACTION_STARTED' || data.type === 'TRANSACTION_COMPLETED') {
          fetchData();
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

  // Fetch all data once
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    try {
      // Fetch all smart plugs data
      const allPlugsEndpoint = `${API_BASE_URL}/api/admin/smartplugs/all`;
      const stationsEndpoint = `${API_BASE_URL}/api/admin/smartplugs/stations`;
      const summaryEndpoint = `${API_BASE_URL}/api/admin/smartplugs/dashboard-summary`;
      
      console.log('Fetching all data...');
      
      const [allPlugsResponse, stationsResponse, summaryResponse] = await Promise.all([
        fetch(allPlugsEndpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch(stationsEndpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch(summaryEndpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);
      
      if (!allPlugsResponse.ok || !stationsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const allPlugsData = await allPlugsResponse.json();
      const stationsData = await stationsResponse.json();
      const summaryData = await summaryResponse.json();
      
      // Process all plugs data
      let plugsArray = [];
      if (Array.isArray(allPlugsData)) {
        plugsArray = allPlugsData;
      } else if (allPlugsData.data && Array.isArray(allPlugsData.data)) {
        plugsArray = allPlugsData.data;
      } else if (allPlugsData.smartPlugs && Array.isArray(allPlugsData.smartPlugs)) {
        plugsArray = allPlugsData.smartPlugs;
      } else {
        plugsArray = [];
      }
      
      console.log('All plugs fetched:', plugsArray.length);
      console.log('Stations fetched:', stationsData.length);
      
      setAllSmartPlugs(plugsArray);
      setStations(stationsData);
      setSummary(summaryData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to fetch data: ${error.message}. Please check if the backend server is running.`);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Reset to first page when view mode changes
  useEffect(() => {
    setCurrentPage(1);
    setStationsCurrentPage(1);
    setExpandedStations({}); // Reset expanded stations when changing view
  }, [viewMode]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchData(true);
  };

  // Toggle show more for stations
  const toggleShowMore = (stationId) => {
    setExpandedStations(prev => ({
      ...prev,
      [stationId]: !prev[stationId]
    }));
  };

  // Get filtered data based on view mode
  const getFilteredData = () => {
    if (viewMode === 'all') {
      return allSmartPlugs;
    } else if (viewMode === 'connected') {
      return allSmartPlugs.filter(item => {
        const isConnected = item.connected !== undefined ? item.connected : item.smartPlug?.connected;
        return isConnected === true;
      });
    } else if (viewMode === 'charging') {
      return allSmartPlugs.filter(item => {
        const isCharging = item.isCharging !== undefined ? item.isCharging : item.smartPlug?.isCharging;
        return isCharging === true;
      });
    }
    return [];
  };

  // Get current page data for plugs (client-side pagination)
  const getCurrentPageData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Get current page data for stations
  const getCurrentPageStations = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const startIndex = (stationsCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Get total pages for plugs
  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Get total pages for stations
  const getTotalStationPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Pagination handlers for plugs
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = (totalPages) => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pagination handlers for stations
  const handleStationPageChange = (pageNumber) => {
    setStationsCurrentPage(pageNumber);
    setExpandedStations({}); // Reset expanded stations when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStationPreviousPage = () => {
    if (stationsCurrentPage > 1) {
      setStationsCurrentPage(stationsCurrentPage - 1);
      setExpandedStations({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStationNextPage = (totalPages) => {
    if (stationsCurrentPage < totalPages) {
      setStationsCurrentPage(stationsCurrentPage + 1);
      setExpandedStations({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!isConnected) return '#fee2e2';
    if (isCharging) return '#fffbeb';
    return '#f0fdf4';
  };

  const getStatusTextColor = (isConnected, isCharging) => {
    if (!isConnected) return '#dc2626';
    if (isCharging) return '#d97706';
    return '#10b981';
  };

  const getStatusText = (isConnected, isCharging) => {
    if (!isConnected) return 'Offline';
    if (isCharging) return 'Charging';
    return 'Available';
  };

  const getStatusIcon = (isConnected, isCharging) => {
    if (!isConnected) return <i className="fas fa-plug" style={{ color: '#dc2626', marginRight: '8px' }}></i>;
    if (isCharging) return <i className="fas fa-bolt" style={{ color: '#d97706', marginRight: '8px' }}></i>;
    return <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i>;
  };

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

  // Pagination component
  const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, onPrevious, onNext, totalPages }) => {
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };
    
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "32px",
        paddingTop: "24px",
        borderTop: "1px solid #e5e7eb",
        flexWrap: "wrap",
      }}>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            background: currentPage === 1 ? "#f3f4f6" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            color: currentPage === 1 ? "#9ca3af" : "#6b7280",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            style={{
              padding: "8px 14px",
              background: currentPage === pageNum ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              color: currentPage === pageNum ? "white" : "#6b7280",
              fontWeight: currentPage === pageNum ? "600" : "400",
              transition: "all 0.2s ease",
            }}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          onClick={() => onNext(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            background: currentPage === totalPages ? "#f3f4f6" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            color: currentPage === totalPages ? "#9ca3af" : "#6b7280",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
        
        <div style={{
          marginLeft: "16px",
          fontSize: "13px",
          color: "#6b7280",
        }}>
          Page {currentPage} of {totalPages} ({totalItems} items)
        </div>
      </div>
    );
  };

  // Pagination component for stations
  const StationPagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, onPrevious, onNext, totalPages }) => {
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };
    
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "32px",
        paddingTop: "24px",
        borderTop: "1px solid #e5e7eb",
        flexWrap: "wrap",
      }}>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            background: currentPage === 1 ? "#f3f4f6" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            color: currentPage === 1 ? "#9ca3af" : "#6b7280",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            style={{
              padding: "8px 14px",
              background: currentPage === pageNum ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              color: currentPage === pageNum ? "white" : "#6b7280",
              fontWeight: currentPage === pageNum ? "600" : "400",
              transition: "all 0.2s ease",
            }}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          onClick={() => onNext(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            background: currentPage === totalPages ? "#f3f4f6" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            color: currentPage === totalPages ? "#9ca3af" : "#6b7280",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
        
        <div style={{
          marginLeft: "16px",
          fontSize: "13px",
          color: "#6b7280",
        }}>
          Page {currentPage} of {totalPages} ({totalItems} stations)
        </div>
      </div>
    );
  };

  // Render all plugs view
  const renderAllPlugsView = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
          <i className="fas fa-plug" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>No smart plugs found</p>
        </div>
      );
    }

    const currentPageData = getCurrentPageData(filteredData);
    const totalPages = getTotalPages(filteredData.length);

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {currentPageData.map((item, index) => {
            const plug = item.smartPlug || item;
            const isConnected = item.connected !== undefined ? item.connected : plug?.connected;
            const isCharging = item.isCharging !== undefined ? item.isCharging : plug?.isCharging;
            const realTime = realTimeData[plug?.idDevice];
            const consumption = realTime?.energy !== undefined ? realTime.energy : (item.activeSession?.totalConsumption || 0);
            const power = realTime?.power;

            if (!plug) return null;

            return (
              <div
                key={plug.idDevice || index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  border: "1px solid #f0f0f0",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                  }}>
                    <i className="fas fa-plug"></i>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: getStatusColor(isConnected, isCharging),
                    color: getStatusTextColor(isConnected, isCharging),
                  }}>
                    {getStatusText(isConnected, isCharging)}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px", display: "flex", alignItems: "center" }}>
                    {getStatusIcon(isConnected, isCharging)}
                    {plug.idDevice}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="fas fa-map-marker-alt" style={{ fontSize: "12px" }}></i>
                    {plug.stationId ? `Station ${plug.stationId}` : 'Unassigned'}
                  </p>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>CEB Serial:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{plug.cebSerialNo || 'N/A'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Max Output:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{plug.maximumOutput || 0} kW</span>
                  </div>
                  {power !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Current Power:</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#7c0000" }}>{power} kW</span>
                    </div>
                  )}
                </div>

                {isCharging && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "#fffbeb", borderRadius: "12px", border: "1px solid #fde68a" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#d97706", marginBottom: "8px", textTransform: "uppercase" }}>
                      <i className="fas fa-bolt" style={{ marginRight: "4px" }}></i> Active Session
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Started:</span>
                      <span style={{ fontSize: "11px", fontWeight: "500" }}>{item.activeSession?.startTime ? new Date(item.activeSession.startTime).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Duration:</span>
                      <span style={{ fontSize: "11px", fontWeight: "500" }}>{item.activeSession?.startTime ? formatDuration(item.activeSession.startTime) : 'N/A'}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Consumption:</span>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#d97706" }}>{consumption} kWh</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handlePlugClick(plug.idDevice)}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            );
          })}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </>
    );
  };

  // Render stations view with show more functionality and pagination
  const renderStationsView = () => {
    if (!stations || stations.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
          <i className="fas fa-home" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>No stations found</p>
        </div>
      );
    }

    const currentPageStations = getCurrentPageStations(stations);
    const totalPages = getTotalStationPages(stations.length);

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
          {currentPageStations.map((station, index) => {
            const isExpanded = expandedStations[station.stationId] || false;
            const smartPlugsList = station.smartPlugs || [];
            const totalPlugs = smartPlugsList.length;
            const displayPlugs = isExpanded ? smartPlugsList : smartPlugsList.slice(0, 1);
            const remainingCount = totalPlugs - 1;

            return (
              <div
                key={station.stationId || index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  border: "1px solid #f0f0f0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                  }}>
                    <i className="fas fa-home"></i>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: station.status === 'Charging' ? '#fffbeb' : '#f0fdf4',
                    color: station.status === 'Charging' ? '#d97706' : '#10b981',
                  }}>
                    {station.status || 'Available'}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>
                    {station.name || `Station ${station.stationId}`}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>ID: {station.stationId}</p>
                </div>

                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>Location:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>{station.location || 'N/A'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>Smart Plugs:</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#7c0000" }}>{totalPlugs}</span>
                  </div>
                </div>

                {smartPlugsList.length > 0 && (
                  <div style={{ marginTop: "12px", padding: "16px", background: "#f9fafb", borderRadius: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                      <i className="fas fa-plug" style={{ marginRight: "6px" }}></i> Smart Plugs:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {displayPlugs.map((plug, plugIndex) => {
                        const isConnected = plug.connected !== undefined ? plug.connected : false;
                        const isCharging = plug.isCharging !== undefined ? plug.isCharging : false;
                        const realTime = realTimeData[plug?.idDevice];
                        
                        return (
                          <div 
                            key={plugIndex} 
                            style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center", 
                              padding: "12px", 
                              background: "white", 
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => handlePlugClick(plug.idDevice)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fef3f2";
                              e.currentTarget.style.borderColor = "#7c0000";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <p style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{plug.idDevice}</p>
                                {realTime?.power !== undefined && (
                                  <span style={{ 
                                    fontSize: "11px", 
                                    fontWeight: "600", 
                                    color: "#d97706",
                                    background: "#fffbeb",
                                    padding: "2px 6px",
                                    borderRadius: "12px"
                                  }}>
                                    {realTime.power} kW
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                                CEB: {plug.cebSerialNo || 'N/A'}
                              </p>
                              {realTime?.energy !== undefined && (
                                <p style={{ fontSize: "10px", color: "#059669" }}>
                                  Energy: {realTime.energy} kWh
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "600",
                                background: getStatusColor(isConnected, isCharging),
                                color: getStatusTextColor(isConnected, isCharging),
                              }}>
                                {getStatusText(isConnected, isCharging)}
                              </span>
                              <i 
                                className="fas fa-chevron-right" 
                                style={{ 
                                  fontSize: "12px", 
                                  color: "#9ca3af", 
                                  marginLeft: "10px",
                                  opacity: 0.6
                                }}
                              ></i>
                            </div>
                          </div>
                        );
                      })}
                      
                      {totalPlugs > 1 && !isExpanded && (
                        <button
                          onClick={() => toggleShowMore(station.stationId)}
                          style={{
                            width: "100%",
                            marginTop: "8px",
                            padding: "10px",
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            color: "#7c0000",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
                          }}
                        >
                          <i className="fas fa-chevron-down"></i> Show {remainingCount} More Plug{remainingCount > 1 ? 's' : ''}
                        </button>
                      )}
                      
                      {isExpanded && totalPlugs > 1 && (
                        <button
                          onClick={() => toggleShowMore(station.stationId)}
                          style={{
                            width: "100%",
                            marginTop: "8px",
                            padding: "10px",
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            color: "#6b7280",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
                          }}
                        >
                          <i className="fas fa-chevron-up"></i> Show Less
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <StationPagination 
          currentPage={stationsCurrentPage}
          totalItems={stations.length}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handleStationPageChange}
          onPrevious={handleStationPreviousPage}
          onNext={handleStationNextPage}
        />
      </>
    );
  };

  // Render connected view
  const renderConnectedView = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
          <i className="fas fa-wifi" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>No connected smart plugs found</p>
        </div>
      );
    }

    const currentPageData = getCurrentPageData(filteredData);
    const totalPages = getTotalPages(filteredData.length);

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {currentPageData.map((item, index) => {
            const plug = item.smartPlug || item;
            const isConnected = item.connected !== undefined ? item.connected : plug?.connected;
            const isCharging = item.isCharging !== undefined ? item.isCharging : plug?.isCharging;
            const realTime = realTimeData[plug?.idDevice];

            if (!plug) return null;

            return (
              <div
                key={plug.idDevice || index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  border: "1px solid #f0f0f0",
                  borderLeft: "4px solid #10b981",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                  }}>
                    <i className="fas fa-wifi"></i>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: isCharging ? '#fffbeb' : '#f0fdf4',
                    color: isCharging ? '#d97706' : '#10b981',
                  }}>
                    {isCharging ? 'Charging' : 'Available'}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                    {plug.idDevice}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#10b981", marginBottom: "12px" }}>
                    <i className="fas fa-circle" style={{ fontSize: "8px", marginRight: "6px" }}></i> Online - Ready
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    <i className="fas fa-map-marker-alt" style={{ fontSize: "11px", marginRight: "4px" }}></i>
                    {plug.stationId ? `Station: ${plug.stationId}` : 'Unassigned'}
                  </p>
                </div>

                {realTime && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #86efac" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#059669", marginBottom: "8px" }}>
                      <i className="fas fa-chart-line" style={{ marginRight: "4px" }}></i> Live Data
                    </p>
                    {realTime.power !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>Power:</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>{realTime.power} kW</span>
                      </div>
                    )}
                    {realTime.energy !== undefined && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>Energy:</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>{realTime.energy} kWh</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handlePlugClick(plug.idDevice)}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "13px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-eye" style={{ marginRight: "6px" }}></i> View Live Status
                </button>
              </div>
            );
          })}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </>
    );
  };

  // Render charging view
  const renderChargingView = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>
          <i className="fas fa-bolt" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>No charging smart plugs found</p>
        </div>
      );
    }

    const currentPageData = getCurrentPageData(filteredData);
    const totalPages = getTotalPages(filteredData.length);

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {currentPageData.map((item, index) => {
            const plug = item.smartPlug || item;
            const realTime = realTimeData[plug?.idDevice];
            const consumption = realTime?.energy !== undefined ? realTime.energy : (item.totalConsumption || 0);
            const power = realTime?.power;
            const sessionStartTime = item.startTime || item.activeSession?.startTime;

            if (!plug) return null;

            return (
              <div
                key={plug.idDevice || index}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  border: "1px solid #f0f0f0",
                  borderLeft: "4px solid #d97706",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                  }}>
                    <i className="fas fa-bolt"></i>
                  </div>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: "#fffbeb",
                    color: "#d97706",
                  }}>
                    Charging
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                    {plug.idDevice}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    <i className="fas fa-map-marker-alt" style={{ fontSize: "11px", marginRight: "4px" }}></i>
                    {plug.stationId ? `Station: ${plug.stationId}` : 'Unassigned'}
                  </p>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Session ID:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#1f2937" }}>#{item.sessionId || item.activeSession?.sessionId || 'N/A'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Started:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Duration:</span>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{sessionStartTime ? formatDuration(sessionStartTime) : 'N/A'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Consumption:</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#d97706" }}>{typeof consumption === 'number' ? consumption.toFixed(2) : consumption} kWh</span>
                  </div>
                  {power !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Current Power:</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#d97706" }}>{power} kW</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePlugClick(plug.idDevice)}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "13px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fas fa-chart-bar" style={{ marginRight: "6px" }}></i> Monitor Live
                </button>
              </div>
            );
          })}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>🔄</div>
          <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading smart plug data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <i className="fas fa-tachometer-alt" style={{ background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}></i>
                Smart Plug Monitor
              </h1>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                <i className="fas fa-plug" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                Monitor and manage all smart plugs in real-time
              </p>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "13px",
                opacity: isRefreshing ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#7c0000";
                }
              }}
              onMouseLeave={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }
              }}
            >
              <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`} style={{ fontSize: "12px" }}></i>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: "8px" }}></i>
              <strong>Error!</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fas fa-plug" style={{ fontSize: "28px" }}></i>
              <div>
                <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Total Smart Plugs</p>
                <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.totalSmartPlugs || 0}</h4>
              </div>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fas fa-wifi" style={{ fontSize: "28px" }}></i>
              <div>
                <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Connected</p>
                <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.connectedPlugs || 0}</h4>
              </div>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fas fa-bolt" style={{ fontSize: "28px" }}></i>
              <div>
                <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Charging Now</p>
                <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.chargingPlugs || 0}</h4>
              </div>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fas fa-home" style={{ fontSize: "28px" }}></i>
              <div>
                <p style={{ fontSize: "12px", opacity: "0.9", marginBottom: "4px" }}>Active Stations</p>
                <h4 style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{summary.stationsWithPlugs || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Main Monitoring Section */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            borderBottom: "2px solid #f0f0f0",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}>
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: "10px 20px",
                background: viewMode === 'all' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
                color: viewMode === 'all' ? "white" : "#6b7280",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'all') {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'all') {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <i className="fas fa-th-large"></i> All Plugs
            </button>
            <button
              onClick={() => setViewMode('stations')}
              style={{
                padding: "10px 20px",
                background: viewMode === 'stations' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
                color: viewMode === 'stations' ? "white" : "#6b7280",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'stations') {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'stations') {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <i className="fas fa-home"></i> By Station
            </button>
            <button
              onClick={() => setViewMode('connected')}
              style={{
                padding: "10px 20px",
                background: viewMode === 'connected' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
                color: viewMode === 'connected' ? "white" : "#6b7280",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'connected') {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'connected') {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <i className="fas fa-wifi"></i> Connected
            </button>
            <button
              onClick={() => setViewMode('charging')}
              style={{
                padding: "10px 20px",
                background: viewMode === 'charging' ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "transparent",
                color: viewMode === 'charging' ? "white" : "#6b7280",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'charging') {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'charging') {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <i className="fas fa-bolt"></i> Charging Now
            </button>
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "2px solid #f0f0f0",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <i className="fas fa-info-circle" style={{ color: "#7c0000" }}></i>
                Smart Plug Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#9ca3af",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#7c0000"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Real-time status section */}
              <div style={{
                background: "linear-gradient(135deg, #fef3f2 0%, #fff5f5 100%)",
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "20px",
                border: "1px solid #fed7d7",
              }}>
                <h6 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#7c0000",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <i className="fas fa-clock"></i> Real-time Status
                </h6>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Connection</p>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                      background: selectedPlug.connected ? "#f0fdf4" : "#fee2e2",
                      color: selectedPlug.connected ? "#10b981" : "#dc2626",
                    }}>
                      {selectedPlug.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Charging Status</p>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                      background: selectedPlug.isCharging ? "#fffbeb" : "#f0fdf4",
                      color: selectedPlug.isCharging ? "#d97706" : "#10b981",
                    }}>
                      {selectedPlug.isCharging ? 'Charging' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div style={{
                background: "#f9fafb",
                padding: "20px",
                borderRadius: "16px",
                marginBottom: "20px",
                border: "1px solid #e5e7eb",
              }}>
                <h6 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <i className="fas fa-microchip"></i> Device Information
                </h6>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Device ID</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.idDevice || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>CEB Serial</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.cebSerialNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Maximum Output</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.maximumOutput || 0} kW</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Firmware</p>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.deviceInfo?.firmwareVersion || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Active Session */}
              {selectedPlug.activeSession && (
                <div style={{
                  background: "#fffbeb",
                  padding: "20px",
                  borderRadius: "16px",
                  marginBottom: "20px",
                  border: "1px solid #fde68a",
                }}>
                  <h6 style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#d97706",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <i className="fas fa-play-circle"></i> Active Charging Session
                  </h6>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Session ID</p>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>#{selectedPlug.activeSession.sessionId}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Duration</p>
                      <p style={{ fontSize: "14px", fontWeight: "500" }}>{selectedPlug.activeSession.startTime ? formatDuration(selectedPlug.activeSession.startTime) : 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Consumption</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#d97706" }}>
                        {realTimeData[selectedPlug.deviceInfo?.idDevice]?.energy !== undefined 
                          ? realTimeData[selectedPlug.deviceInfo?.idDevice].energy 
                          : (selectedPlug.activeSession.totalConsumption || 0)} kWh
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Charging Mode</p>
                      <p style={{ fontSize: "14px", fontWeight: "500" }}>{selectedPlug.activeSession.chargingMode || 'N/A'}</p>
                    </div>
                  </div>
                  {realTimeData[selectedPlug.deviceInfo?.idDevice]?.power && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #fde68a" }}>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>Current Power: <span style={{ fontWeight: "600", color: "#d97706" }}>{realTimeData[selectedPlug.deviceInfo?.idDevice].power} kW</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Station Information */}
              {selectedPlug.stationInfo && (
                <div style={{
                  background: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #86efac",
                }}>
                  <h6 style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#059669",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <i className="fas fa-charging-station"></i> Charging Station
                  </h6>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Station Name</p>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Location</p>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Solar Power</p>
                      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{selectedPlug.stationInfo.solarPowerAvailable || 0} kW</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Status</p>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: selectedPlug.stationInfo.status === 'Charging' ? '#fffbeb' : '#f0fdf4',
                        color: selectedPlug.stationInfo.status === 'Charging' ? '#d97706' : '#10b981',
                      }}>
                        {selectedPlug.stationInfo.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              padding: "20px 24px",
              borderTop: "2px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
              >
                <i className="fas fa-times" style={{ marginRight: "6px" }}></i> Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
}