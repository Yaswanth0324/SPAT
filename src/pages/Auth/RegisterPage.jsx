import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '../../components/ui/UIComponents';
import { DEPARTMENTS, ROLES } from '../../utils/mockData';
import { addUser, isEmailRegistered, setRegistered, generateId, simulateOTP, getUsers, getDepartmentsByCollege, addDepartmentToCollege, getColleges } from '../../utils/localStorage';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [form, setForm] = useState({
    college: '', department: '', role: '',
    email: '', name: '', mentorName: '',
    password: '', confirmPassword: '',
    idCardFile: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Get mentors for dropdown
  const mentors = getUsers().filter(u => u.role === ROLES.MENTOR && u.college === form.college && u.department === form.department);

  const sendOTP = () => {
    if (!form.email) { showToast('Enter email first', 'warning'); return; }
    if (isEmailRegistered(form.email)) { showToast('Email already registered!', 'error'); return; }
    const otp = simulateOTP();
    setOtpValue(otp);
    setOtpSent(true);
    showToast(`OTP sent! (Demo: ${otp})`, 'info', 5000);
  };

  const verifyOTP = () => {
    if (otpInput === otpValue) {
      setOtpVerified(true);
      showToast('OTP verified!', 'success');
    } else {
      showToast('Invalid OTP', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpVerified) { showToast('Please verify OTP first', 'warning'); return; }
    if (form.password !== form.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    const deptToUse = form.department === 'Other' ? customDept.trim() : form.department;
    if (form.department === 'Other' && !deptToUse) {
      showToast('Please enter a department name', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (form.department === 'Other') {
        addDepartmentToCollege(form.college, deptToUse);
      }

      const newUser = {
        id: generateId('user'),
        role: form.role,
        name: form.name,
        email: form.email,
        password: form.password,
        college: form.college,
        department: deptToUse,
        status: 'pending',  // Mentor must approve before student can login
        phone: '',
        ...(form.role === ROLES.STUDENT && { mentorName: form.mentorName, mentorId: mentors.find(m => m.name === form.mentorName)?.id || '' }),
        ...(form.role === ROLES.HOD && { hodId: form.email }),
        avatar: null,
      };
      addUser(newUser);
      setRegistered();
      const successMsg = form.role === ROLES.STUDENT
        ? 'Registration submitted! Your mentor must approve your account before you can login.'
        : 'Registration successful! Please login.';
      showToast(successMsg, 'success', 5000);
      setTimeout(() => navigate('/login'), 2000);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page py-8">
      {ToastComponent}
      <div className="auth-card max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-glow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join SPARK today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: College / Dept / Role */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label-field">College Name</label>
              <select className="select-field" value={form.college} onChange={e => {
                setForm(f => ({ ...f, college: e.target.value, department: '' }));
                setCustomDept('');
              }} required>
                <option value="">Select College</option>
                {getColleges().map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Department</label>
              <select className="select-field" value={form.department} onChange={e => {
                set('department', e.target.value);
                if (e.target.value !== 'Other') setCustomDept('');
              }} required>
                <option value="">Select Department</option>
                {getDepartmentsByCollege(form.college).map(d => <option key={d} value={d}>{d}</option>)}
                {form.college && <option value="Other">Other (Add New Department)</option>}
              </select>
            </div>
            {form.department === 'Other' && (
              <div className="animate-fadeIn">
                <label className="label-field text-primary-600 dark:text-primary-400">New Department Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter new department name"
                  value={customDept}
                  onChange={e => setCustomDept(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label className="label-field">Role</label>
              <select className="select-field" value={form.role} onChange={e => set('role', e.target.value)} required>
                <option value="">Select Role</option>
                <option value={ROLES.HOD}>HOD</option>
                <option value={ROLES.MENTOR}>Mentor</option>
                <option value={ROLES.STUDENT}>Student</option>
              </select>
            </div>
          </div>

          {/* Show rest only if role selected */}
          {form.role && (
            <>
              {/* Email + OTP */}
              <div>
                <label className="label-field">Email Address</label>
                <div className="flex gap-2">
                  <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                  <button type="button" onClick={sendOTP} className="btn-secondary shrink-0 text-xs px-3">
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="label-field">Enter OTP</label>
                  <div className="flex gap-2">
                    <input type="text" className="input-field" placeholder="6-digit OTP" maxLength={6} value={otpInput} onChange={e => setOtpInput(e.target.value)} />
                    <button type="button" onClick={verifyOTP} className={`shrink-0 text-xs px-4 rounded-xl font-semibold ${otpVerified ? 'bg-emerald-600 text-white' : 'btn-secondary'}`}>
                      {otpVerified ? <CheckCircle className="w-4 h-4" /> : 'Verify'}
                    </button>
                  </div>
                  {otpVerified && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> OTP Verified</p>}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="label-field">Full Name</label>
                <input type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              {/* Mentor name (Student only) */}
              {form.role === ROLES.STUDENT && (
                <div>
                  <label className="label-field">Mentor Name</label>
                  {mentors.length > 0 ? (
                    <select className="select-field" value={form.mentorName} onChange={e => set('mentorName', e.target.value)} required>
                      <option value="">Select Mentor</option>
                      {mentors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="input-field" placeholder="Enter mentor name" value={form.mentorName} onChange={e => set('mentorName', e.target.value)} required />
                  )}
                </div>
              )}

              {/* ID Card upload */}
              <div>
                <label className="label-field">
                  {form.role === ROLES.HOD ? 'HOD ID Card' : form.role === ROLES.MENTOR ? 'Mentor ID Card' : 'Student ID Card'}
                </label>
                <label className="flex items-center gap-3 input-field cursor-pointer text-slate-400">
                  <Upload className="w-5 h-5 text-primary-500" />
                  <span className="text-sm">{form.idCardFile || 'Upload ID Card (JPG/PDF)'}</span>
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => set('idCardFile', e.target.files[0]?.name || '')} />
                </label>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Confirm Password</label>
                  <input type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
