import React from "react";
import { X } from "lucide-react";
import {
  getInitials,
  type IUser,
  getPrimaryRole,
  getRoleInfo,
  getUserStatus,
} from "../../../types/User";

interface ViewUserModalProps {
  user: IUser;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, onClose }) => {
  const primaryRole = getPrimaryRole(user);
  const roleInfo = getRoleInfo(primaryRole);
  const userStatus = getUserStatus(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              User Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mx-auto mb-3">
              {getInitials(user.fname, user.lname)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.fname} {user.lname}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>

          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Member Since</span>
              <span className="text-gray-900 font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Display actual role from API */}
            {user.roles && user.roles.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-gray-600 block mb-2">Role Details</span>
                <div className="text-sm bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Role Name:</span>
                    <span className="font-medium">{roleInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
