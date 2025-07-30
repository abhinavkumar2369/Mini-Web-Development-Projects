import React from 'react';
import { FiTarget, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';

const Statistics = ({ stats }) => {
  const statItems = [
    {
      icon: FiTarget,
      label: 'Total Todos',
      value: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: FiCheckCircle,
      label: 'Completed',
      value: stats.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: FiClock,
      label: 'Pending',
      value: stats.pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: FiAlertTriangle,
      label: 'High Priority',
      value: stats.highPriority,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
        
        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${completionRate * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{completionRate}%</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          {completionRate === 100 && stats.total > 0
            ? '🎉 All tasks completed!'
            : `${stats.pending} tasks remaining`}
        </p>

        {/* Stats Grid */}
        <div className="space-y-3">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`text-lg ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
