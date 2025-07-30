import React, { useState } from 'react';
import {
  FiCheck,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFlag,
  FiTag,
  FiMoreVertical,
} from 'react-icons/fi';
import TodoForm from './TodoForm';

const TodoItem = ({ todo, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-blue-600' };
    
    return { 
      text: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }), 
      color: 'text-gray-600' 
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const dueDateInfo = formatDate(todo.dueDate);

  const handleUpdate = (updatedData) => {
    onUpdate(todo._id, updatedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo._id);
    }
  };

  if (isEditing) {
    return (
      <div className={`card p-4 ${getPriorityColor(todo.priority)}`}>
        <TodoForm
          initialData={todo}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`card p-4 hover:shadow-md transition-all duration-200 animate-fade-in ${
        getPriorityColor(todo.priority)
      } ${todo.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo._id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {todo.completed && <FiCheck className="text-white text-sm" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Title */}
              <h4
                className={`font-medium text-gray-800 ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {todo.title}
              </h4>

              {/* Description */}
              {todo.description && (
                <p
                  className={`text-sm mt-1 ${
                    todo.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {todo.description}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                {/* Priority */}
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(todo.priority)}`}></div>
                  <span className="text-gray-500 capitalize">{todo.priority}</span>
                </div>

                {/* Category */}
                <div className="flex items-center space-x-1 text-gray-500">
                  <FiTag className="text-xs" />
                  <span className="capitalize">{todo.category}</span>
                </div>

                {/* Due Date */}
                {dueDateInfo && (
                  <div className={`flex items-center space-x-1 ${dueDateInfo.color}`}>
                    <FiCalendar className="text-xs" />
                    <span>{dueDateInfo.text}</span>
                  </div>
                )}

                {/* Creation Date */}
                <span className="text-gray-400">
                  Created {new Date(todo.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="relative ml-4">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <FiMoreVertical />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiEdit2 className="text-xs" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onToggle(todo._id);
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiCheck className="text-xs" />
                    <span>{todo.completed ? 'Mark Pending' : 'Mark Done'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 className="text-xs" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default TodoItem;
