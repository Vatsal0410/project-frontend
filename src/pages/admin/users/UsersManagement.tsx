import React, { useState, useMemo, useEffect } from "react";
import {
  User,
  UserCheck,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Users,
  UserX,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import AddUserModal from "./AddUserModal";

import {
  getInitials,
  getPrimaryRole,
  getRoleInfo,
  getUserStatus,
  roleOptions,
  type IUser,
} from "../../../types/User";
import ViewUserModal from "./ViewUserModal";

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "active" | "inactive"
  >("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | string>("ALL");
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("token");
  


  useEffect(() => {
  if (token) {
      console.log("Token available, fetching users...");
      fetchUsers();
    }
}, [token]);

  const fetchUsers = async () => {
    const token = Cookies.get("token");
    if (!token) {
      console.log("No token available");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 && res.data.users) {
        // Transform API data to match our interface
        const transformedUsers: IUser[] = res.data.users.map((user: any) => ({
          id: user.id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          password: user.password,
          is_admin: user.is_admin,
          created_at: user.created_at,
          updated_at: user.updated_at,
          deleted_at: user.deleted_at,
          created_by: user.created_by,
          updated_by: user.updated_by,
          deleted_by: user.deleted_by,
          roles: user.roles || [],
        }));

        setUsers(transformedUsers);
      }
    } catch (err: any) {
      console.log(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [viewingUser, setViewingUser] = useState<IUser | null>(null);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => getUserStatus(u) === "active").length;
  const inactiveUsers = users.filter(
    (u) => getUserStatus(u) === "inactive"
  ).length;

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : getUserStatus(u) === statusFilter;

      const matchesRole =
        roleFilter === "ALL" ? true : getPrimaryRole(u) === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Handlers
  const handleViewUser = (user: IUser) => {
    setViewingUser(user);
    setActionMenu(null);
  };

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setShowAddUserModal(true);
    setActionMenu(null);
  };

  const handleDeleteUser = (user: IUser) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.fname} ${user.lname}?`
      )
    ) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
    setActionMenu(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedRoles = u.roles.map((roleData) => ({
            ...roleData,
            role: {
              ...roleData.role,
              status: roleData.role.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            },
          }));
          return { ...u, roles: updatedRoles };
        }
        return u;
      })
    );
    setActionMenu(null);
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    setShowAddUserModal(true);
  };

  const handleSaveUser = (userData: any) => {
    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                fname: userData.fname,
                lname: userData.lname,
                email: userData.email,
                roles: userData.roles || u.roles,
              }
            : u
        )
      );
    } else {
      // Add new user
      const newUser: IUser = {
        id: Date.now().toString(),
        fname: userData.fname,
        lname: userData.lname,
        email: userData.email,
        password: "",
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        created_by: "current-user-id",
        updated_by: null,
        deleted_by: null,
        roles: [
          {
            id: Date.now().toString(),
            userId: Date.now().toString(),
            roleId: Date.now().toString(),
            projectId: null,
            created_at: new Date().toISOString(),
            role: {
              id: Date.now().toString(),
              name: userData.primaryRole,
              description: userData.primaryRole.toLowerCase(),
              status: "ACTIVE",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: "current-user-id",
              updated_by: null,
              deleted_by: null,
            },
          },
        ],
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setShowAddUserModal(false);
    setEditingUser(null);
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={handleAddUserClick}
          className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalUsers}
              </p>
              <p className="text-gray-500 text-sm mt-1">All team members</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {activeUsers}
              </p>
              <p className="text-green-600 text-sm mt-1">Currently active</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Inactive Users
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {inactiveUsers}
              </p>
              <p className="text-gray-500 text-sm mt-1">Not active</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <UserX size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "active" | "inactive")
              }
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "ALL" | string)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="ALL">All Roles</option>
              {roleOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-6 text-left text-sm font-semibold text-gray-900">
                    User
                  </th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                  <th className="p-6 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <User className="text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-500">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const primaryRole = getPrimaryRole(user);
                    const roleInfo = getRoleInfo(primaryRole);
                    const userStatus = getUserStatus(user);

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {getInitials(user.fname, user.lname)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {user.fname} {user.lname}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        <td className="p-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              userStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                userStatus === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {userStatus.charAt(0).toUpperCase() +
                              userStatus.slice(1)}
                          </span>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar size={16} className="mr-2" />
                            {new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenu(
                                  actionMenu === user.id ? null : user.id
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical
                                size={20}
                                className="text-gray-400"
                              />
                            </button>

                            {actionMenu === user.id && (
                              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[160px]">
                                <button
                                  onClick={() => handleViewUser(user)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <Eye size={16} className="mr-2" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <Edit size={16} className="mr-2" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                  <UserCheck size={16} className="mr-2" />
                                  {userStatus === "active"
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          user={editingUser}
          onClose={() => {
            setShowAddUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UsersManagement;
