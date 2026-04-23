import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Household from './pages/Household';
import Fee from './pages/Fee';
import Profile from './pages/Profile';
import Resident from './pages/Resident';
import Vehicle from './pages/Vehicle';
import Account from './pages/Account';
import './App.css';
import FeeType from './pages/FeeType';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); 
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/household" element={<ProtectedRoute><Household /></ProtectedRoute>} />
            <Route path="/fee" element={<ProtectedRoute><Fee /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resident" element={<ProtectedRoute><Resident /></ProtectedRoute>} />
            <Route path="/vehicle" element={<ProtectedRoute><Vehicle /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/fee-type" element={<ProtectedRoute><FeeType /></ProtectedRoute>} />
            {/* Thêm các route khác nếu cần */}
          </Routes>


        </main>
      </div>
    </Router>
  );
};

export default App;
