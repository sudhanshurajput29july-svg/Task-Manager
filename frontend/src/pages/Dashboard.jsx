import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiList, FiCheckCircle, FiClock, FiPlus, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  
  // Recent 3 tasks (tasks are sorted by createdAt descending from backend)
  const recentTasks = tasks.slice(0, 3);

  // Task operation: Toggle Status
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
      });
      
      // Update state local list
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === task._id ? response.data : t))
      );
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update task status');
    }
  };

  // Task operation: Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete task');
    }
  };

  // Task operation: Edit Task Trigger
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Task operation: Create / Save Task submit
  const handleModalSubmit = async (formData) => {
    try {
      if (selectedTask) {
        // Edit Mode
        const response = await api.put(`/tasks/${selectedTask._id}`, formData);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === selectedTask._id ? response.data : t))
        );
        toast.success('Task updated successfully');
      } else {
        // Create Mode
        const response = await api.post('/tasks', formData);
        setTasks((prevTasks) => [response.data, ...prevTasks]);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-955 transition-colors duration-250 lg:pl-64">
      {/* Sidebar Layout */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Navbar Header */}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} title="Dashboard" />

      {/* Main Container */}
      <main className="px-6 py-8">
        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Greeting Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                Workspace Overview
              </h2>
              <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
                Here's the summary of your tasks and overall progress.
              </p>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Total Tasks card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-dark-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Total Tasks
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold text-slate-850 dark:text-slate-100">
                      {totalTasks}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <FiList className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                  All tasks created in your workspace
                </div>
              </div>

              {/* Completed Tasks card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-dark-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Completed Tasks
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-450">
                      {completedTasks}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <FiCheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {totalTasks > 0
                    ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate`
                    : 'No tasks available'}
                </div>
              </div>

              {/* Pending Tasks card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-dark-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Pending Tasks
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-450">
                      {pendingTasks}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <FiClock className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                  Tasks waiting to be finished
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Tasks */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Recent Tasks List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Recent Tasks
                  </h3>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-550 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View All Tasks <FiArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>

                {recentTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-250 bg-white p-8 text-center dark:border-slate-800 dark:bg-dark-900">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      No tasks found in your workspace.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedTask(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                    >
                      <FiPlus className="mr-1 h-3.5 w-3.5" /> Create Task
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {recentTasks.map((task) => (
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

              {/* Action Sidebar Board */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-dark-900">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
                  Quick Controls
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Speed up your workflow using fast action triggers.
                </p>

                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => {
                      setSelectedTask(null);
                      setIsModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FiPlus className="mr-1.5 h-4.5 w-4.5" /> Add New Task
                  </button>
                  
                  <Link
                    to="/tasks"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-250 py-3 text-sm font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-all duration-200"
                  >
                    Manage Tasks Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default Dashboard;
