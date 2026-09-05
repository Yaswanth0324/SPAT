import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Shield, KeyRound, Mail, ArrowLeft, CheckCircle, PlusCircle, RotateCcw, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addDepartmentToCollege } from '../../utils/localStorage';
import { apiLogin, apiGetColleges, apiGetDepartments, apiSendOtp, apiVerifyOtp, apiResetPassword } from '../../utils/api';
import { useToast } from '../../components/ui/UIComponents';
import { ROLES } from '../../utils/mockData';

// ---- System / Admin Login ----
export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect session-expired redirect
  const sessionExpired = new URLSearchParams(location.search).get('reason') === 'session_expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Determine role — try SYSTEM_ADMIN first, fall back to COLLEGE_ADMIN
      let res = null;
      let role = null;

      // Try SYSTEM_ADMIN
      try {
        res = await apiLogin(form.email, form.password, 'SYSTEM_ADMIN');
        role = 'SYSTEM_ADMIN';
      } catch {
        // Try COLLEGE_ADMIN
        try {
          res = await apiLogin(form.email, form.password, 'COLLEGE_ADMIN');
          role = 'COLLEGE_ADMIN';
        } catch (err2) {
          throw new Error(err2.message || 'Invalid credentials');
        }
      }

      login(res);
      if (role === 'SYSTEM_ADMIN') navigate('/dashboard/system-admin');
      else if (role === 'COLLEGE_ADMIN') navigate('/dashboard/college-admin');
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {ToastComponent}
      <div className="auth-card">
        {/* Session-expired banner */}
        {sessionExpired && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.4)', color: '#fb923c' }}>
            ⚠️ Your session has expired. Please log in again.
          </div>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-600 rounded-2xl mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">System & College Administrator Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@sapt.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
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

// ---- Forgot Password Modal (OTP-based, works for HOD / Mentor / Student) ----
const ForgotPasswordModal = ({ onClose }) => {
  // step: 'email' → 'otp' → 'newpass' → 'success'
  const [step, setStep]           = useState('email');
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [resendCd, setResendCd]   = useState(0); // countdown seconds

  // Countdown timer for resend
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  const startCountdown = () => setResendCd(60);

  // ── Step 1: Send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiSendOtp(email.trim().toLowerCase(), 'PASSWORD_RESET');
      setStep('otp');
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check your email.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCd > 0) return;
    setError('');
    setLoading(true);
    try {
      await apiSendOtp(email.trim().toLowerCase(), 'PASSWORD_RESET');
      startCountdown();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Advance to new-password step ─────────────────────
  // NOTE: We do NOT call apiVerifyOtp here because that endpoint clears
  // the OTP from the DB (it's designed for email verification).
  // For password reset, the OTP is validated inside apiResetPassword itself.
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) { setError('OTP must be exactly 6 digits.'); return; }
    setStep('newpass');
  };

  // ── Step 3: Reset Password ────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await apiResetPassword(email.trim().toLowerCase(), otp.trim(), newPass);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const modalBg = { background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' };
  const cardStyle = {
    background: 'linear-gradient(135deg, #1a0a02 0%, #1e0d05 100%)',
    border: '1px solid rgba(234,88,12,0.35)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(234,88,12,0.08)'
  };

  // OTP digit boxes — individual character display
  const OtpDisplay = () => (
    <div className="flex gap-2 justify-center my-3">
      {[0,1,2,3,4,5].map(i => (
        <div key={i}
          className="w-10 h-12 rounded-xl flex items-center justify-center font-mono text-xl font-bold"
          style={{
            background: otp[i] ? 'rgba(234,88,12,0.2)' : 'rgba(255,255,255,0.04)',
            border: otp[i] ? '1.5px solid rgba(234,88,12,0.7)' : '1.5px solid rgba(255,255,255,0.1)',
            color: '#fff1e6',
            transition: 'all 0.15s'
          }}
        >
          {otp[i] || ''}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={modalBg}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl p-8 animate-slide-up" style={cardStyle}>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: '#fff1e6' }}>Forgot Password?</h2>
              <p className="text-sm mt-1.5" style={{ color: '#fdba74' }}>Enter your email — we'll send a 6-digit OTP to reset your password</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="label-field">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4" style={{ color: '#fb923c' }} />
                  <input
                    id="fp-email"
                    type="email"
                    className="input-field pl-10"
                    placeholder="your@email.edu"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    required
                    autoFocus
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm rounded-xl px-3 py-2" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
                  {error}
                </p>
              )}
              <button id="fp-send-otp" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
              <button type="button" onClick={onClose}
                className="w-full text-sm text-center py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                style={{ color: '#fdba74' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Verify OTP ── */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: '#fff1e6' }}>Check Your Email</h2>
              <p className="text-sm mt-1.5" style={{ color: '#fdba74' }}>We sent a 6-digit OTP to</p>
              <p className="text-sm font-mono font-bold mt-0.5" style={{ color: '#fb923c' }}>{email}</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="label-field text-center block">Enter OTP</label>
                <OtpDisplay />
                <input
                  id="fp-otp"
                  type="text"
                  className="input-field text-center font-mono tracking-widest text-lg"
                  placeholder="······"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  required
                  autoFocus
                />
                <p className="text-xs mt-1.5 text-center" style={{ color: '#9ca3af' }}>OTP expires in 10 minutes</p>
              </div>
              {error && (
                <p className="text-sm rounded-xl px-3 py-2" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
                  {error}
                </p>
              )}
              <button id="fp-verify-otp" type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center py-3">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="flex items-center gap-1 transition-colors"
                  style={{ color: '#fdba74' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>
                <button type="button" onClick={handleResend} disabled={resendCd > 0 || loading}
                  className="flex items-center gap-1 transition-colors"
                  style={{ color: resendCd > 0 ? '#6b7280' : '#ea580c', cursor: resendCd > 0 ? 'not-allowed' : 'pointer' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 'newpass' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold" style={{ color: '#fff1e6' }}>Set New Password</h2>
              <p className="text-sm mt-1.5" style={{ color: '#fdba74' }}>Choose a strong password for your account</p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label-field">New Password</label>
                <div className="relative">
                  <input
                    id="fp-new-pass"
                    type={showNew ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Min. 6 characters"
                    value={newPass}
                    onChange={e => { setNewPass(e.target.value); setError(''); }}
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300">
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-field">Confirm Password</label>
                <div className="relative">
                  <input
                    id="fp-confirm-pass"
                    type={showConf ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Re-enter new password"
                    value={confirmPass}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    required
                  />
                  <button type="button" onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300">
                    {showConf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password match indicator */}
                {confirmPass.length > 0 && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: newPass === confirmPass ? '#34d399' : '#f87171' }}>
                    {newPass === confirmPass
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Passwords match</>  
                      : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm rounded-xl px-3 py-2" style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
                  {error}
                </p>
              )}
              <button id="fp-reset-submit" type="submit"
                disabled={loading || newPass !== confirmPass || newPass.length < 6}
                className="btn-primary w-full justify-center py-3">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 'success' && (
          <div className="text-center space-y-5">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.4)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: '#fff1e6' }}>Password Reset!</h2>
              <p className="text-sm mt-2" style={{ color: '#fdba74' }}>Your password has been updated successfully. You can now log in with your new password.</p>
            </div>
            <button id="fp-back-login" onClick={onClose} className="btn-primary w-full justify-center py-3">
              Back to Login
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
  const location = useLocation();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ college: '', department: '', role: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Detect session-expired redirect
  const sessionExpired = new URLSearchParams(location.search).get('reason') === 'session_expired';

  // Dynamic department state
  const [colleges, setColleges] = useState([]);
  const [availableDepts, setAvailableDepts] = useState([]);
  const [isOtherDept, setIsOtherDept] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [savingDept, setSavingDept] = useState(false);
  const [deptSaved, setDeptSaved] = useState(false);

  // Load colleges on mount
  useEffect(() => {
    let active = true;
    const loadColleges = async () => {
      const list = await apiGetColleges();
      if (active) setColleges(list);
    };
    loadColleges();
    return () => { active = false; };
  }, []);

  // Load departments whenever college changes
  useEffect(() => {
    if (!form.college) {
      setAvailableDepts([]);
      setForm(prev => ({ ...prev, department: '' }));
      setIsOtherDept(false);
      setCustomDept('');
      setDeptSaved(false);
      return;
    }
    let active = true;
    const loadDepts = async () => {
      const list = await apiGetDepartments(form.college);
      if (active) setAvailableDepts(list);
    };
    loadDepts();
    // Reset department fields when college changes
    setForm(prev => ({ ...prev, department: '' }));
    setIsOtherDept(false);
    setCustomDept('');
    setDeptSaved(false);
    return () => { active = false; };
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
      setAvailableDepts(prev => {
        if (prev.includes(trimmed)) return prev;
        return [...prev, trimmed];
      });
      setForm(prev => ({ ...prev, department: trimmed }));
      setIsOtherDept(false);
      setDeptSaved(true);
      setSavingDept(false);
      showToast(`"${trimmed}" added to ${form.college}!`, 'success');
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin(form.email, form.password, form.role);
      const userRole = res.role;

      // Block pending / rejected accounts
      const statusLower = res.status ? res.status.toLowerCase() : '';
      if (statusLower === 'pending') {
        showToast('Your account is pending approval. Please wait.', 'warning', 6000);
        return;
      }
      if (statusLower === 'rejected') {
        showToast('Your registration was rejected. Please contact your mentor.', 'error', 6000);
        return;
      }

      login(res);
      if (userRole === ROLES.HOD) navigate('/dashboard/hod');
      else if (userRole === ROLES.MENTOR) navigate('/dashboard/mentor');
      else if (userRole === ROLES.STUDENT) navigate('/dashboard/student');
      else showToast('Unknown role.', 'error');
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {ToastComponent}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-card max-w-lg">
        {/* Session-expired banner */}
        {sessionExpired && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.4)', color: '#fb923c' }}>
            ⚠️ Your session has expired. Please log in again.
          </div>
        )}
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
              {colleges.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
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

