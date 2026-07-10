import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import UserPage from '../pages/UserPage';
import DealerPage from '../pages/DealerPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      
      <Route 
        path="/user" 
        element={
          <ProtectedRoute allowedRole="user">
            <UserPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dealer" 
        element={
          <ProtectedRoute allowedRole="dealer">
            <DealerPage />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
