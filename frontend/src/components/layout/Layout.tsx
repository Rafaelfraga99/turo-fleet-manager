import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-app">
      <Sidebar />
      <div className="ml-64">
        <main className="max-w-screen-2xl mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
