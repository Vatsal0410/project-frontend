// components/ViewProjectModal.tsx
import React, { useEffect } from "react";
import { Calendar, Crown, FileText, Flag, Users, X } from "lucide-react";
import type { IProject } from "../../../../types/Project";
import { getInitials } from "../../../../types/User";
import MemberRoleBadge from "./MemberRoleBadge";
import ProjectStatusBadge from "./ProjectStatusBadge";

interface ViewProjectModalProps {
  project: IProject;
  onClose: () => void;
  onEdit: () => void;
}

const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
  project,
  onClose,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Same as ProjectFormModal */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Details
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                View project information and team members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Project Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Flag className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Project Status
                </p>
                <p className="text-xs text-gray-500">Current project status</p>
              </div>
            </div>
            <ProjectStatusBadge status={project.status} size="md" />
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Project Details
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Project Title
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                {project.title}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Description
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 min-h-[80px]">
                {project.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                    {formatDate(project.start_date)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                    {formatDate(project.end_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Leader */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Project Leader
            </h3>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(project.leader.fname, project.leader.lname)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {project.leader.fname} {project.leader.lname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {project.leader.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-yellow-600">
                <Crown size={16} />
                <span className="text-sm font-medium">Leader</span>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Team Members ({project.members.length})
            </h3>

            <div className="space-y-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(member.user.fname, member.user.lname)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.user.fname} {member.user.lname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <MemberRoleBadge member={member} />
                </div>
              ))}
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={18} />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Team Members
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {project._count.members}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flag className="text-gray-400" size={18} />
              <div>
                <p className="text-xs font-medium text-gray-700">Issues</p>
                <p className="text-sm font-semibold text-gray-900">
                  {project._count.issues}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={
              project.status === "COMPLETED" || project.status === "ARCHIVED"
            }
            className={`flex-1 px-4 py-2.5 transition-colors font-medium text-sm rounded-lg ${
              project.status === "COMPLETED" || project.status === "ARCHIVED"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {project.status === "COMPLETED" || project.status === "ARCHIVED"
              ? "Cannot Edit Project"
              : "Edit Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProjectModal;
