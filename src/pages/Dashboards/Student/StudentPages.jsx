import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, BookOpen, BarChart2, User, Plus, Download, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addSubmission, getSubmissionsByStudent, addLog, getLogsByStudent, getTotalCredits, updateUser, generateId, getCustomCategories, addCustomCategory, getUsers, getSubmissions, saveSubmissions } from '../../../utils/localStorage';
import { ACTIVITY_TYPES, ACTIVITY_CATEGORIES, CREDIT_MAP, getStars, getAchievementBadge } from '../../../utils/mockData';
import { StatCard, Badge, useToast, EmptyState, Avatar, StarsDisplay } from '../../../components/ui/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiUpdateProfile, apiGetMentors, studentApi } from '../../../utils/api';

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
    certificateFileObj: null,
    presentationFile: resubmit?.presentationFile || '',
    presentationFileObj: null,
    documentFile: resubmit?.documentFile || '',
    documentFileObj: null,
    customCategory: '',
    customAchievementType: '',
    customPoints: 15,
  });

  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    studentApi.getCategories()
      .then(map => {
        if (map) setCategoriesMap(map);
      })
      .catch(err => {
        console.error("Failed to load categories:", err);
      });
  }, []);

  const allTypes = Object.keys(categoriesMap);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Sub-types for chosen category
  const subTypes = form.type && form.type !== 'Other' ? (categoriesMap[form.type] || []) : [];

  // Exact points for chosen achievement type
  const exactPoints = form.type === 'Other'
    ? Number(form.customPoints)
    : (subTypes.find(s => s.label === form.achievementType)?.points ?? null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalCategory = form.type;
    let finalAchievementType = form.achievementType;
    let finalPoints = exactPoints;
    let categoryId = null;
    let subTypeId = null;

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
      finalPoints = 0;
    } else {
      if (!form.achievementType) {
        showToast('Please select an achievement type', 'warning');
        return;
      }
      const matchingSub = subTypes.find(s => s.label === form.achievementType);
      if (matchingSub) {
        categoryId = matchingSub.categoryId;
        subTypeId = matchingSub.id;
      }
    }

    // Verify at least one document is uploaded
    if (!form.certificate && !form.presentationFile && !form.documentFile) {
      showToast('Please upload at least one supporting document.', 'error');
      return;
    }

    setLoading(true);

    try {
      let certificateBase64 = null;
      let presentationBase64 = null;
      let documentBase64 = null;

      if (form.certificateFileObj) {
        certificateBase64 = await fileToBase64(form.certificateFileObj);
      }
      if (form.presentationFileObj) {
        presentationBase64 = await fileToBase64(form.presentationFileObj);
      }
      if (form.documentFileObj) {
        documentBase64 = await fileToBase64(form.documentFileObj);
      }

      // If "Other" (custom category/sub-type) is selected, create it first in backend
      if (form.type === 'Other') {
        const customRes = await studentApi.createCustomCategory({
          categoryName: finalCategory,
          achievementType: finalAchievementType,
          suggestedPoints: finalPoints
        });
        categoryId = customRes.categoryId;
        subTypeId = customRes.subTypeId;
        
        // Reload backend categories map
        const updatedCats = await studentApi.getCategories();
        if (updatedCats) setCategoriesMap(updatedCats);
      }

      // Submit activity points request to backend
      await studentApi.createSubmission({
        categoryId,
        subTypeId,
        categoryName: finalCategory,
        achievementType: finalAchievementType,
        title: form.title,
        description: form.description,
        activityDate: form.date,
        suggestedCredits: finalPoints,
        certificateFileName: form.certificate || null,
        certificateBase64,
        presentationFileName: form.presentationFile || null,
        presentationBase64,
        documentFileName: form.documentFile || null,
        documentBase64,
        isResubmission: !!resubmit,
        parentSubmissionId: resubmit?.id || null
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
        certificateFileObj: null,
        presentationFile: '',
        presentationFileObj: null,
        documentFile: '',
        documentFileObj: null,
        customCategory: '',
        customAchievementType: '',
        customPoints: 15,
      });

      // If we resubmitted, clear history state
      if (resubmit) {
        navigate('/dashboard/student/submission', { replace: true, state: null });
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {resubmit ? 'Correct Activity Submission' : 'Upload Submission'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {resubmit ? 'Submit corrections for your rejected activity' : 'Submit activity details for credits'}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="label-field text-xs">Activity Category</label>
              <select className="select-field" value={form.type} onChange={e => {
                setForm(f => ({ ...f, type: e.target.value, achievementType: '', customCategory: '', customAchievementType: '' }));
              }} required>
                <option value="">Select Category</option>
                {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other (Custom Category)</option>
              </select>
            </div>

            {/* Achievement Type (only show if not Other) */}
            {form.type && form.type !== 'Other' && (
              <div>
                <label className="label-field text-xs">Achievement / Level</label>
                <select className="select-field" value={form.achievementType} onChange={e => set('achievementType', e.target.value)} required>
                  <option value="">Select Achievement / Level</option>
                  {subTypes.map(s => (
                    <option key={s.id} value={s.label}>
                      {s.label} ({s.points} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Custom Category Fields */}
          {form.type === 'Other' && (
            <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 rounded-2xl border border-primary-200 dark:border-primary-800 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field text-xs text-primary-600 dark:text-primary-400 font-semibold">Custom Category Name</label>
                  <input className="input-field" placeholder="e.g. Community Service" value={form.customCategory} onChange={e => set('customCategory', e.target.value)} required />
                </div>
                <div>
                  <label className="label-field text-xs text-primary-600 dark:text-primary-400 font-semibold">Custom Level / Label</label>
                  <input className="input-field" placeholder="e.g. Coordinator" value={form.customAchievementType} onChange={e => set('customAchievementType', e.target.value)} required />
                </div>
              </div>
              <p className="text-xs text-primary-700 dark:text-primary-300 flex items-center gap-1.5 font-medium bg-primary-100/60 dark:bg-primary-900/40 p-2.5 rounded-xl">
                <span>ℹ️</span> Credits for custom categories will be evaluated and assigned by your Mentor upon submission review.
              </p>
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label className="label-field text-xs">Activity Title</label>
            <input className="input-field" placeholder="e.g. Smart India Hackathon 2024" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          {/* Activity Date */}
          <div>
            <label className="label-field text-xs">Activity Date</label>
            <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} required />
          </div>

          {/* Description */}
          <div>
            <label className="label-field text-xs">Description</label>
            <textarea className="input-field h-28 resize-none" placeholder="Provide details about your role, achievements, or topics covered..." value={form.description} onChange={e => set('description', e.target.value)} required />
          </div>

          {/* Supporting Documents Section */}
          <div className="p-5 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-750 space-y-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
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
                  onChange={e => {
                    const file = e.target.files[0];
                    setForm(f => ({ ...f, certificate: file ? file.name : '', certificateFileObj: file || null }));
                  }}
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
                  onChange={e => {
                    const file = e.target.files[0];
                    setForm(f => ({ ...f, presentationFile: file ? file.name : '', presentationFileObj: file || null }));
                  }}
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
                  onChange={e => {
                    const file = e.target.files[0];
                    setForm(f => ({ ...f, documentFile: file ? file.name : '', documentFileObj: file || null }));
                  }}
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
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', links: '' });
  const [loading, setLoading] = useState(false);
  const [correctingLogId, setCorrectingLogId] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    studentApi.getLogs()
      .then(list => {
        if (list) {
          setLogs(list);
          if (location.state?.resubmitLog) {
            const rl = location.state.resubmitLog;
            setCorrectingLogId(rl.id);
            setForm({ title: rl.title, description: rl.description, links: rl.links || '' });
            navigate(location.pathname, { replace: true, state: {} });
          }
        }
      })
      .catch(err => {
        console.error("Failed to load logs:", err);
      });
  }, [location.state]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (correctingLogId) {
        const updatedLog = await studentApi.updateLog(correctingLogId, {
          title: form.title,
          description: form.description,
          links: form.links
        });
        setLogs(prev => prev.map(l => l.id === correctingLogId ? updatedLog : l));
        showToast('Log corrections saved and re-submitted!', 'success');
        setCorrectingLogId(null);
      } else {
        const newLog = await studentApi.createLog({
          title: form.title,
          description: form.description,
          links: form.links
        });
        setLogs(prev => [newLog, ...prev]);
        showToast('Log added!', 'success');
      }
      setForm({ title: '', description: '', links: '' });
    } catch (err) {
      showToast(err.message || 'Failed to submit log', 'error');
    } finally {
      setLoading(false);
    }
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
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          {correctingLogId ? (
            <><Plus className="w-4 h-4 text-orange-500 animate-spin" /> Correct Log Entry</>
          ) : (
            <><Plus className="w-4 h-4 text-primary-500" /> Add Today's Log</>
          )}
        </h2>
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
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Submitting...' : correctingLogId ? 'Save Corrections & Re-Submit' : 'Add Log'}
            </button>
            {correctingLogId && (
              <button
                type="button"
                onClick={() => {
                  setCorrectingLogId(null);
                  setForm({ title: '', description: '', links: '' });
                }}
                className="btn-secondary px-4 justify-center"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Metrics ----
export const StudentMetrics = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getDashboardStats()
      .then(res => {
        if (res) setStats(res);
      })
      .catch(err => {
        console.error("Failed to load dashboard metrics:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="card text-center p-8">No metrics available</div>;
  }

  const { submissions, totalCredits, totalApproved, totalRejected, totalPending, stars, badge, growthData } = stats;

  const approved = submissions.filter(s => s.status === 'approved');
  const rejected = submissions.filter(s => s.status === 'rejected');
  const pending = submissions.filter(s => s.status === 'pending');

  const statusColors = { approved: '#10b981', rejected: '#ef4444', pending: '#f59e0b' };
  const pieData = [
    { name: 'Approved', value: approved.length, color: '#10b981' },
    { name: 'Rejected', value: rejected.length, color: '#ef4444' },
    { name: 'Pending', value: pending.length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

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
            onClick={async () => {
              // Fetch logo and convert to base64 data URI so it works in blank popup windows
              let logoDataUri = '';
              try {
                const resp = await fetch(`${window.location.origin}/sapt-logo1.png`);
                if (resp.ok) {
                  const blob = await resp.blob();
                  logoDataUri = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                  });
                }
              } catch (_) { /* logo not critical */ }

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
                        ${logoDataUri ? `<img src="${logoDataUri}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />` : ''}
                        <span class="logo-text" style="font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">SAPT</span>
                      </div>
                      <div class="college-name">${user.college || 'SAPT Partner Institute'}</div>
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
                          <th style="width: 180px;">Mentor Review</th>
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
                              <td>${s.review ? `<em>"${s.review}"</em>` : '–'}</td>
                            </tr>
                          `;
                        }).join('')}
                        ${submissions.length === 0 ? '<tr><td colspan="6" style="text-align: center;">No submissions uploaded yet.</td></tr>' : ''}
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
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
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

  const [totalCredits, setTotalCredits] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState('Beginner');

  useEffect(() => {
    studentApi.getDashboardStats()
      .then(res => {
        if (res) {
          setTotalCredits(res.totalCredits);
          setStars(res.stars);
          setBadge(res.badge);
        }
      })
      .catch(err => {
        console.error("Failed to load profile metrics:", err);
      });
  }, []);

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
        rollNo: editForm.rollNo,
      });

      login(res.user);
      showToast('Profile updated successfully!', 'success');
      setEditMode(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (!password.current) { showToast('Current password is required', 'error'); return; }
    if (password.new.length < 6) { showToast('Password min 6 chars', 'error'); return; }
    if (password.new !== password.confirm) { showToast('Passwords do not match', 'error'); return; }
    try {
      const res = await apiUpdateProfile(user.id, {
        currentPassword: password.current,
        password: password.new
      });
      login(res.user);
      showToast('Password updated!', 'success');
      setEditPass(false);
      setPassword({ current: '', new: '', confirm: '' });
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
              <label className="label-field text-xs">Current Password</label>
              <input type="password" className="input-field" placeholder="Enter current password" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))} />
            </div>
            <div>
              <label className="label-field text-xs">New Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={password.new} onChange={e => setPassword(p => ({ ...p, new: e.target.value }))} />
            </div>
            <div>
              <label className="label-field text-xs">Confirm Password</label>
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
  const [submissions, setSubmissions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'logs'

  useEffect(() => {
    studentApi.getDashboardStats()
      .then(res => {
        if (res) {
          if (res.submissions) setSubmissions(res.submissions);
          if (res.logs) setLogs(res.logs);
        }
      })
      .catch(err => {
        console.error("Failed to load reviewed submissions/logs:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending' || s.review);
  const reviewedLogs = logs.filter(l => l.reviewStatus !== 'pending' || l.mentorRemark);

  const approvedSubs = reviewedSubmissions.filter(s => s.status === 'approved');
  const rejectedSubs = reviewedSubmissions.filter(s => s.status === 'rejected');

  const approvedLogs = reviewedLogs.filter(l => l.reviewStatus === 'approved');
  const rejectedLogs = reviewedLogs.filter(l => l.reviewStatus === 'rejected');

  const handleExportSubmissions = async () => {
    let logoDataUri = '';
    try {
      const resp = await fetch(`${window.location.origin}/sapt-logo1.png`);
      if (resp.ok) {
        const blob = await resp.blob();
        logoDataUri = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (_) { /* logo not critical */ }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <html>
        <head>
          <title>Mentor Submission Reviews - ${user.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c0f00; background-color: #ffffff; }
            .header { border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
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
            .badge-rejected { background-color: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${logoDataUri ? `<img src="${logoDataUri}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />` : ''}
              <span style="font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">SAPT</span>
            </div>
            <div class="college-name">${user.college || 'SAPT Partner Institute'}</div>
          </div>
          <div class="title">Mentor Submission Reviews Report</div>
          <div class="details">
            <p><strong>Student Name:</strong> ${user.name}</p>
            <p><strong>Roll Number:</strong> ${user.rollNo || 'N/A'}</p>
            <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Credits</th>
                <th>Mentor Comments</th>
              </tr>
            </thead>
            <tbody>
              ${reviewedSubmissions.map(s => {
                const isRejected = s.status === 'rejected';
                return `<tr>
                  <td>${s.submittedAt || s.date || '–'}</td>
                  <td><strong>${s.title}</strong></td>
                  <td>${s.type || '–'}</td>
                  <td><span class="badge ${isRejected ? 'badge-rejected' : 'badge-approved'}">${isRejected ? 'Rejected' : 'Approved'}</span></td>
                  <td>${isRejected ? '0' : (s.credits || s.suggestedCredits || '0')} pts</td>
                  <td><em>${s.review ? '"' + s.review + '"' : '–'}</em></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleExportLogs = async () => {
    let logoDataUri = '';
    try {
      const resp = await fetch(`${window.location.origin}/sapt-logo1.png`);
      if (resp.ok) {
        const blob = await resp.blob();
        logoDataUri = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (_) { /* logo not critical */ }
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = `
      <html>
        <head>
          <title>Mentor Log Reviews - ${user.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c0f00; background-color: #ffffff; }
            .header { border-bottom: 3px solid #ea580c; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
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
            .badge-rejected { background-color: #fee2e2; color: #991b1b; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${logoDataUri ? `<img src="${logoDataUri}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 8px;" />` : ''}
              <span style="font-size: 26px; font-weight: 900; color: #ea580c; font-family: 'Outfit', sans-serif; letter-spacing: -0.5px;">SAPT</span>
            </div>
            <div class="college-name">${user.college || 'SAPT Partner Institute'}</div>
          </div>
          <div class="title">Mentor Daily Log Reviews Report</div>
          <div class="details">
            <p><strong>Student Name:</strong> ${user.name}</p>
            <p><strong>Roll Number:</strong> ${user.rollNo || 'N/A'}</p>
            <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Mentor Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${reviewedLogs.map(l => {
                const status = l.reviewStatus || 'pending';
                const badgeClass = status === 'approved' ? 'badge-approved' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
                return `<tr>
                  <td>${l.date || '–'}</td>
                  <td><strong>${l.title}</strong></td>
                  <td>${l.description || '–'}</td>
                  <td><span class="badge ${badgeClass}">${status}</span></td>
                  <td><em>${l.mentorRemark ? '"' + l.mentorRemark + '"' : '–'}</em></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Mentor Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review comments and feedback given by your mentor on your submissions and logs
        </p>
      </div>

      {/* Tabs + Export Button */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-750 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'submissions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Submissions Feedback ({reviewedSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            Daily Logs Feedback ({reviewedLogs.length})
          </button>
        </div>
        {activeTab === 'submissions' && reviewedSubmissions.length > 0 && (
          <button onClick={handleExportSubmissions} className="btn-secondary text-xs gap-1 mb-3">
            <Download className="w-4 h-4" /> Export Submission Reviews
          </button>
        )}
        {activeTab === 'logs' && reviewedLogs.length > 0 && (
          <button onClick={handleExportLogs} className="btn-secondary text-xs gap-1 mb-3">
            <Download className="w-4 h-4" /> Export Log Reviews
          </button>
        )}
      </div>

      {activeTab === 'submissions' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Review Metrics */}
          <div className="grid sm:grid-cols-3 gap-6">
            <StatCard icon={<FileText className="w-6 h-6" />} label="Reviewed Activities" value={reviewedSubmissions.length} color="primary" />
            <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Approved" value={approvedSubs.length} color="green" />
            <StatCard icon={<XCircle className="w-6 h-6" />} label="Rejected / Action Required" value={rejectedSubs.length} color="red" />
          </div>

          <div className="space-y-6 mt-4">
            {reviewedSubmissions.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-slate-355" />}
                  title="No Submission Reviews"
                  subtitle="Your mentor hasn't reviewed any of your activity submissions yet. Once reviewed, feedback will appear here."
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
                            {isRejected ? 'Rejected' : 'Approved & Credited'}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{s.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{s.description}</p>
                      </div>

                      <div className="text-left md:text-right shrink-0">
                        {isRejected ? (
                          <>
                            <p className="text-xs text-red-400">Credit Deduction</p>
                            <p className="text-2xl font-extrabold text-red-500 dark:text-red-400">
                              −{s.creditPenalty ?? Math.ceil((s.suggestedCredits || 0) * 0.1)} pts
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-slate-400">Awarded Credits</p>
                            <p className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400">
                              {s.credits || s.suggestedCredits || '0'} pts
                            </p>
                          </>
                        )}
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

                    {/* Credit Penalty Notice for Rejected submissions */}
                    {isRejected && (
                      <div className="mt-4 pt-3 border-t border-red-100 dark:border-red-950/35">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                          <span className="text-base">⚠️</span>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-red-600 dark:text-red-400">
                              Credit Penalty Applied
                            </p>
                            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                              <strong>{s.creditPenalty ?? Math.ceil((s.suggestedCredits || 0) * 0.1)} credits</strong> have been deducted from your total for this fraudulent/incorrect submission.
                            </p>
                          </div>
                          <span className="text-lg font-extrabold text-red-600 dark:text-red-400">−{s.creditPenalty ?? Math.ceil((s.suggestedCredits || 0) * 0.1)} pts</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Review Metrics */}
          <div className="grid sm:grid-cols-3 gap-6">
            <StatCard icon={<BookOpen className="w-6 h-6" />} label="Reviewed Logs" value={reviewedLogs.length} color="primary" />
            <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Approved" value={approvedLogs.length} color="green" />
            <StatCard icon={<XCircle className="w-6 h-6" />} label="Rejected" value={rejectedLogs.length} color="red" />
          </div>

          <div className="space-y-6 mt-4">
            {reviewedLogs.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-slate-355" />}
                  title="No Daily Log Reviews"
                  subtitle="Your mentor hasn't left feedback on any of your daily activity logs yet. Once reviewed, remarks will show here."
                />
              </div>
            ) : (
              reviewedLogs.map(l => {
                const status = l.reviewStatus || 'pending';
                const isApproved = status === 'approved';
                const isRejected = status === 'rejected';
                
                return (
                  <div
                    key={l.id}
                    className={`card border-l-4 transition-all duration-300 ${
                      isRejected 
                        ? 'border-l-red-500 bg-red-50/10 dark:bg-red-950/5 border-red-100 dark:border-dark-800' 
                        : isApproved
                          ? 'border-l-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-100 dark:border-dark-800'
                          : 'border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/5 border-amber-100 dark:border-dark-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{l.date}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <Badge variant={isApproved ? 'green' : isRejected ? 'red' : 'yellow'}>
                            {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{l.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{l.description}</p>
                        {l.links && <a href={l.links} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline mt-1 block">{l.links}</a>}
                      </div>
                    </div>

                    {/* Mentor Feedback Area */}
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-750">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">
                          👨‍🏫
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Mentor Remarks:</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 italic font-medium">
                            {l.mentorRemark ? `"${l.mentorRemark}"` : '"Reviewed with no additional comments."'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resubmission Action for Rejected logs */}
                    {isRejected && (
                      <div className="mt-4 pt-3 border-t border-red-100 dark:border-red-950/35 flex items-center justify-between flex-wrap gap-3">
                        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                          ⚠️ <strong>Action Required:</strong> Please edit this log to address mentor feedback.
                        </p>
                        <button
                          onClick={() => navigate('/dashboard/student/logs', { state: { resubmitLog: l } })}
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
      )}
    </div>
  );
};
