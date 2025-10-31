import React from "react";

interface AdminBadgeProps {
  isAdmin: boolean;
  size?: "sm" | "md";
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ isAdmin, size = "md" }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  const bgColor = isAdmin ? "bg-blue-100" : "bg-gray-100";
  const textColor = isAdmin ? "text-blue-800" : "text-gray-600";
  const label = isAdmin ? "Yes" : "No";

  return (
    <span
      className={`inline-flex rounded-full font-medium text-center ${sizeClasses[size]} ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
};

export default AdminBadge;
