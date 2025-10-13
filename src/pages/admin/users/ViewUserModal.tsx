import React from "react";
import { X } from "lucide-react";
import { getInitials, type IUser, getPrimaryRole, getRoleInfo, getUserStatus } from "../../../types/User";

interface ViewUserModalProps {
  user: IUser;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, onClose }) => {
  const primaryRole = getPrimaryRole(user);
  const roleInfo = getRoleInfo(primaryRole);
  const userStatus = getUserStatus(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full border border-white/40 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200/20 rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-200/20 rounded-full"></div>
        
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">User Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-xl transition-all duration-200 hover:scale-105">
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4 shadow-lg ring-4 ring-white/50">
              {getInitials(user.fname, user.lname)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {user.fname} {user.lname}
            </h3>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>

          <div className="space-y-4 bg-white/70 rounded-2xl p-6 backdrop-blur-sm border border-white/50 shadow-sm">
            <div className="flex justify-between items-center py-3 border-b border-gray-200/60">
              <span className="text-gray-600 font-medium">Primary Role</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${roleInfo.bgColor} ${roleInfo.textColor} shadow-sm`}>
                {roleInfo.label}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200/60">
              <span className="text-gray-600 font-medium">Status</span>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  userStatus === "active" 
                    ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200/50" 
                    : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50"
                } shadow-sm`}
              >
                {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">Member Since</span>
              <span className="text-gray-900 font-semibold bg-gray-100/50 px-3 py-1 rounded-lg">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Display actual role from API */}
            {user.roles && user.roles.length > 0 && (
              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-gray-600 font-medium block mb-3">Role Details</span>
                <div className="text-sm bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Role Name:</span>
                    <span className="font-semibold text-gray-800">{user.roles[0].role.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role Status:</span>
                    <span className="font-semibold text-gray-800">{user.roles[0].role.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold shadow-sm hover:shadow-md border border-gray-300/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;