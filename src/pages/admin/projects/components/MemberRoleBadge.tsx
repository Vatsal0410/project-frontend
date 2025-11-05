import type { FC } from "react";
import { getMemberRole, getMemberRoleInfo, type IProjectMember } from "../../../../types/Project";

interface MemberRoleBadgeProps {
    member: IProjectMember;
    size?: "sm" | "md";
}

const MemberRoleBadge: FC<MemberRoleBadgeProps> = ({ member, size = "md" }) => {

    const memberRole = getMemberRoleInfo(member.roleName);
    
    const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex rounded-full font-medium text-center ${sizeClasses[size]} ${memberRole.bgColor} ${memberRole.textColor}`}
    >
      {memberRole.label}
    </span>
  );
}

export default MemberRoleBadge