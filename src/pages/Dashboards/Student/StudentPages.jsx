import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, BookOpen, BarChart2, User, Plus, Download, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addSubmission, getSubmissionsByStudent, addLog, getLogsByStudent, getTotalCredits, updateUser, generateId, getCustomCategories, addCustomCategory, getUsers, getSubmissions, saveSubmissions } from '../../../utils/localStorage';
import { ACTIVITY_TYPES, ACTIVITY_CATEGORIES, CREDIT_MAP, getStars, getAchievementBadge } from '../../../utils/mockData';
import { StatCard, Badge, useToast, EmptyState, Avatar, StarsDisplay } from '../../../components/ui/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiUpdateProfile, apiGetMentors } from '../../../utils/api';

// ---- Submission Form ----
export const StudentSubmission = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle re-submission pre-population
  const resubmit = location.state?.resubmitActivity || null;

  const [form, setForm] = useState({
    type: resubmit?.type || '',
    achievementType: resubmit?.achievementType || '',
    title: resubmit?.title || '',
    date: resubmit?.date || '',
    description: resubmit?.description || '',
    certificate: resubmit?.certificateFile || '',
    presentationFile: resubmit?.presentationFile || '',
    documentFile: resubmit?.documentFile || '',
    customCategory: '',
    customAchievementType: '',
    customPoints: 15,
  });

  const [customCats, setCustomCats] = useState(() => getCustomCategories());
  const [loading, setLoading] = useState(false);

  const allCategories = { ...ACTIVITY_CATEGORIES, ...customCats };
  const allTypes = [...ACTIVITY_TYPES, ...Object.keys(customCats).filter(t => !ACTIVITY_TYPES.includes(t))];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Sub-types for chosen category
  const subTypes = form.type && form.type !== 'Other' ? (allCategories[form.type] || []) : [];

  // Exact points for chosen achievement type
  const exactPoints = form.type === 'Other'
    ? Number(form.customPoints)
    : (subTypes.find(s => s.label === form.achievementType)?.points ?? null);

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalCategory = form.type;
    let finalAchievementType = form.achievementType;
    let finalPoints = exactPoints;

    if (form.type === 'Other') {
      if (!form.customCategory.trim()) {
        showToast('Please enter custom category name', 'warning');
        return;
      }
      if (!form.customAchievementType.trim()) {
        showToast('Please enter achievement type', 'warning');
        return;
      }
      finalCategory = form.customCategory.trim();
      finalAchievementType = form.customAchievementType.trim();
      finalPoints = Number(form.customPoints) || 15;

      // Add to persistent custom categories in system database
      addCustomCategory(finalCategory, finalAchievementType, finalPoints);
      // Reload state so it refreshes instantly
      setCustomCats(getCustomCategories());
    } else {
      if (!form.achievementType) {
        showToast('Please select an achievement type', 'warning');
        return;
      }
    }

    // Verify at least one document is uploaded
    if (!form.certificate && !form.presentationFile && !form.documentFile) {
      showToast('Please upload at least one supporting document.', 'error');
      return;
    }

    setLoading(true);

    const validDocs = [];
    if (form.certificate) validDocs.push({ name: form.certificate, type: 'certificate' });
    if (form.presentationFile) validDocs.push({ name: form.presentationFile, type: 'presentation' });
    if (form.documentFile) validDocs.push({ name: form.documentFile, type: 'document' });

    setTimeout(() => {
      addSubmission({
        id: generateId('sub'),
        studentId: user.id,
        studentName: user.name,
        mentorId: user.mentorId || '',
        title: form.title,
        type: finalCategory,
        achievementType: finalAchievementType,
        suggestedCredits: finalPoints,
        date: form.date,
        description: form.description,
        status: 'pending',
        credits: 0,
        review: '',
        fileUrl: form.certificate ? '#' : null,
        presentationUrl: form.presentationFile ? '#' : null,
        documentUrl: form.documentFile ? '#' : null,
        certificateFile: form.certificate || null,
        presentationFile: form.presentationFile || null,
        documentFile: form.documentFile || null,
        allDocuments: validDocs,
        submittedAt: new Date().toISOString().split('T')[0],
      });

      showToast(resubmit ? 'Correction submission uploaded!' : 'Submission uploaded! Waiting for mentor review.', 'success');
      
      // Clear state
      setForm({
        type: '',
        achievementType: '',
        title: '',
        date: '',
        description: '',
        certificate: '',
        presentationFile: '',
        documentFile: '',
        customCategory: '',
        customAchievementType: '',
        customPoints: 15,
      });
      setLoading(false);

      // If we resubmitted, clear history state
      if (resubmit) {
        navigate('/dashboard/student/submission', { replace: true, state: null });
      }
    }, 800);
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {resubmit ? 'Re-Submit Correction' : 'Upload Submission'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {resubmit ? 'Make necessary corrections as requested by your mentor' : 'Submit your activities for mentor review and credits'}
        </p>
      </div>

      {resubmit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Mentor Feedback Rejection Review:</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1 italic">"{resubmit.review}"</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ---- Activity Category ---- */}
          <div>
            <label className="label-field">Activity Category</label>
            <select
              className="select-field"
              value={form.type}
              onChange={e => { set('type', e.target.value); set('achievementType', ''); }}
              required
            >
              <option value="">Select a category</option>
              {allTypes.map(t => <option key={t}>{t}</option>)}
              <option value="Other">Other (Add New Category)</option>
            </select>
          </div>

          {/* ---- Custom Category fields if "Other" selected ---- */}
          {form.type === 'Other' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/40 rounded-xl space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <span>➕</span> Create New Custom Activity Category
              </h4>
              <div>
                <label className="label-field text-xs">New Category Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Cybersecurity Certifications"
                  value={form.customCategory}
                  onChange={e => set('customCategory', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Achievement / Milestone / Level Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. CEH Certified Professional"
                  value={form.customAchievementType}
                  onChange={e => set('customAchievementType', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field text-xs">Suggested Credits / Points</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  className="input-field"
                  value={form.customPoints}
                  onChange={e => set('customPoints', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* ---- Achievement / Activity Type ---- */}
          {form.type && form.type !== 'Other' && (
            <div>
              <label className="label-field">Achievement / Activity Type</label>
              <select
                className="select-field"
                value={form.achievementType}
                onChange={e => set('achievementType', e.target.value)}
                required
              >
                <option value="">Select achievement type</option>
                {subTypes.map(s => (
                  <option key={s.label} value={s.label}>
                    {s.label} — {s.points} pts
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ---- Title ---- */}
          <div>
            <label className="label-field">Activity Title</label>
            <input
              className="input-field"
              placeholder="e.g. First Prize – Smart India Hackathon 2024"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* ---- Date ---- */}
          <div>
            <label className="label-field">Activity Date</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* ---- Description ---- */}
          <div>
            <label className="label-field">Description</label>
            <textarea
              className="input-field h-32 resize-none"
              placeholder="Describe your activity, achievements, and impact..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </div>

          {/* ---- File Uploads ---- */}
          <div className="space-y-3 pt-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-primary-500" />
              Supporting Documents <span className="font-normal text-slate-400 dark:text-slate-500">(at least one required)</span>
            </p>

            {/* Certificate / PDF / Image */}
            <div>
              <label className="label-field text-xs">Certificate / Screenshot / PDF</label>
              <label className="flex items-center gap-3 input-field cursor-pointer hover:border-primary-400 transition-colors group">
                <FileText className="w-5 h-5 text-primary-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className={`text-sm truncate flex-1 ${form.certificate ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                  {form.certificate || 'Upload PDF, JPG, PNG…'}
                </span>
                {form.certificate && (
                  <span className="text-xs text-emerald-500 shrink-0">✓ Selected</span>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => set('certificate', e.target.files[0]?.name || '')}
                />
              </label>
            </div>

            {/* Presentation File – PPT/PPTX */}
            <div>
              <label className="label-field text-xs">
                Presentation File <span className="text-primary-500 font-medium">(PPT / PPTX)</span>
              </label>
              <label className="flex items-center gap-3 input-field cursor-pointer hover:border-primary-400 transition-colors group">
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">📊</span>
                <span className={`text-sm truncate flex-1 ${form.presentationFile ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                  {form.presentationFile || 'Upload PowerPoint presentation (.ppt / .pptx)…'}
                </span>
                {form.presentationFile && (
                  <span className="text-xs text-emerald-500 shrink-0">✓ Selected</span>
                )}
                <input
                  type="file"
                  accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={e => set('presentationFile', e.target.files[0]?.name || '')}
                />
              </label>
            </div>

            {/* Word Document / Report / Spreadsheet */}
            <div>
              <label className="label-field text-xs">
                Report / Document / Spreadsheet <span className="text-primary-500 font-medium">(DOC / DOCX / XLS / XLSX / PDF)</span>
              </label>
              <label className="flex items-center gap-3 input-field cursor-pointer hover:border-primary-400 transition-colors group">
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">📝</span>
                <span className={`text-sm truncate flex-1 ${form.documentFile ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                  {form.documentFile || 'Upload Word, Excel document or PDF (.doc / .docx / .xls / .xlsx / .pdf)…'}
                </span>
                {form.documentFile && (
                  <span className="text-xs text-emerald-500 shrink-0">✓ Selected</span>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  className="hidden"
                  onChange={e => set('documentFile', e.target.files[0]?.name || '')}
                />
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Uploading...' : <><UploadCloud className="w-5 h-5" /> Submit Activity</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---- Daily Logs ----
export const StudentLogs = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [logs, setLogs] = useState(() => getLogsByStudent(user.id));
  const [form, setForm] = useState({ title: '', description: '', links: '' });
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newLog = { id: generateId('log'), studentId: user.id, date: today, ...form };
      addLog(newLog);
      setLogs(getLogsByStudent(user.id));
      showToast('Log added!', 'success');
      setForm({ title: '', description: '', links: '' });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Daily Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record your daily academic activities</p>
      </div>

      {/* Add form */}
      <div className="card mb-8">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-500" /> Add Today's Log</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label-field">Title</label>
            <input className="input-field" placeholder="What did you do today?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label-field">Date</label>
            <input type="date" className="input-field" value={today} readOnly />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field h-24 resize-none" placeholder="Describe what you learned or accomplished..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <label className="label-field">Reference Links (optional)</label>
            <input className="input-field" placeholder="https://..." value={form.links} onChange={e => setForm(f => ({ ...f, links: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Adding...' : 'Add Log'}
          </button>
        </form>
      </div>

      {/* Log History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-white">Log History ({logs.length})</h2>
          {logs.length > 0 && (
            <button
              onClick={() => {
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;
                const content = `
                  <html>
                    <head>
                      <title>Daily Activity Logs - ${user.name}</title>
                      <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c0f00; background-color: #ffffff; }
                        .header { border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .app-logo { font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px; }
                        .college-name { font-size: 14px; font-weight: 700; color: #7c2d12; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; }
                        .title { font-size: 22px; font-weight: 800; color: #1c0f00; margin-bottom: 5px; }
                        .details { margin-bottom: 25px; font-size: 14px; background: #fff7ed; padding: 15px; border-radius: 12px; border: 1px solid #fed7aa; }
                        .details p { margin: 6px 0; color: #44170a; }
                        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        .table th, .table td { border: 1px solid #fed7aa; padding: 12px; text-align: left; font-size: 13px; }
                        .table th { background: #fff7ed; color: #7c2d12; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                        .table td { color: #1c0f00; }
                      </style>
                    </head>
                    <body>
                      <div class="header">
                        <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
                          <img src="/spat-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                          <span class="logo-text" style="font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">SPAT</span>
                        </div>
                        <div class="college-name">${user.college || 'SPAT Partner Institute'}</div>
                      </div>
                      <div class="title">Daily Activity Logs Report</div>
                      <div class="details">
                        <p><strong>Student Name:</strong> ${user.name}</p>
                        <p><strong>Roll Number:</strong> ${user.rollNo || 'N/A'}</p>
                        <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
                      </div>
                      <h3 style="color: #7c2d12; font-size: 16px; margin-top: 20px;">Logged Daily Activities</h3>
                      <table class="table">
                        <thead>
                          <tr>
                            <th style="width: 120px;">Date</th>
                            <th style="width: 200px;">Task Title</th>
                            <th>Detailed Description</th>
                            <th>Resource Links</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${logs.map(l => `
                            <tr>
                              <td>${l.date}</td>
                              <td><strong>${l.title}</strong></td>
                              <td>${l.description}</td>
                              <td>${l.links ? `<a href="${l.links}" target="_blank" style="color: #ea580c; text-decoration: underline;">${l.links}</a>` : '–'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      <script>window.onload = function() { window.print(); }</script>
                    </body>
                  </html>
                `;
                printWindow.document.write(content);
                printWindow.document.close();
              }}
              className="btn-secondary text-xs gap-1"
            >
              <Download className="w-4 h-4" /> Export Logs
            </button>
          )}
        </div>
        {logs.length === 0 ? (
          <div className="card"><EmptyState icon={<BookOpen className="w-12 h-12" />} title="No logs yet" subtitle="Start adding your daily activities" /></div>
        ) : logs.map(l => (
          <div key={l.id} className="card border-l-4 border-primary-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{l.title}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{l.date}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{l.description}</p>
            {l.links && <a href={l.links} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline mt-1 block">{l.links}</a>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Metrics ----
export const StudentMetrics = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const submissions = getSubmissionsByStudent(user.id);
  const totalCredits = getTotalCredits(user.id);
  const stars = getStars(totalCredits);
  const badge = getAchievementBadge(stars);
  const approved = submissions.filter(s => s.status === 'approved');
  const rejected = submissions.filter(s => s.status === 'rejected');
  const pending = submissions.filter(s => s.status === 'pending');

  const statusColors = { approved: '#10b981', rejected: '#ef4444', pending: '#f59e0b' };
  const pieData = [
    { name: 'Approved', value: approved.length, color: '#10b981' },
    { name: 'Rejected', value: rejected.length, color: '#ef4444' },
    { name: 'Pending', value: pending.length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Credit growth chart
  const sortedApproved = [...approved].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  let cumulative = 0;
  const growthData = sortedApproved.map(s => {
    cumulative += s.credits;
    return { date: s.submittedAt?.slice(0, 7) || s.date?.slice(0, 7), credits: cumulative };
  });

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Metrics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your performance and achievements</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<FileText className="w-6 h-6" />} label="Total Submissions" value={submissions.length} color="primary" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Approved" value={approved.length} color="green" />
        <StatCard icon={<XCircle className="w-6 h-6" />} label="Rejected" value={rejected.length} color="red" />
        <StatCard icon={<BarChart2 className="w-6 h-6" />} label="Total Credits" value={totalCredits} color="yellow" />
      </div>

      {/* Star achievement */}
      <div className="card mb-8 bg-gradient-to-r from-primary-600 to-accent-500 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-100 text-sm font-medium">Achievement Level</p>
            <h2 className="font-display text-3xl font-bold mt-1">{badge}</h2>
            <p className="text-primary-100 text-sm mt-1">{totalCredits} credits earned</p>
          </div>
          <div className="text-right">
            <StarsDisplay count={stars} size="xl" />
            <p className="text-primary-100 text-xs mt-2">
              {stars < 5 ? `${[100,250,500,1000,2000][stars] - totalCredits} more for next star` : '🎉 Maximum stars!'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Credits Growth</h3>
          {growthData.length < 2 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Submit more activities to see growth</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="credits" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6, fill: '#ea580c' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Submission Status</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No submissions yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Submission Table */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">All Submissions</h3>
          <button
            onClick={() => {
              const printWindow = window.open('', '_blank');
              if (!printWindow) return;
              const content = `
                <html>
                  <head>
                    <title>Submissions Report - ${user.name}</title>
                    <style>
                      body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c0f00; background-color: #ffffff; }
                      .header { border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                      .app-logo { font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px; }
                      .college-name { font-size: 14px; font-weight: 700; color: #7c2d12; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; }
                      .title { font-size: 22px; font-weight: 800; color: #1c0f00; margin-bottom: 5px; }
                      .details { margin-bottom: 25px; font-size: 14px; background: #fff7ed; padding: 15px; border-radius: 12px; border: 1px solid #fed7aa; }
                      .details p { margin: 6px 0; color: #44170a; }
                      .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                      .table th, .table td { border: 1px solid #fed7aa; padding: 12px; text-align: left; font-size: 13px; }
                      .table th { background: #fff7ed; color: #7c2d12; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                      .table td { color: #1c0f00; }
                      .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 999px; }
                      .badge-approved { background-color: #d1fae5; color: #065f46; }
                      .badge-pending { background-color: #fef3c7; color: #92400e; }
                      .badge-rejected { background-color: #fee2e2; color: #991b1b; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div class="logo-container" style="display: flex; align-items: center; gap: 10px;">
                        <img src="/spat-logo1.png" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />
                        <span class="logo-text" style="font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">SPAT</span>
                      </div>
                      <div class="college-name">${user.college || 'SPAT Partner Institute'}</div>
                    </div>
                    <div class="title">Student Achievement & Submissions Report</div>
                    <div class="details">
                      <p><strong>Student Name:</strong> ${user.name}</p>
                      <p><strong>Roll Number:</strong> ${user.rollNo || 'N/A'}</p>
                      <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
                      <p><strong>Total Approved Credits:</strong> ${totalCredits} Points</p>
                    </div>
                    <h3 style="color: #7c2d12; font-size: 16px; margin-top: 20px;">All Submissions</h3>
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Achievement Type</th>
                          <th>Status</th>
                          <th>Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${submissions.map(s => {
                          const badgeClass = s.status === 'approved' ? 'badge-approved' : s.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
                          return `
                            <tr>
                              <td><strong>${s.title}</strong></td>
                              <td>${s.type}</td>
                              <td>${s.achievementType || '–'}</td>
                              <td><span class="badge ${badgeClass}">${s.status}</span></td>
                              <td style="font-weight: bold; color: #ea580c;">${s.credits || (s.suggestedCredits ? `~${s.suggestedCredits}` : '–')}</td>
                            </tr>
                          `;
                        }).join('')}
                        ${submissions.length === 0 ? '<tr><td colspan="5" style="text-align: center;">No submissions uploaded yet.</td></tr>' : ''}
                      </tbody>
                    </table>
                    <script>window.onload = function() { window.print(); }</script>
                  </body>
                </html>
              `;
              printWindow.document.write(content);
              printWindow.document.close();
            }}
            className="btn-secondary text-xs gap-1"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8"><EmptyState icon={<FileText className="w-12 h-12" />} title="No submissions yet" /></div>
        ) : (
          <table className="w-full">
            <thead><tr>
              <th className="table-th">Title</th>
              <th className="table-th">Category</th>
              <th className="table-th">Achievement Type</th>
              <th className="table-th">Status</th>
              <th className="table-th">Credits</th>
            </tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-700">
                  <td className="table-td font-medium text-sm">{s.title}</td>
                  <td className="table-td"><Badge variant="blue">{s.type}</Badge></td>
                  <td className="table-td text-xs text-slate-500 dark:text-slate-400">{s.achievementType || '–'}</td>
                  <td className="table-td"><Badge variant={s.status === 'approved' ? 'green' : s.status === 'rejected' ? 'red' : 'yellow'}>{s.status}</Badge></td>
                  <td className="table-td font-semibold text-primary-600 dark:text-primary-400">{s.credits || (s.suggestedCredits ? `~${s.suggestedCredits}` : '–')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ---- Profile ----
// ---- Profile ----
export const StudentProfile = () => {
  const { user, login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editPass, setEditPass] = useState(false);
  const [password, setPassword] = useState({ new: '', confirm: '' });
  const [avatar, setAvatar] = useState(user?.avatar || null);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: user?.college || '',
    department: user?.department || '',
    rollNo: user?.rollNo || '',
    phone: user?.phone || '',
    mentorId: user?.mentorId || '',
    mentorName: user?.mentorName || '',
  });

  const totalCredits = getTotalCredits(user.id);
  const stars = getStars(totalCredits);
  const badge = getAchievementBadge(stars);

  const [allMentors, setAllMentors] = useState([]);

  useEffect(() => {
    let active = true;
    if (user.college && user.department) {
      apiGetMentors(user.college, user.department).then(list => {
        if (active) setAllMentors(list);
      });
    }
    return () => { active = false; };
  }, [user.college, user.department]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce <= 1MB size limit
    const MAX_SIZE = 1024 * 1024; // 1MB
    if (file.size > MAX_SIZE) {
      showToast('Upload failed! File size exceeds 1MB limit. Please upload a smaller image of your ID card.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        const res = await apiUpdateProfile(user.id, { avatar: dataUrl });
        setAvatar(dataUrl);
        login(res.user);
        showToast('ID card photo uploaded successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to upload image', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }

    try {
      const res = await apiUpdateProfile(user.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        mentorId: editForm.mentorId,
        mentorName: editForm.mentorName,
      });

      login(res.user);
      showToast('Profile updated successfully!', 'success');
      setEditMode(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (password.new.length < 6) { showToast('Password min 6 chars', 'error'); return; }
    if (password.new !== password.confirm) { showToast('Passwords do not match', 'error'); return; }
    try {
      const res = await apiUpdateProfile(user.id, { password: password.new });
      login(res.user);
      showToast('Password updated!', 'success');
      setEditPass(false);
      setPassword({ new: '', confirm: '' });
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {ToastComponent}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and update your profile details</p>
        </div>
        <button
          onClick={() => {
            if (editMode) {
              setEditForm({
                name: user?.name || '',
                email: user?.email || '',
                college: user?.college || '',
                department: user?.department || '',
                rollNo: user?.rollNo || '',
                phone: user?.phone || '',
                mentorId: user?.mentorId || '',
                mentorName: user?.mentorName || '',
              });
            }
            setEditMode(!editMode);
          }}
          className="btn-secondary text-sm font-semibold"
        >
          {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Avatar Card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <Avatar name={user.name} src={avatar} size="xl" />
            <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow">
              <UploadCloud className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <StarsDisplay count={stars} size="md" />
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <Badge variant="purple">{badge}</Badge>
              <Badge variant="blue">{totalCredits} Credits</Badge>
            </div>
            
            {/* Warning Message */}
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl max-w-md">
              <p className="text-[11px] text-amber-700 dark:text-amber-350 leading-relaxed font-semibold">
                ⚠️ Verification Notice: Upload only your official college ID card photo. Do not upload personal photos. Limit: 1MB.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          {editMode ? 'Edit Profile Details' : 'Profile Details'}
        </h3>
        
        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="label-field text-xs">Full Name</label>
              <input
                className="input-field"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label-field text-xs">Roll Number</label>
              <input
                className="input-field"
                value={editForm.rollNo}
                placeholder="e.g. CS21001"
                onChange={e => setEditForm(f => ({ ...f, rollNo: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field text-xs">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field text-xs">Contact Number</label>
              <input
                className="input-field"
                value={editForm.phone}
                placeholder="e.g. +91 9876543210"
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field text-xs">College Name</label>
              <input
                className="input-field"
                value={editForm.college}
                onChange={e => setEditForm(f => ({ ...f, college: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field text-xs">Department</label>
              <input
                className="input-field"
                value={editForm.department}
                onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
              />
            </div>

            <div>
              <label className="label-field text-xs">Assigned Mentor</label>
              <select
                className="select-field"
                value={editForm.mentorId}
                onChange={e => {
                  const selectedMentor = allMentors.find(m => m.id === e.target.value);
                  setEditForm(f => ({
                    ...f,
                    mentorId: e.target.value,
                    mentorName: selectedMentor ? selectedMentor.name : ''
                  }));
                }}
              >
                <option value="">Select a mentor</option>
                {allMentors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              className="btn-primary w-full justify-center py-2.5 font-bold"
            >
              Save Details
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              ['Full Name', user.name],
              ['Roll Number', user.rollNo || 'Not specified'],
              ['Email', user.email],
              ['Phone', user.phone || 'Not specified'],
              ['College', user.college],
              ['Department', user.department],
              ['Mentor', user.mentorName || 'Not assigned'],
              ['Role', user.role],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-dark-700 last:border-0">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
                <span className="text-sm text-slate-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Change Password</h3>
          <button onClick={() => setEditPass(!editPass)} className="btn-ghost text-sm">{editPass ? 'Cancel' : 'Change'}</button>
        </div>
        {editPass && (
          <div className="space-y-3">
            <div>
              <label className="label-field">New Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={password.new} onChange={e => setPassword(p => ({ ...p, new: e.target.value }))} />
            </div>
            <div>
              <label className="label-field">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button onClick={handlePasswordChange} className="btn-primary">Update Password</button>
          </div>
        )}
        {!editPass && <p className="text-sm text-slate-500 dark:text-slate-400">••••••••</p>}
      </div>
    </div>
  );
};

// ---- Student Reviews Page ----
export const StudentReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const submissions = getSubmissionsByStudent(user.id);
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending' || s.review);

  const approved = reviewedSubmissions.filter(s => s.status === 'approved');
  const rejected = reviewedSubmissions.filter(s => s.status === 'rejected');

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Mentor Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review comments and feedback given by your mentor on your submissions and logs
        </p>
      </div>

      {/* Review Metrics */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<FileText className="w-6 h-6" />} label="Reviewed Activities" value={reviewedSubmissions.length} color="primary" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Approved" value={approved.length} color="green" />
        <StatCard icon={<XCircle className="w-6 h-6" />} label="Rejected / Action Required" value={rejected.length} color="red" />
      </div>

      <div className="space-y-6">
        {reviewedSubmissions.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<BookOpen className="w-12 h-12 text-slate-355" />}
              title="No Reviews Yet"
              subtitle="Your mentor hasn't reviewed any of your submissions or daily logs yet. Once reviewed, feedback will appear here."
            />
          </div>
        ) : (
          reviewedSubmissions.map(s => {
            const isRejected = s.status === 'rejected';
            return (
              <div
                key={s.id}
                className={`card border-l-4 transition-all duration-300 ${
                  isRejected 
                    ? 'border-l-red-500 bg-red-50/10 dark:bg-red-950/5 border-red-100 dark:border-dark-800' 
                    : 'border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-100 dark:border-dark-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{s.submittedAt || s.date}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <Badge variant="blue">{s.type}</Badge>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <Badge variant={isRejected ? 'red' : 'green'}>
                        {isRejected ? 'Rejected (Requires Correction)' : 'Approved & Credited'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{s.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{s.description}</p>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <p className="text-xs text-slate-400">Awarded Credits</p>
                    <p className={`text-2xl font-extrabold ${isRejected ? 'text-slate-400 line-through' : 'text-emerald-500 dark:text-emerald-400'}`}>
                      {isRejected ? '0' : s.credits || s.suggestedCredits || '0'} pts
                    </p>
                  </div>
                </div>

                {/* Mentor Feedback Area */}
                <div className="mt-4 p-4 bg-slate-100 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-750">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                      👨‍🏫
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Mentor Comments & Advice:</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium">
                        {s.review ? `"${s.review}"` : '"No comments left by mentor."'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resubmission Action for Rejected activities */}
                {isRejected && (
                  <div className="mt-4 pt-3 border-t border-red-100 dark:border-red-950/35 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      ⚠️ <strong>Action Required:</strong> Please re-upload this activity after making the requested corrections.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/student/submission', { state: { resubmitActivity: s } })}
                      className="btn-primary py-2 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                    >
                      🔄 Edit & Re-Submit
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
