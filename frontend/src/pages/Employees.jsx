import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiUserPlus, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import EmployeeModal from '../components/EmployeeModal';
import Spinner from '../components/Spinner';

const Employees = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch Employees list
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/auth/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve employees list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  // Create new Employee submit handler
  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/employees', formData);
      setEmployees((prev) => [...prev, response.data]);
      toast.success('Employee added successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to add employee';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return null; // Don't flash layout before redirect completes
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-955 transition-colors duration-250 lg:pl-64">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header Navbar */}
      <Navbar setIsSidebarOpen={setIsSidebarOpen} title="Employees" />

      {/* Main Panel */}
      <main className="px-6 py-8">
        <div className="space-y-6">
          {/* Page Title & Add Button */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">
                Employees Management
              </h2>
              <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
                Add, manage, and view all registered employees in the workspace.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <FiUserPlus className="mr-1.5 h-4.5 w-4.5" /> Add Employee
            </button>
          </div>

          {/* Employees List Grid */}
          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-250 bg-white p-12 text-center dark:border-slate-800 dark:bg-dark-900 animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-450 dark:bg-dark-950 dark:text-slate-550">
                <FiUser className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
                No employees registered
              </h3>
              <p className="mt-1 max-w-xs text-sm text-slate-450 dark:text-slate-500">
                Add your employees to assign them tasks and track their progress.
              </p>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center rounded-xl bg-indigo-55 px-4 py-2.5 text-sm font-semibold text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 transition-all duration-200"
              >
                <FiPlus className="mr-1.5 h-4 w-4" /> Add First Employee
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/80 dark:bg-dark-900 animate-fade-in"
                >
                  <div className="flex items-start space-x-4">
                    {/* Initial Profile Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-dark-950 dark:to-dark-900 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg shadow-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                        {emp.name}
                      </h3>
                      <div className="flex items-center text-xs text-slate-450 dark:text-slate-400 mt-1 truncate">
                        <FiMail className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator / Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Active
                    </span>
                    
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Role: Employee
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Employees;
