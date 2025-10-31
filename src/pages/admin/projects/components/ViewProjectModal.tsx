// components/ViewProjectModal.tsx
import React, { useEffect } from "react";
import { Calendar, Flag, Users, X } from "lucide-react";
import MemberBadge from "./MemberBadge";
import type { IProject } from "../../../../types/Project";
import { getInitials } from "../../../../types/User";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Project Details */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(project.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(project.end_date)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Team Members</p>
                    <p className="font-medium">{project._count.members}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Issues</p>
                    <p className="font-medium">{project._count.issues}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700">{project.description}</p>
            </div>
          </div>{/* Project Leader */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Project Leader</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(project.leader.fname, project.leader.lname)}
              </div>
              <div>
                <p className="font-medium">
                  {project.leader.fname} {project.leader.lname}
                </p>
                <p className="text-sm text-gray-500">{project.leader.email}</p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Team Members ({project.members.length})
            </h3>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(member.user.fname, member.user.lname)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user.fname} {member.user.lname}
                      </p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <MemberBadge role={member.roleName as any} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Project
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewProjectModal;
