// types.ts
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Archive, 
  ListTodo, 
  Bug,
  Calendar,
  Users 
} from "lucide-react";

export type ProjectStatus = "active" | "completed" | "upcoming" | "cancelled" | "archived";
export type IssueType = "TASK" | "BUG";
export type IssueStatus = "PENDING" | "OPEN" | "IN_PROGRESS" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
export type RoleName = "DEVELOPER_FRONTEND" | "DEVELOPER_BACKEND" | "TESTER" | "LEADER";
export type UserRole = "ADMIN" | "LEADER" | "MEMBER";

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  role: UserRole;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleName: RoleName;
  joined_at: string;
  user: User;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  leaderId: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  leader: User | null;
  members: ProjectMember[];
  _count: {
    members: number;
    issues: number;
  };
  issues: {
    id: string;
    type: IssueType;
    status: IssueStatus;
  }[];
  worklog_hours?: number;
}

// Helper functions
export function getProjectStatus(project: Project): ProjectStatus {
  const now = new Date();
  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);

  if (project.deleted_at) return "archived";
  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "active";
}

export function getStatusInfo(status: ProjectStatus) {
  switch (status) {
    case "active":
      return { label: "Active", color: "bg-green-100 text-green-800", icon: PlayCircle };
    case "completed":
      return { label: "Completed", color: "bg-blue-100 text-blue-800", icon: CheckCircle };
    case "upcoming":
      return { label: "Upcoming", color: "bg-yellow-100 text-yellow-800", icon: Clock };
    case "cancelled":
      return { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle };
    case "archived":
      return { label: "Archived", color: "bg-gray-100 text-gray-800", icon: Archive };
    default:
      return { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: AlertCircle };
  }
}

export function getInitials(fname: string, lname: string) {
  return `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase();
}

export function getIssueTypeInfo(type: IssueType) {
  switch (type) {
    case "TASK":
      return { label: "Task", color: "text-blue-600", icon: ListTodo };
    case "BUG":
      return { label: "Bug", color: "text-red-600", icon: Bug };
    default:
      return { label: "Task", color: "text-gray-600", icon: ListTodo };
  }
}

export function getRoleInfo(role: RoleName) {
  switch (role) {
    case "DEVELOPER_FRONTEND":
      return { label: "Frontend Dev", color: "bg-blue-100 text-blue-800" };
    case "DEVELOPER_BACKEND":
      return { label: "Backend Dev", color: "bg-green-100 text-green-800" };
    case "TESTER":
      return { label: "Tester", color: "bg-purple-100 text-purple-800" };
    case "LEADER":
      return { label: "Leader", color: "bg-orange-100 text-orange-800" };
    default:
      return { label: "Member", color: "bg-gray-100 text-gray-800" };
  }
}

// Calculate project health
export function getProjectHealth(project: Project) {
  const totalIssues = project._count.issues;
  const resolvedIssues = project.issues.filter(issue => 
    issue.status === "RESOLVED" || issue.status === "CLOSED"
  ).length;
  
  const completionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;
  
  const now = new Date();
  const start = new Date(project.start_date);
  const end = new Date(project.end_date);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const timelineProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  const healthScore = Math.min(100, (completionRate * 0.7) + (timelineProgress * 0.3));
  
  let healthStatus: "excellent" | "good" | "warning" | "critical";
  if (healthScore >= 80) healthStatus = "excellent";
  else if (healthScore >= 60) healthStatus = "good";
  else if (healthScore >= 40) healthStatus = "warning";
  else healthStatus = "critical";
  
  return {
    completionRate,
    timelineProgress,
    healthScore,
    healthStatus,
    resolvedIssues,
    totalIssues
  };
}

// Get role distribution
export function getRoleDistribution(project: Project) {
  const distribution = {
    DEVELOPER_FRONTEND: 0,
    DEVELOPER_BACKEND: 0,
    TESTER: 0,
    LEADER: 0
  };
  
  project.members.forEach(member => {
    distribution[member.roleName]++;
  });
  
  return distribution;
}