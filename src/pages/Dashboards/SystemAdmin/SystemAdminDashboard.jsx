import { useState, useCallback } from 'react';
import {
  Building2, Users, TrendingUp, TrendingDown, Award, BookOpen,
  GraduationCap, FileText, Star, Clock, RefreshCw, ChevronRight,
  X, CheckCircle, XCircle, AlertCircle, BarChart2, Activity,
  Zap, Globe, Shield, Target, Medal, Crown, UserCheck, UserX,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const KPI_DATA = {
  totalColleges: { value: 48, trend: '+12%', up: true },
  activeColleges: { value: 41, trend: '+8%', up: true },
  inactiveColleges: { value: 7, trend: '-3%', up: false },
  totalUsers: { value: 12480, trend: '+21%', up: true },
  totalDepartments: { value: 312, trend: '+15%', up: true },
  totalHODs: { value: 384, trend: '+9%', up: true },
  totalMentors: { value: 1248, trend: '+18%', up: true },
  totalStudents: { value: 9840, trend: '+24%', up: true },
  totalSubmissions: { value: 34720, trend: '+31%', up: true },
  totalCredits: { value: 2184500, trend: '+27%', up: true },
};

const ACTIVE_COLLEGES = [
  { name: 'VIT AP University', users: 2840, departments: 18, lastActivity: '2026-05-30', credits: 485200 },
  { name: 'SRM AP University', users: 2210, departments: 15, lastActivity: '2026-05-29', credits: 392400 },
  { name: 'KL University', users: 1980, departments: 14, lastActivity: '2026-05-30', credits: 361800 },
  { name: 'GVP College of Engineering', users: 1650, departments: 12, lastActivity: '2026-05-28', credits: 298600 },
  { name: 'GITAM University', users: 1420, departments: 11, lastActivity: '2026-05-30', credits: 254700 },
  { name: 'Vignan University', users: 1180, departments: 10, lastActivity: '2026-05-27', credits: 213400 },
];

const INACTIVE_COLLEGES = [
  { name: 'Acharya Nagarjuna University', users: 320, lastLogin: '2026-04-12', lastSubmission: '2026-03-28', status: 'Suspended' },
  { name: 'Andhra University', users: 480, lastLogin: '2026-04-25', lastSubmission: '2026-04-10', status: 'Inactive' },
  { name: 'Jawaharlal Nehru Tech Univ', users: 290, lastLogin: '2026-03-30', lastSubmission: '2026-03-15', status: 'Suspended' },
  { name: 'Sri Padmavathi Mahila Uni', users: 210, lastLogin: '2026-05-02', lastSubmission: '2026-04-20', status: 'Inactive' },
];

const MONTHLY_GROWTH = [
  { month: 'Jan', colleges: 2, users: 420, submissions: 1840 },
  { month: 'Feb', colleges: 3, users: 680, submissions: 2310 },
  { month: 'Mar', colleges: 4, users: 940, submissions: 2890 },
  { month: 'Apr', colleges: 2, users: 1120, submissions: 3240 },
  { month: 'May', colleges: 5, users: 1480, submissions: 3980 },
  { month: 'Jun', colleges: 3, users: 1240, submissions: 4120 },
  { month: 'Jul', colleges: 6, users: 1840, submissions: 4680 },
  { month: 'Aug', colleges: 4, users: 2010, submissions: 5120 },
  { month: 'Sep', colleges: 5, users: 2240, submissions: 5480 },
  { month: 'Oct', colleges: 7, users: 2480, submissions: 5940 },
  { month: 'Nov', colleges: 3, users: 2140, submissions: 6210 },
  { month: 'Dec', colleges: 4, users: 1980, submissions: 5840 },
];

const SUBMISSION_ANALYTICS = [
  { month: 'Jan', approved: 1420, rejected: 420 },
  { month: 'Feb', approved: 1840, rejected: 470 },
  { month: 'Mar', approved: 2210, rejected: 680 },
  { month: 'Apr', approved: 2480, rejected: 760 },
  { month: 'May', approved: 3120, rejected: 860 },
  { month: 'Jun', approved: 3280, rejected: 840 },
  { month: 'Jul', approved: 3680, rejected: 1000 },
  { month: 'Aug', approved: 4010, rejected: 1110 },
  { month: 'Sep', approved: 4240, rejected: 1240 },
  { month: 'Oct', approved: 4680, rejected: 1260 },
  { month: 'Nov', approved: 4940, rejected: 1270 },
  { month: 'Dec', approved: 4580, rejected: 1260 },
];

const COLLEGE_ACTIVITY_PIE = [
  { name: 'VIT AP', value: 30, color: '#f97316' },
  { name: 'SRM AP', value: 25, color: '#3b82f6' },
  { name: 'KL University', value: 20, color: '#8b5cf6' },
  { name: 'Others', value: 25, color: '#10b981' },
];

const USER_ROLE_PIE = [
  { name: 'Students', value: 9840, color: '#f97316' },
  { name: 'Mentors', value: 1248, color: '#3b82f6' },
  { name: 'HODs', value: 384, color: '#8b5cf6' },
  { name: 'College Admins', value: 48, color: '#10b981' },
];

const TOP_COLLEGES = [
  { rank: 1, name: 'VIT AP University', credits: 485200, approved: 8420 },
  { rank: 2, name: 'SRM AP University', credits: 392400, approved: 6840 },
  { rank: 3, name: 'KL University', credits: 361800, approved: 6210 },
  { rank: 4, name: 'GVP College of Engineering', credits: 298600, approved: 5180 },
  { rank: 5, name: 'GITAM University', credits: 254700, approved: 4420 },
  { rank: 6, name: 'Vignan University', credits: 213400, approved: 3840 },
  { rank: 7, name: 'JNTUK', credits: 184200, approved: 3240 },
  { rank: 8, name: 'Andhra University', credits: 162800, approved: 2980 },
];

const TOP_STUDENTS = [
  { rank: 1, name: 'Arjun Reddy', college: 'VIT AP', credits: 2840, stars: 5 },
  { rank: 2, name: 'Priya Sharma', college: 'SRM AP', credits: 2720, stars: 5 },
  { rank: 3, name: 'Kiran Kumar', college: 'KL University', credits: 2610, stars: 5 },
  { rank: 4, name: 'Sneha Patel', college: 'GVP', credits: 2480, stars: 4 },
  { rank: 5, name: 'Rahul Mehta', college: 'GITAM', credits: 2340, stars: 4 },
];

const TOP_MENTORS = [
  { rank: 1, name: 'Prof. Arun Vijay', department: 'CSE', reviews: 284, credits: 142800 },
  { rank: 2, name: 'Dr. Kavitha Raj', department: 'IT', reviews: 248, credits: 124200 },
  { rank: 3, name: 'Prof. Ravi Kumar', department: 'ECE', reviews: 212, credits: 108400 },
  { rank: 4, name: 'Dr. Meena Sundari', department: 'AIML', reviews: 198, credits: 96800 },
  { rank: 5, name: 'Prof. Suresh Babu', department: 'CSE', reviews: 184, credits: 91200 },
];

const RECENT_ACTIVITY = [
  { id: 1, icon: 'upload', text: 'Arjun Reddy uploaded AWS Cloud Practitioner certification', time: '2 min ago', type: 'success' },
  { id: 2, icon: 'approve', text: 'Prof. Arun Vijay approved internship submission for Priya Sharma', time: '8 min ago', type: 'success' },
  { id: 3, icon: 'college', text: 'New college "Sri Venkateswara University" registered', time: '15 min ago', type: 'info' },
  { id: 4, icon: 'hod', text: 'HOD Dr. Kavitha approved mentor request for Prof. Ravi', time: '32 min ago', type: 'success' },
  { id: 5, icon: 'reject', text: 'Submission rejected: missing certificate documentation', time: '45 min ago', type: 'warning' },
  { id: 6, icon: 'student', text: 'New student batch registered at VIT AP (48 students)', time: '1 hr ago', type: 'info' },
  { id: 7, icon: 'upload', text: 'Kiran Kumar uploaded IEEE research paper', time: '1.5 hrs ago', type: 'success' },
  { id: 8, icon: 'approve', text: 'Mentor approved hackathon achievement for Sneha Patel', time: '2 hrs ago', type: 'success' },
];

const PENDING_ACTIONS = [
  { label: 'Pending HOD Requests', value: 12, color: '#f97316', icon: 'hod' },
  { label: 'Pending Mentor Requests', value: 28, color: '#3b82f6', icon: 'mentor' },
  { label: 'Pending Student Registrations', value: 84, color: '#8b5cf6', icon: 'student' },
  { label: 'Pending Reviews', value: 142, color: '#10b981', icon: 'review' },
];

const COLLEGE_HEALTH = [
  { name: 'VIT AP University', score: 96, status: 'Excellent', participation: '94%', submissions: 8420, credits: 485200 },
  { name: 'SRM AP University', score: 88, status: 'Excellent', participation: '87%', submissions: 6840, credits: 392400 },
  { name: 'KL University', score: 82, status: 'Good', participation: '81%', submissions: 6210, credits: 361800 },
  { name: 'GVP Engineering', score: 74, status: 'Good', participation: '73%', submissions: 5180, credits: 298600 },
  { name: 'GITAM University', score: 68, status: 'Average', participation: '66%', submissions: 4420, credits: 254700 },
  { name: 'Acharya Uni', score: 32, status: 'Low Activity', participation: '28%', submissions: 820, credits: 48200 },
];

const COLLEGE_BAR_DATA = [
  { name: 'VIT AP', credits: 485, submissions: 842, students: 284 },
  { name: 'SRM AP', credits: 392, submissions: 684, students: 221 },
  { name: 'KL Univ', credits: 362, submissions: 621, students: 198 },
  { name: 'GVP', credits: 299, submissions: 518, students: 165 },
  { name: 'GITAM', credits: 255, submissions: 442, students: 142 },
  { name: 'Vignan', credits: 213, submissions: 384, students: 118 },
  { name: 'JNTUK', credits: 184, submissions: 324, students: 98 },
  { name: 'AU', credits: 163, submissions: 298, students: 88 },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-900 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, trend, up, gradient, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl' : ''}`}
    style={{ background: gradient }}
  >
    {/* Decorative blob */}
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
    <div className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)' }} />

    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-white/75 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-extrabold leading-none">
          {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
        </p>
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${up ? 'text-green-200' : 'text-red-200'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend} vs last month</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {onClick && (
      <div className="relative z-10 mt-3 flex items-center gap-1 text-white/70 text-xs font-medium">
        <span>Click to view details</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    )}
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40">
      <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ─── Rank Badge ────────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const colors = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-gray-300 text-gray-800',
    3: 'bg-amber-600 text-white',
  };
  return (
    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full font-extrabold text-sm ${colors[rank] || 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'}`}>
      {rank}
    </span>
  );
};

// ─── Stars Display ─────────────────────────────────────────────────────────────
const Stars = ({ count, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ─── Health Score Badge ────────────────────────────────────────────────────────
const HealthBadge = ({ status }) => {
  const map = {
    'Excellent': 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    'Good': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    'Average': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
    'Low Activity': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || ''}`}>{status}</span>
  );
};

// ─── Activity Feed Icon ────────────────────────────────────────────────────────
const ActivityIcon = ({ type, iconType }) => {
  const config = {
    success: { bg: 'bg-green-100 dark:bg-green-950/40', color: 'text-green-600 dark:text-green-400' },
    info: { bg: 'bg-blue-100 dark:bg-blue-950/40', color: 'text-blue-600 dark:text-blue-400' },
    warning: { bg: 'bg-yellow-100 dark:bg-yellow-950/40', color: 'text-yellow-600 dark:text-yellow-400' },
  };
  const iconMap = {
    upload: FileText, approve: CheckCircle, college: Building2,
    hod: UserCheck, reject: XCircle, student: GraduationCap,
  };
  const Icon = iconMap[iconType] || Activity;
  const c = config[type] || config.info;
  return (
    <div className={`p-2 rounded-xl shrink-0 ${c.bg}`}>
      <Icon className={`w-4 h-4 ${c.color}`} />
    </div>
  );
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-orange-200 dark:border-orange-900 animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 dark:border-orange-900 shrink-0">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/50 p-5 ${className}`}>
    {children}
  </div>
);

// ─── Main Dashboard Component ──────────────────────────────────────────────────
export const SystemAdminAnalyticsDashboard = () => {
  const [activeModal, setActiveModal] = useState(null); // 'active' | 'inactive'
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setRefreshing(false);
    }, 800);
  }, []);

  return (
    <div className="animate-fade-in space-y-8 pb-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Platform Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time overview of the SAPT platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: <span className="font-semibold text-gray-600 dark:text-gray-300">{lastUpdated}</span>
          </span>
          <button
            id="dashboard-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow transition-all duration-200 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          icon={Building2} label="Total Colleges"
          value={KPI_DATA.totalColleges.value}
          trend={KPI_DATA.totalColleges.trend} up={KPI_DATA.totalColleges.up}
          gradient="linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
        />
        <KpiCard
          icon={CheckCircle} label="Active Colleges"
          value={KPI_DATA.activeColleges.value}
          trend={KPI_DATA.activeColleges.trend} up={KPI_DATA.activeColleges.up}
          gradient="linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
          onClick={() => setActiveModal('active')}
        />
        <KpiCard
          icon={XCircle} label="Inactive Colleges"
          value={KPI_DATA.inactiveColleges.value}
          trend={KPI_DATA.inactiveColleges.trend} up={KPI_DATA.inactiveColleges.up}
          gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
          onClick={() => setActiveModal('inactive')}
        />
        <KpiCard
          icon={Users} label="Total Users"
          value={KPI_DATA.totalUsers.value}
          trend={KPI_DATA.totalUsers.trend} up={KPI_DATA.totalUsers.up}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
        />
        <KpiCard
          icon={BookOpen} label="Total Departments"
          value={KPI_DATA.totalDepartments.value}
          trend={KPI_DATA.totalDepartments.trend} up={KPI_DATA.totalDepartments.up}
          gradient="linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          icon={UserCheck} label="Total HODs"
          value={KPI_DATA.totalHODs.value}
          trend={KPI_DATA.totalHODs.trend} up={KPI_DATA.totalHODs.up}
          gradient="linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)"
        />
        <KpiCard
          icon={Target} label="Total Mentors"
          value={KPI_DATA.totalMentors.value}
          trend={KPI_DATA.totalMentors.trend} up={KPI_DATA.totalMentors.up}
          gradient="linear-gradient(135deg, #c2410c 0%, #ea580c 100%)"
        />
        <KpiCard
          icon={GraduationCap} label="Total Students"
          value={KPI_DATA.totalStudents.value}
          trend={KPI_DATA.totalStudents.trend} up={KPI_DATA.totalStudents.up}
          gradient="linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
        />
        <KpiCard
          icon={FileText} label="Total Submissions"
          value={KPI_DATA.totalSubmissions.value}
          trend={KPI_DATA.totalSubmissions.trend} up={KPI_DATA.totalSubmissions.up}
          gradient="linear-gradient(135deg, #9d174d 0%, #ec4899 100%)"
        />
        <KpiCard
          icon={Award} label="Credits Awarded"
          value={KPI_DATA.totalCredits.value}
          trend={KPI_DATA.totalCredits.trend} up={KPI_DATA.totalCredits.up}
          gradient="linear-gradient(135deg, #92400e 0%, #f59e0b 100%)"
        />
      </div>

      {/* ── Pending Actions ── */}
      <ChartCard>
        <SectionHeader icon={AlertCircle} title="Pending Actions" subtitle="Items requiring system admin attention" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PENDING_ACTIONS.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-xl p-4 border-2 hover:scale-[1.02] transition-transform cursor-pointer"
              style={{ borderColor: `${item.color}30`, background: `${item.color}08` }}
            >
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${item.color}20` }}>
                <Zap className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <p className="text-2xl font-extrabold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* ── Charts Row 1: Growth + Submissions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard>
          <SectionHeader icon={TrendingUp} title="Monthly Platform Growth" subtitle="Colleges, Users & Submissions (Jan–Dec)" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MONTHLY_GROWTH} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="colleges" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} name="Colleges" />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Users" />
              <Line type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Submissions" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <SectionHeader icon={FileText} title="Submission Analytics" subtitle="Approved vs Rejected (Monthly)" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={SUBMISSION_ANALYTICS} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2.5} fill="url(#approvedGrad)" name="Approved" />
              <Area type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2.5} fill="url(#rejectedGrad)" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Pie Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard>
          <SectionHeader icon={Globe} title="College Activity Distribution" subtitle="Activity contribution by top colleges" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={220}>
              <PieChart>
                <Pie data={COLLEGE_ACTIVITY_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {COLLEGE_ACTIVITY_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {COLLEGE_ACTIVITY_PIE.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader icon={Users} title="User Role Distribution" subtitle="Breakdown by user roles across all colleges" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={220}>
              <PieChart>
                <Pie data={USER_ROLE_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {USER_ROLE_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {USER_ROLE_PIE.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: item.color }}>{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── College Performance Bar Chart ── */}
      <ChartCard>
        <SectionHeader icon={BarChart2} title="College Performance Comparison" subtitle="Top 8 colleges – Credits (K), Submissions (tens), Students (tens)" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={COLLEGE_BAR_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="credits" fill="#ea580c" radius={[4, 4, 0, 0]} name="Credits (K)" />
            <Bar dataKey="submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submissions (×10)" />
            <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} name="Students (×10)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Leaderboards Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Colleges */}
        <ChartCard className="lg:col-span-1">
          <SectionHeader icon={Crown} title="Top Colleges" subtitle="By credits & approved submissions" />
          <div className="space-y-2">
            {TOP_COLLEGES.map((col) => (
              <div key={col.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                <RankBadge rank={col.rank} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{col.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{col.approved.toLocaleString()} approved</p>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0">
                  {(col.credits / 1000).toFixed(0)}K cr
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Students */}
        <ChartCard className="lg:col-span-1">
          <SectionHeader icon={Medal} title="Top Students" subtitle="Highest credits across platform" />
          <div className="space-y-2">
            {TOP_STUDENTS.map((stu) => (
              <div key={stu.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                <RankBadge rank={stu.rank} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{stu.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{stu.college}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{stu.credits.toLocaleString()}</span>
                  <Stars count={stu.stars} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Mentors */}
        <ChartCard className="lg:col-span-1">
          <SectionHeader icon={Shield} title="Top Mentors" subtitle="By reviews completed" />
          <div className="space-y-2">
            {TOP_MENTORS.map((mentor) => (
              <div key={mentor.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                <RankBadge rank={mentor.rank} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{mentor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{mentor.department} · {mentor.reviews} reviews</p>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0">
                  {(mentor.credits / 1000).toFixed(0)}K cr
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── College Health Scores ── */}
      <ChartCard>
        <SectionHeader icon={Activity} title="College Health Scores" subtitle="Composite score based on activity, participation, submissions & credits" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLEGE_HEALTH.map((col) => (
            <div key={col.name} className="p-4 rounded-xl border border-orange-100 dark:border-orange-900/40 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{col.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{col.participation} participation</p>
                </div>
                <HealthBadge status={col.status} />
              </div>
              {/* Score Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${col.score}%`,
                      background: col.score >= 80 ? '#22c55e' : col.score >= 60 ? '#3b82f6' : col.score >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-sm font-extrabold text-gray-700 dark:text-gray-300 w-8 text-right">{col.score}</span>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{col.submissions.toLocaleString()} sub.</span>
                <span>{(col.credits / 1000).toFixed(0)}K cr</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* ── Activity Feed ── */}
      <ChartCard>
        <SectionHeader icon={Activity} title="Recent Activity Feed" subtitle="Live platform activity stream" />
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
              <ActivityIcon type={item.type} iconType={item.icon} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* ── Active Colleges Modal ── */}
      <Modal
        isOpen={activeModal === 'active'}
        onClose={() => setActiveModal(null)}
        title={`Active Colleges (${ACTIVE_COLLEGES.length})`}
      >
        <div className="space-y-3">
          {ACTIVE_COLLEGES.map((col) => (
            <div key={col.name} className="p-4 rounded-xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 dark:text-white">{col.name}</p>
                <span className="text-xs bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[
                  { label: 'Total Users', value: col.users.toLocaleString() },
                  { label: 'Departments', value: col.departments },
                  { label: 'Total Credits', value: `${(col.credits / 1000).toFixed(0)}K` },
                  { label: 'Last Activity', value: col.lastActivity },
                ].map(item => (
                  <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-base font-extrabold text-orange-600 dark:text-orange-400">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── Inactive Colleges Modal ── */}
      <Modal
        isOpen={activeModal === 'inactive'}
        onClose={() => setActiveModal(null)}
        title={`Inactive Colleges (${INACTIVE_COLLEGES.length})`}
      >
        <div className="space-y-3">
          {INACTIVE_COLLEGES.map((col) => (
            <div key={col.name} className="p-4 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-gray-900 dark:text-white">{col.name}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${col.status === 'Suspended' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400'}`}>
                  {col.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[
                  { label: 'Total Users', value: col.users },
                  { label: 'Last Login', value: col.lastLogin },
                  { label: 'Last Submission', value: col.lastSubmission },
                  { label: 'Status', value: col.status },
                ].map(item => (
                  <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-extrabold text-red-600 dark:text-red-400">{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
};
