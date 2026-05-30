import { useState } from 'react';
import {
  Building2, Calendar, MapPin, Phone, Mail,
  Clock, CheckCircle, XCircle,
} from 'lucide-react';
import {
  getColleges, addUser, addCollege, saveColleges,
  generateId, generateAdminId,
} from '../../../utils/localStorage';
import { ROLES, INITIAL_COLLEGES_DATA } from '../../../utils/mockData';
import { Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';

// ─── helpers ──────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

/** Format ISO date string → DD/MM/YYYY */
const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/** Days remaining from today to endDate. Null if no date. 0 if expired. */
const calcRemaining = (endDateStr) => {
  if (!endDateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end   = new Date(endDateStr); end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end - today) / 86_400_000));
};

/** Add 2 years to today, return ISO date string */
const addTwoYears = (dateStr) => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().split('T')[0];
};

// ─── College Detail Modal ─────────────────────────────────────────────────────
const CollegeDetailModal = ({ college, onClose }) => {
  if (!college) return null;

  // Patch: merge seed data for colleges that pre-date new fields (address, contractStart, etc.)
  const seedRecord = (INITIAL_COLLEGES_DATA || []).find(c => c.id === college.id) || {};
  // stored data takes priority; seed fills any missing fields
  const col = { ...seedRecord, ...college };

  const remaining = calcRemaining(col.contractEnd);
  const isExpired = remaining !== null && remaining === 0;
  const isActive  = col.status !== 'inactive';

  return (
    <Modal isOpen onClose={onClose} title={col.name}>
      <div className="space-y-5">

        {/* ── 1. Contract Timeline ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Contract Timeline
          </p>
          <div className="flex flex-wrap items-center gap-2">

            {/* Date range pill */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {col.contractStart
                ? <span>{fmt(col.contractStart)} – {fmt(col.contractEnd)}</span>
                : <span className="italic text-slate-400 dark:text-slate-500">No contract date set</span>
              }
            </div>

            {/* Days remaining pill */}
            {remaining !== null && (
              <div className={`flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-bold border ${
                isExpired
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  : remaining <= 90
                  ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {isExpired ? 'Expired' : `${remaining} days`}
              </div>
            )}

            {/* Active / Inactive status pill */}
            <div className={`flex items-center gap-1 px-2.5 py-2 rounded-full text-xs font-semibold border ${
              isActive
                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}>
              {isActive
                ? <><CheckCircle className="w-3.5 h-3.5" />&nbsp;Active</>
                : <><XCircle     className="w-3.5 h-3.5" />&nbsp;Inactive</>
              }
            </div>
          </div>
        </div>

        {/* ── 2. College Address ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            College Details
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 space-y-2">
            {col.address ? (
              <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 shrink-0 text-primary-500 mt-0.5" />
                {col.address}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-500">No address on record</p>
            )}
            {col.state && (
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 shrink-0 text-primary-500" />
                {col.state}
              </p>
            )}
          </div>
        </div>

        {/* ── 3. Admin Contact ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            College Admin
          </p>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-850 rounded-xl">
            <Avatar name={col.adminName} size="lg" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">{col.adminName}</p>
              {col.adminEmail && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Mail  className="w-3.5 h-3.5 shrink-0" /> {col.adminEmail}
                </p>
              )}
              {col.adminPhone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> {col.adminPhone}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

// ─── Colleges Page (index) ────────────────────────────────────────────────────
export const SystemAdminColleges = () => {
  const { ToastComponent } = useToast();
  const [colleges]          = useState(getColleges);
  const [selected, setSelected] = useState(null);

  return (
    <div className="animate-fade-in">
      {ToastComponent}

      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Colleges</h1>
          <span className="text-slate-400 dark:text-slate-600 font-light text-2xl">--</span>
          <span className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">{colleges.length}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all registered colleges</p>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-700">
          <h2 className="font-semibold text-slate-800 dark:text-white">All Colleges</h2>
        </div>

        {colleges.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-16 h-16" />}
            title="No colleges yet"
            subtitle="Add a college admin to get started"
          />
        ) : (
          <>
            {/* Mobile View */}
            <div className="divide-y divide-slate-100 dark:divide-dark-700 sm:hidden">
              {colleges.map(c => (
                <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.adminName}</p>
                    <div className="mt-1.5">
                      <Badge variant="blue">{c.totalUsers} users</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(c)}
                    className="btn-ghost text-xs py-1 px-3 shrink-0"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">College Name</th>
                    <th className="table-th">Admin Name</th>
                    <th className="table-th">Total Users</th>
                    <th className="table-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="table-td font-medium">{c.name}</td>
                      <td className="table-td">{c.adminName}</td>
                      <td className="table-td">
                        <Badge variant="blue">{c.totalUsers} users</Badge>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => setSelected(c)}
                          className="btn-ghost text-xs py-1 px-3"
                        >
                          View Details
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
      <CollegeDetailModal college={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

// ─── Add College Admin Page ───────────────────────────────────────────────────
export const SystemAdminAddAdmin = () => {
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({
    collegeName: '', collegeAddress: '', collegeState: '',
    adminName: '', adminEmail: '', adminPhone: '',
    password: '', adminId: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGenId = () => set('adminId', generateAdminId());

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newAdmin = {
        id: generateId('ca'),
        role: ROLES.COLLEGE_ADMIN,
        name: form.adminName,
        email: form.adminEmail,
        password: form.password,
        college: form.collegeName,
        adminId: form.adminId,
        department: 'All',
        phone: form.adminPhone,
      };
      addUser(newAdmin);

      const existing      = getColleges();
      const collegeExists = existing.some(
        c => c.name.toLowerCase().trim() === form.collegeName.toLowerCase().trim()
      );

      if (!collegeExists) {
        const today = new Date().toISOString().split('T')[0];
        addCollege({
          id: generateId('col'),
          name: form.collegeName,
          address: form.collegeAddress,
          state: form.collegeState,
          status: 'active',
          contractStart: today,
          contractEnd: addTwoYears(today),
          adminId: newAdmin.id,
          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminPhone: form.adminPhone,
          totalUsers: 1,
          hods: 0, mentors: 0, students: 0,
          departments: [],
        });
        showToast(`College "${form.collegeName}" registered & admin added!`, 'success', 4000);
      } else {
        const cols = getColleges();
        const idx  = cols.findIndex(
          c => c.name.toLowerCase().trim() === form.collegeName.toLowerCase().trim()
        );
        if (idx !== -1) {
          cols[idx] = { ...cols[idx], adminId: newAdmin.id, adminName: form.adminName, adminEmail: form.adminEmail, adminPhone: form.adminPhone };
          saveColleges(cols);
        }
        showToast(`Admin added to existing college "${form.collegeName}"`, 'info', 4000);
      }

      setForm({ collegeName: '', collegeAddress: '', collegeState: '', adminName: '', adminEmail: '', adminPhone: '', password: '', adminId: '' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="animate-fade-in max-w-lg">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Add College Admin</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Register a new college or assign an admin to an existing one
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* College section */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">College Details</p>
            <div className="space-y-4">
              <div>
                <label className="label-field">College Name</label>
                <input className="input-field" placeholder="e.g. ABC Institute of Technology"
                  value={form.collegeName} onChange={e => set('collegeName', e.target.value)} required />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  If this college already exists, only the admin will be added.
                </p>
              </div>
              <div>
                <label className="label-field">Address</label>
                <input className="input-field" placeholder="Street, City, PIN"
                  value={form.collegeAddress} onChange={e => set('collegeAddress', e.target.value)} />
              </div>
              <div>
                <label className="label-field">State</label>
                <select className="input-field appearance-none" value={form.collegeState} onChange={e => set('collegeState', e.target.value)}>
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-700" />

          {/* Admin section */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-3">Admin Details</p>
            <div className="space-y-4">
              <div>
                <label className="label-field">Admin Name</label>
                <input className="input-field" placeholder="Dr. John Doe"
                  value={form.adminName} onChange={e => set('adminName', e.target.value)} required />
              </div>
              <div>
                <label className="label-field">Admin Email</label>
                <input type="email" className="input-field" placeholder="admin@college.edu"
                  value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} required />
              </div>
              <div>
                <label className="label-field">Admin Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210"
                  value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} />
              </div>
              <div>
                <label className="label-field">Password</label>
                <input type="password" className="input-field" placeholder="Set initial password"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
              <div>
                <label className="label-field">Admin ID</label>
                <div className="flex gap-2">
                  <input className="input-field" placeholder="Auto-generate or enter manually"
                    value={form.adminId} onChange={e => set('adminId', e.target.value)} required />
                  <button type="button" onClick={handleGenId} className="btn-secondary shrink-0">Generate</button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Processing…' : 'Add College Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
