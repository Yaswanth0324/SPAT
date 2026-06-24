import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2, Calendar, MapPin, Phone, Mail, Globe,
  Clock, CheckCircle, XCircle, AlertCircle, UserPlus,
  RefreshCw, Search, Filter, User, Shield, Briefcase,
  ChevronDown, Eye, ToggleLeft, ToggleRight, Download,
  Users2, UploadCloud, Save, Edit,
} from 'lucide-react';
import { ROLES } from '../../../utils/mockData';
import { Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';
import { systemAdminApi } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Puducherry','Chandigarh',
];

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const calcRemaining = (endDateStr) => {
  if (!endDateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end   = new Date(endDateStr); end.setHours(0,0,0,0);
  return Math.max(0, Math.round((end - today) / 86_400_000));
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:    'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    INACTIVE:  'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    SUSPENDED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || ''}`}>
      {status}
    </span>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1,2,3,4,5].map(i => (
      <td key={i} className="table-td">
        <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── College Detail Modal ─────────────────────────────────────────────────────
const CollegeDetailModal = ({ college, onClose, onStatusChange }) => {
  if (!college) return null;

  const remaining = calcRemaining(college.contractEnd);
  const isExpired = remaining !== null && remaining === 0;
  const isActive  = college.status === 'ACTIVE';

  return (
    <Modal isOpen onClose={onClose} title={college.name}>
      <div className="space-y-5">

        {/* Status + Contract Timeline */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Status & Contract
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={college.status} />

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {college.contractStart
                ? <span>{fmt(college.contractStart)} – {fmt(college.contractEnd)}</span>
                : <span className="italic text-slate-400">No contract date set</span>
              }
            </div>

            {remaining !== null && (
              <div className={`flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-bold border ${
                isExpired
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  : remaining <= 90
                  ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {isExpired ? 'Expired' : `${remaining} days remaining`}
              </div>
            )}
          </div>
        </div>

        {/* College Address */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">College Details</p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 space-y-2">
            {college.address && (
              <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 shrink-0 text-primary-500 mt-0.5" />
                {college.address}
              </p>
            )}
            {college.state && (
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 shrink-0 text-primary-500" />
                {college.state}
              </p>
            )}
            {college.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 shrink-0 text-primary-500" />
                {college.phone}
              </p>
            )}
            {college.email && (
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 shrink-0 text-primary-500" />
                {college.email}
              </p>
            )}
            {college.website && (
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 shrink-0 text-primary-500" />
                {college.website}
              </p>
            )}
          </div>
        </div>

        {/* Admin Contact */}
        {college.adminName && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">College Admin</p>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-850 rounded-xl">
              <Avatar name={college.adminName} size="lg" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-white">{college.adminName}</p>
                {college.adminEmail && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> {college.adminEmail}
                  </p>
                )}
                {college.adminPhone && (
                  <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0" /> {college.adminPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Toggle Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-dark-700">
          {college.status !== 'ACTIVE' && (
            <button
              onClick={() => onStatusChange(college.id, 'ACTIVE')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
          )}
          {college.status === 'ACTIVE' && (
            <button
              onClick={() => onStatusChange(college.id, 'INACTIVE')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" /> Deactivate
            </button>
          )}
          {college.status !== 'SUSPENDED' && (
            <button
              onClick={() => onStatusChange(college.id, 'SUSPENDED')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <AlertCircle className="w-4 h-4" /> Suspend
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Colleges Page
// ─────────────────────────────────────────────────────────────────────────────
export const SystemAdminColleges = () => {
  const { showToast, ToastComponent } = useToast();
  const [colleges, setColleges]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemAdminApi.getColleges();
      setColleges(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load colleges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const handleStatusChange = async (collegeId, newStatus) => {
    setUpdatingId(collegeId);
    try {
      await systemAdminApi.updateCollegeStatus(collegeId, newStatus);
      showToast(`College status updated to ${newStatus}`, 'success');
      setSelected(null);
      await fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = colleges.filter(c => {
    const matchSearch = search === '' ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.adminName?.toLowerCase().includes(search.toLowerCase()) ||
      c.state?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      {ToastComponent}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Colleges</h1>
          <span className="text-slate-400 dark:text-slate-600 font-light text-2xl">—</span>
          <span className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">{colleges.length}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all registered colleges on the platform</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by college name, admin, or state…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="input-field pl-9 pr-8 appearance-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={fetchColleges}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 shrink-0"
          id="colleges-refresh-btn"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchColleges} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-white">All Colleges</h2>
          {filtered.length !== colleges.length && (
            <span className="text-xs text-slate-500">{filtered.length} of {colleges.length} shown</span>
          )}
        </div>

        {loading ? (
          <table className="w-full hidden sm:table">
            <thead>
              <tr>
                {['College Name','Admin','State','Status','Action'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map(i => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-16 h-16" />}
            title="No colleges found"
            subtitle={search || statusFilter !== 'ALL' ? 'Try adjusting your search or filter' : 'Add a college admin to register a college'}
          />
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-slate-100 dark:divide-dark-700 sm:hidden">
              {filtered.map(c => (
                <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.adminName || '—'}</p>
                    <div className="mt-1.5 flex gap-1.5">
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                  <button onClick={() => setSelected(c)} className="btn-ghost text-xs py-1 px-3 shrink-0">
                    View
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">College Name</th>
                    <th className="table-th">Admin</th>
                    <th className="table-th">State</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Contract End</th>
                    <th className="table-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="table-td font-medium">{c.name}</td>
                      <td className="table-td text-slate-500 dark:text-slate-400">{c.adminName || '—'}</td>
                      <td className="table-td text-slate-500 dark:text-slate-400">{c.state || '—'}</td>
                      <td className="table-td"><StatusBadge status={c.status} /></td>
                      <td className="table-td text-slate-500 dark:text-slate-400 text-sm">{fmt(c.contractEnd)}</td>
                      <td className="table-td">
                        <button
                          onClick={() => setSelected(c)}
                          className="btn-ghost text-xs py-1 px-3"
                          disabled={updatingId === c.id}
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      <CollegeDetailModal
        college={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Add College Admin Page
// ─────────────────────────────────────────────────────────────────────────────
const Section = ({ label, children }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">{label}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

export const SystemAdminAddAdmin = () => {
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    collegeName: '', collegeAddress: '', collegeState: '',
    collegePhone: '', collegeEmail: '', collegeWebsite: '',
    adminFullName: '', adminEmail: '', adminPassword: '',
    adminPhone: '', adminEmployeeId: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generateEmployeeId = () => set('adminEmployeeId', 'CA' + Math.random().toString().substring(2, 8).toUpperCase());
  const generatePassword   = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    const pwd   = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    set('adminPassword', pwd);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await systemAdminApi.createCollegeAdmin(form);
      
      // Keep local mock storage in sync for college admin dashboard & list views
      const newMockCollege = {
        id: `col_${Date.now()}`,
        name: form.collegeName.trim(),
        address: form.collegeAddress,
        state: form.collegeState,
        email: form.collegeEmail,
        website: form.collegeWebsite,
        status: 'ACTIVE',
        departments: [
          'Computer Science and Engineering',
          'Electronics and Communication Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Information Technology',
          'Electrical and Electronics Engineering'
        ],
        adminName: form.adminFullName,
        adminEmail: form.adminEmail,
        adminPhone: form.adminPhone,
      };

      const newMockUser = {
        id: `user_ca_${Date.now()}`,
        role: ROLES.COLLEGE_ADMIN,
        name: form.adminFullName,
        email: form.adminEmail,
        password: form.adminPassword,
        college: form.collegeName.trim(),
        adminId: form.adminEmployeeId || 'CA' + Math.random().toString().substring(2, 8).toUpperCase(),
        phone: form.adminPhone,
        status: 'approved',
        is_active: true,
      };

      const existingColleges = JSON.parse(localStorage.getItem('spark_colleges') || '[]');
      if (!existingColleges.some(c => c.name.toLowerCase() === form.collegeName.trim().toLowerCase())) {
        existingColleges.push(newMockCollege);
        localStorage.setItem('spark_colleges', JSON.stringify(existingColleges));
      }

      const existingUsers = JSON.parse(localStorage.getItem('spark_users') || '[]');
      if (!existingUsers.some(u => u.email.toLowerCase() === form.adminEmail.toLowerCase())) {
        existingUsers.push(newMockUser);
        localStorage.setItem('spark_users', JSON.stringify(existingUsers));
      }

      showToast(`College Admin "${form.adminFullName}" created successfully! A verification email has been sent.`, 'success', 5000);
      setForm({
        collegeName: '', collegeAddress: '', collegeState: '',
        collegePhone: '', collegeEmail: '', collegeWebsite: '',
        adminFullName: '', adminEmail: '', adminPassword: '',
        adminPhone: '', adminEmployeeId: '',
      });
      setShowPassword(false);
    } catch (err) {
      showToast(err.message || 'Failed to create college admin', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Add College Admin</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Register a new college or assign an admin to an existing one
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── College Details ── */}
          <Section label="College Details">
            <div>
              <label className="label-field">College Name <span className="text-red-500">*</span></label>
              <input className="input-field" placeholder="e.g. ABC Institute of Technology"
                value={form.collegeName} onChange={e => set('collegeName', e.target.value)} required />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                If this college already exists in the system, only the admin will be added.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">State</label>
                <select className="input-field appearance-none" value={form.collegeState} onChange={e => set('collegeState', e.target.value)}>
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210"
                  value={form.collegePhone} onChange={e => set('collegePhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-field">Address</label>
              <input className="input-field" placeholder="Street, City, PIN"
                value={form.collegeAddress} onChange={e => set('collegeAddress', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">College Email</label>
                <input type="email" className="input-field" placeholder="info@college.edu"
                  value={form.collegeEmail} onChange={e => set('collegeEmail', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Website</label>
                <input className="input-field" placeholder="https://college.edu"
                  value={form.collegeWebsite} onChange={e => set('collegeWebsite', e.target.value)} />
              </div>
            </div>
          </Section>

          <div className="border-t border-slate-100 dark:border-dark-700" />

          {/* ── Admin Details ── */}
          <Section label="Admin Details">
            <div>
              <label className="label-field">Full Name <span className="text-red-500">*</span></label>
              <input className="input-field" placeholder="Dr. Jane Smith"
                value={form.adminFullName} onChange={e => set('adminFullName', e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Email <span className="text-red-500">*</span></label>
                <input type="email" className="input-field" placeholder="admin@college.edu"
                  value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} required />
              </div>
              <div>
                <label className="label-field">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210"
                  value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-field">Password <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field flex-1"
                  placeholder="Set initial login password"
                  value={form.adminPassword}
                  onChange={e => set('adminPassword', e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="btn-ghost text-xs px-3 shrink-0">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={generatePassword} className="btn-secondary text-xs shrink-0">Auto-Generate</button>
              </div>
            </div>
            <div>
              <label className="label-field">Employee ID</label>
              <div className="flex gap-2">
                <input className="input-field" placeholder="e.g. CA123456"
                  value={form.adminEmployeeId} onChange={e => set('adminEmployeeId', e.target.value)} />
                <button type="button" onClick={generateEmployeeId} className="btn-secondary shrink-0 text-xs">Generate</button>
              </div>
            </div>
          </Section>

          <button
            type="submit"
            id="add-college-admin-submit"
            className="btn-primary w-full justify-center py-3 text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Creating…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Add College Admin
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// System Admin Profile Page
// ─────────────────────────────────────────────────────────────────────────────
export const SystemAdminProfile = () => {
  const { updateSession } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await systemAdminApi.getProfile();
        setProfile(data);
        setNameInput(data.fullName || '');
        setAvatar(data.avatarUrl || null);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1MB size limit
    if (file.size > 1024 * 1024) {
      showToast('Image size exceeds 1MB! Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setUpdating(true);
    try {
      const updated = await systemAdminApi.updateProfile({
        fullName: nameInput.trim(),
        avatarUrl: avatar
      });
      setProfile(updated);
      updateSession({
        name: updated.fullName,
        fullName: updated.fullName,
        avatar: updated.avatarUrl
      });
      showToast('Profile updated successfully!', 'success');
      setEditMode(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setNameInput(profile?.fullName || '');
    setAvatar(profile?.avatarUrl || null);
    setEditMode(false);
  };

  const Field = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
      <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950/30 shrink-0">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-fade-in max-w-lg">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 dark:bg-dark-700 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-dark-700 rounded w-64 animate-pulse" />
        </div>
        <div className="card space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-dark-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in max-w-lg">
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-red-700 dark:text-red-400">{error}</p>
          <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
            Make sure the backend is running and you are logged in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-lg">
      {ToastComponent}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">System Administrator account details</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={updating}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="relative inline-block">
            <Avatar name={nameInput || profile?.fullName} src={avatar} size="xl" />
            {editMode && (
              <label className="absolute -bottom-1 -right-1 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full cursor-pointer transition-colors shadow-lg border-2 border-white dark:border-gray-900">
                <UploadCloud className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900 dark:text-white">{profile?.fullName}</h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mt-0.5">System Administrator</p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              profile?.active
                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
            }`}>
              {profile?.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Account Information</p>
        <div className="space-y-1">
          {editMode ? (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950/30 shrink-0">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Full Name</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Field label="Full Name"    value={profile?.fullName}    icon={User} />
          )}
          <Field label="Email"        value={profile?.email}       icon={Mail} />
          <Field label="Employee ID"  value={profile?.employeeId}  icon={Briefcase} />
          <Field label="Role"         value="System Administrator" icon={Shield} />
          <Field label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} icon={Calendar} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// College Admins Page  (GET /system-admin/college-admins)
// ─────────────────────────────────────────────────────────────────────────────
export const SystemAdminCollegeAdmins = () => {
  const { showToast, ToastComponent } = useToast();
  const [admins, setAdmins]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const printRef = useRef(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { systemAdminApi } = await import('../../../utils/api');
      const data = await systemAdminApi.getCollegeAdmins();
      setAdmins(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load college admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.collegeName?.toLowerCase().includes(q) ||
      a.employeeId?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && a.active) ||
      (statusFilter === 'INACTIVE' && !a.active);
    return matchSearch && matchStatus;
  });

  const handlePDF = () => {
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body > *:not(#college-admins-print-area) { display: none !important; }
        #college-admins-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; }
        @page { size: A4; margin: 15mm; }
      }
    `;
    document.head.appendChild(style);
    const area = document.getElementById('college-admins-print-area');
    if (area) area.style.display = 'block';
    window.print();
    setTimeout(() => {
      document.head.removeChild(style);
      if (area) area.style.display = 'none';
    }, 1000);
  };

  return (
    <div className="animate-fade-in">
      {ToastComponent}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">College Admins</h1>
            <span className="text-slate-400 font-light text-2xl">—</span>
            <span className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">{admins.length}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">All college administrators registered on the platform</p>
        </div>
        <button
          onClick={handlePDF}
          disabled={loading || admins.length === 0}
          className="btn-secondary flex items-center gap-2 shrink-0"
          id="download-pdf-btn"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, email, college, or employee ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="input-field pl-9 pr-8 appearance-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={fetchAdmins} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-white">All College Admins</h2>
          {filtered.length !== admins.length && (
            <span className="text-xs text-slate-500">{filtered.length} of {admins.length} shown</span>
          )}
        </div>

        {loading ? (
          <table className="w-full">
            <thead><tr>{['Name','College','Employee ID','Email','Status','Joined'].map(h => (
              <th key={h} className="table-th">{h}</th>
            ))}</tr></thead>
            <tbody>{[1,2,3].map(i => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users2 className="w-16 h-16" />}
            title="No college admins found"
            subtitle={search || statusFilter !== 'ALL' ? 'Try adjusting your search or filter' : 'Add a college admin using the sidebar'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" ref={printRef}>
              <thead>
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">College</th>
                  <th className="table-th">Employee ID</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="table-td text-slate-400 text-xs">{i + 1}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.fullName} size="sm" />
                        <span className="font-medium text-slate-800 dark:text-white">{a.fullName}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400">{a.collegeName || '—'}</td>
                    <td className="table-td text-slate-500 dark:text-slate-400 font-mono text-xs">{a.employeeId || '—'}</td>
                    <td className="table-td text-slate-500 dark:text-slate-400 text-sm">{a.email}</td>
                    <td className="table-td text-slate-500 dark:text-slate-400 text-sm">{a.phone || '—'}</td>
                    <td className="table-td">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        a.active
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {a.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td text-slate-500 dark:text-slate-400 text-sm">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden Print Area */}
      <div id="college-admins-print-area" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
          <div style={{ borderBottom: '2px solid #ea580c', paddingBottom: '12px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', color: '#ea580c' }}>SAPT — College Admins Report</h1>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
              Generated: {new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; Total: {filtered.length}
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#fef3c7' }}>
                {['#', 'Name', 'College', 'Employee ID', 'Email', 'Phone', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee' }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee', fontWeight: 600 }}>{a.fullName}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee' }}>{a.collegeName || '—'}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee', fontFamily: 'monospace' }}>{a.employeeId || '—'}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee' }}>{a.email}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee' }}>{a.phone || '—'}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee', color: a.active ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {a.active ? 'Active' : 'Inactive'}
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #eee' }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '16px', fontSize: '10px', color: '#999', textAlign: 'right' }}>
            SAPT Platform &mdash; Confidential
          </p>
        </div>
      </div>
    </div>
  );
};
