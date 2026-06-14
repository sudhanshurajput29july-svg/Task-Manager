import React from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiCheckCircle, FiCircle } from 'react-icons/fi';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isCompleted = task.status === 'Completed';

  // Format Date
  const formatDate = (dateString) => {
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

          {/* Status Badge */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            }`}
          >
            {task.status}
          </span>
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
      </div>

      {/* Bottom Section */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/60">
        {/* Date info */}
        <div className="flex items-center text-xs text-slate-400 dark:text-slate-500">
          <FiCalendar className="mr-1.5 h-3.5 w-3.5" />
          <span>{formatDate(task.createdAt)}</span>
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
            {isCompleted ? <FiCheckCircle className="h-4.5 w-4.5" /> : <FiCircle className="h-4.5 w-4.5" />}
          </button>

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
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
