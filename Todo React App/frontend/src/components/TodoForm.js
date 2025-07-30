import React, { useState } from 'react';
import { FiPlus, FiCalendar, FiFlag, FiTag } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TodoForm = ({ onSubmit, initialData = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    category: initialData?.category || 'general',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
  });

  const [isExpanded, setIsExpanded] = useState(!!initialData);

  const categories = [
    'general', 'work', 'personal', 'shopping', 'health', 'education', 'finance'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const todoData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
    };

    onSubmit(todoData);

    if (!initialData) {
      // Reset form only if it's a new todo
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: null,
      });
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsExpanded(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <FiPlus className="text-blue-600 text-xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData ? 'Edit Todo' : 'Add New Todo'}
        </h2>
      </div>

      {/* Title Input */}
      <div>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          onFocus={() => setIsExpanded(true)}
          className="input text-lg"
          required
        />
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="space-y-4 animate-slide-up">
          {/* Description */}
          <div>
            <textarea
              placeholder="Add a description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiFlag className="mr-2" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiTag className="mr-2" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="mr-2" />
              Due Date
            </label>
            <DatePicker
              selected={formData.dueDate}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
              placeholderText="Select a due date"
              className="input"
              dateFormat="MMM d, yyyy"
              minDate={new Date()}
              isClearable
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button type="submit" className="btn btn-primary flex-1">
              <FiPlus className="mr-2" />
              {initialData ? 'Update Todo' : 'Add Todo'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline px-6"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default TodoForm;
