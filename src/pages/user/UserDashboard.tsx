import { toastError, toastSuccess } from "../../utils/toasts";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { getToken, getUserData } from "../../utils/utils";
import { useEffect, useState } from "react";
import type { IUser } from "../../types/User";
import { userService } from "../../services/userService";
function UserDashboard() {
  const navigate = useNavigate();

  const userData = getUserData();
  const token = getToken();
  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    getUser();
  }, [token, user]);
  const getUser = async () => {
    try {
      if (!token) return;
      const users = await userService.fetchAllUsers(token);
      const findUser = users.find((u) => u.email === userData.email);
      setUser(findUser);
    } catch (error) {
      console.error(error);
      toastError("Something went wrong");
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toastSuccess("Logout successful");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toastError("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        {userData.isLeader === "true" ? "Leader" : "User"} Dashboard
      </h1>
      <h2>
        Welcome {userData.fname} {userData.lname}
      </h2>

      <p>{user?.email}</p>
      <p>{user?.id}</p>

      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold mt-5 py-2 px-4 rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;
