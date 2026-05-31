import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Building2, UserPlus, Users, CheckSquare, BookOpen, FileText, UploadCloud, BarChart2, User, LayoutDashboard } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/mockData';

const roleLinks = {
  [ROLES.SYSTEM_ADMIN]: [
    { to: '/dashboard/system-admin/analytics', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/dashboard/system-admin', end: true, icon: <Building2 className="w-5 h-5" />, label: 'Colleges' },
    { to: '/dashboard/system-admin/add-admin', icon: <UserPlus className="w-5 h-5" />, label: 'Add College Admin' },
  ],
  [ROLES.COLLEGE_ADMIN]: [
    { to: '/dashboard/college-admin', end: true, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/dashboard/college-admin/departments', icon: <BookOpen className="w-5 h-5" />, label: 'Departments' },
    { to: '/dashboard/college-admin/hod-requests', icon: <CheckSquare className="w-5 h-5" />, label: 'HOD Requests' },
    { to: '/dashboard/college-admin/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ],
  [ROLES.HOD]: [
    { to: '/dashboard/hod', end: true, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/dashboard/hod/mentors', icon: <Users className="w-5 h-5" />, label: 'Mentors' },
    { to: '/dashboard/hod/approvals', icon: <CheckSquare className="w-5 h-5" />, label: 'Mentor Approvals' },
    { to: '/dashboard/hod/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ],
  [ROLES.MENTOR]: [
    { to: '/dashboard/mentor', end: true, icon: <Users className="w-5 h-5" />, label: 'Students' },
    { to: '/dashboard/mentor/submissions', icon: <FileText className="w-5 h-5" />, label: 'Submissions' },
  ],
  [ROLES.STUDENT]: [
    { to: '/dashboard/student', end: true, icon: <UploadCloud className="w-5 h-5" />, label: 'Upload Submission' },
    { to: '/dashboard/student/logs', icon: <BookOpen className="w-5 h-5" />, label: 'Daily Logs' },
    { to: '/dashboard/student/metrics', icon: <BarChart2 className="w-5 h-5" />, label: 'Metrics' },
    { to: '/dashboard/student/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ],
};

const roleTitles = {
  [ROLES.SYSTEM_ADMIN]: 'System Admin',
  [ROLES.COLLEGE_ADMIN]: 'College Admin',
  [ROLES.HOD]: 'HOD Panel',
  [ROLES.MENTOR]: 'Mentor Panel',
  [ROLES.STUDENT]: 'Student Portal',
};

export const RoleDashboardLayout = () => {
  const { user } = useAuth();
  const links = roleLinks[user?.role] || [];
  const title = roleTitles[user?.role] || 'Dashboard';
  return <DashboardLayout links={links} title={title} />;
};
