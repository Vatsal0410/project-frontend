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
import ForgotPasswordPage from "../components/auth/ForgotPasswordPage";
import ResetPasswordPage from "../components/auth/ResetPasswordPage";

const AppRouterContent = () => {
  const {isAuthenticated, isAdmin} = useAuth()
  return (
    <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={isAdmin ? "/admin" : "/app"} /> : <Navigate to="/login" replace/>}
        />
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/admin/*"
          element={isAuthenticated && isAdmin ? (
            <Layout>
              <AdminRoutes />
            </Layout>
          ) : (
            <Navigate to="/login" replace/>
          )}
        />
        
        <Route
          path="/app/*"
          element={isAuthenticated ? <UserRoutes /> : <Navigate to="/login" replace/>}
        />
        
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

// UserRoutes
const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
    </Routes>
  )
}

export default AppRouter;
