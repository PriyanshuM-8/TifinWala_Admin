import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Eye,
  RefreshCw,
  FileCode,
  User,
  Clock,
  Terminal,
} from 'lucide-react';
import auditLogService from '../../services/auditLogService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AuditLogsPage = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetModelFilter, setTargetModelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Inspector modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogService.listAuditLogs({
        page,
        limit: 15,
        action: actionFilter,
        targetModel: targetModelFilter,
      });
      setLogs(res.logs || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalLogs(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      addToast('Failed to load security audit trail.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, targetModelFilter, addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Security & System Audit Logs
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Immutable administrative operations, RBAC credential changes, and system compliance events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">All Action Types</option>
            <option value="chef_approved">Chef Approved</option>
            <option value="chef_rejected">Chef Rejected</option>
            <option value="customer_status_updated">Customer Status Changed</option>
            <option value="order_cancelled_by_admin">Order Cancelled</option>
            <option value="settings_updated">Settings Updated</option>
          </select>

          <button
            onClick={fetchLogs}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No audit entries"
            description="No administrative activities logged for this selection."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Admin Actor</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-light-secondary/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-light-text capitalize">
                      {log.action?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-light-muted">
                      {log.targetModel || 'System'} ({log.targetId ? String(log.targetId).slice(-6) : '-'})
                    </td>
                    <td className="py-3.5 px-4 text-light-text font-medium">
                      {log.adminId?.name || 'Administrator'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-light-muted">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                        title="Inspect Metadata"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalLogs}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Metadata Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Entry Inspection"
        subtitle={`Action: ${selectedLog?.action}`}
        maxWidth="max-w-xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl border border-light-border bg-light-secondary/30 space-y-1 font-sans">
              <p>
                <span className="font-semibold text-light-muted">Admin User:</span>{' '}
                {selectedLog.adminId?.name} ({selectedLog.adminId?.email})
              </p>
              <p>
                <span className="font-semibold text-light-muted">IP Address:</span>{' '}
                {selectedLog.ipAddress || '127.0.0.1'}
              </p>
              <p>
                <span className="font-semibold text-light-muted">Timestamp:</span>{' '}
                {formatDateTime(selectedLog.createdAt)}
              </p>
            </div>

            <div>
              <span className="font-semibold font-sans text-light-muted uppercase text-[10px] block mb-1">
                Metadata & State Diffs:
              </span>
              <pre className="p-4 rounded-xl border border-light-border bg-gray-900 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed max-h-64">
                {JSON.stringify(selectedLog.details || selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
