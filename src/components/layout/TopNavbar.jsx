import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/customers': 'Customer Management',
  '/chefs': 'HomeChef Management',
  '/chef-approvals': 'Chef Approvals & Verification',
  '/foods': 'Food Catalog & Moderation',
  '/categories': 'Food Categories',
  '/orders': 'Live Orders & Management',
  '/subscriptions': 'Meal Subscriptions',
  '/finance': 'Financial Ledger & Wallets',
  '/reviews-complaints': 'Reviews & Dispute Resolution',
  '/analytics': 'Interactive Analytics & Reports',
  '/settings': 'Platform Settings',
  '/audit-logs': 'Security & Audit Logs',
};

export const TopNavbar = ({ onOpenMobileMenu, badges = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const currentTitle = PAGE_TITLES[location.pathname] || 'Administration';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    if (q.includes('order')) navigate('/orders');
    else if (q.includes('chef') || q.includes('kitchen')) navigate('/chefs');
    else if (q.includes('approval')) navigate('/chef-approvals');
    else if (q.includes('food') || q.includes('meal')) navigate('/foods');
    else if (q.includes('finance') || q.includes('payout') || q.includes('wallet')) navigate('/finance');
    else if (q.includes('subscription')) navigate('/subscriptions');
    else navigate(`/customers?search=${encodeURIComponent(q)}`);
  };

  const adminName = user?.name || 'Administrator';
  const adminEmail = user?.email || 'admin@gharkaswad.com';
  const pendingApprovals = badges?.pendingChefs || 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-light-border bg-light-card/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden rounded-xl p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-light-muted">
            <span>Admin</span>
            <span>/</span>
            <span className="text-brand-primary capitalize">
              {location.pathname === '/' ? 'Home' : location.pathname.slice(1).replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-light-text truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Quick Search (Desktop) */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden lg:flex items-center relative max-w-xs w-full mx-4"
      >
        <Search className="absolute left-3.5 h-4 w-4 text-light-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Jump to orders, chefs, foods..."
          className="w-full rounded-xl border border-light-border bg-light-secondary/60 pl-9 pr-4 py-2 text-xs text-light-text placeholder-light-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
        />
      </form>

      {/* Right: Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-light-border bg-light-card text-light-text hover:bg-light-secondary transition-colors shadow-xs"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {pendingApprovals > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white shadow-xs animate-pulse">
                {pendingApprovals}
              </span>
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-light-border bg-light-card p-4 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-light-border pb-3 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-text">
                  Notifications & Alerts
                </h4>
                <span className="text-[10px] text-light-muted font-medium">
                  Real-time
                </span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {pendingApprovals > 0 ? (
                  <Link
                    to="/chef-approvals"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-light-text">
                        {pendingApprovals} Chef {pendingApprovals === 1 ? 'Application' : 'Applications'} Pending
                      </p>
                      <p className="text-[11px] text-light-muted mt-0.5">
                        New homechefs are awaiting safety & identity verification.
                      </p>
                    </div>
                  </Link>
                ) : null}

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-light-secondary/50 border border-light-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-light-text">
                      System Operational
                    </p>
                    <p className="text-[11px] text-light-muted mt-0.5">
                      All payment webhooks, database ledgers, and delivery discovery services are healthy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-light-border pt-2.5 mt-3 text-center">
                <Link
                  to="/audit-logs"
                  onClick={() => setNotificationDropdownOpen(false)}
                  className="text-[11px] font-semibold text-brand-primary hover:underline"
                >
                  View full security audit logs &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 sm:px-3 sm:py-2 hover:bg-light-secondary border border-transparent hover:border-light-border transition-all"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white font-bold text-xs shadow-xs">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-light-text truncate max-w-[120px]">
                {adminName}
              </span>
              <span className="text-[10px] text-brand-primary font-medium">
                Super Admin
              </span>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-light-muted" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-light-border bg-light-card p-2 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-light-border mb-1">
                <p className="text-xs font-bold text-light-text truncate">
                  {adminName}
                </p>
                <p className="text-[11px] text-light-muted truncate">
                  {adminEmail}
                </p>
              </div>

              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-light-text hover:bg-light-secondary transition-colors"
              >
                <Settings className="h-4 w-4 text-light-muted" />
                <span>Platform Settings</span>
              </Link>

              <Link
                to="/audit-logs"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-light-text hover:bg-light-secondary transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-light-muted" />
                <span>Security Audit Logs</span>
              </Link>

              <div className="border-t border-light-border my-1" />

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
