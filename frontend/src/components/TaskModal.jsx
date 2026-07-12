import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiSearch, FiUser } from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/auth/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to retrieve employees list', error);
      }
    };

    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Pending');
      setAssigneeId(task.userId?._id || task.userId || '');
      setPriority(task.priority || 'Medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setCategory(task.category || 'Work');
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setAssigneeId('');
      setPriority('Medium');
      setDueDate('');
      setCategory('Work');
    }
    setErrors({});
    setIsEmployeeDropdownOpen(false);
    setSearchTerm('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!assigneeId) {
      newErrors.assigneeId = 'Please assign this task to an employee';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      userId: assigneeId,
      priority,
      dueDate: dueDate || null,
      category,
    });
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-900 border border-slate-150 dark:border-slate-800 transform transition-all animate-fade-in animate-duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {task ? 'Edit Task Assignment' : 'Assign New Task'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Side-by-side 2 column grid to decrease height & increase width */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Left Column (Title & Description) */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete project proposal"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim() && errors.title) {
                      setErrors((prev) => ({ ...prev, title: null }));
                    }
                  }}
                  className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-slate-955 placeholder-slate-400 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                    errors.title
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  placeholder="Provide a detailed description of the task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-955 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455 resize-none h-[116px]"
                ></textarea>
              </div>
            </div>

            {/* Right Column (Assignee, Priority/DueDate, Status) */}
            <div className="space-y-4">
              {/* Assign Employee */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-405">
                    Assign Employee *
                  </label>
                  
                  {/* Quick Assign to Me Button */}
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        const me = employees.find(emp => emp._id === user.id || emp._id === user._id) || user;
                        setAssigneeId(me._id || me.id || '');
                        if (errors.assigneeId) {
                          setErrors((prev) => ({ ...prev, assigneeId: null }));
                        }
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-350 transition-colors uppercase tracking-wider flex items-center"
                    >
                      <FiUser className="mr-0.5" /> Assign to me
                    </button>
                  )}
                </div>

                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  className={`mt-1.5 flex w-full items-center justify-between rounded-xl border bg-white px-4 py-1.5 text-sm text-slate-955 outline-none transition-all duration-200 dark:bg-dark-950 dark:text-slate-100 ${
                    errors.assigneeId
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:focus:border-indigo-455'
                  }`}
                >
                  {assigneeId ? (
                    (() => {
                      const selectedEmp = employees.find(emp => emp._id === assigneeId) || (user && (user.id === assigneeId || user._id === assigneeId) ? user : null);
                      if (selectedEmp) {
                        return (
                          <div className="flex items-center space-x-2.5">
                            {selectedEmp.avatar ? (
                              <img
                                src={selectedEmp.avatar}
                                alt={selectedEmp.name}
                                className="h-5.5 w-5.5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[9px] font-bold text-white uppercase">
                                {selectedEmp.name ? selectedEmp.name.charAt(0) : 'U'}
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {selectedEmp.name}
                            </span>
                          </div>
                        );
                      }
                      return <span className="text-slate-400">-- Choose Assignee --</span>;
                    })()
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">-- Choose Assignee --</span>
                  )}
                  
                  <svg
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      isEmployeeDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isEmployeeDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsEmployeeDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-slate-150 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-dark-900 scrollbar-thin animate-fade-in">
                      {/* Search Input */}
                      <div className="relative mb-2 px-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <FiSearch className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search employee..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-dark-955 dark:text-slate-100"
                        />
                      </div>

                      {/* Dropdown Items */}
                      <div className="space-y-0.5">
                        {filteredEmployees.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                            No employees found
                          </div>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const isSelected = emp._id === assigneeId;
                            return (
                              <button
                                key={emp._id}
                                type="button"
                                onClick={() => {
                                  setAssigneeId(emp._id);
                                  setIsEmployeeDropdownOpen(false);
                                  if (errors.assigneeId) {
                                    setErrors((prev) => ({ ...prev, assigneeId: null }));
                                  }
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-xs transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-850 ${
                                  isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-2.5">
                                  {emp.avatar ? (
                                    <img
                                      src={emp.avatar}
                                      alt={emp.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white uppercase">
                                      {emp.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="overflow-hidden">
                                    <p className={`font-semibold text-slate-850 dark:text-slate-100 truncate ${
                                      isSelected ? 'text-indigo-650 dark:text-indigo-400 font-bold' : ''
                                    }`}>
                                      {emp.name}
                                    </p>
                                    <p className="text-[10px] text-slate-455 dark:text-slate-500 truncate">
                                      {emp.email}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <svg
                                    className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
                {errors.assigneeId && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.assigneeId}</p>
                )}
              </div>

              {/* Priority & Due Date (Side by side grid) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-955 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-955 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                  />
                </div>
              </div>

              {/* Category & Status (Side by side grid) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-955 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-955 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-100 dark:focus:border-indigo-455"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
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
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
