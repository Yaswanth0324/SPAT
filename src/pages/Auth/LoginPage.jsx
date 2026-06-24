import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Shield, KeyRound, Mail, ArrowLeft, CheckCircle, ChevronDown, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login as loginUser, getUsers, getDepartmentsByCollege, addDepartmentToCollege, getColleges } from '../../utils/localStorage';
import { useToast } from '../../components/ui/UIComponents';
import { ROLES } from '../../utils/mockData';
import { authApi } from '../../utils/api';

// ---- System / Admin Login ----
export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ email: '', password: '', adminId: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try SYSTEM_ADMIN first, then COLLEGE_ADMIN
      let data = null;
      try {
        data = await authApi.login(form.email, form.password, ROLES.SYSTEM_ADMIN);
      } catch {
        data = await authApi.login(form.email, form.password, ROLES.COLLEGE_ADMIN);
      }
      login(data);
      if (data.role === ROLES.SYSTEM_ADMIN)      navigate('/dashboard/system-admin');
      else if (data.role === ROLES.COLLEGE_ADMIN) navigate('/dashboard/college-admin');
      else showToast('Not an admin account.', 'error');
    } catch (err) {
      showToast(err.message || 'Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {ToastComponent}
      <div className="auth-card">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-600 rounded-2xl mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">System &amp; College Administrator Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@spark.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div>
            <label className="label-field">Admin ID</label>
            <input type="text" className="input-field" placeholder="SA001" value={form.adminId} onChange={e => setForm({...form, adminId: e.target.value})} required />
          </div>
          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Not an admin? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">User Login</Link>
        </p>
      </div>
    </div>
  );
};

// ---- Forgot Password Modal ----
const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'found' | 'notfound'
  const [foundUser, setFoundUser] = useState(null);

  const handleLookup = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      setFoundUser(user);
      setStep('found');
    } else {
      setStep('notfound');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl p-8 animate-slide-up"
        style={{ background: '#1e0d05', border: '1px solid rgba(234,88,12,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-primary-600 rounded-2xl mb-3 shadow-glow">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold" style={{ color: '#fff1e6' }}>Forgot Password</h2>
          <p className="text-sm mt-1" style={{ color: '#fdba74' }}>Enter your registered email address</p>
        </div>

        {step === 'input' && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4" style={{ color: '#fb923c' }} />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="your@email.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3">
              Find My Account
            </button>
            <button type="button" onClick={onClose}
              className="w-full text-sm text-center py-2 rounded-xl transition-all"
              style={{ color: '#fdba74' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ← Back to Login
            </button>
          </form>
        )}

        {step === 'found' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#fff1e6' }}>Account Found!</p>
              <p className="text-sm mt-1" style={{ color: '#fdba74' }}>{foundUser.name} · {foundUser.role?.replace('_', ' ')}</p>
            </div>
            <div className="rounded-2xl p-4 text-left" style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.25)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#fdba74' }}>Your Password</p>
              <p className="font-mono text-lg font-bold tracking-widest" style={{ color: '#fff1e6' }}>{foundUser.password}</p>
            </div>
            <p className="text-xs" style={{ color: '#c2410c' }}>💡 In a real app, a reset link would be sent to your email.</p>
            <button onClick={onClose} className="btn-primary w-full justify-center">
              Back to Login
            </button>
          </div>
        )}

        {step === 'notfound' && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🔍</div>
            <div>
              <p className="font-semibold" style={{ color: '#fff1e6' }}>No Account Found</p>
              <p className="text-sm mt-1" style={{ color: '#fdba74' }}>No account is registered with <span className="font-mono text-primary-400">{email}</span></p>
            </div>
            <button onClick={() => { setStep('input'); setEmail(''); }}
              className="btn-primary w-full justify-center">
              Try Another Email
            </button>
            <button onClick={onClose}
              className="w-full text-sm py-2 rounded-xl transition-all"
              style={{ color: '#fdba74' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- HOD / Mentor / Student Login ----
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ college: '', department: '', role: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Dynamic department state
  const [availableDepts, setAvailableDepts] = useState([]);
  const [isOtherDept, setIsOtherDept] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [savingDept, setSavingDept] = useState(false);
  const [deptSaved, setDeptSaved] = useState(false);

  // Load departments whenever college changes
  useEffect(() => {
    if (form.college) {
      const depts = getDepartmentsByCollege(form.college);
      setAvailableDepts(depts);
    } else {
      setAvailableDepts([]);
    }
    // Reset department fields when college changes
    setForm(prev => ({ ...prev, department: '' }));
    setIsOtherDept(false);
    setCustomDept('');
    setDeptSaved(false);
  }, [form.college]);

  const handleDeptChange = (e) => {
    const val = e.target.value;
    if (val === '__OTHERS__') {
      setIsOtherDept(true);
      setForm(prev => ({ ...prev, department: '' }));
      setDeptSaved(false);
    } else {
      setIsOtherDept(false);
      setCustomDept('');
      setDeptSaved(false);
      setForm(prev => ({ ...prev, department: val }));
    }
  };

  const handleSaveCustomDept = () => {
    const trimmed = customDept.trim();
    if (!trimmed) {
      showToast('Please enter a department name.', 'error');
      return;
    }
    setSavingDept(true);
    setTimeout(() => {
      addDepartmentToCollege(form.college, trimmed);
      setAvailableDepts(getDepartmentsByCollege(form.college));
      setForm(prev => ({ ...prev, department: trimmed }));
      setIsOtherDept(false);
      setDeptSaved(true);
      setSavingDept(false);
      showToast(`"${trimmed}" added to ${form.college}!`, 'success');
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = loginUser(form.email, form.password, form.role);
      if (res.success) {
        // Block pending / rejected students
        if (res.user.role === ROLES.STUDENT && res.user.status === 'pending') {
          showToast('Your account is pending mentor approval. Please wait for your mentor to approve your registration.', 'warning', 6000);
          setLoading(false);
          return;
        }
        if (res.user.role === ROLES.STUDENT && res.user.status === 'rejected') {
          showToast('Your registration has been rejected by your mentor. Please contact your mentor or register again.', 'error', 6000);
          setLoading(false);
          return;
        }
        login(res.user);
        const role = res.user.role;
        if (role === ROLES.HOD) navigate('/dashboard/hod');
        else if (role === ROLES.MENTOR) navigate('/dashboard/mentor');
        else if (role === ROLES.STUDENT) navigate('/dashboard/student');
        else showToast('Unknown role.', 'error');
      } else {
        showToast('Invalid credentials. Check demo hints below.', 'error');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page">
      {ToastComponent}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-card max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-glow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">HOD · Mentor · Student Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Step 1: College Selection */}
          <div>
            <label className="label-field">College</label>
            <select
              className="select-field"
              value={form.college}
              onChange={e => setForm({ ...form, college: e.target.value })}
              required
            >
              <option value="">Select your College</option>
              {getColleges().map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Step 2: Department (only shown after college is selected) */}
          {form.college && (
            <div
              style={{
                animation: 'slideDown 0.25s ease-out',
              }}
            >
              <style>{`
                @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <label className="label-field">Department</label>

              {!isOtherDept ? (
                <select
                  className="select-field"
                  value={form.department}
                  onChange={handleDeptChange}
                  required
                >
                  <option value="">Select Department</option>
                  {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="__OTHERS__">➕ Others (Add new department)</option>
                </select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Enter department name..."
                      value={customDept}
                      onChange={e => setCustomDept(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSaveCustomDept())}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomDept}
                      disabled={savingDept || !customDept.trim()}
                      className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
                      style={{ minWidth: 'fit-content' }}
                    >
                      {savingDept ? '...' : 'Add'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsOtherDept(false); setCustomDept(''); }}
                    className="text-xs transition-colors"
                    style={{ color: '#ea580c' }}
                  >
                    ← Back to department list
                  </button>
                </div>
              )}

              {deptSaved && form.department && (
                <p className="text-xs mt-1.5 text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Department saved and selected: <span className="font-semibold">{form.department}</span>
                </p>
              )}
            </div>
          )}

          {/* Step 3: Role, Email, Password (shown after department selected) */}
          {form.department && (
            <div className="space-y-4" style={{ animation: 'slideDown 0.25s ease-out' }}>
              <div>
                <label className="label-field">Role</label>
                <select className="select-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                  <option value="">Select Role</option>
                  <option value={ROLES.HOD}>HOD</option>
                  <option value={ROLES.MENTOR}>Mentor</option>
                  <option value={ROLES.STUDENT}>Student</option>
                </select>
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" className="input-field" placeholder="your@email.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label-field mb-0">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#ea580c' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c2410c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ea580c'}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          )}
        </form>


        <div className="flex items-center justify-between mt-5">
          <Link to="/admin-login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Admin Login</Link>
          <Link to="/register" className="text-sm text-slate-500 dark:text-slate-400 hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

