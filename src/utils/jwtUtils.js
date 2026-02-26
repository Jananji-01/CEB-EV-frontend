// utils/jwtUtils.js
export function getRoleFromJwt(token) {
  if (!token) return null;
  try {
    // JWT format: header.payload.signature
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    // Assuming your backend stores roles as an array: ["ROLE_EVOWNER"]
    if (decoded.roles && decoded.roles.length > 0) {
      return decoded.roles[0].replace("ROLE_", ""); // remove prefix
    }
    return null;
  } catch (err) {
    console.error("Failed to parse JWT", err);
    return null;
  }
}
