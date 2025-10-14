// ProjectsManagement.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Plus, Archive, Folder } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

// Import components
import Filters from "./components/Filters";
import ProjectTableRow from "./components/ProjectTableRow";

// Import types and utilities
import { type Project, type ProjectStatus, type User, getProjectStatus } from "./types";
import StatsCards from "./components/StatsCard";
import AddProjectModal from "./components/AddProjectModal";
import ViewProjectModal from "./components/ViewProjectModal";
import AnalyticsModal from "./components/AnalyticsModal";
import MemberManagementModal from "./components/MembersManageModal";

// Mock current user
const currentUser: User = {
  id: "1",
  fname: "John",
  lname: "Doe",
  email: "john.doe@example.com",
  role: "ADMIN"
};

const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProjectStatus>("ALL");
  const [teamSizeFilter, setTeamSizeFilter] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE'>('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Modal states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [managingMembers, setManagingMembers] = useState<Project | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<Project | null>(null);

  const token = Cookies.get("token");

  // Fetch data
  const fetchProjects = async () => {
    if (!token) {
      console.log("Token is missing");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      console.log("Failed to load Projects", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) {
      console.log("Token is missing");
      return;
    }
    try {
      const res = await axios.get("http://localhost:3000/api/all-users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 200 && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.log("Failed to load Users", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // Permission check functions
  const canEditProject = (project: Project) => {
    return currentUser.role === 'ADMIN' || project.leaderId === currentUser.id;
  };

  const canDeleteProject = (project: Project) => {
    return currentUser.role === 'ADMIN';
  };

  const canManageMembers = (project: Project) => {
    return currentUser.role === 'ADMIN' || project.leaderId === currentUser.id;
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.leader?.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.leader?.lname.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : getProjectStatus(project) === statusFilter;

      const matchesTeamSize = teamSizeFilter === 'ALL' ? true : 
        teamSizeFilter === 'SMALL' ? project._count.members < 3 :
        teamSizeFilter === 'MEDIUM' ? project._count.members >= 3 && project._count.members <= 6 :
        project._count.members > 6;

      const matchesArchive = showArchived ? true : getProjectStatus(project) !== 'archived';

      return matchesSearch && matchesStatus && matchesTeamSize && matchesArchive;
    });
  }, [projects, searchTerm, statusFilter, teamSizeFilter, showArchived]);

  // Handlers
  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setActionMenu(null);
  };

  const handleEditProject = (project: Project) => {
    if (!canEditProject(project)) {
      alert("You don't have permission to edit this project");
      return;
    }
    setEditingProject(project);
    setShowAddProjectModal(true);
    setActionMenu(null);
  };

  const handleDeleteProject = (project: Project) => {
    if (!canDeleteProject(project)) {
      alert("You don't have permission to delete this project");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      setProjects(projects.filter((p) => p.id !== project.id));
    }
    setActionMenu(null);
  };

  const handleArchiveProject = (project: Project) => {
    if (!canDeleteProject(project)) {
      alert("You don't have permission to archive this project");
      return;
    }

    if (window.confirm(`Archive "${project.title}"?`)) {
      setProjects(prev => 
        prev.map(p => 
          p.id === project.id 
            ? { ...p, deleted_at: new Date().toISOString() }
            : p
        )
      );
    }
    setActionMenu(null);
  };

  const handleRestoreProject = (project: Project) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === project.id
          ? { ...p, deleted_at: null }
          : p
      )
    );
  };

  const handleManageMembers = (project: Project) => {
    if (!canManageMembers(project)) {
      alert("You don't have permission to manage members for this project");
      return;
    }
    setManagingMembers(project);
    setActionMenu(null);
  };

  const handleViewAnalytics = (project: Project) => {
    setViewingAnalytics(project);
    setActionMenu(null);
  };

  const handleAddProjectClick = () => {
    setEditingProject(null);
    setShowAddProjectModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all projects and their teams
          </p>
        </div>
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <Archive size={16} className="mr-2" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
          <button
            onClick={handleAddProjectClick}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 font-medium"
          >
            <Plus size={20} className="mr-2" />
            Add New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards projects={projects} />

      {/* Filters */}
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        teamSizeFilter={teamSizeFilter}
        onTeamSizeFilterChange={setTeamSizeFilter}
        showArchived={showArchived}
      />

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Project</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Team Lead</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Health</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Team Size</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Issues</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Timeline</th>
                <th className="p-6 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Folder className="text-gray-300 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No projects found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectTableRow
                    key={project.id}
                    project={project}
                    isActionMenuOpen={actionMenu === project.id}
                    onActionMenuToggle={() => setActionMenu(actionMenu === project.id ? null : project.id)}
                    onViewProject={handleViewProject}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                    onArchiveProject={handleArchiveProject}
                    onRestoreProject={handleRestoreProject}
                    onManageMembers={handleManageMembers}
                    onViewAnalytics={handleViewAnalytics}
                    canEdit={canEditProject(project)}
                    canDelete={canDeleteProject(project)}
                    canManage={canManageMembers(project)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddProjectModal && (
        <AddProjectModal
          project={editingProject}
          users={users}
          currentUser={currentUser}
          onClose={() => setShowAddProjectModal(false)}
          onSave={(updatedProject) => {
            // Handle save logic
            setShowAddProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {viewingProject && (
        <ViewProjectModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
        />
      )}

      {managingMembers && (
        <MemberManagementModal
          project={managingMembers}
          users={users}
          onClose={() => setManagingMembers(null)}
          onSave={(updatedProject) => {
            // Handle member management save
            setManagingMembers(null);
          }}
        />
      )}

      {viewingAnalytics && (
        <AnalyticsModal
          project={viewingAnalytics}
          onClose={() => setViewingAnalytics(null)}
        />
      )}
    </div>
  );
};

export default ProjectsManagement;