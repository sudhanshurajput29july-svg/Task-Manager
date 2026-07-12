import React, { useContext } from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiMessageSquare, FiMail } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const { user } = useContext(AuthContext);
  const isCompleted = task.status === 'Completed';
  const isAdmin = user?.role === 'admin';

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/80 dark:bg-dark-900 animate-fade-in">
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between">
          <h3
            className={`text-base font-bold transition-all duration-200 text-slate-800 dark:text-slate-100 ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                task.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : task.status === 'In Progress'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-955/30 dark:text-blue-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
              }`}
            >
              {task.status}
            </span>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                task.priority === 'High'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                  : task.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400'
              }`}
            >
              {task.priority || 'Medium'}
            </span>

            {/* Category Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                task.category === 'Work'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : task.category === 'Personal'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : task.category === 'Shopping'
                  ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                  : 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
              }`}
            >
              {task.category || 'Work'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          className={`mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 ${
            isCompleted ? 'line-through text-slate-400/80 dark:text-slate-500/80' : ''
          }`}
        >
          {task.description || (
            <span className="italic text-slate-350 dark:text-slate-600">No description provided.</span>
          )}
        </p>

        {/* Assignee info if admin/employee */}
        {task.userId && typeof task.userId === 'object' && (
          <div className="mt-3.5 relative group/assignee inline-block">
            <div className="flex items-center space-x-2 rounded-full bg-slate-100 dark:bg-dark-950 p-1 pr-3 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-650/80 transition-all duration-200 cursor-pointer shadow-sm">
              {task.userId.avatar ? (
                <img
                  src={task.userId.avatar}
                  alt={task.userId.name}
                  className="h-6 w-6 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-650 text-[10px] font-extrabold text-white uppercase shadow-sm">
                  {task.userId.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                {task.userId.name}
              </span>
            </div>
            
            {/* Tooltip Hover Card */}
            <div className="absolute bottom-full left-0 mb-2.5 hidden group-hover/assignee:flex flex-col w-56 rounded-xl border border-slate-150 bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-dark-900 z-30 animate-fade-in">
              <div className="flex items-center space-x-2.5">
                {task.userId.avatar ? (
                  <img
                    src={task.userId.avatar}
                    alt={task.userId.name}
                    className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-100 dark:border-slate-850"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white uppercase shadow-sm">
                    {task.userId.name.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {task.userId.name}
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mt-0.5">
                    {task.userId.role || 'Employee'}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-450 dark:text-slate-400">
                <p className="flex items-center truncate">
                  <FiMail className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{task.userId.email}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Remark display */}
        {task.remark && (
          <div className="mt-3.5 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 text-slate-650 dark:bg-dark-950 dark:border-slate-800/60 dark:text-slate-400">
            <div className="flex items-center font-bold text-slate-700 dark:text-slate-350 mb-1">
              <FiMessageSquare className="mr-1 h-3.5 w-3.5" />
              <span>Completion Remark:</span>
            </div>
            <p className="italic">"{task.remark}"</p>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
        {/* Date info */}
        <div className="flex flex-col space-y-1 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center">
            <FiCalendar className="mr-1.5 h-3.5 w-3.5" />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
          {task.dueDate && (
            <div className={`flex items-center font-bold ${isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-rose-650 dark:text-rose-400'}`}>
              <FiCalendar className="mr-1.5 h-3.5 w-3.5" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Toggle status */}
          <button
            onClick={() => onToggleStatus(task)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 ${
              isCompleted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-850'
            }`}
            title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
          >
            {isCompleted ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-1">Undo</span>
            ) : (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-350 px-1">Done</span>
            )}
          </button>

          {isAdmin && (
            <>
              {/* Edit */}
              <button
                onClick={() => onEdit(task)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-850 dark:hover:text-indigo-400 transition-all duration-200"
                title="Edit Task"
              >
                <FiEdit2 className="h-4 w-4" />
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete(task._id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-650 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-850 dark:hover:text-red-400 transition-all duration-200"
                title="Delete Task"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
