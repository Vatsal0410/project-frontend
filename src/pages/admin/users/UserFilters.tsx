import type { FC } from "react";
import { roleOptions, type Filters } from "../../../types/User";
import { Grid, Search, Table, X } from "lucide-react";

interface UserFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  searchDebounce: string;
  onSearchChange: (searchDebounce: string) => void;
  viewMode: "table" | "cards";
  onViewModeChange: (viewMode: "table" | "cards") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const UserFilters: FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  searchDebounce,
  onSearchChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchDebounce}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as any })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={filters.role}
            onChange={(e) =>
              onFiltersChange({ ...filters, role: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
          >
            <option value="ALL">All Roles</option>
            {roleOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded ${
                viewMode === "table"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("cards")}
              className={`p-2 rounded ${
                viewMode === "cards"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
