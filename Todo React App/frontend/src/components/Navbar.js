import React from 'react';
import { FiCheckSquare } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg">
              <FiCheckSquare className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Todo<span className="text-blue-600">Pro</span>
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
            <span>Powered by React, MongoDB & TailwindCSS</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
