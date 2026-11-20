import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ChefHat,
  UserCheck,
  UtensilsCrossed,
  Tags,
  ShoppingBag,
  CalendarDays,
  Wallet,
  MessageSquareWarning,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/chefs', label: 'HomeChefs', icon: ChefHat },
  { path: '/chef-approvals', label: 'Chef Approvals', icon: UserCheck, badgeKey: 'pendingChefs' },
  { path: '/foods', label: 'Foods', icon: UtensilsCrossed },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/subscriptions', label: 'Subscriptions', icon: CalendarDays },
  { path: '/finance', label: 'Wallet & Finance', icon: Wallet },
  { path: '/reviews-complaints', label: 'Reviews & Complaints', icon: MessageSquareWarning },
  { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
];

export const MobileDrawer = ({ isOpen, onClose, badges = {} }) => {
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r border-light-border bg-light-card shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-light-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm font-bold text-base font-serif">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-light-text tracking-tight flex items-center gap-1.5">
                GharKaSwad
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-brand-orange/20 text-brand-orange">
                  Admin
                </span>
              </span>
              <span className="text-[10px] text-light-muted">
                Platform Control
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            const badgeCount = item.badgeKey ? badges[item.badgeKey] : null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white font-semibold shadow-xs'
                    : 'text-light-muted hover:bg-light-secondary hover:text-light-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {badgeCount > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white text-brand-primary' : 'bg-brand-orange text-white'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-light-border">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
