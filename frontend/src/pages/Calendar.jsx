import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiFilter, 
  FiUser, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiCheck,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiInfo,
  FiBriefcase,
  FiShoppingBag,
  FiFolder
} from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import TaskRemarkModal from '../components/TaskRemarkModal';
import Spinner from '../components/Spinner';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);

  // Calendar Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selected Day for details view (defaults to today)
  const [selectedDayStr, setSelectedDayStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [employees, setEmployees] = useState([]);

  // Auth Context
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // Constants
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper: Format Date to YYYY-MM-DD in UTC representation
  const getUTCDateString = (dateObjOrStr) => {
    if (!dateObjOrStr) return '';
    try {
      const date = new Date(dateObjOrStr);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Helper: Get local representation YYYY-MM-DD
  const getLocalDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks for calendar', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employees if Admin
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/auth/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to fetch employees list', error);
      }
    };

    if (isAdmin) {
      fetchEmployees();
    }
    fetchTasks();
  }, [isAdmin]);

  // Handler: Prev Month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Handler: Next Month
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handler: Go to Today
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayStr(getLocalDateString(today));
  };

  // Generate calendar days for the current grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
    const prevMonthDaysCount = new Date(year, month, 0).getDate();

    const calendarDays = [];

    // Previous month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDaysCount - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      calendarDays.push({
        day: dayNum,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      });
    }

    // Current month's days
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      calendarDays.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    // Next month's leading days (pad to multiples of 7, standard 42 cell grid)
    const totalCells = calendarDays.length;
    const nextMonthDaysCount = 42 - totalCells;
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      calendarDays.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return calendarDays;
  };

  // Filter tasks client-side for fluid calendar responses
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // 1. Status Filter
      if (statusFilter !== 'All' && task.status !== statusFilter) return false;

      // 2. Priority Filter
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // 3. Employee Filter (Only relevant for Admin)
      if (isAdmin && employeeFilter !== 'All') {
        const taskUserId = task.userId?._id || task.userId;
        if (taskUserId !== employeeFilter) return false;
      }

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Task Actions
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    
    if (newStatus === 'Completed' && !isAdmin) {
      setTaskToComplete(task);
      setIsRemarkModalOpen(true);
      return;
    }

    try {
      const response = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
        remark: newStatus === 'Pending' ? '' : task.remark,
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

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (selectedTask && selectedTask._id) {
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

  // Open task assigner for a specific cell date
  const handleAssignTaskOnDate = (dateStr, e) => {
    e.stopPropagation(); // Avoid triggering day selection
    if (!isAdmin) return;
    setSelectedTask({ dueDate: dateStr });
    setIsModalOpen(true);
  };

  const calendarDays = generateCalendarDays();
  const todayStr = getLocalDateString(new Date());

  // Tasks for the currently selected day
  const selectedDayTasks = filteredTasks.filter(
    (task) => task.dueDate && getUTCDateString(task.dueDate) === selectedDayStr
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Work': return <FiBriefcase className="mr-1.5 h-3.5 w-3.5" />;
      case 'Personal': return <FiUser className="mr-1.5 h-3.5 w-3.5" />;
      case 'Shopping': return <FiShoppingBag className="mr-1.5 h-3.5 w-3.5" />;
      default: return <FiFolder className="mr-1.5 h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300 lg:pl-64">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header Bar */}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} title="Calendar" />

      {/* Main Container */}
      <main className="px-6 py-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Page Title & Navigation Row */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-650 via-purple-650 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Monthly Task Calendar
              </h2>
              <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
                {isAdmin 
                  ? 'Assign tasks dynamically by selecting cells and track employee timelines.'
                  : 'Track and review all your task deadlines visually.'}
              </p>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center space-x-2.5 bg-white dark:bg-dark-900 border border-slate-205 dark:border-slate-800/80 p-1.5 rounded-2xl shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-sm font-extrabold px-3 text-slate-800 dark:text-slate-100 min-w-[140px] text-center uppercase tracking-wider">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>

              <button
                onClick={handleNextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>

              <button
                onClick={handleGoToToday}
                className="rounded-xl bg-indigo-50 border border-indigo-100/70 px-4 py-2 text-xs font-black uppercase tracking-wider text-indigo-700 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-all duration-200"
              >
                Today
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 bg-white/70 dark:bg-dark-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 self-center">
              <FiFilter className="mr-1.5 h-4 w-4 text-indigo-550" />
              Filters
            </div>
            
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Status */}
              <div className="flex flex-col space-y-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col space-y-1">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-dark-950 dark:text-slate-300"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Admin Assignee filter */}
              {isAdmin && (
                <div className="flex items-center space-x-1.5 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                  <FiUser className="text-slate-400 h-3.5 w-3.5" />
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="All">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Grid wrapper */}
          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-dark-900/40 border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm backdrop-blur-sm">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 mb-4 text-center border-b border-slate-100 dark:border-slate-805/50 pb-2">
                {dayNames.map((day) => (
                  <div 
                    key={day} 
                    className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Month cells */}
              <div className="grid grid-cols-7 gap-2.5 md:gap-4">
                {calendarDays.map((cell, idx) => {
                  const isCellSelected = cell.dateStr === selectedDayStr;
                  const isToday = cell.dateStr === todayStr;

                  const cellTasksList = filteredTasks.filter(
                    (t) => t.dueDate && getUTCDateString(t.dueDate) === cell.dateStr
                  );

                  return (
                    <div
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDayStr(cell.dateStr)}
                      className={`min-h-[85px] md:min-h-[115px] p-2 md:p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer border relative select-none group ${
                        cell.isCurrentMonth
                          ? 'bg-white dark:bg-dark-900 border-slate-200/80 dark:border-slate-800/60 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-md'
                          : 'bg-slate-50/20 dark:bg-dark-950/10 border-slate-100/50 dark:border-slate-850/20 text-slate-350 dark:text-slate-650 opacity-55 hover:opacity-100'
                      } ${
                        isToday
                          ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/25 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-sm'
                          : ''
                      } ${
                        isCellSelected
                          ? 'border-purple-600 dark:border-purple-400 ring-1 ring-purple-600 dark:ring-purple-400 bg-purple-50/20 dark:bg-purple-950/15'
                          : ''
                      }`}
                    >
                      {/* Cell Day Number & Quick Actions */}
                      <div className="flex items-center justify-between">
                        <span 
                          className={`text-xs md:text-sm font-black flex h-6 w-6 items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-650 text-white shadow-md shadow-indigo-550/20'
                              : 'text-slate-750 dark:text-slate-300'
                          }`}
                        >
                          {cell.day}
                        </span>
                        
                        {/* Quick Assign Icon */}
                        {isAdmin && cell.isCurrentMonth && (
                          <button
                            onClick={(e) => handleAssignTaskOnDate(cell.dateStr, e)}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-dark-950 rounded-lg shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                            title="Quick assign task"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Task indicators inside cells */}
                      <div className="mt-3.5 space-y-1 flex-1 overflow-hidden flex flex-col justify-end">
                        {/* Desktop badges */}
                        <div className="hidden md:block space-y-1.5 max-h-[65px] overflow-y-auto pr-0.5 custom-scroll">
                          {cellTasksList.slice(0, 2).map((task) => {
                            let priorityClass = '';
                            if (task.priority === 'High') {
                              priorityClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
                            } else if (task.priority === 'Medium') {
                              priorityClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
                            } else {
                              priorityClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/25 dark:text-sky-400 border-sky-100 dark:border-sky-900/30';
                            }

                            const isCompleted = task.status === 'Completed';

                            return (
                              <div
                                key={task._id}
                                className={`text-[9px] px-2 py-0.5 rounded-lg border font-black truncate flex items-center transition-all hover:scale-[1.03] shadow-sm ${priorityClass} ${
                                  isCompleted ? 'opacity-55 line-through decoration-slate-400' : ''
                                }`}
                                title={task.title}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 flex-shrink-0 ${
                                  isCompleted ? 'bg-emerald-500 animate-pulse' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
                                }`} />
                                <span className="truncate">{task.title}</span>
                              </div>
                            );
                          })}
                          {cellTasksList.length > 2 && (
                            <div className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 text-center tracking-wider uppercase">
                              +{cellTasksList.length - 2} more
                            </div>
                          )}
                        </div>

                        {/* Mobile dots */}
                        <div className="flex md:hidden items-center justify-center space-x-1 flex-wrap">
                          {cellTasksList.map((task) => {
                            let dotColor = 'bg-blue-500';
                            if (task.status === 'Completed') {
                              dotColor = 'bg-emerald-500';
                            } else if (task.priority === 'High') {
                              dotColor = 'bg-rose-500';
                            } else if (task.priority === 'Medium') {
                              dotColor = 'bg-amber-500';
                            }
                            return (
                              <span 
                                key={task._id} 
                                className={`h-1.5 w-1.5 rounded-full ${dotColor}`} 
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agenda Details Timeline wrapper */}
          <div className="bg-white/70 dark:bg-dark-900/40 border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-805/50 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
                  <FiCalendar className="mr-2.5 text-indigo-600 dark:text-indigo-400 h-5 w-5" />
                  Agenda details ({selectedDayStr === todayStr ? 'Today' : selectedDayStr})
                </h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                  Tasks scheduled or due on this date.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => handleAssignTaskOnDate(selectedDayStr, e)}
                  className="mt-3 sm:mt-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-650 to-purple-650 px-4.5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-750 transition-all duration-200"
                >
                  <FiPlus className="mr-1 h-3.5 w-3.5" /> Assign Task for Day
                </button>
              )}
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <FiClock className="h-9 w-9 mb-2.5 text-slate-350 dark:text-slate-700" />
                <span className="text-sm font-bold">No tasks scheduled for this day</span>
                <p className="text-xs text-slate-450 max-w-xs mt-1">
                  Adjust filters or select another day to review items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isInProgress = task.status === 'In Progress';
                  
                  let priorityLabelColor = '';
                  if (task.priority === 'High') {
                    priorityLabelColor = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
                  } else if (task.priority === 'Medium') {
                    priorityLabelColor = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
                  } else {
                    priorityLabelColor = 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
                  }

                  return (
                    <div
                      key={task._id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        isCompleted 
                          ? 'border-slate-100 bg-slate-50/40 dark:border-slate-850/30 dark:bg-dark-950/10 opacity-70' 
                          : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-dark-950 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Status Checkbox Button */}
                        <button
                          onClick={() => handleToggleStatus(task)}
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded-lg border transition-all duration-200 ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-550/20'
                              : 'border-slate-300 hover:border-indigo-500 dark:border-slate-705 text-transparent bg-slate-50 dark:bg-dark-900'
                          }`}
                        >
                          <FiCheck className="h-3.5 w-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1.5">
                          <h4 className={`text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-455 dark:text-slate-400 max-w-xl leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Metadata Badges */}
                          <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-2">
                            {/* Category */}
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              task.category === 'Work'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
                                : task.category === 'Personal'
                                ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
                                : task.category === 'Shopping'
                                ? 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30'
                                : 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30'
                            }`}>
                              {getCategoryIcon(task.category)}
                              {task.category || 'Work'}
                            </span>

                            {/* Priority */}
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${priorityLabelColor}`}>
                              {task.priority} Priority
                            </span>
                            
                            {/* Status badge */}
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              isCompleted 
                                ? 'bg-emerald-50 text-emerald-705 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                : isInProgress
                                  ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-dark-900 dark:text-slate-400 dark:border-slate-805/50'
                            }`}>
                              {task.status}
                            </span>

                            {/* Assignee label */}
                            {task.userId && typeof task.userId === 'object' && (
                              <div className="flex items-center space-x-1.5 rounded-full bg-slate-100/80 dark:bg-dark-900 px-2 py-0.5 border border-slate-200/50 dark:border-slate-800/85 w-max">
                                {task.userId.avatar ? (
                                  <img
                                    src={task.userId.avatar}
                                    alt={task.userId.name}
                                    className="h-4.5 w-4.5 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-650 text-[8px] font-extrabold text-white uppercase">
                                    {task.userId.name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-350">
                                  {task.userId.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Complete Remark show */}
                          {task.remark && (
                            <div className="text-[11px] bg-slate-50 dark:bg-dark-900/50 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 mt-2 border border-slate-100 dark:border-slate-850">
                              <span className="font-bold text-slate-600 dark:text-slate-350">Completion Remark:</span>
                              <span className="italic block mt-0.5">"{task.remark}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Controls */}
                      {isAdmin && (
                        <div className="flex items-center space-x-1.5 mt-4 sm:mt-0 justify-end">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-dark-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                            title="Edit assignment details"
                          >
                            <FiEdit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-950/20"
                            title="Delete task assignment"
                          >
                            <FiTrash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
    </div>
  );
};

export default Calendar;
