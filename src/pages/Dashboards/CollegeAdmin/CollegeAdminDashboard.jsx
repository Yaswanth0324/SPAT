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
  ArrowUpRight,
  TrendingDown,
  UserCheck,
  UserX,
  BarChart2,
  PieChart as PieIcon,
  FileDown,
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
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import {
  getUsers,
  getSubmissions,
  getLogs,
  getDepartmentsByCollege,
  getColleges
} from '../../../utils/localStorage';
import { ROLES, getStars, getAchievementBadge } from '../../../utils/mockData';
import {
  StatCard,
  Badge,
  Avatar,
  StarsDisplay,
  useToast
} from '../../../components/ui/UIComponents';

// Helpers for timeline formatting and calculations
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

// Polyfill ResizeObserver for automated tests or headless browser checks where it is not defined
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// ─── Custom Tooltip for Charts ──────────────────────────────────────────────────
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

// ─── Chart Card Wrapper ────────────────────────────────────────────────────────
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

export const CollegeAdminDashboard = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());

  // Retrieve current college license contract details
  const colleges = getColleges();
  const collegeObj = colleges.find(c => c.name === user?.college) || {};
  const remaining = calcRemaining(collegeObj.contractEnd);
  const isExpired = remaining !== null && remaining === 0;
  
  // Local state for statistics and charts to support simulated reloading
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalApprovals: 0,
    studentActivities: 0,
    topStudents: [],
    topMentor: null,
    mentorPerformances: [],
    recentSubmissions: [],
    deptChartData: [],
    categoryChartData: [],
    monthlyTrends: [],
    placementFactors: {
      hackathonsCount: 0,
      hackathonWins: 0,
      certificationsCount: 0,
      internshipsCount: 0,
      projectsCount: 0,
      placementPrepCount: 0,
      researchCount: 0,
      ppoCount: 0,
      openSourceCount: 0,
      examsCount: 0,
      academicExcellenceCount: 0,
      startupFreelanceCount: 0
    }
  });

  const loadData = useCallback(() => {
    if (!user?.college) return;
    
    // 1. Fetch Users in this college
    const allUsers = getUsers();
    const collegeUsers = allUsers.filter(u => u.college === user.college);
    
    // 2. Departments
    const depts = getDepartmentsByCollege(user.college);
    
    // 3. User roles distribution
    const studentUsers = collegeUsers.filter(u => u.role === ROLES.STUDENT);
    const activeCount = collegeUsers.filter(u => u.status === 'approved' || u.role === ROLES.COLLEGE_ADMIN).length;
    const inactiveCount = collegeUsers.filter(u => u.status === 'pending' || u.status === 'rejected').length;
    
    // 4. Submissions & logs of students in this college
    const studentIds = new Set(studentUsers.map(s => s.id));
    const allSubmissions = getSubmissions();
    const collegeSubmissions = allSubmissions.filter(sub => studentIds.has(sub.studentId));
    
    const approvedSubmissions = collegeSubmissions.filter(sub => sub.status === 'approved');
    const totalApprovals = approvedSubmissions.length;
    
    const allLogs = getLogs();
    const collegeLogs = allLogs.filter(log => studentIds.has(log.studentId));
    const totalActivities = collegeSubmissions.length + collegeLogs.length;

    // 5. Placement readiness factors calculations
    const hackathons = collegeSubmissions.filter(sub => sub.type === 'Hackathons');
    const hackathonsCount = hackathons.length;
    const hackathonWins = hackathons.filter(sub => 
      sub.status === 'approved' && 
      sub.achievementType && 
      sub.achievementType.toLowerCase().includes('winner')
    ).length;

    const certificationsCount = collegeSubmissions.filter(sub => 
      sub.type === 'Certifications & Online Courses' && sub.status === 'approved'
    ).length;

    const internshipsCount = collegeSubmissions.filter(sub => 
      sub.type === 'Internships' && sub.status === 'approved'
    ).length;

    const projectsCount = collegeSubmissions.filter(sub => 
      (sub.type === 'Mini Projects' || sub.type === 'Major Projects') && sub.status === 'approved'
    ).length;

    const placementPrepCount = collegeSubmissions.filter(sub => 
      sub.type === 'Placement Preparation' && sub.status === 'approved'
    ).length;

    // Advanced placement showcase factors
    const researchCount = approvedSubmissions.filter(sub => 
      sub.type === 'Research & Publications'
    ).length;

    const ppoCount = approvedSubmissions.filter(sub => 
      sub.type === 'Internships' && 
      sub.achievementType && 
      sub.achievementType.toLowerCase().includes('ppo')
    ).length;

    const openSourceCount = approvedSubmissions.filter(sub => 
      sub.type === 'Open Source Contributions'
    ).length;

    const examsCount = approvedSubmissions.filter(sub => 
      sub.type === 'Competitive Exams'
    ).length;

    const academicExcellenceCount = approvedSubmissions.filter(sub => 
      sub.type === 'Academic Performance' && 
      sub.achievementType && 
      (sub.achievementType.includes('9.0') || sub.achievementType.toLowerCase().includes('topper') || sub.achievementType.toLowerCase().includes('rank'))
    ).length;

    const startupFreelanceCount = approvedSubmissions.filter(sub => 
      sub.type === 'Freelancing & Real-World Work' || 
      sub.type === 'Startup & Innovation'
    ).length;

    const placementFactors = {
      hackathonsCount,
      hackathonWins,
      certificationsCount,
      internshipsCount,
      projectsCount,
      placementPrepCount,
      researchCount,
      ppoCount,
      openSourceCount,
      examsCount,
      academicExcellenceCount,
      startupFreelanceCount
    };

    // 6. Top 3 Student Performers (by approved credits)
    const studentPerformances = studentUsers.map(student => {
      const studentSubs = collegeSubmissions.filter(sub => sub.studentId === student.id && sub.status === 'approved');
      const totalCredits = studentSubs.reduce((sum, sub) => sum + (sub.credits || 0), 0);
      return { ...student, totalCredits };
    });
    studentPerformances.sort((a, b) => b.totalCredits - a.totalCredits);
    const topStudents = studentPerformances.slice(0, 3);

    // 7. Mentor Performers & Success Rate Percentage
    // Success rate is (Approved / Processed) * 100
    const mentorPerformances = collegeUsers.filter(u => u.role === ROLES.MENTOR).map(mentor => {
      const mentorSubs = collegeSubmissions.filter(sub => sub.mentorId === mentor.id);
      const approvedCount = mentorSubs.filter(sub => sub.status === 'approved').length;
      const totalProcessed = mentorSubs.filter(sub => sub.status === 'approved' || sub.status === 'rejected').length;
      const successRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 100;
      const totalCreditsGuided = mentorSubs.filter(sub => sub.status === 'approved').reduce((sum, sub) => sum + (sub.credits || 0), 0);
      return { 
        ...mentor, 
        successRate, 
        approvedCount, 
        totalCreditsGuided 
      };
    });
    mentorPerformances.sort((a, b) => b.successRate - a.successRate || b.totalCreditsGuided - a.totalCreditsGuided);
    const topMentor = mentorPerformances[0] || null;

    // 8. Department chart data
    const deptChartData = depts
      .filter(deptName => typeof deptName === 'string')
      .map(deptName => {
        const deptStudents = studentUsers.filter(s => s.department === deptName);
        const deptSubs = collegeSubmissions.filter(sub => 
          sub.status === 'approved' && 
          deptStudents.some(s => s.id === sub.studentId)
        );
        const credits = deptSubs.reduce((sum, sub) => sum + (sub.credits || 0), 0);
        return {
          name: deptName.split(' ').filter(Boolean).map(w => w[0] || '').join('').toUpperCase(),
          fullName: deptName,
          students: deptStudents.length,
          credits: credits
        };
      });

    // 9. Categories chart data
    const categoryCounts = {};
    collegeSubmissions.forEach(sub => {
      const typeName = sub.type || 'Other';
      categoryCounts[typeName] = (categoryCounts[typeName] || 0) + 1;
    });
    const pieColors = ['#ea580c', '#3b82f6', '#10b981', '#8b5cf6', '#eab308', '#ec4899', '#06b6d4'];
    const categoryChartData = Object.entries(categoryCounts).map(([name, value], idx) => ({
      name,
      value,
      color: pieColors[idx % pieColors.length]
    }));

    // 10. Monthly Submission Trend Chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = months.map((month, idx) => {
      const monthSubs = collegeSubmissions.filter(sub => {
        const dateStr = sub.submittedAt || sub.date;
        if (!dateStr || typeof dateStr !== 'string') return false;
        const d = new Date(dateStr);
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      });
      return {
        month,
        approved: monthSubs.filter(s => s.status === 'approved').length,
        rejected: monthSubs.filter(s => s.status === 'rejected').length,
        pending: monthSubs.filter(s => s.status === 'pending').length
      };
    });

    // 11. Recent submissions (last 5)
    const recentSubmissions = [...collegeSubmissions]
      .filter(sub => sub && (sub.submittedAt || sub.date))
      .sort((a, b) => new Date(b.submittedAt || b.date) - new Date(a.submittedAt || a.date))
      .slice(0, 5);

    setStats({
      totalDepts: depts.length,
      totalUsers: collegeUsers.length,
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
      totalApprovals,
      studentActivities: totalActivities,
      topStudents,
      topMentor,
      mentorPerformances,
      recentSubmissions,
      deptChartData,
      categoryChartData,
      monthlyTrends,
      placementFactors
    });
  }, [user]);

  // Load database seed/mock values on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==============================================================================
  // FUTURE BACKEND INTEGRATION:
  // Once the Node.js/Java/Python backend API is established, you can rewrite the
  // handleRefresh / loadData logic to fetch analytics directly from the server.
  // Example:
  //
  // const handleRefresh = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`/api/college-admin/dashboard?college=${encodeURIComponent(user.college)}`);
  //     const data = await res.json();
  //     setStats(data);
  //     setLastUpdated(new Date().toLocaleTimeString());
  //     showToast('Dashboard data updated in real-time!', 'success');
  //   } catch(e) {
  //     showToast('Failed to refresh backend data', 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // ==============================================================================

  const handleDownloadReport = () => {
    if (!user) return;
    const collegeName = user.college || 'Our Institution';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocked! Please allow popups to download report.', 'error');
      return;
    }
    
    const studentsHtml = stats.topStudents.map((stu, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 600; text-align: left;">#${i + 1} ${stu.name}</td>
        <td style="padding: 12px; text-align: left;">${stu.department}</td>
        <td style="padding: 12px; text-align: left;">${stu.rollNo || 'N/A'}</td>
        <td style="padding: 12px; font-weight: bold; color: #ea580c; text-align: right;">${stu.totalCredits} Cr</td>
      </tr>
    `).join('');

    const mentorsHtml = stats.mentorPerformances.map((m, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 600; text-align: left;">${m.name}</td>
        <td style="padding: 12px; text-align: left;">${m.department}</td>
        <td style="padding: 12px; font-weight: bold; color: #2563eb; text-align: center;">${m.successRate}% Success</td>
        <td style="padding: 12px; text-align: right;">${m.approvedCount} approved (${m.totalCreditsGuided} Cr guided)</td>
      </tr>
    `).join('');

    const recentSubmissionsHtml = stats.recentSubmissions.map(sub => `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px;">
        <td style="padding: 8px; text-align: left;">${sub.studentName}</td>
        <td style="padding: 8px; text-align: left; font-weight: 500;">${sub.title}</td>
        <td style="padding: 8px; text-align: left;">${sub.type}</td>
        <td style="padding: 8px; font-weight: bold; text-align: center;">+${sub.credits}</td>
        <td style="padding: 8px; text-align: right;">${sub.submittedAt || sub.date}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${collegeName} - SPAT Placement Report</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background: #ffffff; }
            .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 32px; font-weight: 900; color: #ea580c; letter-spacing: 1px; }
            .college-title { font-size: 18px; font-weight: 700; color: #334155; text-align: right; }
            .report-title { text-align: center; font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; color: #0f172a; letter-spacing: 0.5px; }
            .section-title { font-size: 15px; font-weight: 700; background: #f8fafc; border-left: 4px solid #ea580c; padding: 10px 14px; margin-top: 35px; margin-bottom: 15px; text-transform: uppercase; color: #1e293b; }
            .grid-stats { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; background: #fdfbf7; }
            .stat-value { font-size: 24px; font-weight: 900; color: #ea580c; }
            .stat-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; padding: 12px; font-weight: 700; border-bottom: 2px solid #cbd5e1; color: #334155; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500; }
            .no-print { display: block; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print();" style="background: #ea580c; color: white; border: none; padding: 10px 22px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: background 0.2s;">
              Print / Save PDF
            </button>
          </div>
          <div class="header-container">
            <div>
              <span class="logo-text">SPAT</span>
              <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-top: 2px; letter-spacing: 0.5px;">STUDENT PERFORMANCE ARCHIVE & TRACKER</div>
            </div>
            <div class="college-title">
              ${collegeName}
              <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">Placement & Industry Relations Division</div>
            </div>
          </div>
          
          <div class="report-title">Placement Opportunity & Student Readiness Report</div>
          
          <p style="font-size: 13px; color: #475569; margin-bottom: 30px; line-height: 1.6;">
            This report profiles key performance vectors demonstrating corporate readiness, practical competencies, and experiential learning metrics. It compiles aggregate participation statistics for Hackathons, Certifications, Internships, and Core Projects designed to showcase student capabilities to hiring partners.
          </p>

          <div class="section-title">Placement Readiness Vectors</div>
          <div class="grid-stats">
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.hackathonsCount} (Wins: ${stats.placementFactors.hackathonWins})</div>
              <div class="stat-label">Hackathons participations & wins</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.certificationsCount}</div>
              <div class="stat-label">Global industry certifications</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.internshipsCount}</div>
              <div class="stat-label">Corporate internships completed</div>
            </div>
          </div>
          <div class="grid-stats">
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.projectsCount}</div>
              <div class="stat-label">Technical projects built</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.placementPrepCount}</div>
              <div class="stat-label">Placement prep courses completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.studentActivities}</div>
              <div class="stat-label">Total student activities logged</div>
            </div>
          </div>

          <div class="section-title">Special Credentials & Career Distinctions</div>
          <div class="grid-stats">
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.ppoCount}</div>
              <div class="stat-label">Pre-Placement Offers (PPOs)</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.researchCount}</div>
              <div class="stat-label">Research papers & Patents</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.openSourceCount}</div>
              <div class="stat-label">Open Source Contributors</div>
            </div>
          </div>
          <div class="grid-stats">
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.examsCount}</div>
              <div class="stat-label">Competitive Exams Qualified</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.academicExcellenceCount}</div>
              <div class="stat-label">Academic Toppers (SGPA > 9.0)</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.placementFactors.startupFreelanceCount}</div>
              <div class="stat-label">Startups & Freelancers</div>
            </div>
          </div>

          <div class="section-title">Top 3 Student Performers (Preferred Candidates)</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Candidate Name</th>
                <th style="text-align: left;">Specialization / Department</th>
                <th style="text-align: left;">Roll Number</th>
                <th style="text-align: right;">Total Credits</th>
              </tr>
            </thead>
            <tbody>
              ${studentsHtml || '<tr><td colspan="4" style="text-align:center; padding:15px; color:#64748b;">No candidate data recorded</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Faculty Mentor Guidance & Student Success Rate</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Mentor Faculty</th>
                <th style="text-align: left;">Department</th>
                <th style="text-align: center;">Guidance Success Rate</th>
                <th style="text-align: right;">Approved Submissions</th>
              </tr>
            </thead>
            <tbody>
              ${mentorsHtml || '<tr><td colspan="4" style="text-align:center; padding:15px; color:#64748b;">No mentor guidance metrics available</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()} · SPAT Secure Report System
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate API network latency
    setTimeout(() => {
      loadData();
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
      showToast('Dashboard stats updated successfully!', 'success');
    }, 700);
  }, [loadData, showToast]);

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {ToastComponent}

      {/* ─── Contract Timeline Bar ─── */}
      {collegeObj && (
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
            {/* Date range pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 border-orange-200/60 dark:border-orange-950/50">
              <span className="font-bold text-orange-600 dark:text-orange-400">License Term:</span>
              {collegeObj.contractStart
                ? <span>{fmt(collegeObj.contractStart)} – {fmt(collegeObj.contractEnd)}</span>
                : <span className="italic text-slate-400">No contract date set</span>
              }
            </div>

            {/* Days remaining pill */}
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

            {/* Status pill */}
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              collegeObj.status !== 'inactive'
                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-950'
                : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-950'
            }`}>
              <div className={`w-2 h-2 rounded-full ${collegeObj.status !== 'inactive' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
              <span>{collegeObj.status !== 'inactive' ? 'Active Subscription' : 'Inactive License'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            College Dashboard
          </h1>
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

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<Layers className="w-5 h-5" />}
          label="Departments"
          value={stats.totalDepts}
          color="primary"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats.totalUsers}
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5" />}
          label="Active Users"
          value={stats.activeUsers}
          color="green"
        />
        <StatCard
          icon={<UserX className="w-5 h-5" />}
          label="Inactive Users"
          value={stats.inactiveUsers}
          color="red"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5" />}
          label="Total Approvals"
          value={stats.totalApprovals}
          color="yellow"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Student Activities"
          value={stats.studentActivities}
          color="blue"
        />
      </div>

      {/* ─── Placement Showcase Factors ─── */}
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
          <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl border border-orange-100/50 dark:border-orange-950/30 text-center">
            <Trophy className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.placementFactors.hackathonsCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Hackathons Participated</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Wins: {stats.placementFactors.hackatonWins || stats.placementFactors.hackathonWins}</p>
          </div>
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-100/50 dark:border-blue-950/30 text-center">
            <Award className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.placementFactors.certificationsCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Global Certifications</p>
            <p className="text-[10px] text-slate-400 mt-1">AWS / GCP / Cisco / MS</p>
          </div>
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/30 text-center">
            <Users className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.placementFactors.internshipsCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Corporate Internships</p>
            <p className="text-[10px] text-slate-400 mt-1">Real-world industry work</p>
          </div>
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl border border-purple-100/50 dark:border-purple-950/30 text-center">
            <Layers className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.placementFactors.projectsCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Technical Projects</p>
            <p className="text-[10px] text-slate-400 mt-1">Mini & Major implementations</p>
          </div>
          <div className="p-4 bg-yellow-50/50 dark:bg-yellow-950/10 rounded-2xl border border-yellow-100/50 dark:border-yellow-950/30 text-center">
            <CheckSquare className="w-8 h-8 mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.placementFactors.placementPrepCount}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Placement Training</p>
            <p className="text-[10px] text-slate-400 mt-1">Mock Interviews & Aptitude</p>
          </div>
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
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.ppoCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">PPOs Received</p>
          </div>
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.researchCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Research papers</p>
          </div>
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.openSourceCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Open Source Contrib.</p>
          </div>
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.examsCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">GATE/Exams Qualified</p>
          </div>
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.academicExcellenceCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Academic Toppers</p>
          </div>
          <div className="p-3.5 bg-slate-50/50 dark:bg-dark-900/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.placementFactors.startupFreelanceCount}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Startups/Freelancers</p>
          </div>
        </div>
      </div>

      {/* ─── Top Performers & Mentors Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Students Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-orange-100 dark:border-orange-950/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-yellow-500" />
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
            {stats.topStudents.length > 0 ? (
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

        {/* Mentor Performance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-orange-100 dark:border-orange-950/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-blue-500" />
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
            {stats.mentorPerformances.length > 0 ? (
              stats.mentorPerformances.slice(0, 3).map((mentor, i) => {
                const colorClass = mentor.successRate >= 85 ? 'text-emerald-600 dark:text-emerald-400' : mentor.successRate >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400';
                const barBg = mentor.successRate >= 85 ? 'bg-emerald-500' : mentor.successRate >= 70 ? 'bg-blue-500' : 'bg-yellow-500';
                return (
                  <div key={mentor.id} className="flex flex-col p-3 bg-slate-50/50 dark:bg-dark-900/10 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={mentor.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{mentor.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{mentor.department}</p>
                      </div>
                      <span className={`text-sm font-extrabold ${colorClass}`}>
                        {mentor.successRate}% <span className="text-[10px] font-semibold text-slate-400">Success</span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barBg}`} style={{ width: `${mentor.successRate}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-medium">
                      <span>Approved: {mentor.approvedCount} subs</span>
                      <span>Guided: {mentor.totalCreditsGuided} Credits</span>
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
        {/* Department Credits Comparison Bar Chart */}
        <ChartCard
          title="Department Comparisons"
          subtitle="Total Approved Credits by Department"
          icon={BarChart2}
        >
          {stats.deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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

        {/* Monthly Submission Approval Trend */}
        <ChartCard
          title="Monthly Trends"
          subtitle="Submissions Approved, Pending, & Rejected"
          icon={TrendingUp}
        >
          {stats.monthlyTrends.some(t => t.approved > 0 || t.pending > 0 || t.rejected > 0) ? (
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

        {/* Activity Categories Distribution */}
        <ChartCard
          title="Activity Distribution"
          subtitle="Total Submissions by Categories"
          icon={PieIcon}
        >
          {stats.categoryChartData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-4">
              <div className="w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.categoryChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0 overflow-y-auto max-h-[160px] text-xs">
                {stats.categoryChartData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
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

      {/* ─── Recent Submissions & Activities ─── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-950/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/40">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Recent Student Activities</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest submissions uploaded by students</p>
            </div>
          </div>
        </div>

        {stats.recentSubmissions.length === 0 ? (
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
                  <th className="pb-3 pr-4">Credits Granted</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSubmissions.map((sub) => {
                  const badgeVariant = 
                    sub.status === 'approved' ? 'green' : 
                    sub.status === 'rejected' ? 'red' : 'yellow';
                  return (
                    <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-900/10 transition-colors">
                      <td className="py-3.5 pr-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {sub.studentName}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                        {sub.title}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {sub.type}
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-slate-800 dark:text-slate-200">
                        {sub.status === 'approved' ? `+${sub.credits}` : '0'}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {sub.submittedAt || sub.date}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <Badge variant={badgeVariant}>
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
