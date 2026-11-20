import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ChefHat,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react';
import chefService from '../../services/chefService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ChefApprovalsPage = () => {
  const { addToast } = useToast();
  const [pendingChefs, setPendingChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Approval / Rejection modal
  const [actionChef, setActionChef] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPendingChefs = useCallback(async () => {
    try {
      const res = await chefService.listChefs({
        page: 1,
        limit: 50,
        status: 'pending',
        approvalStatus: 'pending',
      });
      const allChefs = res.chefs || res.data || [];
      // Guarantee only pending applications appear in this queue
      const pendingList = allChefs.filter((c) => c.approvalStatus === 'pending');
      setPendingChefs(pendingList);
    } catch (err) {
      console.error('Failed to load pending chefs:', err);
      addToast('Failed to load pending chef queue.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPendingChefs();
  }, [fetchPendingChefs]);

  const handleOpenAction = (chef, type) => {
    setActionChef(chef);
    setActionType(type);
    setReviewNotes('');
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    if (!actionChef) return;

    if (actionType === 'reject' && !reviewNotes.trim()) {
      addToast('Please provide a reason for rejecting this application.', 'error');
      return;
    }

    setProcessing(true);
    try {
      const chefId = actionChef._id || actionChef.userId?._id;
      if (actionType === 'approve') {
        await chefService.approveChef(chefId, reviewNotes);
        addToast(`HomeChef "${actionChef.kitchenName || actionChef.ownerName}" approved successfully!`, 'success');
      } else {
        await chefService.rejectChef(chefId, reviewNotes);
        addToast(`HomeChef application rejected. Notice sent.`, 'info');
      }

      // Optimistically remove from pending list immediately
      setPendingChefs((prev) => prev.filter((c) => c._id !== chefId && c.userId?._id !== chefId));
      setActionChef(null);
      await fetchPendingChefs();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update approval status.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            HomeChef Verification & Approvals
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Review food hygiene standards, kitchen locations, and verify safety details before approving live status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{pendingChefs.length} Pending Review</span>
          </span>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchPendingChefs();
            }}
            disabled={refreshing}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Approval Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading pending verification dossier..." />
        </div>
      ) : pendingChefs.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All Applications Processed"
          description="There are currently no new HomeChef applications awaiting administrative review."
          className="my-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingChefs.map((chef) => {
            const chefUser = chef.userId || {};
            return (
              <div
                key={chef._id}
                className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="h-3 w-3" /> Under Review
                    </span>
                    <span className="text-[10px] text-light-muted">
                      {formatDateTime(chef.createdAt)}
                    </span>
                  </div>

                  {/* Kitchen & Owner */}
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center font-bold text-base shrink-0">
                      {(chef.kitchenName || chef.ownerName || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-light-text truncate">
                        {chef.kitchenName || 'Kitchen Unnamed'}
                      </h4>
                      <p className="text-xs text-light-muted truncate">
                        Owner: {chef.ownerName || chefUser.name || 'Chef'}
                      </p>
                    </div>
                  </div>

                  {/* Location & Radius */}
                  <div className="rounded-xl p-3 bg-light-secondary/40 border border-light-border space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-light-text">
                      <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">{chef.kitchenAddress || 'Address unset'}, {chef.city || 'City unset'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-light-muted pt-1 border-t border-light-border/60">
                      <span>Service Radius:</span>
                      <span className="font-bold text-light-text">
                        {chef.serviceRadiusKm || 10} KM
                      </span>
                    </div>
                  </div>

                  {/* Hygiene / Food Safety */}
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-light-muted text-[11px] uppercase tracking-wider">
                      Food Safety Standard:
                    </span>
                    <p className="p-2 rounded-lg bg-light-secondary/20 border border-light-border text-light-text text-xs italic">
                      {chef.foodSafetyDetails || 'Standard home kitchen inspection declaration submitted.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-5 mt-5 border-t border-light-border grid grid-cols-2 gap-2.5">
                  {chef.approvalStatus === 'approved' ? (
                    <div className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Approved & Active</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenAction(chef, 'reject')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleOpenAction(chef, 'approve')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary-dark transition-colors shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Action Modal */}
      <Modal
        isOpen={!!actionChef}
        onClose={() => setActionChef(null)}
        title={actionType === 'approve' ? 'Approve HomeChef Application' : 'Reject Application'}
        subtitle={actionChef?.kitchenName || actionChef?.ownerName}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitAction} className="space-y-4 text-xs">
          <p className="text-light-muted leading-relaxed">
            {actionType === 'approve'
              ? 'Approving this chef will mark their kitchen as verified and make their dishes discoverable to customers within their configured service radius.'
              : 'Rejecting this application will notify the applicant with the reason provided below.'}
          </p>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              {actionType === 'approve' ? 'Administrative Notes (Optional)' : 'Reason for Rejection (Required)'}
            </label>
            <textarea
              rows={3}
              required={actionType === 'reject'}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'e.g. Identity and address verified. Kitchen ready.'
                  : 'e.g. Incomplete food safety registration, invalid kitchen address...'
              }
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-3 text-xs text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border">
            <button
              type="button"
              onClick={() => setActionChef(null)}
              className="px-4 py-2 rounded-xl border border-light-border text-light-text font-medium hover:bg-light-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={processing}
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-xs transition-colors cursor-pointer ${
                actionType === 'approve' ? 'bg-brand-primary hover:bg-brand-primary-dark' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChefApprovalsPage;
