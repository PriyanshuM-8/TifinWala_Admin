import React, { useState, useEffect, useCallback } from 'react';
import {
  UtensilsCrossed,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Tags,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import foodService from '../../services/foodService';
import categoryService from '../../services/categoryService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const FoodsPage = () => {
  const { addToast } = useToast();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailableFilter, setIsAvailableFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFoods, setTotalFoods] = useState(0);

  // Detail Modal
  const [selectedFood, setSelectedFood] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryService.listCategories();
      setCategories(res.categories || res.data || []);
    } catch {
      // Ignored
    }
  }, []);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await foodService.listFoods({
        page,
        limit: 15,
        search,
        categoryId,
        isAvailable: isAvailableFilter,
      });
      setFoods(res.foods || res.data || []);
      setTotalPages(res.pagination?.pages || res.totalPages || 1);
      setTotalFoods(res.pagination?.total || res.total || 0);
    } catch (err) {
      console.error('Failed to load food items:', err);
      addToast('Failed to load food catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, isAvailableFilter, addToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleToggleFoodStatus = async (food) => {
    const newActive = !food.isActive;
    const action = newActive ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} "${food.name}"?`)) {
      return;
    }

    try {
      await foodService.moderateFood(food._id, {
        isActive: newActive,
        availability: food.isAvailable ? 'available' : 'unavailable',
      });
      addToast(`Food item "${food.name}" updated successfully.`, 'success');
      fetchFoods();
      if (selectedFood?._id === food._id) {
        setSelectedFood((prev) => ({ ...prev, isActive: newActive }));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update food item.', 'error');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Food Catalog Moderation
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Global catalog of homemade dishes, category alignments, pricing integrity, and dish moderation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-light-muted" />
            <input
              type="text"
              placeholder="Search dish name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-light-border bg-light-card pl-9 pr-3 py-2 text-xs text-light-text focus:outline-none w-48 sm:w-56"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={isAvailableFilter}
            onChange={(e) => {
              setIsAvailableFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-light-border bg-light-card px-3 py-2 text-xs font-medium text-light-text focus:outline-none cursor-pointer"
          >
            <option value="">Availability</option>
            <option value="true">Available Dishes</option>
            <option value="false">Unavailable</option>
          </select>

          <button
            onClick={fetchFoods}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : foods.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No food dishes found"
            description="No dishes match your filter specifications."
            className="my-8 border-none"
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-light-border bg-light-secondary/40 text-light-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">HomeChef</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {foods.map((food) => (
                  <tr
                    key={food._id}
                    className="hover:bg-light-secondary/20 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {food.images?.[0] ? (
                          <img
                            src={food.images[0]}
                            alt={food.name}
                            className="h-9 w-9 rounded-lg object-cover shrink-0 border border-light-border"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {food.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-light-text truncate">
                            {food.name}
                          </p>
                          <p className="text-[11px] text-light-muted truncate">
                            {food.foodType || 'Vegetarian'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-light-text font-medium">
                      {food.categoryId?.name || 'General'}
                    </td>

                    <td className="py-3.5 px-4 text-light-muted truncate max-w-[130px]">
                      {food.chefId?.kitchenName || food.chefId?.name || 'HomeChef'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-light-text">
                      {formatCurrency(food.price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={food.isAvailable ? 'available' : 'unavailable'} size="xs" />
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={food.isActive ? 'active' : 'inactive'} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedFood(food)}
                          className="rounded-lg p-1.5 text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleToggleFoodStatus(food)}
                          className={`rounded-lg p-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            food.isActive
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={food.isActive ? 'Deactivate Food' : 'Activate Food'}
                        >
                          {food.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
          totalItems={totalFoods}
          pageSize={15}
          onPageChange={setPage}
        />
      </Card>

      {/* Food Details Modal */}
      <Modal
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
        title={selectedFood?.name || 'Dish Details'}
        subtitle={`Category: ${selectedFood?.categoryId?.name || 'General'}`}
        maxWidth="max-w-xl"
      >
        {selectedFood && (
          <div className="space-y-5 text-xs">
            {selectedFood.images?.[0] && (
              <img
                src={selectedFood.images[0]}
                alt={selectedFood.name}
                className="w-full h-48 rounded-xl object-cover border border-light-border"
              />
            )}

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-light-border bg-light-secondary/30">
              <div>
                <span className="text-light-muted font-medium">Price:</span>
                <p className="text-base font-bold text-light-text">
                  {formatCurrency(selectedFood.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={selectedFood.isAvailable ? 'available' : 'unavailable'} />
                <Badge status={selectedFood.isActive ? 'active' : 'inactive'} />
              </div>
            </div>

            <div>
              <span className="font-semibold text-light-muted uppercase tracking-wider text-[11px]">
                Description:
              </span>
              <p className="mt-1 text-light-text leading-relaxed">
                {selectedFood.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-light-border flex justify-end">
              <button
                onClick={() => handleToggleFoodStatus(selectedFood)}
                className={`px-4 py-2 rounded-xl text-white font-bold shadow-xs transition-colors cursor-pointer ${
                  selectedFood.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-primary hover:bg-brand-primary-dark'
                }`}
              >
                {selectedFood.isActive ? 'Deactivate from Catalog' : 'Activate in Catalog'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FoodsPage;
