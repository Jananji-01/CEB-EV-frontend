// import { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";

// const SessionCheck = () => {
//   const history = useHistory();
//   const [sessionExpired, setSessionExpired] = useState(false);

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8088/EVProject-0.0.1-SNAPSHOT/api/v1/session", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: "Basic " + btoa("user:admin123"),
//           },
//           credentials: "include",
//         });

//         if (response.status === 401 && !sessionExpired) {
//           setSessionExpired(true);
//           alert("Session expired! Please log in again.");
//           sessionStorage.clear(); // Clear stored session
//           history.push("/auth/login");
//         }
//       } catch (error) {
//         console.error("Session check failed:", error);
//       }
//     };

//     // Check session every 30 seconds
//     const interval = setInterval(checkSession, 30000);

//     return () => clearInterval(interval); // Cleanup on unmount
//   }, [history, sessionExpired]);

//   return null;
// };

// export default SessionCheck;

// import { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";

// const SessionCheck = () => {
//   const history = useHistory();
//   const [sessionExpired, setSessionExpired] = useState(false);

//   useEffect(() => {
//     const checkSession = () => {
//       const email = sessionStorage.getItem("email");
//       const userLevel = sessionStorage.getItem("userLevel");
//       const eAccountNo = sessionStorage.getItem("eAccountNo");
//       const sessionStart = sessionStorage.getItem("sessionStart");

//       console.log("Session Check:", { email, userLevel, eAccountNo });

//       const currentTime = Date.now();
//       const tenMinutes = 10 * 60 * 1000 * 3; // 600,000 ms

//       // If any session data is missing or the session has expired
//       if (
//         !email ||
//         !userLevel ||
//         !eAccountNo ||
//         !sessionStart ||
//         currentTime - Number(sessionStart) > tenMinutes
//       ) {
//         // Avoid setting session expired multiple times
//         if (!sessionExpired) {
//           setSessionExpired(true);
//           alert("Session expired or invalid! Please log in again.");
//           sessionStorage.clear();
//           history.push("/auth/login");
//         }
//       } else {
//         // Log the session details if the session is still valid
//         console.log("Session is still valid.");
//       }
//     };

//     // Set interval to check session every 10 minutes
//     const interval = setInterval(checkSession, 600000);

//     // Clean up the interval when the component unmounts
//     return () => clearInterval(interval);
//   }, [history, sessionExpired]);

//   return null;
// };

// export default SessionCheck;


import { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

const SessionCheck = () => {
  const history = useHistory();
  const logoutInProgressRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // Update last activity timestamp
  const updateLastActivity = () => {
    lastActivityRef.current = Date.now();
    sessionStorage.setItem("lastActivity", Date.now().toString());
  };

  const handleSessionExpiration = () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    toast.dismiss();
    toast.error("Session expired! Please log in again.");

    // Clear only your session data
    sessionStorage.clear();
    localStorage.removeItem("user"); // if you store user info in localStorage

    setTimeout(() => {
      history.push("/auth/login");
      logoutInProgressRef.current = false;
    }, 100);
  };

  const checkSession = () => {
    if (logoutInProgressRef.current) return;

    const email = sessionStorage.getItem("email");
    const userLevel = sessionStorage.getItem("userLevel");
    const eAccountNo = sessionStorage.getItem("eAccountNo");

    const lastActivity =
      sessionStorage.getItem("lastActivity") || Date.now().toString();

    const currentTime = Date.now();
    const fifteenMinutes = 15 * 60 * 1000; // inactivity timeout

    // If any session data missing
    if (!email || !userLevel || !eAccountNo) {
      handleSessionExpiration();
      return;
    }

    // If inactive for more than 15 minutes
    if (currentTime - Number(lastActivity) > fifteenMinutes) {
      handleSessionExpiration();
      return;
    }

    // Warn user 2 minutes before inactivity timeout
    const timeLeft = fifteenMinutes - (currentTime - Number(lastActivity));
    if (timeLeft > 0 && timeLeft <= 2 * 60 * 1000) {
      const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
      toast.warning(
        `Session expires in ${minutesLeft} minute${
          minutesLeft > 1 ? "s" : ""
        } due to inactivity`,
        { toastId: "session-warning", autoClose: false }
      );
    }
  };

  useEffect(() => {
    const activityEvents = [
      "mousedown",
      "keypress",
      "click",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    const handleActivity = () => {
      updateLastActivity();
      toast.dismiss("session-warning");
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    // Initialize last activity
    updateLastActivity();

    const interval = setInterval(checkSession, 60 * 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [history]);

  return null;
};

export default SessionCheck;