#!/bin/bash

echo "================================"
echo "    Todo React App Setup"
echo "================================"
echo

echo "Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo
echo "Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo
echo "================================"
echo "    Setup Complete!"
echo "================================"
echo
echo "To start the application:"
echo
echo "1. Start Backend (in first terminal):"
echo "   cd backend"
echo "   npm run dev"
echo
echo "2. Start Frontend (in second terminal):"
echo "   cd frontend"
echo "   npm start"
echo
echo "Make sure MongoDB is running on your system!"
echo
