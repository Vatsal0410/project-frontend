import type { AxiosResponse } from "axios";
import axios from "axios";
import type { IUser } from "../types/User";

export interface UsersApiResponse {
  success: boolean;
  users: IUser[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface UserOperationResponse {
  success: boolean;
  status?: string;
  statusText?: string;  
  user?: IUser;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class UserService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Fetch All Users from API
  async fetchAllUsers(token: string): Promise<IUser[]> {
    try {
      const res: AxiosResponse<UsersApiResponse> = await axios.get(
        `${this.baseURL}/api/all-users`,
        {
          headers: this.getAuthHeaders(token),
        }
      );
      return res.data.users
    } catch (err) {
      console.error("Error fetching users:", err);
      throw this.handleError(err);
    }
  }

  // Add User 
  async createUser(userData: any, token: string): Promise<UserOperationResponse> {
    try {
      const res = await axios.post(
        `${this.baseURL}/api/users`,
        userData,
        {
          headers: this.getAuthHeaders(token)
        }
      )

      console.log(`User created successfully: ${userData.email}`)
      console.log(res.data)
      return res.data
    }
    catch (err) {
      console.error("Error creating user:", err);
      throw this.handleError(err);
    }
  }

  // Update existing User
  async updateUser(userId: string, userData: any, token: string): Promise<UserOperationResponse> {
    try {
      const res = await axios.put(
        `${this.baseURL}/api/users/${userId}`,
        userData,
        {
          headers: this.getAuthHeaders(token)
        }
      )

      console.log(`User updated successfully: ${userId}`)
      return res.data
    }
    catch (err) {
      console.error("Error updating user:", err);
      throw this.handleError(err);
    }
  }

  // Delete (Archive) User
  async deleteUser(
    userId: string,
    token: string
  ): Promise<UserOperationResponse> {
    try {
      const res: AxiosResponse<UserOperationResponse> = await axios.delete(
        `${this.baseURL}/api/users/${userId}`,
        {
          headers: this.getAuthHeaders(token),
        }
      );

      console.log(res.data.user);
      return res.data;
    } catch (err) {
      console.error("Error deleting user:", err);
      throw this.handleError(err);
    }
  }

  // restore User
  async restoreUser(userId: string, token: string): Promise<UserOperationResponse> {
    try {
      const res = await axios.put(
        `${this.baseURL}/api/users/${userId}/restore`,
        {},
        {
          headers: this.getAuthHeaders(token)
        }
      )

      console.log(`User restored successfully: ${userId}`)
      return res.data
    }
    catch (err) {
      console.error("Error restoring user:", err);
      throw this.handleError(err);
    }
  }

  // Handle API errors consistently
  private handleError(err: any): Error {
    if(axios.isAxiosError(err)) {
      const message = err.response?.data?.message || err.message || "API request failed";
      return new Error(message);
    }
    return err instanceof Error ? err : new Error("API request failed")
  }
}


export const userService = new UserService()