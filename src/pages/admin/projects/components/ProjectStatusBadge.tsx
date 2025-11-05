import { type FC } from "react";
import { type ProjectStatus } from "../../../../types/Project";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const ProjectStatusBadge: FC<ProjectStatusBadgeProps> = ({ status, size = "md" }) => {
  const statusConfig: Record<ProjectStatus, { bg: string; text: string; label: string}> = {
    PLANNING: {
      bg: "bg-yellow-100", 
      text: "text-yellow-800",
      label: "PLANNING"
    },
    ACTIVE: { 
      bg: "bg-green-100", 
      text: "text-green-800",
      label: "ACTIVE"
    },
    COMPLETED: { 
      bg: "bg-blue-100", 
      text: "text-blue-800",
      label: "COMPLETED"
    },
    ARCHIVED: { 
      bg: "bg-orange-100", 
      text: "text-orange-800",
      label: "ARCHIVED"
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  const config = statusConfig[status] || { 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    label: "Unknown"
  };

  return (
    <span
      className={`inline-flex rounded-full font-medium ${sizeClasses[size]} ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default ProjectStatusBadge;