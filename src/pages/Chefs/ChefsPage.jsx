import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  MapPin,
  UtensilsCrossed,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';
import chefService from '../../services/chefService';
import foodService from '../../services/foodService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ChefsPage = () => {
  const { addToast } = useToast();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChefs, setTotalChefs] = useState(0);

  // Detail Modal
  const [selectedChef, setSelectedChef] = useState(null);
  const [chefFoods, setChefFoods] = useState([]);

  const fetchChefs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chefService.listChefs({
        page,
        limit: 15,
        search,
        approvalStatus: approvalFilter,
      });
      setChefs(res.chefs || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalChefs(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load chefs:', err);
      addToast('Failed to load chefs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, approvalFilter, addToast]);

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  const handleToggleStatus = async (chef) => {
    const isCurrentlyActive = chef.userId?.isActive;
    const action = isCurrentlyActive ? 'suspend' : 'activate';
    try {
      if (isCurrentlyActive) {
        await chefService.suspendChef(chef._id, 'Administrative review');
        addToast(`HomeChef ${chef.kitchenName || 'kitchen'} suspended.`, 'warning');
      } else {
        await chefService.activateChef(chef._id);
        addToast(`HomeChef ${chef.kitchenName || 'kitchen'} activated.`, 'success');
      }
      fetchChefs();
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} chef.`, 'error');
    }
  };

  const handleViewChef = async (chef) => {
    setSelectedChef(chef);
    try {
      const foodsRes = await foodService.listFoods({ chefId: chef._id, limit: 20 });
      setChefFoods(foodsRes.foods || foodsRes.data || []);
    } catch {
      setChefFoods([]);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            HomeChef Directory
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Registered culinary partners, kitchen locations, approval status, and operating permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/chef-approvals"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-xs hover:bg-brand-orange-hover transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Review Pending Approvals</span>
          </Link>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light-muted" />
            <input
              type="text"
              placeholder="Search kitchen, owner, city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card pl-9 pr-3 py-2 text-xs text-light-text focus:outline-none w-52 sm:w-60"
            />
          </div>

          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={fetchChefs}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : chefs.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No HomeChefs found"
            description="No culinary partners match your filter conditions."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Kitchen & Owner</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Service Radius</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {chefs.map((chef) => {
                  const chefUser = chef.userId || {};
                  return (
                    <tr
                      key={chef._id}
                      className="hover:bg-light-secondary/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {(chef.kitchenName || chef.ownerName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-light-text truncate">
                              {chef.kitchenName || 'Kitchen Unnamed'}
                            </p>
                            <p className="text-[11px] text-light-muted truncate">
                              {chef.ownerName || chefUser.name || 'Owner'} • {chefUser.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-light-text">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-light-muted shrink-0" />
                          <span className="truncate max-w-[140px]">{chef.city || chef.kitchenAddress || 'Unset'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-light-text">
                        {chef.serviceRadiusKm || 10} KM
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={chef.approvalStatus} size="xs" />
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={chefUser.isActive ? 'active' : 'suspended'} size="xs" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewChef(chef)}
                            className="rounded-lg p-1.5 text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                            title="View Kitchen Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(chef)}
                            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                              chefUser.isActive
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={chefUser.isActive ? 'Suspend HomeChef' : 'Activate HomeChef'}
                          >
                            {chefUser.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalChefs}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Chef Details Modal */}
      <Modal
        isOpen={!!selectedChef}
        onClose={() => setSelectedChef(null)}
        title={selectedChef?.kitchenName || 'HomeChef Kitchen Dossier'}
        subtitle={`Owner: ${selectedChef?.ownerName || selectedChef?.userId?.name || 'Chef'}`}
        maxWidth="max-w-2xl"
      >
        {selectedChef && (
          <div className="space-y-6 text-xs">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-light-border bg-light-secondary/30">
              <div>
                <p className="font-bold text-sm text-light-text">
                  {selectedChef.kitchenName}
                </p>
                <p className="text-[11px] text-light-muted mt-0.5">
                  {selectedChef.kitchenAddress}, {selectedChef.city}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={selectedChef.approvalStatus} />
                <Badge status={selectedChef.userId?.isActive ? 'active' : 'suspended'} />
              </div>
            </div>

            {/* Kitchen Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-light-border bg-light-card">
                <span className="text-light-muted font-medium">Service Radius:</span>
                <p className="font-bold text-light-text mt-0.5">
                  {selectedChef.serviceRadiusKm || 10} KM
                </p>
              </div>

              <div className="p-3 rounded-xl border border-light-border bg-light-card">
                <span className="text-light-muted font-medium">Food Safety / FSSAI:</span>
                <p className="font-bold text-light-text mt-0.5 truncate">
                  {selectedChef.foodSafetyDetails || 'Verified standard'}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-light-border bg-light-card">
                <span className="text-light-muted font-medium">Registered:</span>
                <p className="font-bold text-light-text mt-0.5">
                  {formatDateTime(selectedChef.createdAt)}
                </p>
              </div>
            </div>

            {/* Food Menu Items Summary */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-light-text mb-2.5 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-brand-primary" />
                <span>Kitchen Menu Items ({chefFoods.length})</span>
              </h4>

              {chefFoods.length === 0 ? (
                <p className="text-light-muted py-3 text-center border rounded-xl">
                  No food dishes published yet by this chef.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-light-border p-2">
                  {chefFoods.map((f) => (
                    <div
                      key={f._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-light-secondary/30 text-xs"
                    >
                      <span className="font-semibold text-light-text truncate">
                        {f.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{formatCurrency(f.price)}</span>
                        <Badge status={f.isAvailable ? 'available' : 'unavailable'} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChefsPage;
