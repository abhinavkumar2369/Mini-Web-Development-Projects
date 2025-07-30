import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterBar from './components/FilterBar';
import Statistics from './components/Statistics';
import { todoService } from './services/api';
import toast from 'react-hot-toast';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    completed: undefined
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  });

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getTodos(filters);
      setTodos(data);
    } catch (error) {
      toast.error('Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const data = await todoService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create todo
  const handleCreateTodo = async (todoData) => {
    try {
      const newTodo = await todoService.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      fetchStats();
      toast.success('Todo created successfully!');
    } catch (error) {
      toast.error('Failed to create todo');
      console.error('Error creating todo:', error);
    }
  };

  // Update todo
  const handleUpdateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await todoService.updateTodo(id, todoData);
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo));
      fetchStats();
      toast.success('Todo updated successfully!');
    } catch (error) {
      toast.error('Failed to update todo');
      console.error('Error updating todo:', error);
    }
  };

  // Toggle todo completion
  const handleToggleTodo = async (id) => {
    try {
      const updatedTodo = await todoService.toggleTodo(id);
      setTodos(prev => prev.map(todo => todo._id === id ? updatedTodo : todo));
      fetchStats();
      const message = updatedTodo.completed ? 'Todo completed!' : 'Todo marked as pending';
      toast.success(message);
    } catch (error) {
      toast.error('Failed to toggle todo');
      console.error('Error toggling todo:', error);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo._id !== id));
      fetchStats();
      toast.success('Todo deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete todo');
      console.error('Error deleting todo:', error);
    }
  };

  // Delete all completed todos
  const handleDeleteCompleted = async () => {
    try {
      const result = await todoService.deleteCompletedTodos();
      setTodos(prev => prev.filter(todo => !todo.completed));
      fetchStats();
      toast.success(`${result.deletedCount} completed todos deleted!`);
    } catch (error) {
      toast.error('Failed to delete completed todos');
      console.error('Error deleting completed todos:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchTodos();
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'text-sm',
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Statistics */}
          <div className="lg:col-span-1">
            <Statistics stats={stats} />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Todo Form */}
            <div className="card p-6">
              <TodoForm onSubmit={handleCreateTodo} />
            </div>
            
            {/* Filters */}
            <FilterBar
              filters={filters}
              onChange={handleFilterChange}
              totalCount={todos.length}
              onDeleteCompleted={handleDeleteCompleted}
              completedCount={stats.completed}
            />
            
            {/* Todo List */}
            <TodoList
              todos={todos}
              loading={loading}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
