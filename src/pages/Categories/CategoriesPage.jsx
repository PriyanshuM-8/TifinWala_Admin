import React, { useState, useEffect, useCallback } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import categoryService from '../../services/categoryService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const CategoriesPage = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.listCategories();
      setCategories(res.categories || res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      addToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (cat) => {
    try {
      await categoryService.toggleCategoryStatus(cat._id);
      addToast(`Category "${cat.name}" status updated.`, 'success');
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update category.', 'error');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    try {
      await categoryService.deleteCategory(cat._id);
      addToast(`Category "${cat.name}" deleted.`, 'info');
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete category.', 'error');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
        addToast(`Category "${name}" updated successfully.`, 'success');
      } else {
        await categoryService.createCategory(formData);
        addToast(`Category "${name}" created successfully.`, 'success');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-light-text">
            Food Categories
          </h2>
          <p className="text-xs text-light-muted mt-1">
            Organize homemade culinary specialties into searchable categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCategories}
            className="rounded-xl border border-light-border bg-light-card p-2 text-light-muted hover:text-light-text hover:bg-light-secondary transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-xs hover:bg-brand-primary-dark transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading food categories..." />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories found"
          description="Create your first food category to organize dishes for customers."
          action={
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer"
            >
              Add First Category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-2xl border border-light-border bg-light-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-12 w-12 rounded-xl object-cover border border-light-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <Badge status={cat.isActive ? 'active' : 'inactive'} size="xs" />
                </div>

                <div>
                  <h4 className="font-bold text-sm text-light-text tracking-tight">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-light-muted mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-light-border flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(cat)}
                  className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                    cat.isActive
                      ? 'text-rose-500 hover:text-rose-600'
                      : 'text-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-light-muted hover:text-brand-primary hover:bg-light-secondary transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-light-muted hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        subtitle="Manage category metadata and display branding"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Indian Thali, Homemade Sweets..."
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 px-3 py-2 text-xs text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for customers..."
              className="w-full rounded-xl border border-light-border bg-light-secondary/40 px-3 py-2 text-xs text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-light-text mb-1.5">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-light-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary-dark file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-light-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-light-border text-light-text font-medium hover:bg-light-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand-primary text-white font-bold shadow-xs hover:bg-brand-primary-dark transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
