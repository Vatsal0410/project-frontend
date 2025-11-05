import axios from "axios";
import { getToken, removeAuthCookies } from "../utils/utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const authService = {
  async login(email: string, password: string) {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      console.log(res.data);
      return res.data;
    } catch (err: any) {
      console.error("Failed to login");
      throw err;
    }
  },
  async logout() {
    try {
      const token = getToken();
      const res = await axios.post(
        "http://localhost:3000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      if (res.data.success) {
        removeAuthCookies();
      }
    } catch (error) {
      console.error(error);
    }
  },
  async forgotPassword(email: string) {
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.userId;
    } catch (err: any) {
      console.error("Failed to forgot password");
      throw err;
    }
  },
  async resetPassword(userId: string, otp: string, newPassword: string) {
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/reset-password`,
        { userId, otp, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res);
      return res.data;
    } catch (err: any) {
      console.error("Failed to reset password");
      throw err;
    }
  },
};
