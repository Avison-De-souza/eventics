import React, { useState } from 'react';
import LoginPage from './LoginPage';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

function App() {
  const [user, setUser] = useState(null); // stores { email, role }

  const handleLoginSuccess = (userData) => {
    setUser(userData); // userData will be { email: '...', role: 'student' } or 'faculty'
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Route based on role
  if (user.role === 'faculty') {
    return <TeacherDashboard onLogout={handleLogout} userEmail={user.email} />;
  }

  return <StudentDashboard onLogout={handleLogout} userEmail={user.email} />;
}

export default App;