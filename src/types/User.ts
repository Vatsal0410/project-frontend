import { User, UserCheck, UserCog} from "lucide-react";

export interface Role {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  projectId: string | null;
  created_at: string;
  role: Role; // This is an object, not an array
}

export interface IUser {
  id: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  roles: UserRole[];
}

export const roleOptions = [
  {
    value: "DEVELOPER_FRONTEND",
    label: "Frontend Developer",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: User,
  },
  {
    value: "DEVELOPER_BACKEND",
    label: "Backend Developer",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    icon: UserCheck,
  },
  {
    value: "TESTER",
    label: "Tester",
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: UserCog,
  },
];

export const getRoleInfo = (roleName: string) => {
  return roleOptions.find((opt) => opt.value === roleName) || roleOptions[0];
};

export const getInitials = (fname: string, lname: string) => {
  return `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase();
};

export const getPrimaryRole = (user: IUser): string => {
  if (user.roles && user.roles.length > 0) {
    const userRole = user.roles[0];
    if (userRole && userRole.role) {
      return userRole.role.name;
    }
  }
  return "DEVELOPER_FRONTEND";
};

export const getUserStatus = (user: IUser): "active" | "inactive" => {
  if (user.roles && user.roles.length > 0) {
    const userRole = user.roles[0];
    if (userRole && userRole.role) {
      return userRole.role.status === "ACTIVE" ? "active" : "inactive";
    }
  }
  return "inactive";
};