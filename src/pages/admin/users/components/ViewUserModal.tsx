import React from "react";
import { X, Calendar, Shield, Mail } from "lucide-react";
import {
  getInitials,
  type IUser,
  getPrimaryRole,
  getRoleInfo,
  getUserStatus,
} from "../../../../types/User";

interface ViewUserModalProps {
  user: IUser;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, onClose }) => {
  const primaryRole = getPrimaryRole(user);
  const roleInfo = getRoleInfo(primaryRole);
  const userStatus = getUserStatus(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <p className="text-gray-600 mt-1">View user information and role details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
              {getInitials(user.fname, user.lname)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {user.fname} {user.lname}
            </h3>
            <p className="text-gray-600 mt-2 flex items-center justify-center">
              <Mail size={16} className="mr-2" />
              {user.email}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className={`px-4 py-2.5 rounded-xl text-sm font-medium ${roleInfo.bgColor} ${roleInfo.textColor} border border-gray-200`}>
                  {roleInfo.label}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className={`px-4 py-2.5 rounded-xl text-sm font-medium ${
                  userStatus === 'active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      userStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <div className="flex items-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar size={16} className="text-gray-400 mr-3" />
                <span className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {user.is_admin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Administrator Access</label>
                <div className="flex items-center px-4 py-2.5 bg-purple-50 rounded-xl border border-purple-200">
                  <Shield size={16} className="text-purple-600 mr-3" />
                  <span className="text-purple-800 font-medium">Full administrative privileges</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-8 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;