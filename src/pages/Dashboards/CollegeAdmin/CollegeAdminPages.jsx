import { useState } from 'react';
import { BookOpen, Users, CheckSquare, X, Check } from 'lucide-react';
import { getUsers, updateUser, getSubmissions, getLogs } from '../../../utils/localStorage';
import { ROLES } from '../../../utils/mockData';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Modal, Badge, useToast, EmptyState, Avatar } from '../../../components/ui/UIComponents';

// ---- Departments Page ----
export const CollegeAdminDepartments = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  
  const users = getUsers().filter(u => u.college === user.college);
  const hods = users.filter(u => u.role === ROLES.HOD && u.status === 'approved');
  const mentors = users.filter(u => u.role === ROLES.MENTOR && u.status === 'approved');
  const students = users.filter(u => u.role === ROLES.STUDENT);

  const allSubmissions = getSubmissions();
  const allLogs = getLogs();

  // Group by department
  const deptMap = {};
  hods.forEach(h => {
    if (!deptMap[h.department]) deptMap[h.department] = { hod: null, mentors: 0, students: 0 };
    deptMap[h.department].hod = h;
  });
  mentors.forEach(m => { 
    if (!deptMap[m.department]) deptMap[m.department] = { hod: null, mentors: 0, students: 0 };
    deptMap[m.department].mentors++; 
  });
  students.forEach(s => { 
    if (!deptMap[s.department]) deptMap[s.department] = { hod: null, mentors: 0, students: 0 };
    deptMap[s.department].students++; 
  });

  const departments = Object.entries(deptMap);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Departments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{user.college}</p>
      </div>
      
      {/* Removed Total Users Stat Card and shifted to 2-column layout */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <StatCard icon={<BookOpen className="w-6 h-6" />} label="Departments" value={departments.length} color="primary" />
        <StatCard icon={<CheckSquare className="w-6 h-6" />} label="Pending Approvals" value={users.filter(u => u.status === 'pending').length} color="yellow" />
      </div>

      {departments.length === 0 ? (
        <div className="card"><EmptyState icon={<BookOpen className="w-12 h-12" />} title="No departments yet" subtitle="Departments appear once HODs are approved" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(([dept, info]) => {
            const deptStudents = students.filter(s => s.department === dept);
            const deptStudentIds = new Set(deptStudents.map(s => s.id));
            const deptSubmissions = allSubmissions.filter(sub => deptStudentIds.has(sub.studentId));
            const deptLogs = allLogs.filter(log => deptStudentIds.has(log.studentId));
            const totalActivities = deptSubmissions.length + deptLogs.length;
            const approvalCount = deptSubmissions.filter(sub => sub.status === 'approved').length;
            const rejectionCount = deptSubmissions.filter(sub => sub.status === 'rejected').length;

            return (
              <div 
                key={dept} 
                className="card-hover p-6 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100 dark:border-orange-950/40 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col justify-between" 
                onClick={() => setSelected({ 
                  dept, 
                  ...info,
                  totalActivities,
                  approvalCount,
                  rejectionCount
                })}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <Badge variant="green">Active</Badge>
                  </div>
                  
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-3 leading-snug">{dept}</h3>
                  
                  {/* Detailed HOD Info */}
                  <div className="p-3 bg-slate-50/60 dark:bg-dark-900/20 rounded-xl border border-slate-100 dark:border-slate-800/40 mb-4 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department HOD</p>
                    {info.hod ? (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{info.hod.name}</p>
                        <p className="text-xs text-slate-500 truncate">{info.hod.email}</p>
                        <p className="text-xs text-slate-500 truncate">{info.hod.phone || 'No contact number'}</p>
                      </>
                    ) : (
                      <p className="text-xs font-medium text-slate-400 italic">No HOD assigned yet</p>
                    )}
                  </div>
                </div>

                {/* Submissions / logs activities */}
                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg">
                      <p className="text-sm font-black text-orange-600 dark:text-orange-400">{totalActivities}</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Activities</p>
                    </div>
                    <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{approvalCount}</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Approved</p>
                    </div>
                    <div className="p-2 bg-rose-50/50 dark:bg-rose-950/10 rounded-lg">
                      <p className="text-sm font-black text-rose-600 dark:text-rose-400">{rejectionCount}</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">Rejected</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
                    <span>{info.mentors} Mentors</span>
                    <span>·</span>
                    <span>{info.students} Students</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.dept || 'Department Overview'}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-dark-900/10 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <Avatar name={selected.hod?.name} src={selected.hod?.profileImage} size="lg" />
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
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{selected.mentors}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Faculty Mentors</p>
              </div>
              <div className="text-center p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{selected.students}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Students Enrolled</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/40 my-4"></div>

            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Academic Performance & Activities</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-orange-50/60 dark:bg-orange-950/10 rounded-xl border border-orange-100/50 dark:border-orange-950/30">
                  <p className="text-xl font-black text-orange-600 dark:text-orange-400">{selected.totalActivities}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Total Activities</p>
                </div>
                <div className="text-center p-3 bg-emerald-50/60 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-950/30">
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{selected.approvalCount}</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Approvals</p>
                </div>
                <div className="text-center p-3 bg-rose-50/60 dark:bg-rose-950/10 rounded-xl border border-rose-100/50 dark:border-rose-950/30">
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400">{selected.rejectionCount}</p>
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
  const [users, setUsers] = useState(() => getUsers().filter(u => u.role === ROLES.HOD && u.college === user.college));

  const handleAction = (id, action) => {
    updateUser(id, { status: action });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action } : u));
    showToast(`HOD ${action === 'approved' ? 'approved' : 'rejected'} successfully`, action === 'approved' ? 'success' : 'error');
  };

  const handleSuccessionAction = (hodId, action) => {
    const allUsers = getUsers();
    const hodIndex = allUsers.findIndex(u => u.id === hodId);
    
    if (hodIndex !== -1) {
      const hod = allUsers[hodIndex];
      const req = hod.successionRequest;

      if (action === 'approved') {
        // Replace old HOD details in-place to avoid data loss
        allUsers[hodIndex] = {
          ...hod,
          name: req.name,
          email: req.email,
          password: req.password,
          phone: req.phone,
          profileImage: null, // clear old image
          successionRequest: null // clear succession request
        };
        showToast(`HOD succession approved. ${req.name} is now the Head of ${hod.department}! ✓`, 'success');
      } else {
        // Rejected
        allUsers[hodIndex] = {
          ...hod,
          successionRequest: null
        };
        showToast('HOD succession request rejected.', 'error');
      }

      // Save to localStorage
      localStorage.setItem('spark_users', JSON.stringify(allUsers));
      
      // Update local state to force re-render
      setUsers(allUsers.filter(u => u.role === ROLES.HOD && u.college === user.college));
    }
  };

  const pending = users.filter(u => u.status === 'pending');
  const processed = users.filter(u => u.status !== 'pending');
  const successionRequests = users.filter(u => u.successionRequest && u.successionRequest.status === 'pending');

  return (
    <div className="animate-fade-in space-y-6">
      {ToastComponent}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">HOD Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve HOD registrations and handovers</p>
      </div>

      {/* Succession Handover Section */}
      {successionRequests.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            HOD Handover & Succession Requests ({successionRequests.length})
          </h2>
          {successionRequests.map(h => (
            <div key={h.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-orange-500 bg-orange-500/5">
              <div className="flex items-center gap-3">
                <Avatar name={h.successionRequest.name} size="md" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {h.successionRequest.name} <span className="text-xs font-normal text-slate-500">(New HOD Candidate)</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Email: {h.successionRequest.email} | Phone: {h.successionRequest.phone || 'No phone'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    Replacing HOD: {h.name} | Dept: {h.department}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleSuccessionAction(h.id, 'approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Approve Succession
                </button>
                <button
                  onClick={() => handleSuccessionAction(h.id, 'rejected')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length === 0 && successionRequests.length === 0 && (
        <div className="card mb-6">
          <EmptyState icon={<CheckSquare className="w-12 h-12" />} title="No pending requests" subtitle="All registration and succession requests are handled." />
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-slate-800 dark:text-white">Pending Registrations ({pending.length})</h2>
          {pending.map(h => (
            <div key={h.id} className="card flex items-center gap-4">
              <Avatar name={h.name} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                <p className="text-sm text-slate-500">{h.email} · {h.department}</p>
              </div>
              <Badge variant="yellow">Pending</Badge>
              <div className="flex gap-2">
                <button onClick={() => handleAction(h.id, 'approved')} className="btn-success"><Check className="w-4 h-4" /></button>
                <button onClick={() => handleAction(h.id, 'rejected')} className="btn-danger"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Processed Registrations</h2>
          {processed.map(h => (
            <div key={h.id} className="card flex items-center gap-4 opacity-75">
              <Avatar name={h.name} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                <p className="text-sm text-slate-500">{h.email} · {h.department}</p>
              </div>
              <Badge variant={h.status === 'approved' ? 'green' : 'red'}>{h.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
