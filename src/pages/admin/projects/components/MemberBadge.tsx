import React from "react";
import { PROJECT_ROLES, type ProjectRole } from "../../../../types/Project";

interface MemberBadgeProps {
  role: ProjectRole;
  size?: "sm" | "md";
}

const MemberBadge: React.FC<MemberBadgeProps> = ({ role, size = "md" }) => {
  const roleConfig = {
    DEVELOPER_FRONTEND: { bg: "bg-blue-100", text: "text-blue-800" },
    DEVELOPER_BACKEND: { bg: "bg-green-100", text: "text-green-800" },
    TESTER: { bg: "bg-purple-100", text: "text-purple-800" },
    LEADER: { bg: "bg-orange-100", text: "text-orange-800" },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  const config = roleConfig[role] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span
      className={`inline-flex rounded-full font-medium ${sizeClasses[size]} ${config.bg} ${config.text}`}
    >
      {PROJECT_ROLES[role]}
    </span>
  );
};

export default MemberBadge;