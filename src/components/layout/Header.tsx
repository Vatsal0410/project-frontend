import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, Search, User, ChevronDown, UserIcon, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  pageTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, pageTitle = "Dashboard" }) => {
    
    const fname = Cookies.get("fname")
    const lname = Cookies.get("lname")
    const email = Cookies.get("email")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handleClickOutSide = (event: MouseEvent) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("click", handleClickOutSide)

        return () => document.removeEventListener("click", handleClickOutSide)
    })

    const handleLogout = () => {
        Cookies.remove("token")
        Cookies.remove("isAdmin")
        Cookies.remove("fname")
        Cookies.remove("lname")
        Cookies.remove("email")
        navigate("/login")
    }

    const dropDownItems = [
        {
      icon: <UserIcon size={16} />,
      label: 'Profile',
      onClick: () => console.log('Navigate to profile'),
    },
    {
      icon: <Settings size={16} />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      icon: <LogOut size={16} />,
      label: 'Logout',
      onClick: handleLogout,
      isDestructive: true,
    },
    ]



  return (
    <header className="bg-white border-b border-gray-200 relative z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Page Title & Breadcrumbs */}
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            <nav className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
              <span>Home</span>
              <span>/</span>
              <span className="text-gray-700">{pageTitle}</span>
            </nav>
          </div>
        </div>

        {/* Right Section - Search & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks, users, projects..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 text-sm placeholder-gray-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors group">
            <Bell size={20} className="text-gray-600 group-hover:text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              3
            </span>
          </button>

          {/* User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{fname}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 group-hover:text-gray-600 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{fname} {lname}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                
                {/* Dropdown Items */}
                <div className="py-2">
                  {dropDownItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors
                        ${
                          item.isDestructive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={item.isDestructive ? 'text-red-500' : 'text-gray-400'}>
                        {item.icon}
                      </div>
                      <span className={item.isDestructive ? 'text-red-600' : 'text-gray-700'}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;