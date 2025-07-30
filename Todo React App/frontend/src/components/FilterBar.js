import React from 'react';
import { FiFilter, FiTrash2 } from 'react-icons/fi';

const FilterBar = ({ filters, onChange, totalCount, onDeleteCompleted, completedCount }) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const statuses = [
    { value: 'all', label: 'All Todos' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const handleStatusChange = (status) => {
    let completed;
    if (status === 'completed') completed = true;
    else if (status === 'pending') completed = false;
    else completed = undefined;

    onChange({ completed, status });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <h3 className="font-medium text-gray-800">Filters</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? 'todo' : 'todos'} found
          </div>
          {completedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete all ${completedCount} completed todos?`)) {
                  onDeleteCompleted();
                }
              }}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <FiTrash2 className="text-xs" />
              <span>Clear Completed ({completedCount})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="input text-sm"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className="input text-sm"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => onChange({ category: 'all', priority: 'all', completed: undefined, status: 'all' })}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => handleStatusChange('pending')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filters.completed === false
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Show Pending
        </button>
        <button
          onClick={() => onChange({ priority: 'high' })}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filters.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => onChange({ category: 'work' })}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filters.category === 'work'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Work Only
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
