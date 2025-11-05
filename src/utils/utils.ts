import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const getToken = () => {
    return Cookies.get("token");
};

export const removeAuthCookies = () => {
    Cookies.remove("token");
    Cookies.remove("isAdmin");
    Cookies.remove("fname");
    Cookies.remove("lname");
    Cookies.remove("email");
  };

export const navigateToLogin = () => {
    const navigate = useNavigate()
    navigate("/login")
}

export const getUserData = () => {
    const token = getToken();
    const isAuthenticated = !!token;
    const isAdmin = Cookies.get("isAdmin");
    const fname = Cookies.get("fname")
    const lname = Cookies.get("lname")
    const email = Cookies.get("email")
    const isLeader = Cookies.get("isLeader")
    return { isAuthenticated, isAdmin, fname, lname, email, isLeader }
};