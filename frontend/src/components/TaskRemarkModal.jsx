 import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const TaskRemarkModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setRemark(task?.remark || '');
      setErrors({});
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation is optional for remark, but let's encourage one
    const newErrors = {};
    if (!remark.trim()) {
      newErrors.remark = 'Remark is required to complete this task';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      status: 'Completed',
      remark: remark.trim(),
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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-900 border border-slate-150 dark:border-slate-800 transform transition-all animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Complete Task
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
              Task: {task?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Remark Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completion Remark *
            </label>
            <textarea
              placeholder="e.g. Completed the reports and shared them with the sales team."
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (e.target.value.trim() && errors.remark) {
                  setErrors((prev) => ({ ...prev, remark: null }));
                }
              }}
              rows="4"
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-slate-950 placeholder-slate-400 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                errors.remark
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
              }`}
            ></textarea>
            {errors.remark && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.remark}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-250 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/55 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Submit & Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskRemarkModal;
