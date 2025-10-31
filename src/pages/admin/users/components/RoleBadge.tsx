import React from "react";
import { getRoleInfo } from "../../../../types/User";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md";
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = "md" }) => {
  const roleInfo = getRoleInfo(role);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex rounded-full font-medium text-center ${sizeClasses[size]} ${roleInfo.bgColor} ${roleInfo.textColor}`}
    >
      {roleInfo.label}
    </span>
  );
};

export default RoleBadge;