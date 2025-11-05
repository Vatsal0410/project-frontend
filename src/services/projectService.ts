import axios from "axios";
import { type IProject } from "../types/Project";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getAuthHeaders = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const projectService = {
  // fetch all projects
  async fetchAllProjects(token: string): Promise<IProject[]> {
    try {
      const res = await axios.get(`${API_BASE}/api/projects`, {
        headers: getAuthHeaders(token),
      });
      return res.data.projects;
    } catch (err: any) {
      console.error("Failed to fetch projects");
      throw err;
    }
  },

  //   create project
  async createProject(projectData: any, token: string) {
    try {
      const res = await axios.post(`${API_BASE}/projects`, projectData, {
        headers: getAuthHeaders(token),
      });
      return res.data;
    } catch (err: any) {
      console.error("Failed to create project");
      throw err;
    }
  },

  //   update project
  async updateProject(projectId: string, projectData: any, token: string) {
    try {
      const res = await axios.put(
        `${API_BASE}/projects/${projectId}`,
        projectData,
        {
          headers: getAuthHeaders(token),
        }
      );
      return res.data;
    } catch (err: any) {
      console.error("Failed to update project");
      throw err;
    }
  },

  //   delete project
  async deleteProject(projectId: string, token: string) {
    try {
      const res = await axios.delete(`${API_BASE}/projects/${projectId}`, {
        headers: getAuthHeaders(token),
      });
      return res.data;
    } catch (err: any) {
      console.error("Failed to delete project");
      throw err;
    }
  },

  async updateProjectStatus(projectId: string, status: string, token: string) {
  try {
    const res = await axios.patch(`${API_BASE}/projects/${projectId}/status`, 
      { status },
      { headers: getAuthHeaders(token) }
    );
    return res.data;
  } catch (err: any) {
    console.error("Failed to update project status");
    throw err;
  }
},

  //   Add member to project
  async addMemberToProject(projectId: string, memberData: any, token: string) {
    try {
      const res = await axios.post(
        `${API_BASE}/projects/${projectId}/members`,
        memberData,
        {
          headers: getAuthHeaders(token),
        }
      );

      return res.data;
    } catch (err: any) {
      console.error("Failed to add member to project");
      throw err;
    }
  },
};
