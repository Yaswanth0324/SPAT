import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { ROLES } from '../utils/mockData';

// Pages
import HomePage from '../pages/Home/HomePage';
import LoginPage, { AdminLoginPage } from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Dashboards
import { RoleDashboardLayout } from '../pages/Dashboards/DashboardLayoutWrapper';
import { SystemAdminColleges, SystemAdminAddAdmin } from '../pages/Dashboards/SystemAdmin/SystemAdminPages';
import { SystemAdminAnalyticsDashboard } from '../pages/Dashboards/SystemAdmin/SystemAdminDashboard';
import { CollegeAdminDepartments, CollegeAdminHODRequests } from '../pages/Dashboards/CollegeAdmin/CollegeAdminPages';
import { CollegeAdminDashboard } from '../pages/Dashboards/CollegeAdmin/CollegeAdminDashboard';
import { CollegeAdminProfile } from '../pages/Dashboards/CollegeAdmin/CollegeAdminProfile';
import { HODMentorApprovals, HODMentors } from '../pages/Dashboards/HOD/HODPages';
import { HODDashboard } from '../pages/Dashboards/HOD/HODDashboard';
import { HODProfile } from '../pages/Dashboards/HOD/HODProfile';
import { MentorStudents, MentorSubmissions } from '../pages/Dashboards/Mentor/MentorPages';
import { StudentSubmission, StudentLogs, StudentMetrics, StudentProfile } from '../pages/Dashboards/Student/StudentPages';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/admin-login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* System Admin */}
      <Route path="/dashboard/system-admin" element={
        <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}><RoleDashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<SystemAdminColleges />} />
        <Route path="add-admin" element={<SystemAdminAddAdmin />} />
        <Route path="analytics" element={<SystemAdminAnalyticsDashboard />} />
      </Route>

      {/* College Admin */}
      <Route path="/dashboard/college-admin" element={
        <ProtectedRoute allowedRoles={[ROLES.COLLEGE_ADMIN]}><RoleDashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<CollegeAdminDashboard />} />
        <Route path="departments" element={<CollegeAdminDepartments />} />
        <Route path="hod-requests" element={<CollegeAdminHODRequests />} />
        <Route path="profile" element={<CollegeAdminProfile />} />
      </Route>

      {/* HOD */}
      <Route path="/dashboard/hod" element={
        <ProtectedRoute allowedRoles={[ROLES.HOD]}><RoleDashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<HODDashboard />} />
        <Route path="mentors" element={<HODMentors />} />
        <Route path="approvals" element={<HODMentorApprovals />} />
        <Route path="profile" element={<HODProfile />} />
      </Route>

      {/* Mentor */}
      <Route path="/dashboard/mentor" element={
        <ProtectedRoute allowedRoles={[ROLES.MENTOR]}><RoleDashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<MentorStudents />} />
        <Route path="submissions" element={<MentorSubmissions />} />
      </Route>

      {/* Student */}
      <Route path="/dashboard/student" element={
        <ProtectedRoute allowedRoles={[ROLES.STUDENT]}><RoleDashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<StudentSubmission />} />
        <Route path="logs" element={<StudentLogs />} />
        <Route path="metrics" element={<StudentMetrics />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
