import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  AlertTriangle,
  RefreshCw,
  Bell,
  Mail,
  Phone,
  Power,
} from 'lucide-react';
import settingService from '../../services/settingService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const SettingsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'GharKaSwad is briefly undergoing scheduled maintenance. We will be back shortly.',
    supportEmail: 'support@gharkaswad.com',
    supportPhone: '+91 9876543210',
    platformCommissionPercent: 10,
    maxChefServiceRadiusKm: 50,
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingService.getSettings();
      if (res?.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingService.updateSettings(settings);
      addToast('Platform settings saved successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading platform configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl min-w-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
          Platform System Settings
        </h2>
        <p className="text-xs text-light-muted mt-1">
          Configure global marketplace operational toggles, emergency maintenance mode, and support contacts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Maintenance Mode Card */}
        <Card
          title="Emergency Maintenance Control"
          subtitle="Block consumer checkout and discovery while keeping admin access active"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl border border-light-border bg-light-secondary/30">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    settings.maintenanceMode
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-light-text">
                    Maintenance Mode
                  </h4>
                  <p className="text-light-muted">
                    {settings.maintenanceMode ? 'System is locked to external customers' : 'System is live and accepting orders'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {settings.maintenanceMode && (
              <div>
                <label className="block font-semibold text-light-text mb-1">
                  Public Maintenance Announcement
                </label>
                <textarea
                  rows={2}
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-3 text-xs text-light-text focus:outline-none"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Support & Contact Card */}
        <Card title="Customer & Chef Support Information" subtitle="Publicly displayed on invoices and receipts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-light-text mb-1.5">
                Support Helpline Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-muted" />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full rounded-xl border border-light-border bg-light-secondary/40 pl-9 pr-3 py-2 text-xs text-light-text focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-light-text mb-1.5">
                Support Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-light-muted" />
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full rounded-xl border border-light-border bg-light-secondary/40 pl-9 pr-3 py-2 text-xs text-light-text focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-primary-dark transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
