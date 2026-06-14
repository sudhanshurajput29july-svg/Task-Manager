import React from 'react';

const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } animate-spin rounded-full border-t-indigo-600 border-r-indigo-600/20 border-b-indigo-600/20 border-l-indigo-600/20 dark:border-t-indigo-400 dark:border-r-indigo-400/20 dark:border-b-indigo-400/20 dark:border-l-indigo-400/20`}
      ></div>
    </div>
  );
};

export default Spinner;
