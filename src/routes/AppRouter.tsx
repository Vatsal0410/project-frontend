import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard"
import UserDashboard from "../pages/user/UserDashboard" 
import UsersManagement from "../pages/admin/users/UsersManagement";
import RolesManagement from "../pages/admin/roles/RolesManagement";
import ProjectsManagement from "../pages/admin/projects/ProjectsManagement";
import WorklogsManagement from "../pages/admin/worklogs/WorklogsManagement";
import BugsManagement from "../pages/admin/bugs/BugsManagement";
import TasksManagement from "../pages/admin/tasks/TasksManagement";
import MembersManagement from "../pages/admin/users/MembersManagement";
import Layout from "../components/layout/Layout";
import LoginPage from "../components/auth/LoginForm";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const AppRouterContent = () => {
  const {isAuthenticated, isAdmin} = useAuth()
  return (
    <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={isAdmin ? "/dashboard" : "/user-dashboard"} /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard/*"
          element={isAuthenticated && isAdmin ? (
            <Layout>
              <AdminRoutes />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )}
        />
        
        <Route
          path="/user-dashboard"
          element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />}
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  )
}

const AppRouter = () => {
  
  

  return (
    <BrowserRouter>
    <AuthProvider>
      <AppRouterContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// AdminRoutes 
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UsersManagement />} />
      <Route path="/members" element={<MembersManagement />} />
      <Route path="/projects" element={<ProjectsManagement />} />
      <Route path="/tasks" element={<TasksManagement />} />
      <Route path="/bugs" element={<BugsManagement />} />
      <Route path="/worklogs" element={<WorklogsManagement />} />
      <Route path="/roles" element={<RolesManagement />} />
      
    </Routes>
  );
}

export default AppRouter;
