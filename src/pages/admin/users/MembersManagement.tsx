import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Folder, UserCheck, Building, Grid, Table, Filter, X } from 'lucide-react';
import axios from 'axios';

interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
}

interface ProjectLeader {
  id: string;
  fname: string;
  lname: string;
  email: string;
}

interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  roleName: string;
  joined_at: string;
  user: User;
}

interface Project {
  id: string;
  title: string;
  description: string;
  leaderId: string;
  start_date: string;
  end_date: string;
  leader: ProjectLeader;
  members: ProjectMember[];
  _count: {
    members: number;
    issues: number;
  };
}

interface ProjectMemberWithProject extends ProjectMember {
  project: {
    id: string;
    title: string;
    leader: ProjectLeader;
  };
}

const MembersManagement: React.FC = () => {
  const [members, setMembers] = useState<ProjectMemberWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<'ALL' | string>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const token = Cookies.get("token");

  // Fetch projects and their members
  const fetchProjects = async () => {
    if (!token) {
      console.log("Token is missing");
      return;
    }
    
    try {
      const res = await axios.get('http://localhost:3000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200 && res.data.projects) {
        setProjects(res.data.projects);
        
        // Transform the data to match the expected members structure
        const allMembers: ProjectMemberWithProject[] = [];
        
        res.data.projects.forEach((project: Project) => {
          project.members.forEach((member: ProjectMember) => {
            allMembers.push({
              ...member,
              project: {
                id: project.id,
                title: project.title,
                leader: project.leader
              }
            });
          });
        });
        
        setMembers(allMembers);
      }
    } catch (error) {
      console.log("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Get unique projects and roles for filters
  const availableProjects = ['ALL', ...new Set(members.map(member => member.project.title))];
  const availableRoles = ['ALL', ...new Set(members.map(member => member.roleName))];

  // Get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'DEVELOPER_FRONTEND':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'DEVELOPER_BACKEND':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'TESTER':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'UI_UX_DESIGNER':
        return 'bg-pink-100 text-pink-800 border border-pink-200';
      case 'PROJECT_MANAGER':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'LEADER':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.project.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = projectFilter === 'ALL' || member.project.title === projectFilter;
    const matchesRole = roleFilter === 'ALL' || member.roleName === roleFilter;
    
    return matchesSearch && matchesProject && matchesRole;
  });

  // handle Assign Member
  const handleAssignMember = () => {
    console.log('Assign member clicked');
  };

  // handle Edit Member
  const handleEditMemberRole = (member: ProjectMemberWithProject) => {
    console.log('Edit member role:', member);
  };

  // handle Remove Member
  const handleRemoveMember = (member: ProjectMemberWithProject) => {
    if (window.confirm(`Remove ${member.user.fname} ${member.user.lname} from ${member.project.title}?`)) {
      console.log('Remove member:', member);
    }
  };

  // handle Bulk Remove
  const handleBulkRemove = () => {
    if (selectedMembers.length === 0) return;
    if (window.confirm(`Remove ${selectedMembers.length} members from their projects?`)) {
      console.log('Bulk remove:', selectedMembers);
      setSelectedMembers([]);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all members
  const selectAllMembers = () => {
    setSelectedMembers(
      selectedMembers.length === filteredMembers.length 
        ? [] 
        : filteredMembers.map(m => m.id)
    );
  };

  // Statistics
  const totalMembers = members.length;
  const uniqueUsers = new Set(members.map(m => m.userId)).size;
  const uniqueProjects = new Set(members.map(m => m.projectId)).size;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-2">Manage project teams and member assignments across your organization</p>
        </div>
        <button
          onClick={handleAssignMember}
          className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={20} className="mr-2" />
          Assign Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <UserCheck className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Assignments</p>
              <p className="text-2xl font-bold text-blue-900">{totalMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Unique Team Members</p>
              <p className="text-2xl font-bold text-green-900">{uniqueUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Folder className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Active Projects</p>
              <p className="text-2xl font-bold text-purple-900">{uniqueProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Building className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Avg Team Size</p>
              <p className="text-2xl font-bold text-orange-900">
                {uniqueProjects > 0 ? (totalMembers / uniqueProjects).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members by name, email, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Table View"
             >
                <Table size={18} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Card View"
              >
                <Grid size={18} />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-300 text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Filters"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableProjects.map(project => (
                    <option key={project} value={project}>
                      {project === 'ALL' ? 'All Projects' : project}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-900">
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Remove from Projects
              </button>
              <button 
                onClick={() => setSelectedMembers([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredMembers.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalMembers}</span> assignments
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{uniqueUsers}</span> users across{' '}
          <span className="font-semibold text-gray-900">{uniqueProjects}</span> projects
        </div>
      </div>

      {/* Members Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={selectAllMembers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Leader
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedMembers.includes(member.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {member.user.fname} {member.user.lname}
                        </div>
                        <div className="text-sm text-gray-500">{member.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Folder size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {member.project.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {member.project.leader.fname} {member.project.leader.lname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.roleName)}`}
                      >
                        {member.roleName.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.joined_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditMemberRole(member)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit Role"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Remove from Project"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No team members found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm || projectFilter !== 'ALL' || roleFilter !== 'ALL'
                  ? 'No members match your current search criteria. Try adjusting your filters.'
                  : 'Get started by assigning team members to projects using the "Assign Member" button.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Members Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 ${
                selectedMembers.includes(member.id) ? 'ring-2 ring-blue-500 border-blue-300' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMemberSelection(member.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.user.fname} {member.user.lname}
                    </h3>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.roleName)}`}>
                  {member.roleName.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Folder size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{member.project.title}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Project Lead:</span> {member.project.leader.fname} {member.project.leader.lname}
                </div>
                
                <div className="text-sm text-gray-500">
                  Joined: {formatDate(member.joined_at)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEditMemberRole(member)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Edit Role
                </button>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for Card View */}
      {viewMode === 'cards' && filteredMembers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No team members found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {searchTerm || projectFilter !== 'ALL' || roleFilter !== 'ALL'
              ? 'No members match your current search criteria. Try adjusting your filters.'
              : 'Get started by assigning team members to projects.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MembersManagement;