import { useState } from 'react';
import { User, Mail, Phone, Lock, Upload, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateUser, getUsers } from '../../../utils/localStorage';
import { useToast, Avatar } from '../../../components/ui/UIComponents';
import { apiUpdateProfile } from '../../../utils/api';

export const MentorProfile = () => {
  const { user, login } = useAuth();
  const { showToast, ToastComponent } = useToast();

  // --- Profile Edit State ---
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // --- Password Change State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Succession Form State ---
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorEmail, setNewMentorEmail] = useState('');
  const [newMentorPassword, setNewMentorPassword] = useState('');
  const [newMentorPhone, setNewMentorPhone] = useState('');

  // --- Profile Image Upload ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 1MB
    const limit = 1 * 1024 * 1024;
    if (file.size > limit) {
      showToast('Image size exceeds 1MB limit! ⚠️', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await apiUpdateProfile(user.id, { profileImage: base64String });
        login(res.user);
        showToast('Profile image updated successfully! ✓', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to upload profile image! ⚠️', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Save Contact Info ---
  const handleSaveContactInfo = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email cannot be empty! ⚠️', 'error');
      return;
    }

    try {
      const res = await apiUpdateProfile(user.id, { name, email, phone });
      login(res.user);
      setIsEditingInfo(false);
      showToast('Contact details saved successfully! ✓', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save contact details! ⚠️', 'error');
    }
  };

  // --- Change Password ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields! ⚠️', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match! ⚠️', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters! ⚠️', 'error');
      return;
    }

    try {
      const res = await apiUpdateProfile(user.id, {
        password: newPassword,
        currentPassword: currentPassword
      });
      login(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully! ✓', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update password! ⚠️', 'error');
    }
  };

  // --- Submit Handover Request ---
  const handleSuccessionRequest = (e) => {
    e.preventDefault();
    if (!newMentorName.trim() || !newMentorEmail.trim() || !newMentorPassword.trim()) {
      showToast('Please fill in Name, Email, and Password! ⚠️', 'error');
      return;
    }

    // Check if new mentor email is already in use
    const emailExists = getUsers().some(u => u.email.toLowerCase() === newMentorEmail.trim().toLowerCase());
    if (emailExists) {
      showToast('Registration email is already in use! ⚠️', 'error');
      return;
    }

    const request = {
      name: newMentorName.trim(),
      email: newMentorEmail.trim().toLowerCase(),
      password: newMentorPassword,
      phone: newMentorPhone.trim(),
      status: 'pending',
      requestedAt: new Date().toLocaleDateString()
    };

    updateUser(user.id, { successionRequest: request });
    
    // Clear Form
    setNewMentorName('');
    setNewMentorEmail('');
    setNewMentorPassword('');
    setNewMentorPhone('');

    showToast('Mentor Succession Request submitted to HOD! ✓', 'success');
  };

  const handleCancelSuccession = () => {
    updateUser(user.id, { successionRequest: null });
    showToast('Succession request cancelled. ✓', 'info');
  };

  const activeSuccession = user.successionRequest && user.successionRequest.status === 'pending';

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {ToastComponent}

      {/* Header */}
      <div className="border-b border-slate-100 dark:border-dark-800 pb-5">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal info, contact details, and mentorship succession parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 text-center border border-slate-100 dark:border-dark-800 flex flex-col items-center">
            <div className="relative group mb-4">
              <Avatar name={user.name} src={user.profileImage} size="xl" />
              <label className="absolute bottom-0 right-0 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-105">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mt-1">
              Faculty Mentor
            </p>
            <p className="text-sm text-slate-500 mt-2">{user.department}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.college}</p>
            
            <div className="mt-4 w-full border-t border-slate-100 dark:border-dark-800 pt-4 text-xs text-slate-400 text-center">
              Image upload limit: {"<= 1MB (Base64 verified)"}
            </div>
          </div>

          {/* Active Succession Request Warning */}
          {activeSuccession && (
            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
              <span className="font-semibold text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4" /> Succession Request Pending
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Replacing mentor account with **{user.successionRequest.name}** ({user.successionRequest.email}). This change will take place upon HOD approval.
              </p>
              <button
                type="button"
                onClick={handleCancelSuccession}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
              >
                Cancel Handover Request
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Account Details & Handover */}
        <div className="lg:col-span-2 space-y-6">

          {/* Info Edit Form */}
          <div className="card p-6 md:p-8 border border-slate-100 dark:border-dark-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" /> Mentor Profile Info
              </h3>
              {!isEditingInfo && (
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors"
                >
                  Edit Details
                </button>
              )}
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Mentor Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditingInfo}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-75 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={user.department}
                    disabled
                    className="w-full p-3 text-sm bg-slate-100 dark:bg-dark-800 opacity-60 rounded-xl border border-slate-200 dark:border-dark-750 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingInfo}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-75 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditingInfo}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-75 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {isEditingInfo && (
                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user.name);
                      setEmail(user.email);
                      setPhone(user.phone || '');
                      setIsEditingInfo(false);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 text-slate-700 dark:text-white rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow transition-all"
                  >
                    Save Info
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Password Changing Form */}
          <div className="card p-6 md:p-8 border border-slate-100 dark:border-dark-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-orange-500" /> Change Account Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                >
                  <KeyRound className="w-4 h-4" /> Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Mentor Handover / Succession Form */}
          <div className="card p-6 md:p-8 border border-slate-100 dark:border-dark-800 relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-dark-900 dark:to-dark-950/20">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              Mentor Handover & Succession Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Transition student mentorship and historical data to a new Mentor in-place. Input the details of the incoming Mentor. Upon HOD approval, this account's details will update, and students will not lose any submissions or record details.
            </p>

            <form onSubmit={handleSuccessionRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    New Mentor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMentorName}
                    onChange={(e) => setNewMentorName(e.target.value)}
                    placeholder="Prof. Rajesh Varma"
                    disabled={activeSuccession}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    New Mentor Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newMentorEmail}
                    onChange={(e) => setNewMentorEmail(e.target.value)}
                    placeholder="rajesh.varma@mit.edu"
                    disabled={activeSuccession}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    New Mentor Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newMentorPassword}
                    onChange={(e) => setNewMentorPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={activeSuccession}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    New Mentor Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMentorPhone}
                    onChange={(e) => setNewMentorPhone(e.target.value)}
                    placeholder="+91 9876543222"
                    disabled={activeSuccession}
                    className="w-full p-3 text-sm bg-slate-50 disabled:opacity-50 dark:bg-dark-850 rounded-xl border border-slate-200 dark:border-dark-750 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={activeSuccession}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all"
                >
                  Change Mentor
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
