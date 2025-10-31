// components/AddProjectModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { type Project,type User } from "../types";
import axios from "axios";
import { getToken } from "../../../../utils/utils";

interface AddProjectModalProps {
  project: Project | null;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  project,
  users,
  currentUser,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [startDate, setStartDate] = useState(project?.start_date.slice(0, 10) || "");
  const [endDate, setEndDate] = useState(project?.end_date.slice(0, 10) || "");
  const [leaderId, setLeaderId] = useState(project?.leaderId || "");
  const [loading, setLoading] = useState(false)

  const token = getToken()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !startDate || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true)

    try {
      const res = await axios.post("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          start_date: startDate + "T00:00:00.000Z",
          end_date: endDate + "T00:00:00.000Z",
          leaderId: leaderId || null,
        }),
      })

      if(res.status === 200) {
        console.log("Project added successfully")
        console.log(res);
        
        setLoading(false)
      }
    }
    catch (error) {
      console.log(`Failed to add project: ${error}`)
    }

    const projectData = {
      title,
      description,
      start_date: startDate + "T00:00:00.000Z",
      end_date: endDate + "T00:00:00.000Z",
      leaderId: leaderId || null,
    };

    onSave(projectData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {project ? "Edit Project" : "Add New Project"}
              </h2>
              <p className="text-gray-600 mt-1">
                {project ? "Update project information" : "Create a new project"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter project description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Leader
              </label>
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a leader</option>
                {users.filter(user => user.role === 'ADMIN' || user.role === 'LEADER').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fname} {user.lname} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/25"
              >
                {project ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;