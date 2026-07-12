import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiFilter, FiFolder, FiUser, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskRemarkModal from '../components/TaskRemarkModal';
import Spinner from '../components/Spinner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const limit = 6;
  
  // User info and roles
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // Admin specific employee filter states
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [isEmployeeFilterOpen, setIsEmployeeFilterOpen] = useState(false);
  const [employeeFilterSearchTerm, setEmployeeFilterSearchTerm] = useState('');

  // Fetch employees list if user is Admin
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/auth/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to load employees list', error);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  // Fetch Tasks from API
  const fetchTasks = async () => {
    try {
      const params = {
        status: selectedFilter,
        search: searchQuery,
        category: selectedCategory,
        sortBy,
        sortOrder,
        page,
        limit,
      };

      if (isAdmin && selectedEmployeeId !== 'All') {
        params.userId = selectedEmployeeId;
      }

      const response = await api.get('/tasks', { params });
      
      // If we got back a paginated object
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
        setTotalPages(response.data.pages || 1);
        setTotalTasksCount(response.data.total || 0);
      } else {
        // Fallback for non-paginated arrays
        setTasks(response.data || []);
        setTotalPages(1);
        setTotalTasksCount(response.data?.length || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounced API calling on search, filter, or employee selection change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilter, selectedEmployeeId, selectedCategory, sortBy, sortOrder, page]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilter, selectedEmployeeId, selectedCategory, sortBy, sortOrder]);

  // Toggle Completion Status
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    // Employees need to write a remark when completing
    if (newStatus === 'Completed' && !isAdmin) {
      setTaskToComplete(task);
      setIsRemarkModalOpen(true);
      return;
    }

    try {
      const response = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
        remark: newStatus === 'Pending' ? '' : task.remark, // clear remark if reverting to pending
      });

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === task._id ? response.data : t))
      );
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle status');
    }
  };

  // Complete task with remark
  const handleRemarkSubmit = async (data) => {
    try {
      const response = await api.patch(`/tasks/${taskToComplete._id}/status`, {
        status: data.status,
        remark: data.remark,
      });

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskToComplete._id ? response.data : t))
      );
      toast.success('Task marked as completed with remark');
      setIsRemarkModalOpen(false);
      setTaskToComplete(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete task');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id));
      toast.success('Task removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete task');
    }
  };

  // Trigger Edit Modal
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle Form Submission from Modal
  const handleModalSubmit = async (formData) => {
    try {
      if (selectedTask) {
        // Edit Mode
        const response = await api.put(`/tasks/${selectedTask._id}`, formData);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === selectedTask._id ? response.data : t))
        );
        toast.success('Task updated');
      } else {
        // Create Mode
        const response = await api.post('/tasks', formData);
        setTasks((prevTasks) => [response.data, ...prevTasks]);
        toast.success('Task created');
      }
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error(error);
      toast.error('Task submission failed');
    }
  };

  const filteredEmployeesForFilter = employees.filter((emp) =>
    emp.name.toLowerCase().includes(employeeFilterSearchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeFilterSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-250 lg:pl-64">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header with search functionality */}
      <Navbar
        setIsSidebarOpen={setIsSidebarOpen}
        title="Tasks"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Panel */}
      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Header section with add action */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                {isAdmin ? 'Tasks Management Board' : 'My Tasks List'}
              </h2>
              <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
                {isAdmin 
                  ? 'Assign tasks, monitor employee completions, and view employee remarks.'
                  : 'Track and complete tasks assigned to you by the Admin.'}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                <FiPlus className="mr-1.5 h-4.5 w-4.5" /> Assign Task
              </button>
            )}
          </div>

          {/* Filtering System Tabs & Admin Employee Filter Dropdown */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800/85 pb-1">
            {/* Status Filter tabs */}
            <div className="flex -mb-px">
              {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`border-b-2 px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    selectedFilter === tab
                      ? 'border-indigo-650 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-450 hover:border-slate-300 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Controls panel: Sort + Employee selection */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sorting options */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Sort By:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="rounded-xl border border-slate-250 bg-white px-3 py-1.5 text-sm font-medium text-slate-750 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-dark-900 dark:text-slate-200"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="dueDate-asc">Due Date (Soonest)</option>
                  <option value="dueDate-desc">Due Date (Latest)</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>
              </div>

              {/* Admin Employee Filter Dropdown */}
              {isAdmin && (
                <div className="relative flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Assignee:</span>
                  
                  {/* Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsEmployeeFilterOpen(!isEmployeeFilterOpen)}
                    className="flex items-center space-x-2 rounded-xl border border-slate-250 bg-white px-3 py-1.5 text-sm font-medium text-slate-750 outline-none hover:border-indigo-500 dark:border-slate-800 dark:bg-dark-900 dark:text-slate-200 transition-all duration-150"
                  >
                    {selectedEmployeeId !== 'All' ? (
                      (() => {
                        const selectedEmp = employees.find(emp => emp._id === selectedEmployeeId);
                        if (selectedEmp) {
                          return (
                            <div className="flex items-center space-x-1.5">
                              {selectedEmp.avatar ? (
                                <img
                                  src={selectedEmp.avatar}
                                  alt={selectedEmp.name}
                                  className="h-4.5 w-4.5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[8px] font-bold text-white uppercase">
                                  {selectedEmp.name.charAt(0)}
                                </div>
                              )}
                              <span className="font-semibold">{selectedEmp.name}</span>
                            </div>
                          );
                        }
                        return <span>All Employees</span>;
                      })()
                    ) : (
                      <span>All Employees</span>
                    )}
                    
                    <svg
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                        isEmployeeFilterOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isEmployeeFilterOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsEmployeeFilterOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 top-full z-50 mt-1.5 w-60 max-h-72 overflow-y-auto rounded-2xl border border-slate-150 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-dark-900 scrollbar-thin animate-fade-in">
                        {/* Search Input */}
                        <div className="relative mb-2 px-1">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <FiSearch className="h-3.5 w-3.5" />
                          </span>
                          <input
                            type="text"
                            placeholder="Search employee..."
                            value={employeeFilterSearchTerm}
                            onChange={(e) => setEmployeeFilterSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-dark-955 dark:text-slate-100"
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-1">
                          {/* "All Employees" option */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployeeId('All');
                              setIsEmployeeFilterOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-850 ${
                              selectedEmployeeId === 'All' ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <span className={`font-semibold text-slate-850 dark:text-slate-200 ${
                              selectedEmployeeId === 'All' ? 'text-indigo-650 dark:text-indigo-400 font-bold' : ''
                            }`}>
                              All Employees
                            </span>
                            {selectedEmployeeId === 'All' && (
                              <svg
                                className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Individual Employee options */}
                          {filteredEmployeesForFilter.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-405 dark:text-slate-500">
                              No employees found
                            </div>
                          ) : (
                            filteredEmployeesForFilter.map((emp) => {
                              const isSelected = emp._id === selectedEmployeeId;
                              return (
                                <button
                                  key={emp._id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmployeeId(emp._id);
                                    setIsEmployeeFilterOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-850 ${
                                    isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5">
                                    {emp.avatar ? (
                                      <img
                                        src={emp.avatar}
                                        alt={emp.name}
                                        className="h-7 w-7 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white uppercase">
                                        {emp.name.charAt(0)}
                                      </div>
                                    )}
                                    <div className="overflow-hidden">
                                      <p className={`font-semibold text-slate-800 dark:text-slate-100 truncate ${
                                        isSelected ? 'text-indigo-650 dark:text-indigo-400 font-bold' : ''
                                      }`}>
                                        {emp.name}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <svg
                                      className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400"
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
                </div>
              )}
            </div>
          </div>

          {/* Category Filter Pills Row */}
          <div className="flex flex-wrap gap-2 py-1 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center mr-2">Category:</span>
            {['All', 'Work', 'Personal', 'Shopping', 'Others'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-dark-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Task Grid rendering */}
          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-250 bg-white p-12 text-center dark:border-slate-800 dark:bg-dark-900 animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-450 dark:bg-dark-950 dark:text-slate-550">
                <FiFolder className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
                No tasks found
              </h3>
              <p className="mt-1 max-w-xs text-sm text-slate-455 dark:text-slate-500">
                {searchQuery || selectedFilter !== 'All' || (isAdmin && selectedEmployeeId !== 'All')
                  ? 'Adjust your search queries or filters to locate tasks.'
                  : isAdmin
                    ? 'Start assigning tasks to employees to populate the dashboard.'
                    : 'You have no assigned tasks at the moment. All caught up!'}
              </p>
              
              {isAdmin && !searchQuery && selectedFilter === 'All' && selectedEmployeeId === 'All' && (
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-5 inline-flex items-center rounded-xl bg-indigo-55 px-4 py-2.5 text-sm font-semibold text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 transition-all duration-200"
                >
                  <FiPlus className="mr-1.5 h-4 w-4" /> Assign First Task
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Creation & Update Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleModalSubmit}
        task={selectedTask}
      />

      {/* Task Remark Modal */}
      <TaskRemarkModal
        isOpen={isRemarkModalOpen}
        onClose={() => {
          setIsRemarkModalOpen(false);
          setTaskToComplete(null);
        }}
        onSubmit={handleRemarkSubmit}
        task={taskToComplete}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-205 dark:border-slate-800/80 pt-6 mt-8 max-w-7xl mx-auto">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="inline-flex items-center justify-center rounded-xl border border-slate-250 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            Previous
          </button>
          
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} ({totalTasksCount} tasks total)
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="inline-flex items-center justify-center rounded-xl border border-slate-250 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-dark-900 dark:text-slate-300 dark:hover:bg-slate-800/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;
