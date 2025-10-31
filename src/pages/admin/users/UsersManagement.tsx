import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  User,
  UserCheck,
  Search,
  Eye,
  Edit,
  Plus,
  Users,
  UserX,
  Grid,
  Table,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import ViewUserModal from "./components/ViewUserModal";
import RoleBadge from "./components/RoleBadge.tsx";
import {
  getInitials,
  getGlobalRole,
  getUserStatus,
  type IUser,
} from "../../../types/User";
import AdminBadge from "./components/AdminBadge.tsx";
import { userService } from "../../../services/userService.ts";
import { toastError, toastSuccess } from "../../../utils/toasts.ts";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import UserFormModal from "./components/UserFormModal.tsx";
import { getToken } from "../../../utils/utils.ts";

type SortField = "name" | "email" | "role" | "status" | "created_at";
type SortOrder = "asc" | "desc";

interface Filters {
  search: string;
  status: "ALL" | "active" | "inactive";
  role: "ALL" | string;
  isAdmin: "ALL" | "true" | "false";
}

const ITEMS_PER_PAGE = 10;

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "ALL",
    role: "ALL",
    isAdmin: "ALL",
  });
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [viewingUser, setViewingUser] = useState<IUser | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState("");
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);

  const token = getToken()
  const navigate = useNavigate();
  const { confirm, setLoading: setConfirmLoading } = useConfirm();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }));
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDebounce]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Fetch users
  const fetchUsers = async () => {
    if (!token) {
      alert("Token is missing");
      navigate("/login")
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedUsers: IUser[] = await userService.fetchAllUsers(token);
      setUsers(fetchedUsers);
      console.log(fetchedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toastError(err.message || "API request for fetching users failed.");
    } finally {
      setLoading(false);
    }
  };

  // Stats - Memoized for performance
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.deleted_at === null).length,
      inactive: users.filter((u) => getUserStatus(u) === "inactive").length,
      deleted: users.filter((u) => u.deleted_at !== null).length,
      admin: users.filter((u) => u.is_admin).length,
    }),
    [users]
  );

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      const matchedDeleted = showDeletedUsers ? true : u.deleted_at === null;

      const matchesSearch =
        u.fname.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.lname.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "ALL" ? true : getUserStatus(u) === filters.status;

      const matchesRole =
        filters.role === "ALL" ? true : getGlobalRole(u) === filters.role;

      const matchedAdmin =
        filters.isAdmin === "ALL"
          ? true
          : filters.isAdmin === "true"
          ? u.is_admin
          : !u.is_admin;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchedAdmin &&
        matchedDeleted
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = `${a.fname} ${a.lname}`.localeCompare(
            `${b.fname} ${b.lname}`
          );
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = getGlobalRole(a).localeCompare(getGlobalRole(b));
          break;
        case "status":
          comparison = getUserStatus(a).localeCompare(getUserStatus(b));
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, filters, sortField, sortOrder, showDeletedUsers]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedUsers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedUsers, currentPage]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleViewUser = useCallback((user: IUser) => {
    setViewingUser(user);
  }, []);

  const handleEditUser = useCallback((user: IUser) => {
    setEditingUser(user);
    setShowUserFormModal(true);
  }, []);

  // Delete User
  const handleDeleteUser = async (user: IUser) => {
    const confirmed = await confirm({
      title: "Archive User",
      message: `Are you sure you want to archive ${user.fname} ${user.lname}? This action can be reversed later.`,
      type: "warning",
      confirmText: "Yes, Archive",
      cancelText: "Cancel"
    });

    if (confirmed) {
      setConfirmLoading(true);
      try {
        await userService.deleteUser(user.id, token!);
        await fetchUsers();
        toastSuccess(`${user.fname} ${user.lname} archived successfully`);
      } catch (err: any) {
        console.error("Error archiving user:", err);
        toastError(err.message || "API request for archiving user failed.");
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  // Restore User
  const handleRestoreUser = async (user: IUser) => {
    const confirmed = await confirm({
      title: "Restore User",
      message: `Are you sure you want to restore ${user.fname} ${user.lname}?`,
      type: "success",
      confirmText: "Yes, Restore",
      cancelText: "Cancel"
    });

    if (confirmed) {
      setConfirmLoading(true);
      try {
        await userService.restoreUser(user.id, token!);
        await fetchUsers();
        toastSuccess(`${user.fname} ${user.lname} restored successfully`);
      } catch (err: any) {
        console.error("Error restoring user:", err);
        toastError(err.message || "API request for restoring user failed.");
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    setShowUserFormModal(true);
  };

  // Save User
  const handleSaveUser = async (userData: any) => {
    if (!token) {
      navigate("/login")
      return
    };
    setError(null);
    setLoading(true);

    try {
      // Update existing User
      if (editingUser) {
        const res = await userService.updateUser(
          editingUser.id,
          userData,
          token
        );
        if (res.success) {
          toastSuccess(
            `${userData.fname} ${userData.lname} updated successfully`
          );
          console.log("User updated:", userData);
          await fetchUsers();
        } else {
          toastError("Failed to update user.");
        }
      }

      // Create new User
      else {
        const newUserData = {
          fname: userData.fname,
          lname: userData.lname,
          email: userData.email,
          is_admin: userData.is_admin || false,
        };

        const res = await userService.createUser(newUserData, token);
        if (res.user) {
          toastSuccess(
            `${userData.fname} ${userData.lname} created successfully`
          );
          console.log("User created:", userData);
          await fetchUsers();
        } else {
          console.error("Error creating user:", res);
          toastError("Failed to create user.");
        }
      }
    } catch (err: any) {
      console.error("Error saving user:", err);
      toastError(err.message || "API request for saving user failed.");
    } finally {
      setLoading(false);
    }
    setShowUserFormModal(false);
    setEditingUser(null);
  };

  const handleExportCSV = () => {
    console.log("Exporting users to CSV");
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Joined"],
      ...filteredAndSortedUsers.map((u) => [
        `${u.fname} ${u.lname}`,
        u.email,
        getGlobalRole(u),
        getUserStatus(u),
        new Date(u.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "ALL", role: "ALL", isAdmin: "ALL" });
    setSearchDebounce("");
  };

  const hasActiveFilters =
    filters.search || filters.status !== "ALL" || filters.role !== "ALL";

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <ArrowUpDown
        size={14}
        className={sortField === field ? "text-blue-600" : "text-gray-400"}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowDeletedUsers((prev) => !prev)}
            className={`inline-flex items-center px-3 py-2.5 rounded-xl border font-medium transition-all shadow-sm hover:shadow-md ${
              showDeletedUsers
                ? "bg-white border-red-300 text-red-800 hover:bg-red-50"
                : "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {showDeletedUsers ? (
              <Archive size={18} className="mr-2" />
            ) : (
              <Eye size={18} className="mr-2" />
            )}
            {showDeletedUsers ? "Hide Archived Users" : "Show Archived Users"}
          </button>
          <button
            onClick={handleAddUserClick}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={20} className="mr-2" />
            Add New User
          </button>
        </div>
      </div>
      {/* Error Message */}

      <>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-blue-700">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <UserCheck className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-green-700">Active Users</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <User className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-purple-700">Admin Users</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.admin}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <UserX className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-orange-700">
                Inactive Users
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.deleted}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchDebounce}
              onChange={(e) => setSearchDebounce(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex overflow-x-auto items-center gap-2 sm:justify-around">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as "ALL" | "active" | "inactive",
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[120px]"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.isAdmin}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isAdmin: e.target.value as "ALL" | "true" | "false",
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[120px]"
            >
              <option value="ALL">All Users</option>
              <option value="true">Admin Only</option> {/* Changed */}
              <option value="false">Regular Users</option> {/* Changed */}
            </select>

            {/* Clear Filters (only when active) */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear filters"
              >
                <X size={18} />
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded transition-all ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Table View"
              >
                <Table size={16} />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded transition-all ${
                  viewMode === "cards"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Card View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredAndSortedUsers.length}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{stats.total}</span>{" "}
          users
        </div>
      </div>
      {/* Users Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sr. No
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="name" label="User" />
                    </th>
                    {/* <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="role" label="Role" />
                    </th> */}
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="role" label="Admin" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="status" label="Status" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="created_at" label="Joined" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user, index) => {
                    const userStatus = getUserStatus(user);

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors bg-blue-50"
                      >
                        <td className="px-6 py-4 text-sm font-semibold">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 justify-start">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${
                                user.is_admin
                                  ? "from-amber-500 to-yellow-600"
                                  : "from-blue-500 to-blue-600"
                              } rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                            >
                              {getInitials(user.fname, user.lname)}
                            </div>
                            <div>
                              <div className="text-sm text-left font-semibold text-gray-900">
                                {user.fname} {user.lname}
                              </div>
                              <div className="text-xs text-left text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_admin ? (
                            "-"
                          ) : (
                            <RoleBadge role={globalRole} />
                          )}
                        </td> */}
                        <td className="px-6py-4 whitespace-nowrap">
                          <AdminBadge isAdmin={user.is_admin} size="md" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* <StatusBadge status={userStatus} /> */}
                          <span
                            className={`inline-flex rounded-full font-medium text-center px-2 py-0.5 text-xs ${
                              userStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {user.deleted_at === null ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              disabled={
                                user.is_admin || user.deleted_at !== null
                              }
                              className={`transition-colors p-1.5 rounded ${
                                user.is_admin || user.deleted_at !== null
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                              }`}
                              title={
                                user.is_admin
                                  ? "Cannot Edit Admin"
                                  : user.deleted_at !== null
                                  ? "Restore to Edit Archived User"
                                  : "Edit User"
                              }
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={
                                user.deleted_at === null
                                  ? () => handleDeleteUser(user)
                                  : () => handleRestoreUser(user)
                              }
                              disabled={user.is_admin === true}
                              className={`transition-colors p-1.5 rounded ${
                                user.is_admin
                                  ? "text-gray-400 cursor-not-allowed"
                                  : user.deleted_at === null
                                  ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                              title={
                                user.is_admin
                                  ? "Cannot Archive Admin"
                                  : user.deleted_at !== null
                                  ? "Restore Archived User"
                                  : "Archive User"
                              }
                            >
                              {user.deleted_at === null ? (
                                <Archive size={16} />
                              ) : (
                                <ArchiveRestore size={16} />
                              )}
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
            {!loading && filteredAndSortedUsers.length === 0 && (
              <div className="text-center py-16">
                <User className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No users match your current search criteria. Try adjusting your filters."
                    : 'Get started by adding users using the "Add New User" button.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Users Card View */}
      {viewMode === "cards" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              <LoadingSpinner />
            ) : (
              paginatedUsers.map((user) => {
                const globalRole = getGlobalRole(user);
                const userStatus = getUserStatus(user);

                return (
                  <div
                    key={user.id}
                    className={`${
                      user.is_admin
                        ? "border-2 border-amber-200"
                        : "border-gray-200"
                    } bg-white rounded-xl border  shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
                  >
                    {/* Header with gray background */}
                    <div
                      className={`${
                        user.is_admin
                          ? "bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-amber-100"
                          : "border-gray-200"
                      } bg-gray-50 px-6 py-4 border-b `}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${
                            user.is_admin
                              ? "from-amber-500 to-yellow-600"
                              : "from-blue-500 to-blue-600"
                          } rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {getInitials(user.fname, user.lname)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.fname} {user.lname}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 space-y-3">
                      {/* Admin */}
                      {user.is_admin && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Admin
                          </span>
                          <AdminBadge isAdmin={user.is_admin} size="md" />
                        </div>
                      )}

                      {/* Role */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Role
                        </span>
                        {user.is_admin ? (
                          <span className="text-sm text-gray-500">-</span>
                        ) : (
                          <RoleBadge role={globalRole} />
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </span>
                        <span
                          className={`inline-flex rounded-full font-medium text-center px-2 py-0.5 text-xs ${
                            userStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {user.deleted_at === null ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Joined
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-white">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={user.is_admin || user.deleted_at !== null}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            user.is_admin || user.deleted_at !== null
                              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                          }`}
                          title={
                            user.is_admin
                              ? "Cannot Edit Admin"
                              : user.deleted_at !== null
                              ? "Restore to Edit Archived User"
                              : "Edit User"
                          }
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={
                            user.deleted_at === null
                              ? () => handleDeleteUser(user)
                              : () => handleRestoreUser(user)
                          }
                          disabled={user.is_admin === true}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            user.is_admin
                              ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                              : user.deleted_at === null
                              ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
                          title={
                            user.is_admin
                              ? "Cannot Archive Admin"
                              : user.deleted_at !== null
                              ? "Restore Archived User"
                              : "Archive User"
                          }
                        >
                          {user.deleted_at === null ? (
                            <>
                              <Archive size={16} />
                              Archive
                            </>
                          ) : (
                            <>
                              <ArchiveRestore size={16} />
                              Restore
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Empty State for Card View */}
          {!loading && filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <User className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No users match your current search criteria. Try adjusting your filters."
                  : "Get started by adding users to your organization."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination for Card View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Modals */}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            setEditingUser(viewingUser);
            setViewingUser(null);
            setShowUserFormModal(true);
          }}
        />
      )}
      {showUserFormModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setShowUserFormModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UsersManagement;