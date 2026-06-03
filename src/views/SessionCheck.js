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
  const isInitializedRef = useRef(false); // 🔥 important fix

  // ✅ Update last activity
  const updateLastActivity = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    sessionStorage.setItem("lastActivity", now.toString());
  };

  // ✅ Handle logout safely
  const handleSessionExpiration = () => {
    if (logoutInProgressRef.current) return;

    logoutInProgressRef.current = true;

    toast.dismiss();
    toast.error("Session expired! Please log in again.");

    sessionStorage.clear();
    localStorage.removeItem("user");

    setTimeout(() => {
      history.push("/auth/login");
      logoutInProgressRef.current = false;
    }, 100);
  };

  // ✅ Main session check
  const checkSession = () => {
    if (logoutInProgressRef.current) return;

    const email = sessionStorage.getItem("email");
    const userLevel = sessionStorage.getItem("userLevel");
    const eAccountNo = sessionStorage.getItem("eAccountNo");

    // 🔥 Wait until session is initialized (IMPORTANT FIX)
    if (!isInitializedRef.current) {
      if (email && userLevel && eAccountNo) {
        isInitializedRef.current = true;
        console.log("Session initialized ✅");
      } else {
        console.log("Waiting for session data...");
        return;
      }
    }

    const lastActivity =
      sessionStorage.getItem("lastActivity") || Date.now().toString();

    const currentTime = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    // ❌ If session data missing AFTER init → logout
    if (!email || !userLevel || !eAccountNo) {
      handleSessionExpiration();
      return;
    }

    // ❌ Inactivity timeout
    if (currentTime - Number(lastActivity) > fifteenMinutes) {
      handleSessionExpiration();
      return;
    }

    // ⚠️ Warning before expiry (2 mins before)
    const timeLeft = fifteenMinutes - (currentTime - Number(lastActivity));

    if (timeLeft > 0 && timeLeft <= 2 * 60 * 1000) {
      const minutesLeft = Math.ceil(timeLeft / (60 * 1000));

      toast.warning(
        `Session expires in ${minutesLeft} minute${
          minutesLeft > 1 ? "s" : ""
        }`,
        {
          toastId: "session-warning",
          autoClose: false,
        }
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

    // ✅ Attach listeners
    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    // ✅ Initialize activity
    updateLastActivity();

    // ✅ Run check every minute
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