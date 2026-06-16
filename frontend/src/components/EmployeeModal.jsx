import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Spinner from './Spinner';

const EmployeeModal = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email,
      password,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-900 border border-slate-150 dark:border-slate-800 transform transition-all animate-fade-in animate-duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim() && errors.name) {
                  setErrors((prev) => ({ ...prev, name: null }));
                }
              }}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-slate-955 placeholder-slate-400 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                errors.name
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="employee@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value && errors.email) {
                  setErrors((prev) => ({ ...prev, email: null }));
                }
              }}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-slate-955 placeholder-slate-400 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                errors.email
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password *
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length >= 6 && errors.password) {
                  setErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-slate-955 placeholder-slate-400 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                errors.password
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-250 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/55 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 min-w-[120px]"
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
