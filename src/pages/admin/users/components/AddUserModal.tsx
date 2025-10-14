import React, { useState } from "react";
import { Loader, X } from "lucide-react";
import { type IUser, getPrimaryRole, roleOptions } from "../../../../types/User";
import Cookies from "js-cookie";
import axios from "axios";

interface AddUserModalProps {
  user: IUser | null;
  onClose: () => void;
  onSave: (userData: any) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [fname, setFname] = useState(user?.fname || "");
  const [lname, setLname] = useState(user?.lname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [primaryRole, setPrimaryRole] = useState(
    user ? getPrimaryRole(user) : "DEVELOPER_FRONTEND"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = Cookies.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fname.trim() || !lname.trim() || !email.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (user) {
        // Edit user
        const res = await axios.put(
          `http://localhost:3000/api/users/${user.id}`,
          {
            fname,
            lname,
            email,
            role: primaryRole,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 200) {
          onSave({
            fname,
            lname,
            email,
            primaryRole,
            id: user.id,
          });
        }
      } else {
        // Add user
        const res = await axios.post(
          "http://localhost:3000/api/users",
          {
            fname,
            lname,
            email,
            role: primaryRole,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        );

        if (res.status === 200) {
          onSave({
            fname,
            lname,
            email,
            primaryRole,
          });
        }
      }
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to save user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user ? "Edit User" : "Add New User"}
              </h2>
              <p className="text-gray-600 mt-1">
                {user ? "Update user information" : "Create a new team member"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                required
              >
                {roleOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" />
                    {user ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  user ? "Save Changes" : "Add User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;