'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`${styles.mainContent} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
        <TopNav onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}