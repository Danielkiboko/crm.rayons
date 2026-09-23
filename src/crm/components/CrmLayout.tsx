'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PaywallModal from './PaywallModal';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-body">
          {children}
        </main>
      </div>
      <PaywallModal />
    </div>
  );
}
