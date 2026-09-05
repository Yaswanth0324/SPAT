import { useState, useEffect } from 'react';
import { UploadCloud, Shield, Building2, Key, Mail, Phone, MapPin, User, Save, Loader } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { StatCard, Badge, useToast, Avatar } from '../../../components/ui/UIComponents';
import { apiUpdateProfile, collegeAdminApi } from '../../../utils/api';


export const CollegeAdminProfile = () => {
  const { user, login, updateSession } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form states — pre-filled from user session, then overridden by fetched profile
  const [adminForm, setAdminForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [collegeForm, setCollegeForm] = useState({
    address: '',
    officialEmail: '',
    chairmanName: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile from database on mount
  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const profile = await collegeAdminApi.getProfile();
        if (!active) return;

        // Populate admin personal form from DB
        setAdminForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
        setAvatar(profile.avatarUrl || null);

        // Populate college details (address + officialEmail) from colleges table
        setCollegeForm(prev => ({
          ...prev,
          officialEmail: profile.collegeOfficialEmail || '',
          address: profile.collegeAddress || '',
        }));

      } catch (err) {
        showToast('Failed to load profile from server', 'error');
      } finally {
        if (active) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => { active = false; };
  }, []);

  // File Upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB! Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        // apiUpdateProfile returns the updated User entity directly
        const updatedUser = await apiUpdateProfile(user.id, { avatar: dataUrl });
        setAvatar(dataUrl);
        // Update session with new avatar
        updateSession({ avatar: dataUrl, avatarUrl: dataUrl });
        showToast('Profile image updated successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to upload image', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Admin Details + College Details together
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update admin personal profile in MySQL DB
      const updatedUser = await apiUpdateProfile(user.id, {
        name: adminForm.name,
        phone: adminForm.phone,
      });

      // Update auth session with new name/phone
      updateSession({
        name: updatedUser.name || adminForm.name,
        fullName: updatedUser.name || adminForm.name,
        phone: updatedUser.phone || adminForm.phone,
      });

      // 2. Save college address + official email to the colleges table
      await collegeAdminApi.updateCollegeDetails({
        address: collegeForm.address || null,
        officialEmail: collegeForm.officialEmail || null,
      });

      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showToast('Please enter your current password.', 'warning');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }

    try {
      await apiUpdateProfile(user.id, {
        password: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword,
      });

      showToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-slate-500 dark:text-slate-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl space-y-6 pb-12">
      {ToastComponent}

      {/* Title Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Institutional Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your administrator profile and registered college credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Avatar / Summary */}
        <div className="space-y-6">
          <div className="card text-center p-6 bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-950/40 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
            <div className="relative inline-block mt-4">
              <Avatar name={user?.name} src={avatar} size="xl" />
              <label className="absolute -bottom-1 -right-1 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full cursor-pointer transition-colors shadow-lg border-2 border-white dark:border-gray-900">
                <UploadCloud className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-4">{adminForm.name || user?.name}</h2>
            <Badge variant="purple">College Administrator</Badge>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              ID: {user?.id}
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800/40 my-4 pt-4 text-left">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Avatar Policy</p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-bold leading-normal bg-orange-50/50 dark:bg-orange-950/10 p-2.5 rounded-xl border border-orange-100/50 dark:border-orange-950/20">
                Please upload &lt;= 2MB images only. Use college/official photos.
              </p>
            </div>
          </div>

          {/* License Status Widget */}
          <div className="card p-5 bg-gradient-to-br from-orange-600 to-amber-600 text-white border-0 rounded-2xl shadow-md">
            <h3 className="font-bold text-sm uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Institutional License
            </h3>
            <p className="text-2xl font-black mt-2 truncate">{user?.college || 'No College Assigned'}</p>
            <p className="text-xs text-orange-100 mt-1">Authorized Node &amp; System Registry Active</p>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveDetails} className="space-y-6">

            {/* 1. College Admin Details */}
            <div className="card p-6 bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-950/40 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <User className="w-5 h-5 text-orange-500" /> Admin Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Administrator Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={adminForm.name}
                    onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Admin Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="input-field pl-10"
                      value={adminForm.email}
                      onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Contact Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="e.g. 9876543210"
                      value={adminForm.phone}
                      onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. College Info (read-only display from DB) */}
            <div className="card p-6 bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-950/40 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <Building2 className="w-5 h-5 text-orange-500" /> Institutional Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label-field">College Name</label>
                  <input
                    type="text"
                    readOnly
                    className="input-field bg-slate-50 dark:bg-slate-800/30 cursor-not-allowed text-slate-600 dark:text-slate-400"
                    value={user?.college || 'Not assigned'}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">College name is managed by the System Administrator.</p>
                </div>

                <div>
                  <label className="label-field">College Official Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. info@mitcollege.edu"
                      className="input-field pl-10"
                      value={collegeForm.officialEmail}
                      onChange={e => setCollegeForm({ ...collegeForm, officialEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">College Registered Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <textarea
                      placeholder="Enter the official registered address of the college campus..."
                      className="input-field pl-10 h-24 resize-none pt-2.5"
                      value={collegeForm.address}
                      onChange={e => setCollegeForm({ ...collegeForm, address: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-normal">
                    💡 This information is displayed on your institutional profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow transition-all duration-200 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* 3. Password Changer Card */}
          <div className="card p-6 bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-950/40 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-500" /> Change Security Password
              </h3>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              >
                {isChangingPassword ? 'Cancel Action' : 'Modify Password'}
              </button>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="label-field">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter active current password"
                    className="input-field"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">New Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    className="input-field"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Confirm Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new secure password"
                    className="input-field"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-sm font-semibold shadow hover:from-orange-700 hover:to-amber-700 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-dark-900/10 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-xs font-bold text-slate-500">Security Status</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">•••••••••••• (Active Session Secure)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
