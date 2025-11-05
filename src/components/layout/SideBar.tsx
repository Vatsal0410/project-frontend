import {
  Bug,
  CheckSquare,
  Clock,
  Folder,
  LayoutDashboard,
  Settings,
  Shield,
  Contact2,
  Users,
} from "lucide-react";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserData } from "../../utils/utils";

interface MenuItem {
  name: string;
  path: string;
  icon: ReactNode;
  badge?: number;
}

interface MenuItemsProps {
  title: string;
  items: MenuItem[];
}

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideBar: FC<SideBarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const fname = Cookies.get("fname");
  const lname = Cookies.get("lname");
  const email = Cookies.get("email");
  const [menuItems, setMenuItems] = useState<MenuItemsProps[]>([]);

  // Admin Menu Items
  const adminMenuItems: { title: string; items: MenuItem[] }[] = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          path: "/admin",
          icon: <LayoutDashboard size={20} />,
        },
      ],
    },
    {
      title: "Team Management",
      items: [
        { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
        {
          name: "Members",
          path: "/admin/members",
          icon: <Contact2 size={20} />,
        },
      ],
    },
    {
      title: "Project Workflow",
      items: [
        {
          name: "Projects",
          path: "/admin/projects",
          icon: <Folder size={20} />,
        },
        {
          name: "Tasks",
          path: "/admin/tasks",
          icon: <CheckSquare size={20} />,
        },
        { name: "Bugs", path: "/admin/bugs", icon: <Bug size={20} /> },
        {
          name: "Worklogs",
          path: "/admin/worklogs",
          icon: <Clock size={20} />,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        { name: "Roles", path: "/admin/roles", icon: <Shield size={20} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
      ],
    },
  ];

  // Leader Menu Items
  const leaderMenuItems: { title: string; items: MenuItem[] }[] = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          path: "/leader/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
      ],
    },
    {
      title: "Team Management",
      items: [
        {
          name: "Manage Tasks",
          path: "/leader/tasks",
          icon: <CheckSquare size={20} />,
        },
        {
          name: "Team Members",
          path: "/leader/members",
          icon: <Users size={20} />,
        },
        {
          name: "Team Worklogs",
          path: "/leader/worklogs",
          icon: <Clock size={20} />,
        },
      ],
    },
    {
      title: "Project Oversight",
      items: [
        {
          name: "Project Reports",
          path: "/leader/reports",
          icon: <Folder size={20} />,
        },
        {
          name: "Bug Management",
          path: "/leader/bugs",
          icon: <Bug size={20} />,
        },
      ],
    },
  ];

  // User Menu Items
  const userMenuItems: { title: string; items: MenuItem[] }[] = [
    {
      title: "Dashboard",
      items: [
        {
          name: "Dashboard",
          path: "/user/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
      ],
    },
    {
      title: "My Work",
      items: [
        {
          name: "My Projects",
          path: "/user/projects",
          icon: <Folder size={20} />,
        },
        {
          name: "My Tasks",
          path: "/user/tasks",
          icon: <CheckSquare size={20} />,
        },
        { name: "Work Log", path: "/user/worklogs", icon: <Clock size={20} /> },
        { name: "Bug Reports", path: "/user/bugs", icon: <Bug size={20} /> },
      ],
    },
  ];

  useEffect(() => {
    const user = getUserData()
    if(user.isAdmin) {
      setMenuItems(adminMenuItems)
    } else if (user.isLeader) {
      setMenuItems(leaderMenuItems)
    } else {
      setMenuItems(userMenuItems)
    }
  }, [])

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 backdrop-brightness-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-70 bg-white shadow-xl lg:shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col h-screen border-r border-gray-100
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">
                Project Manager
              </span>
              <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${
                        isActivePath(item.path)
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <div
                      className={`
                      transition-colors
                      ${
                        isActivePath(item.path)
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>

                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">
                {fname && lname
                  ? fname.charAt(0).toUpperCase() +
                    lname.charAt(0).toUpperCase()
                  : "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {fname} {lname}
              </p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
