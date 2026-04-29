// import React, { useEffect, useRef, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
// import "leaflet-fullscreen";
// import "leaflet-routing-machine";

// // Fix for default Leaflet icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

// function MapExample() {
//   const mapRef = useRef(null);
//   const [map, setMap] = useState(null);
//   const [locations, setLocations] = useState([]);
//   const [mapInitialized, setMapInitialized] = useState(false);
//   const routeControlRef = useRef(null);
//   const userMarkerRef = useRef(null);
//   const markersRef = useRef([]);
//   const legendRef = useRef(null);

//   const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088";

//   // Icons for charging stations
//   const iconStatus = {
//     available: new L.Icon({
//       iconUrl:
//         "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//       shadowSize: [41, 41],
//     }),
//     occupied: new L.Icon({
//       iconUrl:
//         "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//       shadowSize: [41, 41],
//     }),
//     unplugged: new L.Icon({
//       iconUrl:
//         "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [1, -34],
//       shadowUrl:
//         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//       shadowSize: [41, 41],
//     }),
//   };

//   // Fetch charging stations from backend
//   useEffect(() => {
//     const fetchStations = async () => {
//       try {
//         const response = await fetch(`${baseUrl}/api/charging-stations`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log("Fetched Locations:", data);
//         setLocations(data);
//       } catch (error) {
//         console.error("Error fetching charging stations:", error);
//       }
//     };

//     fetchStations();
//   }, [baseUrl]);

//   // Initialize the map - only once
//   useEffect(() => {
//     if (!mapRef.current || map) return;

//     const initialLat = 6.9271;
//     const initialLng = 79.8612;

//     try {
//       const newMap = L.map(mapRef.current, {
//         fullscreenControl: true,
//         fullscreenControlOptions: { position: "topright" },
//       }).setView([initialLat, initialLng], 14);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
//       }).addTo(newMap);

//       setMap(newMap);
//       setMapInitialized(true);
//     } catch (error) {
//       console.error("Error initializing map:", error);
//     }

//     // Cleanup function
//     return () => {
//       if (map) {
//         map.remove();
//         setMapInitialized(false);
//       }
//     };
//   }, []); // Empty dependency array - run only once

//   // Add markers for charging stations
//   useEffect(() => {
//     // Wait for map to be initialized and locations to be loaded
//     if (!map || !mapInitialized || locations.length === 0) return;

//     // Clear existing markers
//     markersRef.current.forEach(marker => {
//       if (map.hasLayer(marker)) {
//         map.removeLayer(marker);
//       }
//     });
//     markersRef.current = [];

//     // Clear existing legend
//     if (legendRef.current) {
//       map.removeControl(legendRef.current);
//     }

//     // Add new markers with a small delay to ensure map is ready
//     setTimeout(() => {
//       try {
//         locations.forEach((location) => {
//           if (!location.latitude || !location.longitude) {
//             console.warn("Invalid location data:", location);
//             return;
//           }

//           const icon = location.status?.toLowerCase() === "available" ? iconStatus.available :
//                       location.status?.toLowerCase() === "occupied" ? iconStatus.occupied :
//                       iconStatus.unplugged;

//           const marker = L.marker([location.latitude, location.longitude], { icon })
//             .bindTooltip(
//               `<b>${location.name || "Unknown"}</b><br>Status: ${location.status || "Unknown"}<br>Charge: ${
//                 location.solarPowerAvailable || 0
//               }%`
//             );
          
//           marker.addTo(map);
//           markersRef.current.push(marker);
//         });

//         // Add Legend
//         const legend = L.control({ position: "bottomright" });
//         legend.onAdd = function () {
//           const div = L.DomUtil.create("div", "info legend");
//           div.innerHTML = `
//             <div style="background:white; padding:10px; border-radius:5px; box-shadow:0 0 5px rgba(0,0,0,0.3);">
//               <h4 style="margin:0 0 5px 0;">Station Status</h4>
//               <div><span style="display:inline-block; width:12px; height:12px; background:green; margin-right:5px;"></span> Available</div>
//               <div><span style="display:inline-block; width:12px; height:12px; background:blue; margin-right:5px;"></span> Occupied</div>
//               <div><span style="display:inline-block; width:12px; height:12px; background:red; margin-right:5px;"></span> Unplugged</div>
//             </div>
//           `;
//           return div;
//         };

//         legend.addTo(map);
//         legendRef.current = legend;

//       } catch (error) {
//         console.error("Error adding markers:", error);
//       }
//     }, 100); // Small delay to ensure map is ready

//   }, [map, mapInitialized, locations]);

//   // Track user location and route to the nearest available station
//   useEffect(() => {
//     if (!map || !mapInitialized || locations.length === 0) return;

//     const carIcon = new L.Icon({
//       iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
//       iconSize: [40, 40],
//       iconAnchor: [20, 40],
//       popupAnchor: [0, -35],
//     });

//     let watchId = null;

//     if (navigator.geolocation) {
//       watchId = navigator.geolocation.watchPosition(
//         (position) => {
//           try {
//             const userLat = position.coords.latitude;
//             const userLng = position.coords.longitude;

//             // Remove previous user marker
//             if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) {
//               map.removeLayer(userMarkerRef.current);
//             }

//             // Add new user marker
//             userMarkerRef.current = L.marker([userLat, userLng], { icon: carIcon })
//               .addTo(map)
//               .bindPopup("<b>Your Car</b>")
//               .openPopup();

//             // Find the nearest available charging station
//             const availableStations = locations.filter(
//               (station) => station.status?.toLowerCase() === "available"
//             );
            
//             console.log("Available Stations:", availableStations);
            
//             if (availableStations.length === 0) return;

//             const nearestStation = availableStations.reduce((prev, curr) => {
//               const prevDist = Math.hypot(
//                 userLat - prev.latitude,
//                 userLng - prev.longitude
//               );
//               const currDist = Math.hypot(
//                 userLat - curr.latitude,
//                 userLng - curr.longitude
//               );
//               return prevDist < currDist ? prev : curr;
//             });

//             // Remove existing route
//             if (routeControlRef.current && map.hasLayer(routeControlRef.current)) {
//               map.removeControl(routeControlRef.current);
//             }

//             // Add routing to the nearest station
//             routeControlRef.current = L.Routing.control({
//               waypoints: [
//                 L.latLng(userLat, userLng),
//                 L.latLng(nearestStation.latitude, nearestStation.longitude),
//               ],
//               routeWhileDragging: true,
//               createMarker: () => null,
//               show: true,
//               addWaypoints: false,
//               fitSelectedRoutes: true,
//               lineOptions: {
//                 styles: [{ color: "blue", weight: 5 }],
//               },
//             }).addTo(map);
//           } catch (error) {
//             console.error("Error in location tracking:", error);
//           }
//         },
//         (error) => {
//           console.error("Error getting user location:", error);
//         },
//         {
//           enableHighAccuracy: true,
//           maximumAge: 5000,
//           timeout: 10000,
//         }
//       );
//     }

//     // Cleanup geolocation watch
//     return () => {
//       if (watchId) {
//         navigator.geolocation.clearWatch(watchId);
//       }
//     };
//   }, [map, mapInitialized, locations]);

//   return (
//     <div style={{ position: "relative", height: "600px", width: "100%" }}>
//       <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
//       {!mapInitialized && (
//         <div style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           background: "white",
//           padding: "20px",
//           borderRadius: "5px",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
//         }}>
//           Loading map...
//         </div>
//       )}
//     </div>
//   );
// }

// export default MapExample;


import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";
import "leaflet-routing-machine";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// ✅ Add CSS to completely hide routing panel
const hideRoutingStyles = `
  .leaflet-routing-container {
    display: none !important;
  }
  .leaflet-control-container .leaflet-routing-collapse-btn {
    display: none !important;
  }
  .leaflet-routing-collapsible {
    display: none !important;
  }
`;

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapExample() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const routeControlRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef({}); // Store markers by stationId for easy updates
  const legendRef = useRef(null);
  const stompClientRef = useRef(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8088";
  const wsUrl = process.env.REACT_APP_WS_URL || "http://localhost:8088";

  // ✅ Inject CSS to hide routing panel on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = hideRoutingStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Icons for charging stations
  const iconStatus = {
    available: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
    occupied: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
    charging: new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
  };

  // Function to update marker status in real-time
  const updateMarkerStatus = (stationId, newStatus) => {
    const marker = markersRef.current[stationId];
    if (!marker || !map) return;

    // Get the appropriate icon
    const icon = iconStatus[newStatus] || iconStatus.available;
    
    // Update marker icon
    marker.setIcon(icon);
    
    // Find the station data
    const station = locations.find(s => s.stationId === parseInt(stationId) || s.stationId === stationId);
    if (station) {
      const tooltipContent = `<b>${station.stationName || "Unknown Station"}</b><br>Status: ${newStatus.toUpperCase()}<br>Charge: ${station.solarPowerAvailable || 0}%`;
      marker.bindTooltip(tooltipContent);
    }
    
    console.log(`Station ${stationId} status updated to: ${newStatus}`);
  };

  // Fetch charging stations from backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/charging-stations`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Locations:", data);
        setLocations(data);
      } catch (error) {
        console.error("Error fetching charging stations:", error);
      }
    };

    fetchStations();
  }, [baseUrl]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!mapInitialized || locations.length === 0) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws`),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket for real-time station updates');
        
        // Subscribe to station status updates
        stompClient.subscribe('/topic/stations', (message) => {
          const update = JSON.parse(message.body);
          console.log('Received station update:', update);
          
          if (update.type === 'station_status_update') {
            updateMarkerStatus(update.stationId, update.status);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [mapInitialized, locations]);

  // Initialize the map - only once
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initialLat = 6.9271;
    const initialLng = 79.8612;

    try {
      const newMap = L.map(mapRef.current, {
        fullscreenControl: true,
        fullscreenControlOptions: { position: "topright" },
      }).setView([initialLat, initialLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      }).addTo(newMap);

      setMap(newMap);
      setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMapInitialized(false);
      }
    };
  }, []);

  // Add markers for charging stations
  useEffect(() => {
    if (!map || !mapInitialized || locations.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Clear existing legend
    if (legendRef.current) {
      map.removeControl(legendRef.current);
    }

    // Add new markers
    setTimeout(() => {
      try {
        locations.forEach((location) => {
          if (!location.latitude || !location.longitude) {
            console.warn("Invalid location data:", location);
            return;
          }

          // Determine status
          let status = location.status?.toLowerCase() || 'available';
          
          const icon = status === "available" ? iconStatus.available :
                      status === "occupied" ? iconStatus.occupied :
                      iconStatus.charging;

          // Use stationName instead of name
          const stationName = location.stationName || location.name || "Unknown Station";
          
          const marker = L.marker([location.latitude, location.longitude], { icon })
            .bindTooltip(
              `<b>${stationName}</b><br>Status: ${status.toUpperCase()}<br>Charge: ${
                location.solarPowerAvailable || 0
              }%`
            );
          
          marker.addTo(map);
          // Store marker by stationId
          markersRef.current[location.stationId] = marker;
        });

        // Add Legend
        const legend = L.control({ position: "bottomright" });
        legend.onAdd = function () {
          const div = L.DomUtil.create("div", "info legend");
          div.innerHTML = `
            <div style="background:white; padding:10px; border-radius:5px; box-shadow:0 0 5px rgba(0,0,0,0.3);">
              <h4 style="margin:0 0 5px 0;">Station Status</h4>
              <div><span style="display:inline-block; width:12px; height:12px; background:green; margin-right:5px;"></span> Available</div>
              <div><span style="display:inline-block; width:12px; height:12px; background:blue; margin-right:5px;"></span> Occupied</div>
              <div><span style="display:inline-block; width:12px; height:12px; background:red; margin-right:5px;"></span> Charging</div>
            </div>
          `;
          return div;
        };

        legend.addTo(map);
        legendRef.current = legend;

      } catch (error) {
        console.error("Error adding markers:", error);
      }
    }, 100);

  }, [map, mapInitialized, locations]);

  // Track user location and route to the nearest available station
  useEffect(() => {
    if (!map || !mapInitialized || locations.length === 0) return;

    const carIcon = new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35],
    });

    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          try {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Remove previous user marker
            if (userMarkerRef.current && map.hasLayer(userMarkerRef.current)) {
              map.removeLayer(userMarkerRef.current);
            }

            // Add new user marker
            userMarkerRef.current = L.marker([userLat, userLng], { icon: carIcon })
              .addTo(map)
              .bindPopup("<b>Your Car</b>")
              .openPopup();

            // Find the nearest available charging station (not charging)
            const availableStations = locations.filter(
              (station) => {
                const status = station.status?.toLowerCase();
                // Check if station is currently charging by looking at marker icon
                const marker = markersRef.current[station.stationId];
                const isCharging = marker && marker.options.icon === iconStatus.charging;
                return status === "available" && !isCharging;
              }
            );
            
            console.log("Available Stations:", availableStations);
            
            if (availableStations.length === 0) return;

            const nearestStation = availableStations.reduce((prev, curr) => {
              const prevDist = Math.hypot(
                userLat - prev.latitude,
                userLng - prev.longitude
              );
              const currDist = Math.hypot(
                userLat - curr.latitude,
                userLng - curr.longitude
              );
              return prevDist < currDist ? prev : curr;
            });

            // Remove existing route
            if (routeControlRef.current && map.hasLayer(routeControlRef.current)) {
              map.removeControl(routeControlRef.current);
            }

            // Add routing with minimal UI - only the line
            routeControlRef.current = L.Routing.control({
              waypoints: [
                L.latLng(userLat, userLng),
                L.latLng(nearestStation.latitude, nearestStation.longitude),
              ],
              routeWhileDragging: false,
              createMarker: () => null,
              show: false,
              addWaypoints: false,
              fitSelectedRoutes: true,
              lineOptions: {
                styles: [{ color: "#0c45e1", weight: 5, opacity: 0.8 }],
              },
              formatter: new L.Routing.Formatter({
                formatInstruction: function(instruction) {
                  return '';
                }
              })
            }).addTo(map);
            
            // Hide the panel after adding
            setTimeout(() => {
              const routingContainer = document.querySelector('.leaflet-routing-container');
              if (routingContainer) {
                routingContainer.style.display = 'none';
              }
            }, 100);
            
          } catch (error) {
            console.error("Error in location tracking:", error);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    }

    // Cleanup geolocation watch
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [map, mapInitialized, locations]);

  return (
    <div style={{ position: "relative", height: "600px", width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      {!mapInitialized && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
}

export default MapExample;