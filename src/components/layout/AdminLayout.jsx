import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MobileDrawer from './MobileDrawer';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../common/LoadingSpinner';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('gharkaswad_admin_sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState({ pendingChefs: 0 });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('gharkaswad_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const loadBadges = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await dashboardService.getOverview();
      if (res?.chefs?.pendingApproval !== undefined) {
        setBadges({ pendingChefs: res.chefs.pendingApproval });
      }
    } catch {
      // Graceful fallback
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadBadges();
    const interval = setInterval(loadBadges, 60000);
    return () => clearInterval(interval);
  }, [loadBadges]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light-main">
        <LoadingSpinner size="lg" text="Authenticating administrator..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-light-main text-light-text flex flex-col">
      {/* Fixed Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        badges={badges}
      />

      {/* Mobile Drawer (Overlay slide-out) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        badges={badges}
      />

      {/* Main Content Area - Offset on desktop by fixed sidebar width */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Sticky Top Navigation */}
        <TopNavbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          badges={badges}
        />

        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
