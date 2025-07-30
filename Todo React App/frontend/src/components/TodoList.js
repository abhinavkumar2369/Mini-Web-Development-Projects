import React from 'react';
import TodoItem from './TodoItem';
import { FiInbox } from 'react-icons/fi';

const TodoList = ({ todos, loading, onToggle, onUpdate, onDelete }) => {
  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading todos...</span>
        </div>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FiInbox className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No todos found</h3>
        <p className="text-gray-500">
          Create your first todo to get started or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Your Todos ({todos.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
