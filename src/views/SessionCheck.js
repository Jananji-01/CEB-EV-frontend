import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const SessionCheck = () => {
  const history = useHistory();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const email = sessionStorage.getItem("email");
      const userLevel = sessionStorage.getItem("userLevel");
      const eAccountNo = sessionStorage.getItem("eAccountNo");
      const sessionStart = sessionStorage.getItem("sessionStart");

      console.log("Session Check:", { email, userLevel, eAccountNo });

      const currentTime = Date.now();
      const tenMinutes = 10 * 60 * 1000 * 3; // 600,000 ms

      // If any session data is missing or the session has expired
      if (
        !email ||
        !userLevel ||
        !eAccountNo ||
        !sessionStart ||
        currentTime - Number(sessionStart) > tenMinutes
      ) {
        // Avoid setting session expired multiple times
        if (!sessionExpired) {
          setSessionExpired(true);
          alert("Session expired or invalid! Please log in again.");
          sessionStorage.clear();
          history.push("/auth/login");
        }
      } else {
        // Log the session details if the session is still valid
        console.log("Session is still valid.");
      }
    };

    // Set interval to check session every 10 minutes
    const interval = setInterval(checkSession, 600000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [history, sessionExpired]);

  return null;
};

export default SessionCheck;



