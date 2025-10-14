// components/ProjectTableRow.tsx
import React from "react";
import { MoreVertical, Eye, Edit, Trash2, Users, BarChart3, Archive, RefreshCw, Calendar } from "lucide-react";
import { type Project, getProjectStatus, getStatusInfo, getInitials,  getProjectHealth, getIssueTypeInfo } from "../types";

interface ProjectTableRowProps {
  project: Project;
  isActionMenuOpen: boolean;
  onActionMenuToggle: () => void;
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onRestoreProject: (project: Project) => void;
  onManageMembers: (project: Project) => void;
  onViewAnalytics: (project: Project) => void;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  isActionMenuOpen,
  onActionMenuToggle,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onRestoreProject,
  onManageMembers,
  onViewAnalytics,
  canEdit,
  canDelete,
  canManage
}) => {
  const statusInfo = getStatusInfo(getProjectStatus(project));
  const StatusIcon = statusInfo.icon;
  const health = getProjectHealth(project);
  const projectStatus = getProjectStatus(project);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="p-6">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {project.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {project.description || "No description"}
          </p>
        </div>
      </td>

      <td className="p-6">
        {project.leader ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(project.leader.fname, project.leader.lname)}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {project.leader.fname} {project.leader.lname}
              </p>
              <p className="text-gray-500 text-xs">
                {project.leader.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No leader assigned</span>
        )}
      </td>

      <td className="p-6">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
        >
          <StatusIcon size={14} className="mr-1" />
          {statusInfo.label}
        </span>
      </td>

      <td className="p-6">
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full ${
                health.healthStatus === 'excellent' ? 'bg-green-500' :
                health.healthStatus === 'good' ? 'bg-blue-500' :
                health.healthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${health.healthScore}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(health.healthScore)}%
          </span>
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center text-gray-700">
          <Users size={16} className="mr-2 text-gray-400" />
          <span className="font-medium">{project._count.members}</span>
          <span className="text-gray-500 text-sm ml-1">members</span>
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">
            {project._count.issues}
          </span>
          <div className="flex space-x-1">
            {project.issues.slice(0, 3).map((issue, index) => {
              const issueTypeInfo = getIssueTypeInfo(issue.type);
              const IssueIcon = issueTypeInfo.icon;
              return (
                <IssueIcon
                  key={index}
                  size={14}
                  className={issueTypeInfo.color}
                />
              );
            })}
            {project._count.issues > 3 && (
              <span className="text-xs text-gray-500">
                +{project._count.issues - 3}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar size={16} className="mr-2" />
          {new Date(project.start_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </td>

      <td className="p-6">
        <div className="relative">
          <button
            onClick={onActionMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={20} className="text-gray-400" />
          </button>

          {isActionMenuOpen && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[200px]">
              <button
                onClick={() => onViewProject(project)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <Eye size={16} className="mr-2" />
                View Details
              </button>
              
              <button
                onClick={() => onViewAnalytics(project)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
              >
                <BarChart3 size={16} className="mr-2" />
                View Analytics
              </button>

              {canManage && (
                <button
                  onClick={() => onManageMembers(project)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Users size={16} className="mr-2" />
                  Manage Team
                </button>
              )}

              {canEdit && (
                <button
                  onClick={() => onEditProject(project)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Project
                </button>
              )}

              {projectStatus === 'archived' ? (
                <button
                  onClick={() => onRestoreProject(project)}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Restore Project
                </button>
              ) : canDelete ? (
                <button
                  onClick={() => onArchiveProject(project)}
                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center transition-colors"
                >
                  <Archive size={16} className="mr-2" />
                  Archive Project
                </button>
              ) : null}

              {canDelete && (
                <button
                  onClick={() => onDeleteProject(project)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Project
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProjectTableRow;