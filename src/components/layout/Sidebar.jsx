import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Landmark,
  Building2,
  ArrowDownToLine,
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
  { path: '/finance', label: 'Financial Overview', icon: Wallet },
  { path: '/admin-earnings', label: 'Admin Earnings', icon: Landmark },
  { path: '/bank-accounts', label: 'Bank Accounts', icon: Building2 },
  { path: '/withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
  { path: '/reviews-complaints', label: 'Reviews & Complaints', icon: MessageSquareWarning },
  { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
];

export const Sidebar = ({ isCollapsed, onToggleCollapse, badges = {} }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 h-screen z-30 bg-light-card border-r border-light-border select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-light-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm font-bold text-lg font-serif">
            G
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-light-text tracking-tight truncate flex items-center gap-1.5">
                GharKaSwad
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange">
                  Admin
                </span>
              </span>
              <span className="text-[11px] text-light-muted truncate">
                Platform Control
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-1.5 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List - Scrolls internally if content overflows */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs font-semibold'
                  : 'text-light-muted hover:bg-light-secondary hover:text-light-text'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-light-muted group-hover:text-brand-primary'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!isCollapsed && badgeCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-brand-primary'
                      : 'bg-brand-orange text-white'
                  }`}
                >
                  {badgeCount}
                </span>
              )}

              {isCollapsed && badgeCount > 0 && (
                <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-brand-orange ring-2 ring-white" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info / Logout */}
      <div className="shrink-0 p-3 border-t border-light-border">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
