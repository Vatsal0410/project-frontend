// components/AnalyticsModal.tsx
import React from "react";
import { X } from "lucide-react";
import { type Project, type RoleName, getProjectHealth, getRoleDistribution, getRoleInfo } from "../types";

interface AnalyticsModalProps {
  project: Project;
  onClose: () => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ project, onClose }) => {
  const health = getProjectHealth(project);
  const roleDistribution = getRoleDistribution(project);

  const getHealthColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50";
      case "good": return "text-blue-600 bg-blue-50";
      case "warning": return "text-yellow-600 bg-yellow-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Project Analytics</h2>
              <p className="text-gray-600 mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Project Health */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Health</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {Math.round(health.healthScore)}%
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(health.healthStatus)}`}>
                  {health.healthStatus.charAt(0).toUpperCase() + health.healthStatus.slice(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    health.healthStatus === 'excellent' ? 'bg-green-500' :
                    health.healthStatus === 'good' ? 'bg-blue-500' :
                    health.healthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health.healthScore}%` }}
                />
              </div>
            </div>

            {/* Issue Statistics */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Issue Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Issues</span>
                  <span className="font-semibold">{health.totalIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resolved Issues</span>
                  <span className="font-semibold text-green-600">{health.resolvedIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{Math.round(health.completionRate)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Timeline Progress</span>
                  <span className="font-semibold">{Math.round(health.timelineProgress)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Team Size</h3>
              <div className="text-3xl font-bold text-gray-900">{project._count.members}</div>
              <p className="text-gray-600 text-sm">Total members</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Worklog Hours</h3>
              <div className="text-3xl font-bold text-gray-900">{project.worklog_hours || 0}</div>
              <p className="text-gray-600 text-sm">Hours logged</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Role Distribution</h3>
              <div className="space-y-2">
                {Object.entries(roleDistribution).map(([role, count]) => {
                  const roleInfo = getRoleInfo(role as RoleName);
                  return (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{roleInfo.label}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;