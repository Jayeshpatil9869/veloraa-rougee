import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Sparkles,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  UploadCloud,
  FolderOpen,
  X,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import {
  DangerButton,
  DataTable,
  GhostButton,
  inputClass,
  Modal,
  Notice,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SoftButton,
  StatusBadge,
} from '../ui';

interface CategoryOption {
  id?: string;
  databaseId: string;
  slug: string;
  name: string;
}

interface Shade {
  databaseId?: string;
  name: string;
  price: string;
  stock: string;
}

const emptyShade = (): Shade => ({ name: '', price: '90', stock: '25' });

export const ProductsModule: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    api<{ items: Product[] }>('/admin/products')
      .then((result) => setProducts(result.items))
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load catalog products.')
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    api<CategoryOption[]>('/admin/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat =
        selectedCategory === 'all' ||
        p.categoryId === selectedCategory ||
        p.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const remove = async (product: Product) => {
    if (!product.databaseId || !window.confirm(`Are you sure you want to delete "${product.name}"?`))
      return;
    try {
      await api(`/admin/products/${product.databaseId}`, { method: 'DELETE' });
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Shades"
        subtitle="Manage luxury formulas, shade variants, pricing, and stock inventory."
        action={
          <PrimaryButton
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Create Product
          </PrimaryButton>
        }
      />

      {error && <Notice variant="error">{error}</Notice>}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or formula..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${inputClass} w-full sm:w-48 text-xs font-semibold`}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.databaseId || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={['Item', 'Category', 'Base Price', 'Variants', 'Status', 'Actions']}
        rows={filteredProducts.map((product) => [
          <div key="item" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[0.3rem] border border-[#E2E8F0] bg-[#FAF5F8] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {product.images?.[0]?.src ? (
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-5 h-5 text-[#A06A98]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#333333] truncate">{product.name}</p>
              <p className="text-[11px] text-[#888888] font-mono truncate">{product.slug}</p>
            </div>
          </div>,
          <span
            key="cat"
            className="text-xs font-bold text-[#76416F] bg-[#FDF2F8] px-2 py-0.5 rounded-[0.3rem] border border-[#DFBEDB]/50 inline-block"
          >
            {product.categoryName || 'General'}
          </span>,
          <span key="price" className="font-bold text-xs text-[#333333]">
            {product.variants[0] ? `₹${product.variants[0].price}` : '—'}
          </span>,
          <span key="vars" className="text-xs text-[#666666]">
            {product.variants.length} {product.variants.length === 1 ? 'shade' : 'shades'}
          </span>,
          <StatusBadge key="status" value={product.status} />,
          <div key="act" className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setEditing(product);
                setOpen(true);
              }}
              className="p-1.5 text-[#666666] hover:text-[#A06A98] hover:bg-[#FDF2F8] rounded-[0.3rem] transition-colors cursor-pointer"
              title="Edit product"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => void remove(product)}
              className="p-1.5 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded-[0.3rem] transition-colors cursor-pointer"
              title="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>,
        ])}
        emptyMessage={
          isLoading
            ? 'Loading catalog products...'
            : searchQuery || selectedCategory !== 'all'
              ? 'No products match your search filter.'
              : 'No products in catalog. Click "Create Product" to add one.'
        }
      />

      {open && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
};

const ProductForm: React.FC<{
  product: Product | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ product, categories, onClose, onSaved }) => {
  const [name, setName] = useState(product?.name ?? '');
  const matchedCategory = categories.find(
    (category) => category.slug === product?.categoryId || category.id === product?.categoryId
  );
  const [categorySlug, setCategorySlug] = useState(
    matchedCategory?.slug ?? categories[0]?.slug ?? ''
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageUrl, setImageUrl] = useState(product?.images[0]?.src ?? '');
  const [imageFileName, setImageFileName] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(product?.status ?? 'published');
  const [shades, setShades] = useState<Shade[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          databaseId: variant.databaseId,
          name: variant.name,
          price: String(variant.price),
          stock: String(variant.stock ?? 0),
        }))
      : [emptyShade()]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const computedSlug = name
    ? name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    : 'formula-slug';

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }
    setError('');
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const slug = product?.slug || computedSlug;
    const body = {
      name,
      slug,
      categorySlug,
      description,
      shortDescription: description,
      status,
      images: imageUrl ? [{ url: imageUrl, alt: name }] : [],
      variants: shades.map((shade, index) => ({
        id: shade.databaseId,
        name: shade.name || 'Default Shade',
        price: Number(shade.price) || 0,
        stock: Number(shade.stock) || 0,
        isDefault: index === 0,
        images: [],
      })),
    };
    try {
      if (product?.databaseId) {
        await api(`/admin/products/${product.databaseId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await api('/admin/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to save product formula.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={product ? 'Edit Formula / Product' : 'Create New Product'}
      subtitle="Configure luxury formula attributes, shade variations, pricing, and media."
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-[#76416F] font-medium hidden sm:block">
            <span>{shades.length} shade {shades.length === 1 ? 'variant' : 'variants'} configured</span>
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <GhostButton type="button" onClick={onClose}>
              Cancel
            </GhostButton>
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                const form = document.getElementById('product-edit-form') as HTMLFormElement | null;
                if (form) form.requestSubmit();
              }}
            >
              {isSubmitting ? 'Saving Formula…' : 'Save Product'}
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <form id="product-edit-form" className="space-y-5" onSubmit={(event) => void save(event)}>
        {/* Row 1: Title and Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
              Product Title *
            </label>
            <input
              className={inputClass}
              required
              placeholder="e.g. The Lip Liner"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {name && (
              <p className="text-[11px] text-[#888888] font-mono truncate">
                slug: <span className="text-[#A06A98]">/{computedSlug}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
              Collection / Category *
            </label>
            <select
              className={`${inputClass} font-semibold`}
              required
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.databaseId || category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Editorial Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
            Editorial Description
          </label>
          <textarea
            className={`${inputClass} min-h-24 py-2 text-xs leading-relaxed`}
            placeholder="An innovative transfer-proof formulation that delivers smooth precision and velvety matte finish..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {/* Row 3: Drag & Drop Image Uploader with Local File Select & Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#666666] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#A06A98]" />
              <span>Product Cover Image</span>
            </label>
            <div className="flex items-center gap-1 p-0.5 bg-[#FAF5F8] border border-[#E2E8F0] rounded-[0.3rem]">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-[0.25rem] transition-colors cursor-pointer ${
                  imageTab === 'upload'
                    ? 'bg-white text-[#76416F] shadow-2xs'
                    : 'text-[#888888] hover:text-[#333333]'
                }`}
              >
                Upload / Drop File
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-[0.25rem] transition-colors cursor-pointer ${
                  imageTab === 'url'
                    ? 'bg-white text-[#76416F] shadow-2xs'
                    : 'text-[#888888] hover:text-[#333333]'
                }`}
              >
                Image URL Link
              </button>
            </div>
          </div>

          {imageTab === 'upload' ? (
            <div>
              {imageUrl ? (
                /* Live Preview Card with replace / remove actions */
                <div className="flex items-center gap-4 p-3 bg-[#FAF5F8] border border-[#DFBEDB]/70 rounded-xl">
                  <div className="w-16 h-16 rounded-lg border border-[#DFBEDB] bg-white overflow-hidden shrink-0 shadow-xs relative group">
                    <img
                      src={imageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#333333] truncate">
                      {imageFileName || 'Selected Product Photo'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Image loaded & ready for storefront
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white border border-[#DFBEDB] hover:border-[#A06A98] text-[#76416F] hover:text-[#5C3257] rounded-[0.3rem] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#A06A98]" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageFileName('');
                      }}
                      className="p-1.5 text-[#999999] hover:text-rose-600 hover:bg-rose-50 rounded-[0.3rem] transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Drag and Drop Zone */
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${
                    isDragging
                      ? 'border-[#A06A98] bg-[#FDF2F8] scale-[1.01] shadow-xs'
                      : 'border-[#DFBEDB] hover:border-[#A06A98] bg-[#FAF5F8]/70 hover:bg-[#FDF2F8]/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-[#DFBEDB] flex items-center justify-center text-[#A06A98] group-hover:scale-110 transition-transform shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#333333] group-hover:text-[#76416F] transition-colors">
                      <span className="text-[#A06A98] underline underline-offset-2">Click to select local image</span> or drag & drop file here
                    </p>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      Supports PNG, JPG, WEBP, SVG or GIF (up to 10MB)
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex gap-2.5 items-center">
              <input
                className={`${inputClass} flex-1`}
                placeholder="https://cdn.example.com/products/lip-liner.webp"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-[0.3rem] border border-[#DFBEDB] bg-[#FAF5F8] overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 4: Storefront Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#666666] block">
            Storefront Visibility Status
          </label>
          <select
            className={`${inputClass} font-semibold`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="published">● Published (Live in Storefront)</option>
            <option value="draft">○ Draft (Hidden from Public)</option>
            <option value="archived">× Archived</option>
          </select>
        </div>

        {/* Shade / Variant Manager with Smooth Flowing Layout */}
        <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A06A98]" />
                <span>Shade Variations & Stock Inventory</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDF2F8] text-[#76416F] border border-[#DFBEDB]/60 font-mono">
                  {shades.length}
                </span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShades([...shades, emptyShade()])}
              className="text-xs font-bold text-[#76416F] hover:text-[#5C3257] bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#DFBEDB]/60 px-2.5 py-1 rounded-[0.3rem] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3 text-[#A06A98]" />
              <span>Add Shade</span>
            </button>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-2.5 px-3 py-1.5 bg-[#FAF5F8] rounded-[0.3rem] border border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            <div className="col-span-5 sm:col-span-6">Shade / Variant Name</div>
            <div className="col-span-3 sm:col-span-3">Price (₹)</div>
            <div className="col-span-3 sm:col-span-2">Stock Qty</div>
            <div className="col-span-1 sm:col-span-1 text-center">Action</div>
          </div>

          {/* Shade Rows List */}
          <div className="space-y-2">
            {shades.map((shade, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2.5 items-center bg-white p-2.5 rounded-[0.35rem] border border-[#E2E8F0] hover:border-[#DFBEDB] transition-colors shadow-2xs"
              >
                <div className="col-span-5 sm:col-span-6">
                  <input
                    className="w-full bg-[#FAF5F8] border border-[#E2E8F0] focus:border-[#A06A98] focus:bg-white rounded-[0.3rem] px-2.5 py-1.5 text-xs text-[#333333] placeholder-[#999999] outline-none transition-all"
                    required
                    placeholder="e.g. Cashmere Rose"
                    value={shade.name}
                    onChange={(event) =>
                      setShades(
                        shades.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-3 sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888888] pointer-events-none">
                      ₹
                    </span>
                    <input
                      className="w-full bg-[#FAF5F8] border border-[#E2E8F0] focus:border-[#A06A98] focus:bg-white rounded-[0.3rem] pl-5 pr-2 py-1.5 text-xs text-[#333333] font-semibold outline-none transition-all"
                      required
                      type="number"
                      placeholder="850"
                      value={shade.price}
                      onChange={(event) =>
                        setShades(
                          shades.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, price: event.target.value } : item
                          )
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    className="w-full bg-[#FAF5F8] border border-[#E2E8F0] focus:border-[#A06A98] focus:bg-white rounded-[0.3rem] px-2.5 py-1.5 text-xs text-[#333333] font-mono outline-none transition-all"
                    required
                    type="number"
                    placeholder="25"
                    value={shade.stock}
                    onChange={(event) =>
                      setShades(
                        shades.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, stock: event.target.value } : item
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-1 sm:col-span-1 text-center">
                  {shades.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShades(shades.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="text-[#999999] hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-[0.3rem] transition-colors cursor-pointer"
                      title="Remove Shade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <Notice variant="error">{error}</Notice>}
      </form>
    </Modal>
  );
};
