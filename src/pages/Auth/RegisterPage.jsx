import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '../../components/ui/UIComponents';
import { ROLES } from '../../utils/mockData';
import { apiGetColleges, apiGetDepartments, apiGetMentors, apiSendOtp, apiVerifyOtp, apiRegister } from '../../utils/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentors, setMentors] = useState([]);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customDept, setCustomDept] = useState('');
  const [form, setForm] = useState({
    college: '', department: '', role: '',
    email: '', name: '', mentorName: '',
    password: '', confirmPassword: '',
    idCardFile: null,
    idCardFileName: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Fetch colleges on mount
  useEffect(() => {
    let active = true;
    const loadColleges = async () => {
      const list = await apiGetColleges();
      if (active) setColleges(list);
    };
    loadColleges();
    return () => { active = false; };
  }, []);

  // Fetch departments when selected college changes
  useEffect(() => {
    if (!form.college) {
      setDepartments([]);
      return;
    }
    let active = true;
    const loadDepts = async () => {
      const list = await apiGetDepartments(form.college);
      if (active) setDepartments(list);
    };
    loadDepts();
    return () => { active = false; };
  }, [form.college]);

  // Fetch mentors when college or department changes (for Student role)
  useEffect(() => {
    if (!form.college || !form.department || form.role !== ROLES.STUDENT) {
      setMentors([]);
      return;
    }
    let active = true;
    const loadMentors = async () => {
      const list = await apiGetMentors(form.college, form.department);
      if (active) setMentors(list);
    };
    loadMentors();
    return () => { active = false; };
  }, [form.college, form.department, form.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    const deptToUse = form.department === 'Other' ? customDept.trim() : form.department;
    if (form.department === 'Other' && !deptToUse) {
      showToast('Please enter a department name', 'error');
      return;
    }

    let idCardUrl = null;
    if (form.idCardFile) {
      try {
        idCardUrl = await fileToBase64(form.idCardFile);
      } catch (err) {
        showToast('Error reading ID card file', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        college: form.college,
        department: deptToUse,
        mentorName: form.role === ROLES.STUDENT ? form.mentorName : null,
        idCardUrl: idCardUrl
      };

      await apiRegister(payload);
      showToast('Registration submitted! Verification OTP sent to your email.', 'success', 5000);
      setOtpSent(true);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      showToast('Please enter a 6-digit OTP', 'warning');
      return;
    }
    setLoading(true);
    try {
      await apiVerifyOtp(form.email, otpInput, 'EMAIL_VERIFICATION');
      
      const successMsg = form.role === ROLES.STUDENT
        ? 'Email verified! Account is awaiting mentor approval.'
        : 'Registration successful! You can now log in.';
      showToast(successMsg, 'success', 5000);
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await apiSendOtp(form.email, 'EMAIL_VERIFICATION');
      showToast('A new OTP has been sent to your email.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // If register call succeeded, display the verification screen
  if (otpSent) {
    return (
      <div className="auth-page py-8">
        {ToastComponent}
        <div className="auth-card max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-glow">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Verify Your Email</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              We have sent a 6-digit verification code to <strong className="text-primary-600 dark:text-primary-400">{form.email}</strong>.
            </p>
          </div>

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div>
              <label className="label-field text-center block mb-2">Enter 6-Digit OTP</label>
              <input
                type="text"
                className="input-field text-center font-mono text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete Registration'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Didn't receive the code?{' '}
            <button type="button" onClick={handleResendOtp} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer">
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    );
  }

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
                {colleges.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Department</label>
              <select className="select-field" value={form.department} onChange={e => {
                set('department', e.target.value);
                if (e.target.value !== 'Other') setCustomDept('');
              }} required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
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
              {/* Email Address */}
              <div>
                <label className="label-field">Email Address</label>
                <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>

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
                  <span className="text-sm">{form.idCardFileName || 'Upload ID Card (JPG/PDF)'}</span>
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => {
                      const file = e.target.files[0];
                      setForm(f => ({
                        ...f,
                        idCardFile: file,
                        idCardFileName: file ? file.name : ''
                      }));
                    }} />
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
                {loading ? 'Submitting...' : 'Register & Send OTP'}
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
