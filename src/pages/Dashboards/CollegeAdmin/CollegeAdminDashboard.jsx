import { useState, useCallback, useEffect } from 'react';
import {
  BookOpen,
  Users,
  CheckSquare,
  RefreshCw,
  Trophy,
  Award,
  TrendingUp,
  GraduationCap,
  Calendar,
  Activity,
  Layers,
  UserCheck,
  UserX,
  BarChart2,
  PieChart as PieIcon,
  FileDown,
  Loader,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { collegeAdminApi } from '../../../utils/api';
import { getStars, getAchievementBadge } from '../../../utils/mockData';
import {
  StatCard,
  Badge,
  Avatar,
  StarsDisplay,
  useToast
} from '../../../components/ui/UIComponents';

// Polyfill ResizeObserver
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const calcRemaining = (endDateStr) => {
  if (!endDateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end   = new Date(endDateStr); end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end - today) / 86_400_000));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-900 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium text-xs">
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-orange-100 dark:border-orange-950/50 shadow-sm flex flex-col justify-between">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40 shrink-0">
        <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    <div className="flex-1 w-full min-h-[220px]">
      {children}
    </div>
  </div>
);

const EMPTY_STATS = {
  totalDepartments: 0,
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  hodCount: 0,
  mentorCount: 0,
  studentCount: 0,
  totalApprovals: 0,
  studentActivities: 0,
  topStudents: [],
  mentorPerformances: [],
  departmentChart: [],
  categoryChart: [],
  monthlyTrends: [],
  recentSubmissions: [],
  placementFactors: {
    hackathonsCount: 0, hackathonWins: 0, certificationsCount: 0,
    internshipsCount: 0, projectsCount: 0, placementPrepCount: 0,
    researchCount: 0, ppoCount: 0, openSourceCount: 0,
    examsCount: 0, academicExcellenceCount: 0, startupFreelanceCount: 0
  },
  college: null
};

export const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());
  const [stats, setStats] = useState(EMPTY_STATS);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await collegeAdminApi.getDashboardStats();
      setStats({ ...EMPTY_STATS, ...data });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      showToast('Failed to load dashboard data from server', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const collegeInfo = stats.college || {};
  const remaining = calcRemaining(collegeInfo.contractEnd);
  const isExpired = remaining !== null && remaining === 0;

  const handleRefresh = useCallback(async () => {
    await loadData();
    showToast('Dashboard refreshed!', 'success');
  }, [loadData, showToast]);

  const handleDownloadReport = () => {
    if (!user) return;
    const collegeName = user.college || 'Institution';
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Popup blocked! Please allow popups.', 'error'); return; }

    printWindow.document.write(`<html><head><title>${collegeName} - SPAT Report</title>
      <style>body{font-family:sans-serif;padding:40px;color:#1e293b}
      .logo{font-size:28px;font-weight:900;color:#ea580c}
      h2{color:#ea580c}table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f1f5f9;padding:10px;border-bottom:2px solid #cbd5e1}
      td{padding:10px;border-bottom:1px solid #e2e8f0}</style></head><body>
      <div class="logo">SPAT</div>
      <h2>College Dashboard Report — ${collegeName}</h2>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <h3>Summary</h3>
      <table><tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Departments</td><td>${stats.totalDepartments}</td></tr>
      <tr><td>Total Users</td><td>${stats.totalUsers}</td></tr>
      <tr><td>Active Users</td><td>${stats.activeUsers}</td></tr>
      <tr><td>Total Approvals</td><td>${stats.totalApprovals}</td></tr>
      <tr><td>Student Activities</td><td>${stats.studentActivities}</td></tr></table>
      <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
      </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {ToastComponent}

      {/* ─── Contract Timeline Bar ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-orange-50/60 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-950/30 rounded-2xl gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">SPAT Institutional Contract License</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authorized access period for {user?.college}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 border-orange-200/60 dark:border-orange-950/50">
            <span className="font-bold text-orange-600 dark:text-orange-400">License Term:</span>
            {collegeInfo.contractStart
              ? <span>{fmt(collegeInfo.contractStart)} – {fmt(collegeInfo.contractEnd)}</span>
              : <span className="italic text-slate-400">No contract date set</span>
            }
          </div>
          {remaining !== null && (
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              isExpired
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-950'
                : remaining <= 90
                ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-950'
                : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-950'
            }`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {isExpired ? 'Expired' : `${remaining} Days Remaining`}
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
            collegeInfo.status !== 'INACTIVE'
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-950'
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-950'
          }`}>
            <div className={`w-2 h-2 rounded-full ${collegeInfo.status !== 'INACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
            <span>{collegeInfo.status !== 'INACTIVE' ? 'Active Subscription' : 'Inactive License'}</span>
          </div>
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">College Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics for <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.college}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Last updated: <span className="font-semibold text-slate-600 dark:text-slate-300">{lastUpdated}</span>
          </span>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow transition-all duration-200"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow transition-all duration-200 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Loading Overlay ─── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-3 text-slate-500 dark:text-slate-400">Loading dashboard data...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* ─── Metric Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon={<Layers className="w-5 h-5" />} label="Departments" value={stats.totalDepartments} color="primary" />
            <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.totalUsers} color="blue" />
            <StatCard icon={<UserCheck className="w-5 h-5" />} label="Active Users" value={stats.activeUsers} color="green" />
            <StatCard icon={<UserX className="w-5 h-5" />} label="Inactive Users" value={stats.inactiveUsers} color="red" />
            <StatCard icon={<CheckSquare className="w-5 h-5" />} label="Total Approvals" value={stats.totalApprovals} color="yellow" />
            <StatCard icon={<Activity className="w-5 h-5" />} label="Student Activities" value={stats.studentActivities} color="blue" />
          </div>

          {/* ─── Placement Showcase ─── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-950/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40">
                <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Placement Showcase & Readiness Factors</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated student activities highlighting job readiness and technical capacity</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: Trophy, color: 'orange', label: 'Hackathons Participated', sub: `Wins: ${stats.placementFactors.hackathonWins}`, value: stats.placementFactors.hackathonsCount },
                { icon: Award, color: 'blue', label: 'Global Certifications', sub: 'AWS / GCP / Cisco / MS', value: stats.placementFactors.certificationsCount },
                { icon: Users, color: 'emerald', label: 'Corporate Internships', sub: 'Real-world industry work', value: stats.placementFactors.internshipsCount },
                { icon: Layers, color: 'purple', label: 'Technical Projects', sub: 'Mini & Major implementations', value: stats.placementFactors.projectsCount },
                { icon: CheckSquare, color: 'yellow', label: 'Placement Training', sub: 'Mock Interviews & Aptitude', value: stats.placementFactors.placementPrepCount },
              ].map(({ icon: Icon, color, label, sub, value }) => (
                <div key={label} className={`p-4 bg-${color}-50/50 dark:bg-${color}-950/10 rounded-2xl border border-${color}-100/50 dark:border-${color}-950/30 text-center`}>
                  <Icon className={`w-8 h-8 mx-auto text-${color}-600 dark:text-${color}-400 mb-2`} />
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
                  <p className={`text-xs font-bold text-slate-500 dark:text-slate-400 mt-1`}>{label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-orange-100/50 dark:border-orange-950/30 my-6"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 shrink-0">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none">Advanced Corporate Distinctions & Credentials</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Premium student milestones highly sought after by top-tier recruiters</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'PPOs Received', value: stats.placementFactors.ppoCount },
                { label: 'Research Papers', value: stats.placementFactors.researchCount },
                { label: 'Open Source Contrib.', value: stats.placementFactors.openSourceCount },
                { label: 'GATE/Exams Qualified', value: stats.placementFactors.examsCount },
                { label: 'Academic Toppers', value: stats.placementFactors.academicExcellenceCount },
                { label: 'Startups/Freelancers', value: stats.placementFactors.startupFreelanceCount },
              ].map(({ label, value }) => (
                <div key={label} className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                  <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Top Performers & Mentors ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-orange-100 dark:border-orange-950/50 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-none">Top Performers Candidates Pool</h2>
                  <p className="text-xs text-slate-500 mt-1">Top 3 students by approved credits for placement</p>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                {stats.topStudents && stats.topStudents.length > 0 ? (
                  stats.topStudents.map((stu, i) => {
                    const colors = [
                      'bg-yellow-400 text-yellow-900 ring-yellow-300',
                      'bg-slate-300 text-slate-800 ring-slate-200',
                      'bg-amber-600 text-white ring-amber-500'
                    ];
                    return (
                      <div key={stu.id} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-dark-900/10 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:shadow-sm transition-all duration-200">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ring-2 ${colors[i] || 'bg-slate-200 text-slate-700'}`}>
                          {i + 1}
                        </span>
                        <Avatar name={stu.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{stu.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{stu.department} · {stu.rollNo || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right">
                          <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 leading-none">
                            {stu.totalCredits} <span className="text-[10px] font-semibold text-slate-400">Credits</span>
                          </span>
                          <span className="text-[10px] font-bold mt-1 text-slate-500">
                            {getAchievementBadge(getStars(stu.totalCredits))}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">No student activity recorded yet</div>
                )}
              </div>
            </div>

            {/* Mentor Performance */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-orange-100 dark:border-orange-950/50 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-none">Mentor Guidance Performance</h2>
                  <p className="text-xs text-slate-500 mt-1">Approval success rate based on student submissions</p>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                {stats.mentorPerformances && stats.mentorPerformances.length > 0 ? (
                  stats.mentorPerformances.slice(0, 3).map((mentor) => {
                    const successRate = mentor.successRate || 0;
                    const colorClass = successRate >= 85 ? 'text-emerald-600 dark:text-emerald-400' : successRate >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400';
                    const barBg = successRate >= 85 ? 'bg-emerald-500' : successRate >= 70 ? 'bg-blue-500' : 'bg-yellow-500';
                    return (
                      <div key={mentor.id} className="flex flex-col p-3 bg-slate-50/50 dark:bg-dark-900/10 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar name={mentor.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{mentor.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{mentor.departmentName || mentor.department}</p>
                          </div>
                          <span className={`text-sm font-extrabold ${colorClass}`}>
                            {successRate}% <span className="text-[10px] font-semibold text-slate-400">Success</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barBg}`} style={{ width: `${successRate}%` }} />
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-medium">
                          <span>Approved: {mentor.approvedCount || 0} subs</span>
                          <span>Guided: {mentor.totalCreditsGuided || 0} Credits</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">No mentor guidance data available</div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Charts ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Department Comparisons" subtitle="Total Approved Credits by Department" icon={BarChart2}>
              {stats.departmentChart && stats.departmentChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.departmentChart} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="credits" fill="#ea580c" radius={[4, 4, 0, 0]} name="Approved Credits" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No department data to display</div>
              )}
            </ChartCard>

            <ChartCard title="Monthly Trends" subtitle="Submissions Approved, Pending, & Rejected" icon={TrendingUp}>
              {stats.monthlyTrends && stats.monthlyTrends.some(t => t.approved > 0 || t.pending > 0 || t.rejected > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyTrends} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                    <defs>
                      <linearGradient id="approvedColAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} fill="url(#approvedColAdmin)" name="Approved" />
                    <Area type="monotone" dataKey="pending" stroke="#eab308" strokeWidth={2} fill="none" name="Pending" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No monthly trend data to display</div>
              )}
            </ChartCard>

            <ChartCard title="Activity Distribution" subtitle="Total Submissions by Categories" icon={PieIcon}>
              {stats.categoryChart && stats.categoryChart.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-4">
                  <div className="w-[140px] h-[140px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.categoryChart} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                          {stats.categoryChart.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color || '#ea580c'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0 overflow-y-auto max-h-[160px] text-xs">
                    {stats.categoryChart.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color || '#ea580c' }} />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No submission data to display</div>
              )}
            </ChartCard>
          </div>

          {/* ─── Recent Submissions ─── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-950/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Recent Student Activities</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Latest submissions uploaded by students</p>
              </div>
            </div>

            {!stats.recentSubmissions || stats.recentSubmissions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
                No submissions from this college yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-orange-100 dark:border-orange-950/50 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Submission Title</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4">Credits</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSubmissions.map((sub) => {
                      const badgeVariant = sub.status === 'approved' ? 'green' : sub.status === 'rejected' ? 'red' : 'yellow';
                      return (
                        <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-900/10 transition-colors">
                          <td className="py-3.5 pr-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{sub.studentName}</td>
                          <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{sub.title}</td>
                          <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{sub.type}</td>
                          <td className="py-3.5 pr-4 font-bold text-slate-800 dark:text-slate-200">
                            {sub.status === 'approved' ? `+${sub.credits}` : '0'}
                          </td>
                          <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{sub.date}</td>
                          <td className="py-3.5 whitespace-nowrap">
                            <Badge variant={badgeVariant}>{sub.status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
