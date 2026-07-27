import React from 'react';
import UserDashboard from './Userdashboard';
import ProviderDashboard from './Providerdashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'provider') return <ProviderDashboard />;
  return <UserDashboard />;
}