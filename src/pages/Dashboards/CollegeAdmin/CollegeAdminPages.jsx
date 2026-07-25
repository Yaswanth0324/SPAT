import { useState, useEffect } from 'react';
import { BookOpen, Users, CheckSquare, X, Check, Loader, RefreshCw } from 'lucide-react';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';
import { collegeAdminApi, apiUpdateUserStatus } from '../../../utils/api';

// ---- Departments Page ----
export const CollegeAdminDepartments = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [selected, setSelected] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depts, hods] = await Promise.all([
          collegeAdminApi.getDepartments(),
          collegeAdminApi.getUsersByRole('HOD'),
        ]);
        if (!active) return;
        setDepartments(depts || []);
        const pending = (hods || []).filter(h => {
          const s = h.status ? h.status.toLowerCase() : '';
          return s === 'pending';
        });
        setPendingCount(pending.length);
      } catch (err) {
        if (active) showToast('Failed to load department data from server', 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Departments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{user?.college}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <StatCard icon={<BookOpen className="w-6 h-6" />} label="Departments" value={loading ? '…' : departments.length} color="primary" />
        <StatCard icon={<CheckSquare className="w-6 h-6" />} label="Pending HOD Approvals" value={loading ? '…' : pendingCount} color="yellow" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-3 text-slate-500 dark:text-slate-400">Loading departments...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No departments yet"
            subtitle="Departments appear once HODs are registered and approved"
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="card-hover p-6 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-950/40 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              onClick={() => setSelected(dept)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <Badge variant={dept.active ? 'green' : 'red'}>{dept.active ? 'Active' : 'Inactive'}</Badge>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-3 leading-snug">{dept.name}</h3>

                <div className="p-3 bg-slate-50/60 dark:bg-dark-900/20 rounded-xl border border-slate-100 dark:border-slate-800/40 mb-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department HOD</p>
                  {dept.hod ? (
                    <>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{dept.hod.name}</p>
                      <p className="text-xs text-slate-500 truncate">{dept.hod.email}</p>
                      <p className="text-xs text-slate-500 truncate">{dept.hod.phone || 'No contact number'}</p>
                    </>
                  ) : (
                    <p className="text-xs font-medium text-slate-400 italic">No HOD assigned yet</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg">
                    <p className="text-sm font-black text-orange-600 dark:text-orange-400">{dept.totalActivities ?? 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Activities</p>
                  </div>
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{dept.approvedCount ?? 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Approved</p>
                  </div>
                  <div className="p-2 bg-rose-50/50 dark:bg-rose-950/10 rounded-lg">
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400">{dept.rejectedCount ?? 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Rejected</p>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
                  <span>{dept.mentorCount ?? 0} Mentors</span>
                  <span>·</span>
                  <span>{dept.studentCount ?? 0} Students</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Department Overview'}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-900/10 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <Avatar name={selected.hod?.name} src={selected.hod?.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Department Head (HOD)</p>
                <p className="font-bold text-slate-900 dark:text-white text-base truncate">{selected.hod?.name || 'Unassigned HOD'}</p>
                {selected.hod ? (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{selected.hod.email}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selected.hod.phone || 'No phone number provided'}</p>
                  </>
                ) : (
                  <p className="text-xs italic text-slate-400 dark:text-slate-500">Approvals of new HODs will enable assignment.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-100/50 dark:border-blue-950/30">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{selected.mentorCount ?? 0}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Faculty Mentors</p>
              </div>
              <div className="text-center p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selected.studentCount ?? 0}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Students Enrolled</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/40 my-4"></div>

            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Academic Performance & Activities</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-orange-50/60 dark:bg-orange-950/10 rounded-xl border border-orange-100/50 dark:border-orange-950/30">
                  <p className="text-xl font-black text-orange-600 dark:text-orange-400">{selected.totalActivities ?? 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Total Activities</p>
                </div>
                <div className="text-center p-3 bg-emerald-50/60 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-950/30">
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{selected.approvedCount ?? 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Approvals</p>
                </div>
                <div className="text-center p-3 bg-rose-50/60 dark:bg-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-950/30">
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400">{selected.rejectedCount ?? 0}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Rejections</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ---- HOD Requests Page ----
export const CollegeAdminHODRequests = () => {
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHODs = async () => {
    setLoading(true);
    try {
      const list = await collegeAdminApi.getUsersByRole('HOD');
      const normalized = (list || []).map(u => ({
        ...u,
        status: u.status ? u.status.toLowerCase() : 'pending',
        department: u.departmentName || u.department || '',
      }));
      setUsers(normalized);
    } catch (err) {
      showToast('Failed to fetch HOD list from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHODs();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await apiUpdateUserStatus(id, action.toUpperCase());
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action } : u));
      showToast(
        `HOD ${action === 'approved' ? 'approved successfully!' : 'rejected.'}`,
        action === 'approved' ? 'success' : 'error'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update HOD status', 'error');
    }
  };

  const pending = users.filter(u => u.status === 'pending');
  const processed = users.filter(u => u.status !== 'pending');

  return (
    <div className="animate-fade-in space-y-6">
      {ToastComponent}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">HOD Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve HOD registrations for your college</p>
        </div>
        <button
          onClick={fetchHODs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-3 text-slate-500">Loading HOD requests...</span>
        </div>
      ) : (
        <>
          {pending.length === 0 && processed.length === 0 && (
            <div className="card mb-6">
              <EmptyState
                icon={<CheckSquare className="w-12 h-12" />}
                title="No HOD registrations found"
                subtitle="HOD registrations will appear here once they sign up."
              />
            </div>
          )}

          {pending.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                Pending Registrations ({pending.length})
              </h2>
              {pending.map(h => (
                <div key={h.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={h.name} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{h.name}</p>
                      <p className="text-sm text-slate-500 truncate">{h.email}</p>
                      {h.department && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5 truncate">
                          Dept: {h.department}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="yellow">Pending</Badge>
                    <button
                      onClick={() => handleAction(h.id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(h.id, 'rejected')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pending.length === 0 && processed.length > 0 && (
            <div className="card mb-6">
              <EmptyState
                icon={<CheckSquare className="w-12 h-12" />}
                title="No pending requests"
                subtitle="All HOD registrations have been processed."
              />
            </div>
          )}

          {processed.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 dark:text-white">Processed Registrations ({processed.length})</h2>
              {processed.map(h => (
                <div key={h.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={h.name} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{h.name}</p>
                      <p className="text-sm text-slate-500 truncate">{h.email}</p>
                      {h.department && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">Dept: {h.department}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={h.status === 'approved' ? 'green' : 'red'}>
                    {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
