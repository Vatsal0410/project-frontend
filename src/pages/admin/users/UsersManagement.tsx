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
  Filter,
  Grid,
  Table,
  X,
  Building,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import AddUserModal from "./components/AddUserModal";
import ViewUserModal from "./components/ViewUserModal";
import {
  getInitials,
  getPrimaryRole,
  getRoleInfo,
  getUserStatus,
  roleOptions,
  type IUser,
} from "../../../types/User";

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "inactive">("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [viewingUser, setViewingUser] = useState<IUser | null>(null);

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

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => getUserStatus(u) === "active").length;
  const inactiveUsers = users.filter((u) => getUserStatus(u) === "inactive").length;
  const adminUsers = users.filter((u) => u.is_admin).length;

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

  // Bulk actions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(u => u.id)
    );
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Delete ${selectedUsers.length} users?`)) {
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    }
  };

  const handleBulkStatusToggle = () => {
    if (selectedUsers.length === 0) return;
    setUsers(prev =>
      prev.map(user => {
        if (selectedUsers.includes(user.id)) {
          const updatedRoles = user.roles.map((roleData) => ({
            ...roleData,
            role: {
              ...roleData.role,
              status: roleData.role.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            },
          }));
          return { ...user, roles: updatedRoles };
        }
        return user;
      })
    );
    setSelectedUsers([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-2">Manage your team members and their permissions across your organization</p>
        </div>
        <button
          onClick={handleAddUserClick}
          className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={20} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <User className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Admin Users</p>
              <p className="text-2xl font-bold text-purple-900">{adminUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <UserX className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Inactive Users</p>
              <p className="text-2xl font-bold text-orange-900">{inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Table View"
              >
                <Table size={18} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Card View"
              >
                <Grid size={18} />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-300 text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Filters"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "ALL" | "active" | "inactive")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-900">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkStatusToggle}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Toggle Status
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Users
              </button>
              <button 
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalUsers}</span> users
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{activeUsers}</span> active •{' '}
          <span className="font-semibold text-gray-900">{inactiveUsers}</span> inactive
        </div>
      </div>

      {/* Users Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={selectAllUsers}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const primaryRole = getPrimaryRole(user);
                    const roleInfo = getRoleInfo(primaryRole);
                    const userStatus = getUserStatus(user);

                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(user.fname, user.lname)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.fname} {user.lname}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                            {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 rounded hover:bg-yellow-50"
                              title="Edit User"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                              title={userStatus === "active" ? "Deactivate" : "Activate"}
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <User className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL'
                    ? 'No users match your current search criteria. Try adjusting your filters.'
                    : 'Get started by adding users using the "Add New User" button.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            filteredUsers.map((user) => {
              const primaryRole = getPrimaryRole(user);
              const roleInfo = getRoleInfo(primaryRole);
              const userStatus = getUserStatus(user);

              return (
                <div 
                  key={user.id} 
                  className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 ${
                    selectedUsers.includes(user.id) ? 'ring-2 ring-blue-500 border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getInitials(user.fname, user.lname)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.fname} {user.lname}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          userStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            userStatus === "active"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <Calendar size={14} className="inline mr-1" />
                      Joined: {formatDate(user.created_at)}
                    </div>

                    {user.is_admin && (
                      <div className="text-sm text-purple-600 font-medium">
                        Administrator
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <UserCheck size={14} />
                      {userStatus === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Empty State for Card View */}
      {viewMode === 'cards' && !loading && filteredUsers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <User className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL'
              ? 'No users match your current search criteria. Try adjusting your filters.'
              : 'Get started by adding users to your organization.'}
          </p>
        </div>
      )}

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