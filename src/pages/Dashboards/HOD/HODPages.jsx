import { useState } from 'react';
import { Users, CheckSquare, X, Check, Phone, Mail, TrendingUp, BarChart2, Clock } from 'lucide-react';
import { getUsers, updateUser, getSubmissions } from '../../../utils/localStorage';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';

const getMentorStats = (mentorId) => {
  const all = getSubmissions().filter(s => s.mentorId === mentorId);
  const approved = all.filter(s => s.status === 'approved').length;
  const rejected = all.filter(s => s.status === 'rejected').length;
  const pending  = all.filter(s => s.status === 'pending').length;
  const total    = approved + rejected;
  const rate     = total > 0 ? Math.round((approved / total) * 100) : null;
  return { approved, rejected, pending, total: all.length, rate };
};

// ---- HOD Dashboard Index: Mentor Approvals ----
export const HODMentorApprovals = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [mentors, setMentors] = useState(() =>
    getUsers().filter(u => u.role === ROLES.MENTOR && u.college === user.college && u.department === user.department)
  );
  const students = getUsers().filter(u => u.role === ROLES.STUDENT && u.college === user.college && u.department === user.department);

  const handleAction = (id, action) => {
    updateUser(id, { status: action });
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
    showToast(`Mentor ${action === 'approved' ? 'approved ✓' : 'rejected'}`, action === 'approved' ? 'success' : 'error');
  };

  const pending  = mentors.filter(m => m.status === 'pending');
  const approved = mentors.filter(m => m.status === 'approved');

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Mentor Approvals</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{user.department}</p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
          Pending Mentor Requests {pending.length > 0 && <span className="ml-2 badge-yellow">{pending.length}</span>}
        </h2>
        {pending.length === 0 ? (
          <div className="card"><EmptyState icon={<CheckSquare className="w-12 h-12" />} title="No pending approvals" subtitle="All mentor requests are processed" /></div>
        ) : (
          <div className="space-y-3">
            {pending.map(m => (
              <div key={m.id} className="card flex items-center gap-4">
                <Avatar name={m.name} />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.email}</p>
                </div>
                <Badge variant="yellow">Pending</Badge>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(m.id, 'approved')} className="btn-success py-1.5 px-3"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleAction(m.id, 'rejected')} className="btn-danger py-1.5 px-3"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- HOD Mentors List ----
export const HODMentors = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const mentors = getUsers().filter(
    u => u.role === ROLES.MENTOR && u.college === user.college && u.department === user.department && u.status === 'approved'
  );

  const selectedStats = selected ? getMentorStats(selected.id) : null;

  const RateBar = ({ rate }) => {
    if (rate === null) return <p className="text-xs text-slate-400 mt-1">No reviewed submissions yet</p>;
    const color = rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="mt-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Success Rate</span>
          <span className={`text-xs font-bold ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{rate}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${rate}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Mentors</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">All approved mentors in your department</p>
      </div>

      {mentors.length === 0 ? (
        <div className="card"><EmptyState icon={<Users className="w-12 h-12" />} title="No mentors yet" subtitle="Approve mentor requests to see them here" /></div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-orange-50/40 dark:bg-dark-900/40 text-orange-850 dark:text-orange-300 uppercase text-xs tracking-wider border-b border-orange-100 dark:border-dark-850">
              <tr>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Department</th>
                <th className="p-4 font-bold">Position</th>
                <th className="p-4 font-bold">Success Percentage</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/50 dark:divide-dark-850 text-sm text-slate-700 dark:text-slate-350">
              {mentors.map(m => {
                const stats = getMentorStats(m.id);
                const position = m.position || (m.name.startsWith('Prof.') ? 'Professor' : m.name.startsWith('Dr.') ? 'Associate Professor' : 'Assistant Professor');
                const rateStr = stats.rate === null ? '0%' : `${stats.rate}%`;
                return (
                  <tr key={m.id} className="hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{m.department || user.department}</td>
                    <td className="p-4 font-medium">{position}</td>
                    <td className="p-4">
                      <span className={`font-bold ${stats.rate >= 70 ? 'text-emerald-600' : stats.rate >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {rateStr}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(m)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Mentor Performance">
        {selected && selectedStats && (
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-850 rounded-2xl">
              <Avatar name={selected.name} size="xl" />
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{selected.name}</p>
                <Badge variant="green">Approved Mentor</Badge>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-primary-500" />{selected.email}
              </div>
              {selected.phone && (
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-primary-500" />{selected.phone}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{selectedStats.approved}</p>
                <p className="text-xs text-slate-500 mt-1">Approved</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{selectedStats.rejected}</p>
                <p className="text-xs text-slate-500 mt-1">Rejected</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{selectedStats.pending}</p>
                <p className="text-xs text-slate-500 mt-1">Pending</p>
              </div>
            </div>

            {/* Success Rate Bar */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-slate-800 dark:text-white">Approval Success Rate</span>
              </div>
              {selectedStats.rate === null ? (
                <p className="text-sm text-slate-500">No reviewed submissions yet</p>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedStats.approved} approved out of {selectedStats.approved + selectedStats.rejected} reviewed
                    </span>
                    <span className={`text-2xl font-black ${selectedStats.rate >= 70 ? 'text-emerald-600' : selectedStats.rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {selectedStats.rate}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${selectedStats.rate >= 70 ? 'bg-emerald-500' : selectedStats.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${selectedStats.rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedStats.rate >= 70 ? '🌟 Excellent reviewer' : selectedStats.rate >= 40 ? '📊 Average reviewer' : '⚠️ High rejection rate'}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <BarChart2 className="w-4 h-4" />
              Total {selectedStats.total} submission{selectedStats.total !== 1 ? 's' : ''} handled
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
