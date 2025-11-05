import { useCallback, useState } from "react";
import type { IUser } from "../types/User";
import { toastError } from "../utils/toasts";
import { userService } from "../services/userService";
import { getToken } from "../utils/utils";

export const useUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const token = getToken()

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedUsers: IUser[] = await userService.fetchAllUsers(token);
      setUsers(fetchedUsers);
      console.log(users);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toastError("API request for fetching users failed");
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {users, loading, fetchUsers}
};
