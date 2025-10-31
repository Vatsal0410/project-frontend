import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { getProjectStatus, type IProject } from "../../../types/Project";
import { getToken, navigateToLogin } from "../../../utils/utils";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import { projectService } from "../../../services/projectService";
import { toastError, toastSuccess } from "../../../utils/toasts";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Flag,
  FolderArchive,
  FolderCheck,
  FolderCode,
  FolderOpen,
  Folders,
  Grid,
  Package,
  Plus,
  Search,
  Table,
  Users,
  X,
} from "lucide-react";
import { getInitials } from "../../../types/User";
import ViewProjectModal from "./components/ViewProjectModal";
import ProjectFormModal from "./components/ProjectFormModal";

type SortField =
  | "title"
  | "leader"
  | "members"
  | "issues"
  | "start_date"
  | "end_date";
type sortOrder = "asc" | "desc";

interface Filters {
  search: string;
  status: "ALL" | "active" | "completed" | "archived";
}

const ITEMS_PER_PAGE = 10;

const ProjectsManagement: FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "ALL",
  });

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectFormModal, setShowProjectFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [viewingProject, setViewingProject] = useState<IProject | null>(null);
  const [sortField, setSortField] = useState<SortField>("start_date");
  const [sortOrder, setSortOrder] = useState<sortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState("");

  // const token = getToken();
  const token = getToken();
  const navigate = useNavigate();
  const { confirm, setLoading: setConfirmLoading } = useConfirm();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }));
      setCurrentPage(1);
    }, 300);

    return clearTimeout(timer);
  }, [searchDebounce]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  // Fetch all projects
  const fetchProjects = async () => {
    if (!token) {
      alert("Token is missing");
      navigate("/login");
      setLoading(false);
      return;
    }

    setLoading(false);
    setError(null);

    try {
      const fetchedProjects: IProject[] = await projectService.fetchAllProjects(
        token
      );
      setProjects(fetchedProjects);
      console.log(fetchedProjects);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      toastError("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: projects?.length || 0,
      active:
        projects?.filter((p) => getProjectStatus(p) === "active").length || 0,
      completed:
        projects?.filter((p) => getProjectStatus(p) === "completed").length ||
        0,
      archived:
        projects?.filter((p) => getProjectStatus(p) === "archived").length || 0,
    }),
    [projects]
  );

  // Filters and sorting
  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        `${project.leader.fname} ${project.leader.lname}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "ALL"
          ? true
          : filters.status === "active"
          ? getProjectStatus(project) === "active"
          : getProjectStatus(project) === "completed";

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "leader":
          comparison = `${a.leader.fname} ${a.leader.lname}`.localeCompare(
            `${b.leader.fname} ${b.leader.lname}`
          );
          break;
        case "members":
          comparison = a._count.members - b._count.members;
          break;
        case "issues":
          comparison = a._count.issues - b._count.issues;
          break;
        case "start_date":
          comparison =
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          break;
        case "end_date":
          comparison =
            new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : comparison * -1;
    });
    return filtered;
  }, [projects, filters, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedProjects.length / ITEMS_PER_PAGE
  );
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProjects.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedProjects, currentPage]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectFormModal(true);
  };

  const handleViewProject = useCallback((project: IProject) => {
    setViewingProject(project);
  }, []);

  const handleEditProject = useCallback((project: IProject) => {
    setEditingProject(project);
    setShowProjectFormModal(true);
  }, []);

  // Save Project
  const handleSaveProject = async (projectData: any) => {
    if (!token) {
      navigateToLogin();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Update project
      if (editingProject) {
        await projectService.updateProject(
          editingProject.id,
          projectData,
          token
        );
        toastSuccess(`${projectData.title} updated successfully`);
      }
      // Create project
      else {
        await projectService.createProject(projectData, token);
        toastSuccess(`${projectData.title} created successfully`);
      }
    } catch (err: any) {
      console.error("Failed to save project");
      toastError(err.message || "Failed to save project.");
    } finally {
      await fetchProjects();
      setLoading(false);
      setShowProjectFormModal(false);
      setEditingProject(null);
    }
  };

  // Delete Project
  const handleDeleteProject = async (project: IProject) => {
    const confirmed = await confirm({
      title: "Archive Project",
      message: `Are you sure you want to archive ${project.title}? This action can be reversed later.`,
      type: "warning",
      confirmText: "Yes, Archive",
      cancelText: "Cancel",
    });

    if (confirmed) {
      setConfirmLoading(true);
      try {
        await projectService.deleteProject(project.id, token!);
        await fetchProjects();
        toastSuccess(`${project.title} archived successfully`);
      } catch (err: any) {
        console.error("Error archiving project:", err);
        toastError(err.message || "Failed to archive project.");
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  // Restore Project
  const handleRestoreProject = async (project: IProject) => {
    const confirmed = await confirm({
      title: "Restore Project",
      message: `Are you sure you want to restore ${project.title}?`,
      type: "success",
      confirmText: "Yes, Restore",
      cancelText: "Cancel",
    });

    if (confirmed) {
      setConfirmLoading(true);
      try {
        await projectService.restoreProject(project.id, token!);
        await fetchProjects();
        toastSuccess(`${project.title} restored successfully`);
      } catch (err: any) {
        console.error("Error restoring project:", err);
        toastError(err.message || "Failed to restore project.");
      }
    }
  };

  // format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // clear filters
  const clearFilters = () => {
    setFilters({ search: "", status: "ALL" });
    setSearchDebounce("");
  };

  const hasActiveFilters = filters.search || filters.status !== "ALL";

  // Loading Spinner
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
          <h2 className="text-3xl font-bold text-gray-900">
            Project Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your projects and team assignments
          </p>
        </div>

        <button
          onClick={handleAddProject}
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={20} className="mr-2" />
          Add New Project
        </button>
      </div>

      <>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </>

      {/* stats cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <Folders className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-blue-700">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <FolderOpen className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-green-700">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-green-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        {/* Completed Projects Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <FolderCheck className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-purple-700">
                Completed Projects
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Archived Projects Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2.5 bg-white rounded-lg shadow-sm">
              <FolderArchive className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-orange-700">
                Archive Projects
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.archived}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
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
              placeholder="Search projects..."
              value={searchDebounce}
              onChange={(e) => setSearchDebounce(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={filters.status}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm min-w-[140px]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* clear filters */}
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
            {filteredAndSortedProjects.length}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{stats.total}</span>{" "}
          projects
        </div>
      </div>

      {/* Projects Table View */}
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
                      Project
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="leader" label="Leader" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="members" label="Team" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="issues" label="Issues" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <SortButton field="start_date" label="Timeline" />
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials(
                              project.leader.fname,
                              project.leader.lname
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.leader.fname} {project.leader.lname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          {project._count.members} members
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project._count.issues} issues
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>Start: {formatDate(project.start_date)}</div>
                          <div>End: {formatDate(project.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            project.deleted_at === null
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {project.deleted_at === null ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProject(project)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditProject(project)}
                            disabled={project.deleted_at !== null}
                            className={`transition-colors p-1.5 rounded ${
                              project.deleted_at !== null
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                            }`}
                            title={
                              project.deleted_at !== null
                                ? "Restore to Edit Archived Project"
                                : "Edit Project"
                            }
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={
                              project.deleted_at === null
                                ? () => handleDeleteProject(project)
                                : () => handleRestoreProject(project)
                            }
                            className={`transition-colors p-1.5 rounded ${
                              project.deleted_at === null
                                ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            }`}
                            title={
                              project.deleted_at === null
                                ? "Archive Project"
                                : "Restore Project"
                            }
                          >
                            {project.deleted_at === null ? (
                              <Archive size={16} />
                            ) : (
                              <ArchiveRestore size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty state */}
            {!loading && filteredAndSortedProjects.length === 0 && (
              <div className="text-center py-16">
                <Flag className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No projects found
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No projects match your current search criteria. Try adjusting your filters."
                    : 'Get started by creating your first project using the "Add New Project" button.'}
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

      {/* Projects Card View */}
      {viewMode === "cards" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading ? (
              <LoadingSpinner />
            ) : (
              paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                    project.deleted_at !== null
                      ? "border-gray-300 opacity-75"
                      : "border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {project.title}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          project.deleted_at === null
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {project.deleted_at === null ? "Active" : "Archived"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Leader */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Leader
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(
                            project.leader.fname,
                            project.leader.lname
                          )}
                        </div>
                        <span className="text-sm text-gray-900">
                          {project.leader.fname} {project.leader.lname}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project._count.members}
                          </div>
                          <div className="text-xs text-gray-500">Members</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project._count.issues}
                          </div>
                          <div className="text-xs text-gray-500">Issues</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Start:</span>
                        <span className="text-gray-900">
                          {formatDate(project.start_date)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">End:</span>
                        <span className="text-gray-900">
                          {formatDate(project.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleEditProject(project)}
                        disabled={project.deleted_at !== null}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          project.deleted_at !== null
                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                            : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                        }`}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={
                          project.deleted_at === null
                            ? () => handleDeleteProject(project)
                            : () => handleRestoreProject(project)
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          project.deleted_at === null
                            ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                            : "text-green-600 hover:text-green-900 hover:bg-green-50"
                        }`}
                      >
                        {project.deleted_at === null ? (
                          <Archive size={16} />
                        ) : (
                          <ArchiveRestore size={16} />
                        )}
                        {project.deleted_at === null ? "Archive" : "Restore"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Empty State for Card View */}
          {!loading && filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Flag className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No projects found
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {hasActiveFilters
                  ? "No projects match your current search criteria. Try adjusting your filters."
                  : "Get started by creating your first project."}
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
      {viewingProject && (
        <ViewProjectModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={() => {
            setEditingProject(viewingProject);
            setViewingProject(null);
            setShowProjectFormModal(true);
          }}
        />
      )}

      {showProjectFormModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowProjectFormModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
};

export default ProjectsManagement;
