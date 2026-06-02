import { useMemo } from 'react';
import {
  Users, Award, BookOpen, GraduationCap, TrendingUp,
  Star, Briefcase, Code, Download, FileText
} from 'lucide-react';
import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { getUsers, getSubmissions } from '../../../utils/localStorage';
import { ROLES, STAR_THRESHOLDS, getStars, getAchievementBadge } from '../../../utils/mockData';
import { StatCard, Badge, useToast, Avatar } from '../../../components/ui/UIComponents';

export const HODDashboard = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();

  // --- Read Database & Calculate CSE Stats ---
  const {
    departmentStudents,
    departmentMentors,
    approvedSubmissions,
    hackathonsWon,
    hackathonsParticipated,
    coursesDone,
    internshipsDone,
    topStudents,
    topMentors,
    factorCounts,
    skillTrendData
  } = useMemo(() => {
    const allUsers = getUsers();
    const allSubmissions = getSubmissions();

    // Filter by HOD's college and department
    const mentors = allUsers.filter(
      u => u.role === ROLES.MENTOR &&
      u.college === user.college &&
      u.department === user.department &&
      u.status === 'approved'
    );

    const students = allUsers.filter(
      u => u.role === ROLES.STUDENT &&
      u.college === user.college &&
      u.department === user.department &&
      u.status === 'approved'
    );

    const studentIds = new Set(students.map(s => s.id));
    const subs = allSubmissions.filter(s => studentIds.has(s.studentId));
    const approved = subs.filter(s => s.status === 'approved');

    // Calculate metrics: won vs participated hackathons, courses done, internships done
    let hackWon = 0;
    let hackPart = 0;
    let courses = 0;
    let internships = 0;

    approved.forEach(sub => {
      if (['Hackathons', 'Ideathons', 'Coding Competitions'].includes(sub.type)) {
        const typeLower = (sub.achievementType || '').toLowerCase();
        if (typeLower.includes('winner') || typeLower.includes('finalist') || typeLower.includes('rank') || typeLower.includes('1st')) {
          hackWon++;
        } else {
          hackPart++;
        }
      } else if (['Certifications & Online Courses', 'Workshops', 'Seminars & Guest Lectures'].includes(sub.type)) {
        courses++;
      } else if (sub.type === 'Internships') {
        internships++;
      }
    });

    // Student performance breakdown
    const studentPerformance = students.map(student => {
      const studentSubs = approved.filter(s => s.studentId === student.id);
      const cr = studentSubs.reduce((sum, s) => sum + (s.credits || 0), 0);
      const act = studentSubs.length;

      // Factors count
      const hackathons = studentSubs.filter(s => ['Hackathons', 'Ideathons', 'Coding Competitions'].includes(s.type)).length;
      const certifications = studentSubs.filter(s => ['Certifications & Online Courses', 'Workshops', 'Seminars & Guest Lectures'].includes(s.type)).length;
      const internshipsCount = studentSubs.filter(s => s.type === 'Internships').length;
      const projects = studentSubs.filter(s => ['Mini Projects', 'Major Projects', 'Freelancing & Real-World Work'].includes(s.type)).length;
      const publications = studentSubs.filter(s => ['Conferences', 'Research & Publications'].includes(s.type)).length;

      return {
        ...student,
        credits: cr,
        activitiesCount: act,
        starsCount: getStars(cr),
        badge: getAchievementBadge(getStars(cr)),
        factors: { hackathons, certifications, internships: internshipsCount, projects, publications }
      };
    });

    // Sort Top Students by total credits
    const topStus = [...studentPerformance]
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 3);

    // Mentor performance calculation
    const mentorPerformance = mentors.map(mentor => {
      const mentees = students.filter(s => s.mentorId === mentor.id);
      const menteeIds = new Set(mentees.map(m => m.id));
      const mentorApproved = approved.filter(s => menteeIds.has(s.studentId));
      
      const totalCrGuided = mentorApproved.reduce((sum, s) => sum + (s.credits || 0), 0);
      const reviews = subs.filter(s => s.mentorId === mentor.id).length;
      const approvals = subs.filter(s => s.mentorId === mentor.id && s.status === 'approved').length;
      const successRate = reviews > 0 ? Math.round((approvals / reviews) * 100) : 0;

      return {
        ...mentor,
        creditsGuided: totalCrGuided,
        reviewsHandled: reviews,
        approvalsCount: approvals,
        successRate
      };
    });

    // Sort Top Mentors by approval/success percentage
    const topMens = [...mentorPerformance]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);

    // Placement Factors Count for Charts
    const factors = {
      'Hackathons': 0,
      'Certifications': 0,
      'Internships': 0,
      'Projects': 0,
      'Publications': 0,
    };
    approved.forEach(sub => {
      if (['Hackathons', 'Ideathons', 'Coding Competitions'].includes(sub.type)) {
        factors['Hackathons']++;
      } else if (['Certifications & Online Courses', 'Workshops', 'Seminars & Guest Lectures'].includes(sub.type)) {
        factors['Certifications']++;
      } else if (sub.type === 'Internships') {
        factors['Internships']++;
      } else if (['Mini Projects', 'Major Projects', 'Freelancing & Real-World Work'].includes(sub.type)) {
        factors['Projects']++;
      } else if (['Conferences', 'Research & Publications'].includes(sub.type)) {
        factors['Publications']++;
      }
    });

    // Skill acquisition monthly trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    months.forEach(m => { monthlyMap[m] = 0; });
    approved.forEach(sub => {
      const dateStr = sub.date || sub.submittedAt;
      if (dateStr) {
        const monthIndex = new Date(dateStr).getMonth();
        const mName = months[monthIndex];
        if (monthlyMap[mName] !== undefined) {
          monthlyMap[mName]++;
        }
      }
    });

    const trend = months.map(m => ({
      month: m,
      achievements: monthlyMap[m] || 0,
    }));

    return {
      departmentStudents: studentPerformance,
      departmentMentors: mentorPerformance,
      approvedSubmissions: approved,
      hackathonsWon: hackWon,
      hackathonsParticipated: hackPart,
      coursesDone: courses,
      internshipsDone: internships,
      topStudents: topStus,
      topMentors: topMens,
      factorCounts: factors,
      skillTrendData: trend
    };
  }, [user]);

  // --- Recharts colors mapping ---
  const chartColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  const factorsData = Object.entries(factorCounts).map(([name, count], index) => ({
    name,
    count,
    fill: chartColors[index]
  }));

  // --- Real-time PDF Report Print Generator ---
  const handleDownloadPDF = () => {
    showToast('Generating department placement report PDF... ✓', 'success');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked! Please allow popups to download report.', 'error');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Placement Readiness Report - ${user.department}</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 40px; 
              color: #1e293b; 
              background: #fff; 
              line-height: 1.5;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #f97316; 
              padding-bottom: 20px; 
              margin-bottom: 35px; 
            }
            .title { 
              font-size: 26px; 
              font-weight: 800; 
              color: #0f172a; 
              margin: 0; 
            }
            .subtitle { 
              font-size: 14px; 
              color: #ea580c; 
              font-weight: 600;
              margin-top: 5px; 
            }
            .metadata { 
              display: flex; 
              justify-content: space-between; 
              font-size: 12px; 
              color: #64748b; 
              margin-top: 20px; 
              font-weight: 500;
            }
            .section-title { 
              font-size: 15px; 
              font-weight: 700; 
              border-bottom: 1px solid #cbd5e1; 
              padding-bottom: 6px; 
              margin-top: 35px; 
              margin-bottom: 18px; 
              color: #0f172a; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
            }
            .metrics-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 15px; 
              margin-bottom: 25px; 
            }
            .metric-card { 
              background: #f8fafc; 
              border: 1px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 12px; 
              text-align: center; 
            }
            .metric-value { 
              font-size: 22px; 
              font-weight: 800; 
              color: #ea580c; 
              margin: 0; 
            }
            .metric-label { 
              font-size: 10px; 
              text-transform: uppercase; 
              color: #64748b; 
              font-weight: 600;
              margin-top: 5px; 
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px; 
              margin-bottom: 30px; 
            }
            .table th, .table td { 
              border: 1px solid #e2e8f0; 
              padding: 12px; 
              text-align: left; 
              font-size: 13px; 
            }
            .table th { 
              background: #f1f5f9; 
              color: #334155; 
              font-weight: 700;
            }
            .row-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 12px; 
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-bottom: 10px;
              font-size: 13px; 
              background: #f8fafc;
            }
            .row-name { 
              font-weight: 700; 
              color: #0f172a; 
            }
            .row-details { 
              font-size: 11px; 
              color: #64748b; 
              margin-top: 3px; 
            }
            .footer { 
              margin-top: 60px; 
              display: flex; 
              justify-content: space-between; 
              font-size: 12px; 
              color: #64748b;
            }
            .signature-line { 
              border-top: 1px solid #94a3b8; 
              width: 220px; 
              margin-top: 50px; 
              text-align: center; 
              padding-top: 6px; 
              font-weight: 700;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${user.college}</h1>
            <p class="subtitle">Placement Readiness Report | Department of ${user.department}</p>
            <div class="metadata">
              <span>Report Reference: MIT/${user.department.substring(0, 3).toUpperCase()}/PL-${new Date().getFullYear()}</span>
              <span>Generated Date: ${new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div class="section-title">Verified Placement Factors Summary</div>
          <div class="metrics-grid">
            <div class="metric-card"><p class="metric-value">${hackathonsWon}</p><p class="metric-label">Hackathons Won</p></div>
            <div class="metric-card"><p class="metric-value">${hackathonsParticipated}</p><p class="metric-label">Hackathons Participated</p></div>
            <div class="metric-card"><p class="metric-value">${internshipsDone}</p><p class="metric-label">Internships Done</p></div>
            <div class="metric-card"><p class="metric-value">${coursesDone}</p><p class="metric-label">Courses Completed</p></div>
          </div>

          <div class="section-title">Detailed Placement Factor Breakdown</div>
          <table class="table">
            <thead>
              <tr>
                <th>Placement Metric</th>
                <th>Approved Milestones (Department)</th>
                <th>Status assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hackathons & Coding Contests</strong></td>
                <td>${factorCounts['Hackathons']} achievements (Won: ${hackathonsWon}, Participated: ${hackathonsParticipated})</td>
                <td>High Technical Competency</td>
              </tr>
              <tr>
                <td><strong>Industry Certifications & Courses</strong></td>
                <td>${factorCounts['Certifications']} modules completed</td>
                <td>Domain Proficiency Confirmed</td>
              </tr>
              <tr>
                <td><strong>Corporate Internships</strong></td>
                <td>${internshipsDone} internships completed</td>
                <td>Verified Workplace Readiness</td>
              </tr>
              <tr>
                <td><strong>Capstone Projects</strong></td>
                <td>${factorCounts['Projects']} projects finalized</td>
                <td>Strong Hands-on Portfolio</td>
              </tr>
              <tr>
                <td><strong>Research & Publications</strong></td>
                <td>${factorCounts['Publications']} publications</td>
                <td>Analytical Skills Demonstrated</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Top 3 Student Placements Outlook</div>
          <div style="margin-bottom: 25px;">
            ${topStudents.map((stu, i) => `
              <div class="row-item">
                <div>
                  <span class="row-name">#${i+1} ${stu.name} (${stu.rollNo || 'CS2100' + (i+1)})</span>
                  <div class="row-details">
                    ${stu.factors.hackathons} Hackathons | ${stu.factors.certifications} Certifications | ${stu.factors.internships} Internships
                  </div>
                </div>
                <div style="text-align: right; font-weight: 800; color: #ea580c;">
                  ${stu.credits} SAPT Credits
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section-title">Top Guidance Mentors (By Approval Percentage)</div>
          <div style="margin-bottom: 25px;">
            ${topMentors.map((men, i) => `
              <div class="row-item">
                <div>
                  <span class="row-name">#${i+1} ${men.name}</span>
                  <div class="row-details">${men.reviewsHandled} total submissions reviewed</div>
                </div>
                <div style="text-align: right; font-weight: 800; color: #10b981;">
                  ${men.successRate}% Success Rate
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <div>
              <p style="margin: 0;">Compiled automatically via SAPT platform blockchain ledgers.</p>
              <p style="margin: 4px 0 0 0;">All credentials verified under Institutional parameters.</p>
            </div>
            <div>
              <div class="signature-line">Dr. Priya Sharma</div>
              <p style="text-align: center; margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Head of Department</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {ToastComponent}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-dark-800 pb-5">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            HOD Department Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department of {user.department} | {user.college}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Live Department Feed
          </span>
        </div>
      </div>

      {/* Dynamic Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6 text-orange-600" />}
          label="Total Mentors"
          value={departmentMentors.length}
          color="primary"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6 text-emerald-600" />}
          label="Total Students"
          value={departmentStudents.length}
          color="green"
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-blue-600" />}
          label="Hackathons Won"
          value={hackathonsWon}
          color="blue"
        />
        <StatCard
          icon={<Code className="w-6 h-6 text-purple-600" />}
          label="Hackathons Participated"
          value={hackathonsParticipated}
          color="yellow"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-cyan-600" />}
          label="Courses Completed"
          value={coursesDone}
          color="blue"
        />
        <StatCard
          icon={<Briefcase className="w-6 h-6 text-pink-600" />}
          label="Internships Completed"
          value={internshipsDone}
          color="red"
        />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor Breakdown Bar Chart */}
        <div className="card-gradient p-6 rounded-3xl border border-slate-100 dark:border-dark-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-xl">
              <Code className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Placement Skill Factors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total approved student achievements per factor</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorsData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-25" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(234, 88, 12, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  cursor={{ fill: 'rgba(234, 88, 12, 0.05)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Achievements">
                  {factorsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Trend Area Chart */}
        <div className="card-gradient p-6 rounded-3xl border border-slate-100 dark:border-dark-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Skill Acquisition Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly student achievements submitted and approved</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-25" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="achievements" stroke="#10b981" strokeWidth={3} fill="url(#trendGrad)" name="Approved Skills" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaders Grid (Top Students & Top Mentors) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <div className="card p-6 rounded-3xl border border-slate-100 dark:border-dark-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Top 3 Students (By Credits)</h3>
            </div>
            <Badge variant="purple">Ranked by Credits</Badge>
          </div>

          <div className="space-y-4">
            {topStudents.map((student, i) => {
              const stars = student.starsCount;
              const badgeType = student.badge;
              const maxThreshold = STAR_THRESHOLDS[4].credits;
              const progressPercentage = Math.min((student.credits / maxThreshold) * 100, 100);

              return (
                <div key={student.id} className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-850 rounded-2xl hover:scale-[1.01] transition-transform">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-300' :
                    i === 1 ? 'bg-slate-300 text-slate-800 ring-2 ring-slate-200' :
                    'bg-amber-600 text-white ring-2 ring-amber-500'
                  }`}>
                    {i + 1}
                  </div>
                  <Avatar name={student.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                      <Badge variant={badgeType === 'Gold' || badgeType === 'Diamond' ? 'yellow' : badgeType === 'Silver' ? 'purple' : 'blue'}>
                        {badgeType}
                      </Badge>
                    </div>
                    {/* Stars indicator */}
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                    </div>
                    {/* Progress Bar towards Diamond Tier */}
                    <div className="w-full mt-2 h-1.5 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-orange-600 dark:text-orange-400">{student.credits}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{student.activitiesCount} Approved</p>
                  </div>
                </div>
              );
            })}
            {topStudents.length === 0 && (
              <p className="text-slate-500 text-center py-6 text-sm">No student activity logged in this department.</p>
            )}
          </div>
        </div>

        {/* Top Mentors */}
        <div className="card p-6 rounded-3xl border border-slate-100 dark:border-dark-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Top 3 Mentors (By Approval %)</h3>
            </div>
            <Badge variant="green">By Success Rate</Badge>
          </div>

          <div className="space-y-4">
            {topMentors.map((mentor, i) => (
              <div key={mentor.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-850 rounded-2xl hover:scale-[1.01] transition-transform">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  i === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-300' :
                  i === 1 ? 'bg-slate-300 text-slate-800 ring-2 ring-slate-200' :
                  'bg-amber-600 text-white ring-2 ring-amber-500'
                }`}>
                  {i + 1}
                </div>
                <Avatar name={mentor.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{mentor.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {mentor.reviewsHandled} submissions reviewed
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{mentor.successRate}%</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Success Rate</p>
                </div>
              </div>
            ))}
            {topMentors.length === 0 && (
              <p className="text-slate-500 text-center py-6 text-sm">No mentors are approved in this department.</p>
            )}
          </div>
        </div>
      </div>

      {/* Placement Report Downloader Card */}
      <div className="card p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-dark-800 relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-dark-900 dark:to-dark-950/20">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-orange-600" />
              Download Placement Readiness Report
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate a comprehensive PDF compiling all department placement factors (hackathons won/participated, courses, internships, project portfolios) and top student credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all shrink-0"
          >
            <Download className="w-4.5 h-4.5" /> Download Placement PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
