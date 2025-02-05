import { jwtDecode } from "jwt-decode";
export const getToken = () => {
  return localStorage.getItem("token");
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    // console.log(decoded);
    const now = Date.now() / 1000;
    return { _id: decoded.userId, isExpired: decoded.exp < now };
  } catch (error) {
    console.log("Invalid Token", error);
    return true;
  }
};
