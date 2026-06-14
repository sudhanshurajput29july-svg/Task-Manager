import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiFilter, FiFolder } from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Spinner from '../components/Spinner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Fetch Tasks from API
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', {
        params: {
          status: selectedFilter,
          search: searchQuery,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounced API calling on search or filter change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilter]);

  // Toggle Completion Status
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-955 transition-colors duration-250 lg:pl-64">
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
                Tasks Manager
              </h2>
              <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
                Organize, track progress, and update your tasks list.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <FiPlus className="mr-1.5 h-4.5 w-4.5" /> Add Task
            </button>
          </div>

          {/* Filtering Tab System */}
          <div className="flex border-b border-slate-200 dark:border-slate-800/80">
            {['All', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`border-b-2 px-5 py-3 text-sm font-semibold transition-all duration-200 -mb-px ${
                  selectedFilter === tab
                    ? 'border-indigo-650 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-450 hover:border-slate-300 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-300'
                }`}
              >
                {tab}
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
              <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-slate-500">
                {searchQuery || selectedFilter !== 'All'
                  ? 'Adjust your search query or filters to locate tasks.'
                  : 'Start adding new tasks to your task manager to stay organized.'}
              </p>
              
              {!searchQuery && selectedFilter === 'All' && (
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-5 inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 transition-all duration-200"
                >
                  <FiPlus className="mr-1.5 h-4 w-4" /> Create First Task
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
    </div>
  );
};

export default Tasks;
