
// import React, { useState } from 'react';

// import Header from './Header';
// import SideBar from './SideBar';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <SideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Header */}
//         <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
//         {/* Page Content */}
//         <main className="flex-1 overflow-auto p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SideBar from './SideBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/users') return 'Users Management';
    if (path === '/dashboard/members') return 'Members Management';
    if (path === '/projects') return 'Projects Management';
    if (path === '/dashboard/tasks') return 'Tasks Management';
    if (path === '/dashboard/bugs') return 'Bugs Management';
    if (path === '/dashboard/worklogs') return 'Worklogs Management';
    if (path === '/dashboard/roles') return 'Roles Management';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          pageTitle={getPageTitle()}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;