// components/ViewProjectModal.tsx
import React from "react";
import { X, Calendar, Users } from "lucide-react";
import { type Project, getProjectStatus, getStatusInfo, getInitials } from "../types";

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
}

const ViewProjectModal: React.FC<ViewProjectModalProps> = ({ project, onClose }) => {
  const statusInfo = getStatusInfo(getProjectStatus(project));
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 bg-gray-50 rounded-xl p-4">
                {project.description || "No description provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <StatusIcon size={14} className="mr-1" />
                  {statusInfo.label}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Team Lead</h3>
                {project.leader ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(project.leader.fname, project.leader.lname)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {project.leader.fname} {project.leader.lname}
                      </p>
                      <p className="text-gray-500 text-xs">{project.leader.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No leader assigned</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {project._count.members}
                </p>
                <p className="text-gray-600 text-sm text-center">Team Members</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {project._count.issues}
                </p>
                <p className="text-gray-600 text-sm text-center">Total Issues</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900 text-center">
                  {project.issues.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length}
                </p>
                <p className="text-gray-600 text-sm text-center">Resolved</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Start Date</h3>
                <p className="text-gray-900 font-medium">
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">End Date</h3>
                <p className="text-gray-900 font-medium">
                  {new Date(project.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProjectModal;