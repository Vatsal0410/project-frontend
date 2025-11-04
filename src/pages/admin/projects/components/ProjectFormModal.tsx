import { useEffect, useState, type FC, type FormEvent } from "react";
import type { IProject, ProjectStatus } from "../../../../types/Project";
import {
  AlertCircle,
  Calendar,
  Crown,
  FileText,
  Loader,
  Search,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { getInitials, type IUser } from "../../../../types/User";
import { getToken } from "../../../../utils/utils";
import { userService } from "../../../../services/userService";

interface ProjectFormModalProps {
  project?: IProject | null;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

interface FormData {
  title: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  leaderId: string;
  members: string[];
  is_completed?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  leaderId?: string;
  members?: string;
}

const ProjectFormModal: FC<ProjectFormModalProps> = ({
  project,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "PLANNING",
    start_date: "",
    end_date: "",
    leaderId: "",
    members: [],
    is_completed: false,
  });

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // set form data when project is edited
  useEffect(() => {
    if (project) {
      const formateDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const memberIds = project.members.map((member) => member.userId);

      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        start_date: formateDateForInput(project.start_date),
        end_date: formateDateForInput(project.end_date),
        leaderId: project.leaderId,
        members: memberIds,
        is_completed: project.is_completed,
      });
    }
  }, [project]);

  // filter users
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(
        allUsers.filter((user) => !formData.members.includes(user.id))
      );
    } else {
      const filtered = allUsers.filter(
        (user) =>
          (!formData.members.includes(user.id) &&
            user.fname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          user.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers, formData.members]);

  // fetch all users
  const fetchAllUsers = async () => {
    const token = getToken();
    setUserLoading(true);
    try {
      const users = await userService.fetchAllUsers(token!);
      setAllUsers(
        users.filter(
          (user) => user.deleted_at === null && user.is_admin === false
        )
      );
    } catch (err: any) {
      console.error(
        "Error fetching filtered users for project form:",
        err.message
      );
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  };

  // validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Project title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 50) {
      errors.title = "Title must be less than 50 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 3) {
      errors.description = "Description must be at least 3 characters";
    } else if (formData.description.trim().length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      errors.end_date = "End date is required";
    } else if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        errors.end_date = "End date must be after start date";
      }
    }

    if (!formData.leaderId) {
      errors.leaderId = "Project leader is required";
    } else if (!formData.members.includes(formData.leaderId)) {
      errors.leaderId = "Leader must be selected from team members";
    }

    if (formData.members.length === 0) {
      errors.members = "At least one team member is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddMember = (userId: string) => {
    if (!formData.members.includes(userId)) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, userId],
      }));
      setSearchTerm("");
    }
  };

  const handleRemoveMember = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member !== userId),
      leaderId: prev.leaderId === userId ? "" : prev.leaderId,
    }));
  };

  const handleSetLeader = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      leaderId: userId,
    }));
  };

  const getSelectedMembers = () => {
    return allUsers.filter((user) => formData.members.includes(user.id));
  };

  const getLeader = () => {
    return allUsers.find((user) => user.id === formData.leaderId);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        leaderId: formData.leaderId,
        members: formData.members,
        ...(project && { is_completed: formData.is_completed }),
      };

      onSave(projectData);
    } catch (err: any) {
      console.error("Error saving project:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {project ? "Edit Project" : "Create New Project"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {project ? "Update project details" : "Set up your new project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl"
        >
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Project Details
              </h3>

              {/* Project Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Project Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={loading}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400 ${
                      formErrors.title
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter project title"
                  />
                </div>
                {formErrors.title && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Project Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400"
                  placeholder="Describe the project goals and objectives..."
                />
              </div>

              {/* Status Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Project Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      min={!project ? new Date().toISOString().split("T")[0] : ""}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm ${
                        formErrors.start_date
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                    />
                  </div>
                  {formErrors.start_date && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm ${
                        formErrors.end_date
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                    />
                  </div>
                  {formErrors.end_date && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Team Members
              </h3>

              {/* Selected Members */}
              {getSelectedMembers().length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Selected Team Members ({getSelectedMembers().length})
                  </label>
                  <div className="space-y-2">
                    {getSelectedMembers().map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials(user.fname, user.lname)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.fname} {user.lname}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetLeader(user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              formData.leaderId === user.id
                                ? "bg-yellow-100 text-yellow-600"
                                : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                            }`}
                            title={
                              formData.leaderId === user.id
                                ? "Project Leader"
                                : "Set as Leader"
                            }
                          >
                            <Crown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(user.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from team"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Members */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Add Team Members
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading || userLoading}
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400"
                  />
                </div>

                {/* User List */}
                {filteredUsers.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleAddMember(user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(user.fname, user.lname)}
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user.fname} {user.lname}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <UserPlus size={16} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}

                {userLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-500 ml-2">
                      Loading users...
                    </span>
                  </div>
                )}

                {formErrors.members && (
                  <p className="text-xs text-red-600 mt-1">
                    {formErrors.members}
                  </p>
                )}
                {formErrors.leaderId && (
                  <p className="text-xs text-red-600 mt-1">
                    {formErrors.leaderId}
                  </p>
                )}
              </div>
            </div>

            {/* Selected Leader Display */}
            {formData.leaderId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Project Leader:
                  </span>
                  <span className="text-sm text-yellow-700">
                    {getLeader()
                      ? `${getLeader()?.fname} ${getLeader()?.lname}`
                      : "Selecting..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Sticky Footer */}
          <div className="sticky bottom-0 rounded-2xl bg-white border-t border-gray-100 p-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center shadow-sm hover:shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {project ? "Saving..." : "Creating..."}
                </>
              ) : project ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;