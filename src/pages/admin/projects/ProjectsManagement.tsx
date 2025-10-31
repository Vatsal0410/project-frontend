import { useEffect, useMemo, useState, type FC } from "react";
import { getProjectStatus, type IProject } from "../../../types/Project";
import { getToken } from "../../../utils/utils";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import { projectService } from "../../../services/projectService";
import { toastError } from "../../../utils/toasts";

type sortField =
  | "title"
  | "leader"
  | "members"
  | "issues"
  | "start_date"
  | "end_date";
type sortOrder = "asc" | "desc";

interface Filters {
  search: string;
  status: "ALL" | "active" | "completed" | "archived";
}

const ITEMS_PER_PAGE = 10;

const ProjectsManagement: FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "ALL",
  });

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectFormModal, setShowProjectFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [viewingProject, setViewingProject] = useState<IProject | null>(null);
  const [sortField, setSortField] = useState<sortField>("start_date");
  const [sortOrder, setSortOrder] = useState<sortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState("");

  const token = getToken();
  const navigate = useNavigate();
  const { confirm, setLoading: setConfirmLoading } = useConfirm();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchDebounce }));
      setCurrentPage(1);
    }, 300);

    return clearTimeout(timer);
  }, [searchDebounce]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  // Fetch all projects
  const fetchProjects = async () => {
    if (!token) {
      alert("Token is missing");
      navigate("/login");
      setLoading(false);
      return;
    }

    setLoading(false);
    setError(null);

    try {
      const fetchedProjects: IProject[] = await projectService.fetchAllProjects(
        token
      );
      setProjects(fetchedProjects);
      console.log(fetchedProjects);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      toastError(err.message || "API request for fetching projects failed.");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    total: projects.length;
    active: projects.filter((p) => getProjectStatus(p) === "active").length;
    completed: projects.filter((p) => getProjectStatus(p) === "completed")
      .length;
    archived: projects.filter((p) => getProjectStatus(p) === "archived").length;
  }, [projects]);

  // Filters and sorting
  const filteredandSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        `${project.leader.fname} ${project.leader.lname}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === "ALL" ? true : filters.status === "active" ? getProjectStatus(project) === "active" : getProjectStatus(project) === "completed";

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a,b) => {
      let comparison = 0

      switch(sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break;
        case "leader":
          comparison = `${a.leader.fname} ${a.leader.lname}`.localeCompare(`${b.leader.fname} ${b.leader.lname}`)
          break
        case "members":
          comparison = a._count.members - b._count.members
          break
        case "issues":
          comparison = a._count.issues - b._count.issues
          break
        case "start_date":
          comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          break
        case "end_date":
          comparison = new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : comparison * -1
    })
  }, [projects, filters, sortField, sortOrder]);

  
  return <div>Projects Management</div>;
};

export default ProjectsManagement;
