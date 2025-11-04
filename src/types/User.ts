import { UserCheck, UserCog } from "lucide-react";

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  projectId: string | null;
  created_at: string;
  role: {
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
  };
}

export interface IUser {
  id: string;
  fname: string;
  lname: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_by: string | null;
  roles: UserRole[];
}

export type SortField = "name" | "email" | "role" | "status" | "created_at";
export type SortOrder = "asc" | "desc";

export interface Filters {
  search: string;
  status: "ALL" | "active" | "inactive";
  role: "ALL" | string;
  isAdmin: "ALL" | "true" | "false";
}

export const roleOptions = [
  {
    value: "USER",
    label: "User",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    icon: UserCheck,
  },
  {
    value: "ADMIN",
    label: "Admin",
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

export const getGlobalRole = (user: IUser): string => {
  return user.is_admin ? "ADMIN" : "USER";
};

export const getUserStatus = (user: IUser): "active" | "inactive" => {
  return user.deleted_at === null ? "active" : "inactive";
};
