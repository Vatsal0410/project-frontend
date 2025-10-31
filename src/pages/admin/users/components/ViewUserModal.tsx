import React, { useEffect } from "react";
import {
  X,
  Calendar,
  Shield,
  Mail,
  User,
  Star,
  Clock,
  Edit,
  Hash,
  AlertCircle,
  UserPlus,
  UserCog,
  Trash2,
} from "lucide-react";
import {
  getInitials,
  type IUser,
  getGlobalRole,
  getUserStatus,
} from "../../../../types/User";
import RoleBadge from "./RoleBadge.tsx";

interface ViewUserModalProps {
  user: IUser;
  onEdit: () => void;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  const globalRole = getGlobalRole(user);
  const userStatus = getUserStatus(user);
  const isDeleted = !!user.deleted_at;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const createdDate = formatDateTime(user.created_at);
  const updatedDate = formatDateTime(user.updated_at || user.created_at);
  const deletedDate = user.deleted_at ? formatDateTime(user.deleted_at) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  User Profile
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  View complete user information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              type="button"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${
                isDeleted
                  ? "from-gray-400 to-gray-500"
                  : "from-blue-500 to-blue-600"
              } rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg ring-4 ring-white`}
            >
              {getInitials(user.fname, user.lname)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {user.fname} {user.lname}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <Hash className="w-3 h-3 flex-shrink-0" />
                <span className="font-mono">{user.id}</span>
              </div>
            </div>
          </div>

          {/* Deleted Warning */}
          {isDeleted && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg">
              <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900">
                  Archived User
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  This user was archived on {deletedDate?.date} at{" "}
                  {deletedDate?.time}
                  {user.deleted_by && ` by ${user.deleted_by}`}
                </p>
              </div>
            </div>
          )}

          {/* Admin Warning */}
          {user.is_admin && !isDeleted && (
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  Administrator Account
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  This user has full system access and cannot be edited through
                  this interface
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Role & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  Global Role
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <RoleBadge role={globalRole} size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span
                    className={`inline-flex rounded-full font-medium text-center px-2 py-1 text-xs ${
                      userStatus === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user.deleted_at === null ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Created */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  Member Since
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {createdDate.date}
                  </div>
                  <div className="text-xs text-gray-500">
                    {createdDate.weekday} • {createdDate.time}
                  </div>
                </div>
              </div>

              {/* Updated */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Last Updated
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {updatedDate.date}
                  </div>
                  <div className="text-xs text-gray-500">
                    {updatedDate.time}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Audit Trail
              </label>
              <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                {/* Created By */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Created by</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.created_by || "System"}
                  </span>
                </div>

                {/* Updated By */}
                {user.updated_by && (
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Updated by</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.updated_by}
                    </span>
                  </div>
                )}

                {/* Deleted By */}
                {user.deleted_by && (
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-600">Deleted by</span>
                    </div>
                    <span className="text-sm font-medium text-red-700">
                      {user.deleted_by}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions Badge */}
            {user.is_admin && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <Star className="w-3 h-3" />
                  Permissions
                </label>
                <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
                  <div className="p-1.5 bg-purple-500 rounded-md">
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <span className="text-sm font-semibold text-purple-900">
                    Full Administrator Access
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 pt-2 sticky bottom-0 bg-white border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
              type="button"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              disabled={user.is_admin || isDeleted}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 ${
                user.is_admin || isDeleted
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
              }`}
              type="button"
            >
              <Edit className="w-4 h-4" />
              {isDeleted
                ? "Deleted User"
                : user.is_admin
                ? "Cannot Edit"
                : "Edit User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
