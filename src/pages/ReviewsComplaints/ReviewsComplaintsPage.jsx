import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  Star,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import reviewComplaintService from '../../services/reviewComplaintService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ReviewsComplaintsPage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'reviews'
  const [loading, setLoading] = useState(true);

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [complaintPage, setComplaintPage] = useState(1);
  const [complaintTotalPages, setComplaintTotalPages] = useState(1);
  const [complaintTotal, setComplaintTotal] = useState(0);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [flagFilter, setFlagFilter] = useState('');

  // Complaint Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewComplaintService.listComplaints({
        page: complaintPage,
        limit: 15,
        status: complaintStatusFilter,
      });
      setComplaints(res.complaints || res.data || []);
      setComplaintTotalPages(res.pagination?.pages || res.totalPages || 1);
      setComplaintTotal(res.pagination?.total || res.total || 0);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [complaintPage, complaintStatusFilter]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewComplaintService.listReviews({
        page: reviewPage,
        limit: 15,
        isFlagged: flagFilter,
      });
      setReviews(res.reviews || res.data || []);
      setReviewTotalPages(res.pagination?.pages || res.totalPages || 1);
      setReviewTotal(res.pagination?.total || res.total || 0);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [reviewPage, flagFilter]);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab, fetchComplaints, fetchReviews]);

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    if (!resolutionNotes.trim()) {
      addToast('Please provide resolution notes.', 'error');
      return;
    }

    setResolving(true);
    try {
      await reviewComplaintService.updateComplaintStatus(selectedComplaint._id, {
        status: resolutionStatus,
        resolutionNotes,
      });
      addToast('Complaint resolution updated successfully.', 'success');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update complaint.', 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleModerateReview = async (review, isFlagged, isHidden) => {
    try {
      await reviewComplaintService.moderateReview(review._id, { isFlagged, isHidden });
      addToast(`Review ${isFlagged ? 'flagged' : 'unflagged'} successfully.`, 'info');
      fetchReviews();
    } catch (err) {
      addToast('Failed to moderate review.', 'error');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Customer Feedback & Grievance Redressal
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Resolve consumer disputes, manage delivery grievances, and moderate public culinary reviews.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-light-border bg-light-card text-xs font-semibold">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Complaints & Disputes
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Public Reviews
          </button>
        </div>
      </div>

      {/* Tab 1: Complaints */}
      {activeTab === 'complaints' && (
        <Card bodyClassName="p-0 overflow-x-auto">
          <div className="p-4 border-b border-light-border flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-text">
              Customer Grievances Queue
            </h3>

            <select
              value={complaintStatusFilter}
              onChange={(e) => {
                setComplaintStatusFilter(e.target.value);
                setComplaintPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card px-3 py-1.5 text-xs text-light-text focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No active complaints"
              description="No grievances pending resolution under this status."
              className="my-8 border-none"
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Subject & Customer</th>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted On</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-light-secondary/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-light-text truncate max-w-[200px]">
                          {c.subject || 'Grievance ticket'}
                        </p>
                        <p className="text-[11px] text-light-muted">
                          By {c.customerId?.name || 'Customer'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        #{c.orderId?.orderNumber || c.orderId?._id?.slice(-6) || '-'}
                      </td>

                      <td className="py-3.5 px-4 capitalize text-light-text">
                        {c.category?.replace(/_/g, ' ') || 'Order Issue'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={c.status} size="xs" />
                      </td>

                      <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                        {formatDateTime(c.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setResolutionStatus(c.status === 'submitted' ? 'in_review' : 'resolved');
                            setResolutionNotes(c.resolutionNotes || '');
                          }}
                          className="px-3 py-1 rounded-lg bg-brand-primary text-white text-[11px] font-semibold hover:bg-brand-primary-dark transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={complaintPage}
            totalPages={complaintTotalPages}
            totalItems={complaintTotal}
            pageSize={15}
            onPageChange={setComplaintPage}
          />
        </Card>
      )}

      {/* Tab 2: Reviews */}
      {activeTab === 'reviews' && (
        <Card bodyClassName="p-0 overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No customer reviews found"
              description="Reviews written by customers will appear here."
              className="my-8 border-none"
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Rating & Review</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">HomeChef</th>
                    <th className="py-3.5 px-4">Flagged</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-light-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < r.rating ? 'fill-amber-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-light-text italic line-clamp-2">
                          "{r.comment || 'No comment text'}"
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-light-text">
                        {r.customerId?.name || 'Customer'}
                      </td>

                      <td className="py-3.5 px-4 text-light-muted">
                        {r.chefId?.kitchenName || r.chefId?.name || 'HomeChef'}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.isFlagged ? (
                          <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                            <Flag className="h-3 w-3 fill-rose-500" /> Flagged
                          </span>
                        ) : (
                          <span className="text-[11px] text-light-muted">Clean</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-light-muted whitespace-nowrap">
                        {formatDateTime(r.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleModerateReview(reviewComplaintService, !r.isFlagged, r.isHidden)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            r.isFlagged
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {r.isFlagged ? 'Unflag Review' : 'Flag Review'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={reviewPage}
            totalPages={reviewTotalPages}
            totalItems={reviewTotal}
            pageSize={15}
            onPageChange={setReviewPage}
          />
        </Card>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint?.subject || 'Grievance Resolution'}
        subtitle={`From: ${selectedComplaint?.customerId?.name || 'Customer'}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResolveComplaint} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-light-secondary/40 border border-light-border">
            <span className="font-semibold text-[10px] uppercase text-light-muted">
              Customer Complaint Description:
            </span>
            <p className="mt-1 text-light-text leading-relaxed">
              {selectedComplaint?.description}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Set Resolution Status
            </label>
            <select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none cursor-pointer"
            >
              <option value="in_review">Mark In Review</option>
              <option value="resolved">Mark Resolved</option>
              <option value="rejected">Reject Complaint</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Resolution Notes / Outcome Explanation *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Issue resolved with kitchen, refund credited to customer wallet..."
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 p-2.5 text-xs text-light-text focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="px-4 py-2 rounded-xl border border-light-border font-medium hover:bg-light-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 rounded-xl bg-brand-primary text-white font-bold shadow-xs hover:bg-brand-primary-dark transition-colors cursor-pointer"
            >
              {resolving ? 'Updating...' : 'Update Grievance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewsComplaintsPage;
