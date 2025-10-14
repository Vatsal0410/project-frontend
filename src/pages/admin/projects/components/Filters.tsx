// components/Filters.tsx
import React from "react";
import { Search } from "lucide-react";
import { type ProjectStatus } from "../types";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "ALL" | ProjectStatus;
  onStatusFilterChange: (value: "ALL" | ProjectStatus) => void;
  teamSizeFilter: 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
  onTeamSizeFilterChange: (value: 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE') => void;
  showArchived: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  teamSizeFilter,
  onTeamSizeFilterChange,
  showArchived
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects by title, description, or leader..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as "ALL" | ProjectStatus)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
            <option value="cancelled">Cancelled</option>
            {showArchived && <option value="archived">Archived</option>}
          </select>

          <select
            value={teamSizeFilter}
            onChange={(e) => onTeamSizeFilterChange(e.target.value as 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE')}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="ALL">All Team Sizes</option>
            <option value="SMALL">Small (1-2)</option>
            <option value="MEDIUM">Medium (3-6)</option>
            <option value="LARGE">Large (7+)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;