import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Pages
import Login from './pages/Login/Login';
import PatientHome from './pages/patient/PatientHome/PatientHome';
import MyMemories from './pages/patient/MyMemories/MyMemories';
import GameSelect from './pages/patient/GameSelect/GameSelect';
import GameSession from './pages/games/GameSession/GameSession';

import Dashboard from './pages/caretaker/Dashboard/Dashboard';
import ContentLibrary from './pages/caretaker/ContentLibrary/ContentLibrary';
import PatientManager from './pages/caretaker/PatientManager/PatientManager';
import DailyLog from './pages/caretaker/DailyLog/DailyLog';
import Reminders from './pages/caretaker/Reminders/Reminders';
import Settings from './pages/caretaker/Settings/Settings';

import DoctorDashboard from './pages/doctor/DoctorDashboard/DoctorDashboard';
import PatientDetail from './pages/doctor/PatientDetail/PatientDetail';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';

export default function App() {
  const location = useLocation();
  const isDoctorTheme = location.pathname.startsWith('/doctor');

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={`app-layout ${isDoctorTheme ? 'theme-doctor' : ''}`} data-theme={isDoctorTheme ? 'doctor' : 'clinical'}>
          <Navbar />
          <Routes>
            {/* Public Entry / Login */}
            <Route path="/" element={<Login />} />

            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/memories"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <MyMemories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/games"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <GameSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/game/:gameType"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <GameSession />
                </ProtectedRoute>
              }
            />

            {/* Caretaker Routes */}
            <Route
              path="/caretaker"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/patients"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <PatientManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/content"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <ContentLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/dailylog"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <DailyLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/reminders"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <Reminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caretaker/settings"
              element={
                <ProtectedRoute allowedRoles={['caretaker', 'admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patient/:patientId"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
