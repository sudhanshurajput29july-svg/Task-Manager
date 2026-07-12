import React, { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiCamera, FiUploadCloud } from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle Avatar File Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const response = await api.post('/auth/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAvatar(response.data.url);
      toast.success('Image uploaded successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Profile Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = { name, email, avatar };
      if (password) {
        updateData.password = password;
      }

      const response = await api.put('/auth/profile', updateData);
      const { token, ...userData } = response.data;
      
      // Update local storage and context state
      localStorage.setItem('token', token);
      setUser(userData);
      
      setPassword('');
      setConfirmPassword('');
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-250 lg:pl-64">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar setIsSidebarOpen={setIsSidebarOpen} title="My Profile" />

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
              Profile Management
            </h2>
            <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
              Customize your profile details, change security credentials, and upload an avatar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left Card: Avatar Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800/80 dark:bg-dark-900 flex flex-col items-center justify-center space-y-5">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Profile Avatar
              </h3>
              
              <div className="relative group w-32 h-32">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile Avatar Preview"
                    className="w-32 h-32 rounded-full object-cover shadow-md border-2 border-indigo-100 dark:border-indigo-950"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-200 to-indigo-100 dark:from-dark-950 dark:to-dark-800 text-indigo-700 dark:text-indigo-400 font-extrabold text-4xl flex items-center justify-center shadow-md">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                {/* Camera upload overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 shadow-inner">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <FiCamera className="h-6 w-6 text-slate-100 animate-pulse" />
                </label>
              </div>

              <div className="space-y-1 text-center">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {user?.role}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  Hover to upload/replace. Supported formats: JPG, PNG, GIF. Max size 5MB.
                </p>
              </div>
            </div>

            {/* Right Card: Profile Form */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-dark-900">
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  Account Details
                </h3>

                {/* Name field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <FiUser className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-805 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <FiMail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-805 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                      required
                    />
                  </div>
                </div>

                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pt-4 pb-3">
                  Security (Leave blank to keep current)
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <FiLock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-805 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                        <FiLock className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-805 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Updating...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
