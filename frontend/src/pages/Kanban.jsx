import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { 
  FiList, 
  FiClock, 
  FiCheckCircle, 
  FiUser, 
  FiBriefcase, 
  FiShoppingBag, 
  FiFolder, 
  FiAlertTriangle, 
  FiInfo, 
  FiCalendar, 
  FiArrowRight 
} from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskRemarkModal from '../components/TaskRemarkModal';
import Spinner from '../components/Spinner';

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  
  // Drag active column tracker
  const [activeDropCol, setActiveDropCol] = useState(null);

  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // Admin filter states
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');

  // Fetch employees list if Admin
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

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const params = {};
      if (isAdmin && selectedEmployeeId !== 'All') {
        params.userId = selectedEmployeeId;
      }
      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tasks for board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedEmployeeId]);

  // Native Drag and Drop events
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setActiveDropCol(status);
  };

  const handleDragLeave = () => {
    setActiveDropCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    // Open remark modal if employee is completing task
    if (targetStatus === 'Completed' && !isAdmin) {
      setTaskToComplete(task);
      setIsRemarkModalOpen(true);
      return;
    }

    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: targetStatus,
        remark: targetStatus === 'Pending' ? '' : task.remark,
      });

      setTasks((prev) => prev.map((t) => (t._id === taskId ? response.data : t)));
      toast.success(`Task moved to ${targetStatus}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update task status');
    }
  };

  // Submit completion remark
  const handleRemarkSubmit = async (data) => {
    try {
      const response = await api.patch(`/tasks/${taskToComplete._id}/status`, {
        status: data.status,
        remark: data.remark,
      });

      setTasks((prev) => prev.map((t) => (t._id === taskToComplete._id ? response.data : t)));
      toast.success('Task completed successfully!');
      setIsRemarkModalOpen(false);
      setTaskToComplete(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit remark');
    }
  };

  // Group tasks by status
  const columns = {
    Pending: tasks.filter((t) => t.status === 'Pending'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Completed: tasks.filter((t) => t.status === 'Completed'),
  };

  // Modern configuration details
  const columnConfig = {
    Pending: {
      title: 'Pending',
      headerClass: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
      activeBorderClass: 'border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/5',
      icon: FiClock,
      accentColor: '#f59e0b',
    },
    'In Progress': {
      title: 'In Progress',
      headerClass: 'border-blue-500/20 bg-blue-500/5 text-blue-500',
      activeBorderClass: 'border-blue-500/50 bg-blue-50/10 dark:bg-blue-950/5',
      icon: FiList,
      accentColor: '#3b82f6',
    },
    Completed: {
      title: 'Completed',
      headerClass: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500',
      activeBorderClass: 'border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/5',
      icon: FiCheckCircle,
      accentColor: '#10b981',
    },
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Work': return <FiBriefcase className="mr-1.5 h-3.5 w-3.5" />;
      case 'Personal': return <FiUser className="mr-1.5 h-3.5 w-3.5" />;
      case 'Shopping': return <FiShoppingBag className="mr-1.5 h-3.5 w-3.5" />;
      default: return <FiFolder className="mr-1.5 h-3.5 w-3.5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300 lg:pl-64">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar setIsSidebarOpen={setIsSidebarOpen} title="Kanban Board" />

      {/* Main Container */}
      <main className="px-6 py-8 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header Block */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-8 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-650 via-purple-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
              Interactive Kanban Board
            </h2>
            <p className="text-sm text-slate-450 dark:text-slate-400 mt-1.5">
              Drag-and-drop tasks across columns to update task statuses instantly.
            </p>
          </div>

          {/* Admin filter dropdown */}
          {isAdmin && (
            <div className="flex items-center space-x-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800/80 px-3.5 py-2 rounded-xl shadow-sm">
              <FiUser className="text-indigo-600 dark:text-indigo-400 h-4.5 w-4.5" />
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-750 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All" className="dark:bg-dark-900">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id} className="dark:bg-dark-900">
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          /* Kanban Columns Board Grid */
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-x-auto pb-6 overflow-y-hidden items-stretch">
            {Object.keys(columns).map((status) => {
              const config = columnConfig[status];
              const taskList = columns[status];
              const Icon = config.icon;
              const isDraggingOver = activeDropCol === status;

              return (
                <div
                  key={status}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                  className={`flex-1 min-w-[310px] max-w-[380px] flex flex-col rounded-2xl border transition-all duration-300 shadow-sm ${
                    isDraggingOver
                      ? `${config.activeBorderClass} border-dashed border-2 scale-[1.01] shadow-lg`
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800/60 dark:bg-dark-900/40 backdrop-blur-sm'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-4 border-b rounded-t-2xl font-bold border-slate-200/80 dark:border-slate-800/60 ${config.headerClass}`}>
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-dark-950 shadow-inner">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-sm uppercase tracking-wider font-extrabold">{config.title}</span>
                    </div>
                    <span className="rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-805 px-2.5 py-0.5 text-xs font-black shadow-sm">
                      {taskList.length}
                    </span>
                  </div>

                  {/* Column Cards Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-17rem)] custom-scroll select-none">
                    {taskList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-dark-950 text-slate-350 dark:text-slate-600 mb-2">
                          <FiInfo className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          Empty Column
                        </p>
                      </div>
                    ) : (
                      taskList.map((task) => {
                        const isHighPriority = task.priority === 'High';
                        return (
                          <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task._id)}
                            className="cursor-grab active:cursor-grabbing group bg-white border border-slate-200/90 dark:bg-dark-900 dark:border-slate-800/70 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015]"
                          >
                            {/* Card Header title */}
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                {task.title}
                              </h4>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-xs text-slate-455 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                                {task.description}
                              </p>
                            )}

                            {/* visual Category & Priority Pills */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              {/* Category */}
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm border ${
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
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                                task.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30'
                                  : 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/30'
                              }`}>
                                {isHighPriority && <FiAlertTriangle className="mr-1 h-3 w-3 animate-bounce" />}
                                {task.priority || 'Medium'}
                              </span>
                            </div>

                            {/* Card Footer Detail */}
                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-805/50 pt-3.5 mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                              {task.dueDate ? (
                                <span className={`flex items-center ${isHighPriority && status !== 'Completed' ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                  <FiCalendar className="mr-1 h-3.5 w-3.5" />
                                  <span>Due: {formatDate(task.dueDate)}</span>
                                </span>
                              ) : (
                                <span className="italic">No due date</span>
                              )}
                              
                              {task.userId && typeof task.userId === 'object' && (
                                <div className="flex items-center space-x-1 max-w-[120px] truncate bg-slate-50 dark:bg-dark-950 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-805">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                  <span className="truncate text-slate-600 dark:text-slate-400">{task.userId.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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

export default Kanban;
