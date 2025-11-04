export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleName: string;
  joined_at: string;
  user: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
}

export interface IProject {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  is_completed: boolean;
  is_archived: boolean;
  leaderId: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  leader: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
  members: IProjectMember[];
  _count: {
    members: number;
    issues: number;
  };
  issues: any[];
}

export const PROJECT_ROLES = {
  DEVELOPER_FRONTEND: "Frontend Developer",
  DEVELOPER_BACKEND: "Backend Developer",
  TESTER: "Tester",
  LEADER: "Leader",
};

export type ProjectRole = keyof typeof PROJECT_ROLES;

export type ProjectStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export function getProjectStatus(project: IProject): ProjectStatus {
  if (project.deleted_at !== null) return "ARCHIVED";
  if (project.is_completed && project.deleted_at === null) return "COMPLETED";

  return "ACTIVE";
}

export const memberRoleOptions = [
  {
    value: "DEVELOPER_FRONTEND",
    label: "Frontend Developer",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    value: "DEVELOPER_BACKEND",
    label: "Backend Developer",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    value: "TESTER",
    label: "Tester",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function getMemberRole(member: IProjectMember) {
  return PROJECT_ROLES[member.roleName as ProjectRole];
}

export const getMemberRoleInfo = (roleName: string) => {
  return memberRoleOptions.find((opt) => opt.value === roleName) || memberRoleOptions[0];
}

export const getStatusConfig = (status: ProjectStatus) => {
    switch (status) {
      case "PLANNING":
        return {
          borderColor: "border-l-amber-400",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          badgeBg: "bg-amber-100",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600"
        };
      case "ACTIVE":
        return {
          borderColor: "border-l-emerald-500",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          badgeBg: "bg-emerald-100",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600"
        };
      case "COMPLETED":
        return {
          borderColor: "border-l-violet-500",
          bgColor: "bg-violet-50",
          textColor: "text-violet-700",
          badgeBg: "bg-violet-100",
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600"
        };
      case "ARCHIVED":
        return {
          borderColor: "border-l-slate-400",
          bgColor: "bg-slate-50",
          textColor: "text-slate-600",
          badgeBg: "bg-slate-100",
          iconBg: "bg-slate-50",
          iconColor: "text-slate-600"
        };
      default:
        return {
          borderColor: "border-l-gray-400",
          bgColor: "bg-gray-50",
          textColor: "text-gray-600",
          badgeBg: "bg-gray-100",
          iconBg: "bg-gray-50",
          iconColor: "text-gray-600"
        };
    }
  };