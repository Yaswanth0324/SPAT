import { useState } from 'react';
import { UploadCloud, Shield, Building2, Key, Mail, Phone, MapPin, User, Save } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getUsers, saveUsers, getColleges, saveColleges, updateUser } from '../../../utils/localStorage';
import { StatCard, Badge, useToast, Avatar } from '../../../components/ui/UIComponents';

export const CollegeAdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);

  // Retrieve current college details
  const colleges = getColleges();
  const collegeObj = colleges.find(c => c.name === user?.college) || {};

  // Form states
  const [adminForm, setAdminForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [collegeForm, setCollegeForm] = useState({
    address: collegeObj.address || '',
    officialEmail: collegeObj.officialEmail || '',
    chairmanName: collegeObj.chairmanName || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // File Upload handler with 1MB limit check
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1MB = 1,048,576 bytes
    if (file.size > 1024 * 1024) {
      showToast('Image size exceeds 1MB! Please upload a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
      // Update in user object
      updateUser(user.id, { avatar: dataUrl });
      
      // Refresh context
      refreshUser();
      showToast('Profile image updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Submit Admin & College Details
  const handleSaveDetails = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // 1. Update user account details in localStorage
      updateUser(user.id, {
        name: adminForm.name,
        email: adminForm.email,
        phone: adminForm.phone,
      });

      // 2. Update College Details in localStorage (reflects everywhere)
      const currentColleges = getColleges();
      const updatedColleges = currentColleges.map(col => {
        if (col.name === user.college) {
          return {
            ...col,
            address: collegeForm.address,
            officialEmail: collegeForm.officialEmail,
            chairmanName: collegeForm.chairmanName,
            // Also keep admin details in sync
            adminName: adminForm.name,
            adminEmail: adminForm.email,
            adminPhone: adminForm.phone,
          };
        }
        return col;
      });
      saveColleges(updatedColleges);

      refreshUser();
      setLoading(false);
      showToast('Profile and institutional details updated successfully!', 'success');
    }, 600);
  };

  // Submit Password Change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    // Validations
    if (!passwordForm.currentPassword) {
      showToast('Please enter your current password.', 'warning');
      return;
    }

    if (passwordForm.currentPassword !== user.password) {
      showToast('Incorrect current password! Please verify.', 'error');
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

    // Save password
    updateUser(user.id, { password: passwordForm.newPassword });
    
    // Also update in colleges list if stored there
    const currentColleges = getColleges();
    const updatedColleges = currentColleges.map(col => {
      if (col.name === user.college) {
        return {
          ...col,
          password: passwordForm.newPassword,
        };
      }
      return col;
    });
    saveColleges(updatedColleges);

    showToast('Password updated successfully!', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
  };

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
            
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-4">{user?.name}</h2>
            <Badge variant="purple">College Administrator</Badge>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Institutional ID: {user?.id}
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800/40 my-4 pt-4 text-left">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Avatar Policy</p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-bold leading-normal bg-orange-50/50 dark:bg-orange-950/10 p-2.5 rounded-xl border border-orange-100/50 dark:border-orange-950/20">
                Please upload &lt;= 2mb images only allowed college images not personal photos
              </p>
            </div>
          </div>
          
          {/* License Status Widget */}
          <div className="card p-5 bg-gradient-to-br from-orange-600 to-amber-600 text-white border-0 rounded-2xl shadow-md">
            <h3 className="font-bold text-sm uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Institutional License
            </h3>
            <p className="text-2xl font-black mt-2 truncate">{user?.college}</p>
            <p className="text-xs text-orange-100 mt-1">Authorized Node & System Registry Active</p>
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
                      value={adminForm.phone}
                      onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. College Institutional Details */}
            <div className="card p-6 bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-950/40 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <Building2 className="w-5 h-5 text-orange-500" /> Institutional Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label-field">College Chairman Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Shri. K. Vijayakumar"
                    className="input-field"
                    value={collegeForm.chairmanName}
                    onChange={e => setCollegeForm({ ...collegeForm, chairmanName: e.target.value })}
                  />
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
                      required
                      placeholder="Enter the official registered address of the college campus..."
                      className="input-field pl-10 h-24 resize-none pt-2.5"
                      value={collegeForm.address}
                      onChange={e => setCollegeForm({ ...collegeForm, address: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-normal">
                    💡 Changing this registered address commits updates across the secure campus registry immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
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
