import { useState, useCallback, useEffect } from 'react';
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
import { systemAdminApi } from '../../../utils/api';


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
const KpiCard = ({ icon: Icon, label, value, trend, up, gradient, onClick, loading }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.03] hover:shadow-xl' : ''}`}
    style={{ background: gradient }}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
    <div className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)' }} />

    <div className="relative z-10 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-white/75 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold leading-none">
            {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
          </p>
        )}
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

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/50 p-5 ${className}`}>
    {children}
  </div>
);

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

// ─── Empty Chart Placeholder ──────────────────────────────────────────────────
const EmptyChart = ({ message = 'No data yet — connect to backend' }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2 py-8">
    <BarChart2 className="w-10 h-10 opacity-30" />
    <p className="text-xs text-center">{message}</p>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export const SystemAdminAnalyticsDashboard = () => {
  const [activeModal, setActiveModal]   = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(() => new Date().toLocaleTimeString());
  const [refreshing, setRefreshing]     = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats]               = useState(null);
  const [statsError, setStatsError]     = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await systemAdminApi.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(err.message || 'Failed to load stats');
      // Keep showing 0s gracefully
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setLastUpdated(new Date().toLocaleTimeString());
    setRefreshing(false);
  }, [fetchStats]);

  // KPI values wired to real stats
  const kpi = {
    totalColleges:    stats?.totalColleges    ?? 0,
    activeColleges:   stats?.activeColleges   ?? 0,
    inactiveColleges: stats?.inactiveColleges ?? 0,
    suspendedColleges:stats?.suspendedColleges?? 0,
    totalUsers:       stats?.totalUsers       ?? 0,
    totalCollegeAdmins: stats?.totalCollegeAdmins ?? 0,
  };

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
          {statsError && (
            <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {statsError}
            </span>
          )}
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

      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <KpiCard
          icon={Building2} label="Total Colleges"
          value={kpi.totalColleges} trend="—" up={true} loading={statsLoading}
          gradient="linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
        />
        <KpiCard
          icon={CheckCircle} label="Active Colleges"
          value={kpi.activeColleges} trend="—" up={true} loading={statsLoading}
          gradient="linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
          onClick={() => setActiveModal('active')}
        />
        <KpiCard
          icon={XCircle} label="Inactive / Suspended"
          value={kpi.inactiveColleges + kpi.suspendedColleges} trend="—" up={false} loading={statsLoading}
          gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
          onClick={() => setActiveModal('inactive')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <KpiCard
          icon={Users} label="Total Users"
          value={kpi.totalUsers} trend="—" up={true} loading={statsLoading}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
        />
        <KpiCard
          icon={UserCheck} label="College Admins"
          value={kpi.totalCollegeAdmins} trend="—" up={true} loading={statsLoading}
          gradient="linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
        />
      </div>

      {/* ── Charts: Growth + Submissions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard>
          <SectionHeader icon={TrendingUp} title="Monthly Platform Growth" subtitle="Colleges, Users & Submissions (Jan–Dec)" />
          <div className="h-[260px] flex items-center justify-center">
            <EmptyChart message="Connect backend analytics to populate growth chart" />
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader icon={FileText} title="Submission Analytics" subtitle="Approved vs Rejected (Monthly)" />
          <div className="h-[260px] flex items-center justify-center">
            <EmptyChart message="Connect backend analytics to populate submission chart" />
          </div>
        </ChartCard>
      </div>

      {/* ── Pie Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard>
          <SectionHeader icon={Globe} title="College Activity Distribution" subtitle="Activity contribution by top colleges" />
          <div className="h-[220px] flex items-center justify-center">
            <EmptyChart message="Aggregated college analytics — connect backend" />
          </div>
        </ChartCard>

        <ChartCard>
          <SectionHeader icon={Users} title="User Role Distribution" subtitle="Breakdown by user roles across all colleges" />
          {statsLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 h-[220px]">
              <ResponsiveContainer width={200} height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Total Users', value: kpi.totalUsers || 1, color: '#7c3aed' },
                      { name: 'College Admins', value: kpi.totalCollegeAdmins || 0, color: '#0891b2' },
                    ]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                  >
                    {[{ color: '#7c3aed' }, { color: '#0891b2' }].map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { name: 'Total Users', value: kpi.totalUsers, color: '#7c3aed' },
                  { name: 'College Admins', value: kpi.totalCollegeAdmins, color: '#0891b2' },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-sm" style={{ color: item.color }}>{item.value?.toLocaleString() ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── College Performance Bar Chart placeholder ── */}
      <ChartCard>
        <SectionHeader icon={BarChart2} title="College Performance Comparison" subtitle="Top colleges — Credits, Submissions, Students" />
        <div className="h-[300px] flex items-center justify-center">
          <EmptyChart message="Connect college analytics endpoint to show performance chart" />
        </div>
      </ChartCard>

      {/* ── Active Colleges Modal ── */}
      <Modal
        isOpen={activeModal === 'active'}
        onClose={() => setActiveModal(null)}
        title={`Active Colleges (${kpi.activeColleges})`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          Navigate to <strong>Colleges</strong> in the sidebar to manage and view active college details.
        </p>
      </Modal>

      {/* ── Inactive Colleges Modal ── */}
      <Modal
        isOpen={activeModal === 'inactive'}
        onClose={() => setActiveModal(null)}
        title={`Inactive / Suspended Colleges (${kpi.inactiveColleges + kpi.suspendedColleges})`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          Navigate to <strong>Colleges</strong> in the sidebar and filter by <em>Inactive</em> or <em>Suspended</em> to manage them.
        </p>
      </Modal>

    </div>
  );
};
