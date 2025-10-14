import { createContext, useContext, useState, type ReactNode } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, isAdmin: boolean, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!Cookies.get("token")
  );
  const [isAdmin, setIsAdmin] = useState(Cookies.get("isAdmin") === "true");

  const login = (token: string, isAdmin: boolean, userData: any) => {
    if (!token || token === "undefined" || token === "null") {
      console.error("Invalid token received:", token);
      return;
    }

    const cookieOptions = {
      expires: 7,
      path: "/",
    };


    
    Cookies.set("token", token, cookieOptions);
    Cookies.set("isAdmin", String(isAdmin), cookieOptions);
    Cookies.set("fname", userData.fname, cookieOptions);
    Cookies.set("lname", userData.lname, cookieOptions);
    Cookies.set("email", userData.email, cookieOptions);


    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("isAdmin");
    Cookies.remove("fname");
    Cookies.remove("lname");
    Cookies.remove("email");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
