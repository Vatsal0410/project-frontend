// components/MemberManagementModal.tsx
import React, { useState } from "react";
import { X, Users, Trash2, UserPlus } from "lucide-react";
import {
  type Project,
  type User,
  type ProjectMember,
  type RoleName,
  getRoleDistribution,
  getRoleInfo,
  getInitials,
} from "../types";

interface MemberManagementModalProps {
  project: Project;
  users: User[];
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  project,
  users,
  onClose,
  onSave,
}) => {
  const [members, setMembers] = useState<ProjectMember[]>(project.members);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<RoleName>("DEVELOPER_FRONTEND");

  const availableUsers = users.filter(
    (user) =>
      !members.find((member) => member.userId === user.id) &&
      user.id !== project.leaderId
  );

  const handleAddMember = () => {
    if (!selectedUserId) return;

    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;

    const newMember: ProjectMember = {
      id: Date.now().toString(),
      projectId: project.id,
      userId: selectedUserId,
      roleName: selectedRole,
      joined_at: new Date().toISOString(),
      user,
    };

    setMembers((prev) => [...prev, newMember]);
    setSelectedUserId("");
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleUpdateRole = (memberId: string, newRole: RoleName) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, roleName: newRole } : m))
    );
  };

  const handleSave = () => {
    const updatedProject = {
      ...project,
      members,
      _count: { ...project._count, members: members.length },
      updated_at: new Date().toISOString(),
    };
    onSave(updatedProject);
  };

  const roleDistribution = getRoleDistribution({ ...project, members });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Team</h2>
              <p className="text-gray-600 mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Role Distribution */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">Team Composition</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(roleDistribution).map(([role, count]) => {
                const roleInfo = getRoleInfo(role as RoleName);
                return (
                  <div
                    key={role}
                    className="text-center p-3 bg-white rounded-lg"
                  >
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} mb-2`}
                    >
                      {roleInfo.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">
              Team Members ({members.length})
            </h3>
            {members.map((member) => {
              const roleInfo = getRoleInfo(member.roleName);
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(member.user.fname, member.user.lname)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.fname} {member.user.lname}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={member.roleName}
                      onChange={(e) =>
                        handleUpdateRole(member.id, e.target.value as RoleName)
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DEVELOPER_FRONTEND">Frontend Dev</option>
                      <option value="DEVELOPER_BACKEND">Backend Dev</option>
                      <option value="TESTER">Tester</option>
                      <option value="LEADER">Leader</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {members.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No team members added yet</p>
              </div>
            )}
          </div>

          {/* Add Member Section */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Add Team Member</h3>
            <div className="flex gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fname} {user.lname} ({user.email})
                  </option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RoleName)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DEVELOPER_FRONTEND">Frontend</option>
                <option value="DEVELOPER_BACKEND">Backend</option>
                <option value="TESTER">Tester</option>
                <option value="LEADER">Leader</option>
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementModal;
