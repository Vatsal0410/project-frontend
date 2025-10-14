// components/StatsCards.tsx
import React from "react";
import { Folder, PlayCircle, CheckCircle, Archive } from "lucide-react";
import { type Project, getProjectStatus } from "../types";


interface StatsCardsProps {
  projects: Project[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ projects }) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => getProjectStatus(p) === "active").length;
  const completedProjects = projects.filter(p => getProjectStatus(p) === "completed").length;
  const archivedProjects = projects.filter(p => getProjectStatus(p) === "archived").length;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      description: "All projects",
      icon: Folder,
      color: "blue"
    },
    {
      label: "Active Projects",
      value: activeProjects,
      description: "In progress",
      icon: PlayCircle,
      color: "green"
    },
    {
      label: "Completed Projects",
      value: completedProjects,
      description: "Finished",
      icon: CheckCircle,
      color: "blue"
    },
    {
      label: "Archived Projects",
      value: archivedProjects,
      description: "Soft deleted",
      icon: Archive,
      color: "gray"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: "bg-blue-50", text: "text-blue-600" },
      green: { bg: "bg-green-50", text: "text-green-600" },
      gray: { bg: "bg-gray-50", text: "text-gray-600" }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        const Icon = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 ${colorClasses.bg} rounded-xl`}>
                <Icon size={24} className={colorClasses.text} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;