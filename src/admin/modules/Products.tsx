import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Image as ImageIcon,
  UploadCloud,
  FolderOpen,
  X,
  Sparkles,
  Layers,
  ChevronDown,
  Check,
  Tag,
  Link as LinkIcon,
  Star,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import {
  DataTable,
  inputClass,
  Modal,
  Notice,
  PageHeader,
  PrimaryButton,
  SearchInput,
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

const MAX_IMAGES = 6;

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
        title="Products & Formulas"
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
          placeholder="Search products by formula, category, or slug..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`${inputClass} w-full sm:w-48 text-xs font-semibold cursor-pointer`}
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
              <p className="text-[11px] text-[#888888] font-mono truncate">/{product.slug}</p>
            </div>
          </div>,
          <span
            key="cat"
            className="text-xs font-bold text-[#76416F] bg-[#FDF2F8] px-2 py-0.5 rounded-[0.3rem] border border-[#DFBEDB]/50 inline-block"
          >
            {product.categoryName || 'Lips'}
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
    matchedCategory?.slug ?? categories[0]?.slug ?? 'lips'
  );
  const [finish, setFinish] = useState('Velour Matte');
  const [status, setStatus] = useState(product?.status ?? 'published');
  const [description, setDescription] = useState(product?.description ?? '');
  
  // Multi-image gallery state (5 to 6 images maximum)
  const [images, setImages] = useState<string[]>(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((img) => img.src).slice(0, MAX_IMAGES);
    }
    return [
      'https://cdn.shopify.com/s/files/1/0669/7723/5199/files/2048x2048_5b4ae2c3-bbbe-4bf4-95d8-6d0438976909.jpg?v=1756197958',
    ];
  });
  const [urlInput, setUrlInput] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // New shade quick entry
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadePrice, setNewShadePrice] = useState('80');
  const [newShadeStock, setNewShadeStock] = useState('25');

  // Badges / Tags
  const [bestseller, setBestseller] = useState(product?.bestseller ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? true);

  const [shades, setShades] = useState<Shade[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          databaseId: variant.databaseId,
          name: variant.name,
          price: String(variant.price),
          stock: String(variant.stock ?? 25),
        }))
      : [
          { name: 'Cashmere Rose', price: '80', stock: '25' },
          { name: 'Cinnamon', price: '80', stock: '25' },
          { name: 'Hazelnut', price: '80', stock: '25' },
          { name: 'Pink Nude', price: '80', stock: '25' },
        ]
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

  const totalStock = shades.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError('');

    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum limit reached: You can add up to ${MAX_IMAGES} images only.`);
      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      setError(`Only ${availableSlots} more image(s) could be added (max ${MAX_IMAGES} images).`);
    }

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files (PNG, JPG, WEBP, GIF).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each image file size must be less than 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          const resultStr = e.target.result;
          setImages((prev) => {
            if (prev.length >= MAX_IMAGES) return prev;
            return [...prev, resultStr];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum limit reached: You can add up to ${MAX_IMAGES} images only.`);
      return;
    }
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setError('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePreviewIndex >= indexToRemove && activePreviewIndex > 0) {
      setActivePreviewIndex((prev) => prev - 1);
    }
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    setImages((prev) => {
      const item = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [item, ...rest];
    });
    setActivePreviewIndex(0);
  };

  const handleAddShade = () => {
    if (!newShadeName.trim()) return;
    setShades((prev) => [
      ...prev,
      {
        name: newShadeName.trim(),
        price: newShadePrice || '80',
        stock: newShadeStock || '25',
      },
    ]);
    setNewShadeName('');
  };

  const save = async (event?: React.FormEvent, customStatus?: string) => {
    if (event) event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const targetStatus = customStatus || status;
    const slug = product?.slug || computedSlug;
    const body = {
      name,
      slug,
      categoryId: categorySlug,
      categorySlug,
      description,
      shortDescription: description,
      status: targetStatus,
      bestseller,
      featured,
      images: images.map((src, idx) => ({
        url: src,
        src: src,
        alt: `${name} - View ${idx + 1}`,
      })),
      variants: shades.map((shade, index) => ({
        id: shade.databaseId,
        name: shade.name || 'Default Shade',
        price: Number(shade.price) || 80,
        stock: Number(shade.stock) || 25,
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
      setError(reason instanceof Error ? reason.message : 'Failed to save formula.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={product ? 'Edit Luxury Formula' : 'New Luxury Formula'}
      subtitle="Configure product formula details, multi-image gallery, shade matrix, and inventory."
      onClose={onClose}
      maxWidth="max-w-5xl"
      confirmOnClose={true}
    >
      <form id="product-edit-form" className="space-y-6" onSubmit={(event) => void save(event)}>
        {/* ========================================================================= */}
        {/* MAIN TWO-COLUMN FORM LAYOUT                                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Formula Details, Category, Finish, Description & Badges    */}
          {/* Sticky positioning: remains visible while scrolling right column        */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-0 self-start">
            
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#333333] block">
                Product / Formula Name <span className="text-[#A06A98]">*</span>
              </label>
              <input
                className={`${inputClass} font-semibold`}
                required
                placeholder="e.g. The Lip Liner"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <p className="text-[11px] text-[#888888] font-mono">
                Store URL: <span className="text-[#76416F] font-semibold">/product/{computedSlug}</span>
              </p>
            </div>

            {/* Category & Finish (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#333333] block">
                  Category <span className="text-[#A06A98]">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-8 text-xs font-semibold cursor-pointer`}
                    required
                    value={categorySlug}
                    onChange={(event) => setCategorySlug(event.target.value)}
                  >
                    <option value="lips">Lips</option>
                    <option value="face">Face</option>
                    <option value="eyes">Eyes</option>
                    <option value="brows">Brows</option>
                    <option value="bundles">Special Offers</option>
                    {categories
                      .filter((c) => !['lips', 'face', 'eyes', 'brows', 'bundles'].includes(c.slug))
                      .map((category) => (
                        <option key={category.databaseId || category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#333333] block">
                  Texture / Finish
                </label>
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-8 text-xs font-semibold cursor-pointer`}
                    value={finish}
                    onChange={(event) => setFinish(event.target.value)}
                  >
                    <option value="Velour Matte">Velour Matte</option>
                    <option value="Satin Glow">Satin Glow</option>
                    <option value="Sheer Hydration">Sheer Hydration</option>
                    <option value="Precision Liquid">Precision Liquid</option>
                    <option value="Creamy Kohl">Creamy Kohl</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Catalog Visibility Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#333333] block">
                Catalog Visibility
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'published', label: 'Published' },
                  { id: 'draft', label: 'Draft' },
                  { id: 'archived', label: 'Archived' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-[0.3rem] border transition-all cursor-pointer text-center ${
                      status === item.id
                        ? 'border-[#A06A98] bg-[#FDF2F8] text-[#76416F] shadow-2xs'
                        : 'border-[#E2E8F0] bg-white text-[#666666] hover:border-[#DFBEDB]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#333333] block">
                Formula Description & Sensory Notes
              </label>
              <textarea
                className={`${inputClass} min-h-[110px] py-2.5 text-xs leading-relaxed`}
                placeholder="An innovative transfer-proof formulation that delivers precision, velvety matte texture, and long-lasting comfortable wear for up to 16 hours..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="text-[11px] text-[#888888]">
                Describe wear-time, application technique, texture, and botanical ingredients.
              </p>
            </div>

            {/* Badges / Highlights */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBestseller(!bestseller)}
                className={`px-3 py-1.5 text-xs font-bold rounded-[0.3rem] border transition-all cursor-pointer flex items-center gap-1.5 ${
                  bestseller
                    ? 'bg-[#FDF2F8] border-[#A06A98] text-[#76416F]'
                    : 'bg-white border-[#E2E8F0] text-[#888888] hover:border-[#DFBEDB]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A06A98]" />
                <span>Bestseller</span>
              </button>

              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`px-3 py-1.5 text-xs font-bold rounded-[0.3rem] border transition-all cursor-pointer flex items-center gap-1.5 ${
                  featured
                    ? 'bg-[#FDF2F8] border-[#A06A98] text-[#76416F]'
                    : 'bg-white border-[#E2E8F0] text-[#888888] hover:border-[#DFBEDB]'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#A06A98]" />
                <span>Featured Collection</span>
              </button>
            </div>

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Multi-Image Gallery (5 to 6 Images), Shade Matrix & Save  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Multi-Image Gallery Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#333333]">
                    Product Images
                  </label>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-[#FAF5F8] border border-[#DFBEDB] text-[#76416F] rounded font-bold">
                    {images.length} / {MAX_IMAGES} max
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageInputMode(imageInputMode === 'upload' ? 'url' : 'upload')}
                  className="text-[11px] font-bold text-[#76416F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-[#A06A98]" />
                  <span>{imageInputMode === 'upload' ? 'Add via URL' : 'Upload Files'}</span>
                </button>
              </div>

              {/* URL Input Bar (When in URL Mode) */}
              {imageInputMode === 'url' && (
                <div className="flex gap-2 items-center">
                  <input
                    className={`${inputClass} flex-1 text-xs`}
                    placeholder="https://cdn.example.com/formula-angle.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrlImage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!urlInput.trim() || images.length >= MAX_IMAGES}
                    onClick={handleAddUrlImage}
                    className="px-3 py-2 bg-[#76416F] hover:bg-[#A06A98] text-white text-xs font-bold rounded-[0.3rem] transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Add Image
                  </button>
                </div>
              )}

              {/* Multi-Image Gallery Grid (Up to 6 Images) */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={`p-3 bg-[#FAF5F8] border rounded-[0.35rem] transition-all ${
                  isDragging ? 'border-[#A06A98] bg-[#FDF2F8]' : 'border-[#DFBEDB]/70'
                }`}
              >
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
                  {/* Uploaded Images Cards */}
                  {images.map((src, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={index}
                        className={`group relative rounded-[0.3rem] bg-white border overflow-hidden aspect-square flex items-center justify-center transition-all ${
                          isCover
                            ? 'border-[#A06A98] ring-2 ring-[#DFBEDB] shadow-2xs'
                            : 'border-[#E2E8F0] hover:border-[#DFBEDB]'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`Product shot ${index + 1}`}
                          className="w-full h-full object-contain p-1.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />

                        {/* Top Badge: Primary Cover vs Slot Index */}
                        <div className="absolute top-1 left-1 pointer-events-none">
                          {isCover ? (
                            <span className="bg-[#76416F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Cover
                            </span>
                          ) : (
                            <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(index)}
                              className="p-1.5 bg-white text-[#76416F] hover:bg-[#FDF2F8] rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                              title="Set as primary cover"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Delete image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty / Add More Slots (If under MAX_IMAGES) */}
                  {images.length < MAX_IMAGES && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#DFBEDB] hover:border-[#A06A98] bg-white hover:bg-[#FDF2F8] rounded-[0.3rem] aspect-square flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors group"
                    >
                      <UploadCloud className="w-5 h-5 text-[#A06A98] group-hover:scale-110 transition-transform mb-1" />
                      <p className="text-[10px] font-bold text-[#76416F]">
                        + Add Image
                      </p>
                      <span className="text-[9px] text-[#888888]">
                        ({MAX_IMAGES - images.length} left)
                      </span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                />
              </div>

              <p className="text-[11px] text-[#888888] leading-tight">
                Add 1 to {MAX_IMAGES} high-res images (1:1 square or 4:5 ratio). The 1st image is the primary cover. Hover any image to set as cover or delete.
              </p>
            </div>

            {/* ===================================================================== */}
            {/* SHADE VARIANTS & INVENTORY (PREMIUM UI/UX REDESIGN)                   */}
            {/* ===================================================================== */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <label className="text-xs font-bold text-[#333333] block">
                    Shade Variants & Inventory Matrix
                  </label>
                  <p className="text-[11px] text-[#888888]">
                    Manage individual shades, custom prices, and live inventory levels.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[#76416F] bg-[#FDF2F8] px-2.5 py-1 rounded-[0.3rem] border border-[#DFBEDB]/70 shadow-2xs">
                    {shades.length} {shades.length === 1 ? 'Shade' : 'Shades'} • {totalStock} Units Total
                  </span>
                </div>
              </div>

              {/* Quick Preset Shades Chips (1-Click Addition) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-[#888888] tracking-wider shrink-0">
                  Quick Add:
                </span>
                {[
                  { name: '05 Velvet Mauve', color: '#9E5B6D' },
                  { name: '06 Royal Plum', color: '#6A2A48' },
                  { name: '07 Terracotta', color: '#B35A38' },
                  { name: '08 Berry Rouge', color: '#881F38' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (shades.some((s) => s.name === preset.name)) return;
                      setShades((prev) => [
                        ...prev,
                        { name: preset.name, price: '80', stock: '25' },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#FDF2F8] border border-[#DFBEDB]/80 hover:border-[#A06A98] text-[#76416F] text-[11px] font-semibold rounded-[0.25rem] transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                    <span>+ {preset.name}</span>
                  </button>
                ))}
              </div>

              {/* In-Place Editable Shades Table */}
              <div className="border border-[#DFBEDB]/80 rounded-[0.35rem] bg-white overflow-hidden shadow-2xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#FAF5F8] border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                  <div className="col-span-5 sm:col-span-5">Shade Title</div>
                  <div className="col-span-3 sm:col-span-3">Price (₹)</div>
                  <div className="col-span-3 sm:col-span-3">Stock Qty</div>
                  <div className="col-span-1 sm:col-span-1 text-right">Action</div>
                </div>

                {/* Table Rows (Max Height with Smooth Luxury Scroll) */}
                <div className="divide-y divide-[#F1F5F9] max-h-[170px] overflow-y-auto modal-luxury-scroll">
                  {shades.map((shade, index) => {
                    const stockNum = Number(shade.stock) || 0;
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-[#FAF5F8]/50 transition-colors"
                      >
                        {/* 1. Shade Title & Swatch */}
                        <div className="col-span-5 sm:col-span-5 flex items-center gap-2 min-w-0">
                          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#76416F] to-[#DFBEDB] shrink-0 shadow-2xs border border-white" />
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded px-1.5 py-1 text-xs font-bold text-[#333333] focus:outline-none transition-all truncate"
                            value={shade.name}
                            placeholder="Shade Name"
                            onChange={(e) => {
                              const val = e.target.value;
                              setShades((prev) =>
                                prev.map((item, i) => (i === index ? { ...item, name: val } : item))
                              );
                            }}
                          />
                        </div>

                        {/* 2. Price Input */}
                        <div className="col-span-3 sm:col-span-3 flex items-center">
                          <span className="text-xs text-[#888888] font-bold mr-1">₹</span>
                          <input
                            type="number"
                            className="w-full bg-transparent border border-transparent hover:border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded px-1.5 py-1 text-xs font-mono font-bold text-[#76416F] focus:outline-none transition-all"
                            value={shade.price}
                            placeholder="80"
                            onChange={(e) => {
                              const val = e.target.value;
                              setShades((prev) =>
                                prev.map((item, i) => (i === index ? { ...item, price: val } : item))
                              );
                            }}
                          />
                        </div>

                        {/* 3. Stock Qty Input + Status indicator */}
                        <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                          <input
                            type="number"
                            className="w-14 bg-transparent border border-transparent hover:border-[#DFBEDB] focus:border-[#A06A98] focus:bg-white rounded px-1.5 py-1 text-xs font-mono font-bold text-[#333333] focus:outline-none transition-all"
                            value={shade.stock}
                            placeholder="25"
                            onChange={(e) => {
                              const val = e.target.value;
                              setShades((prev) =>
                                prev.map((item, i) => (i === index ? { ...item, stock: val } : item))
                              );
                            }}
                          />
                          <span
                            className={`hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              stockNum > 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : stockNum > 0
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {stockNum > 10 ? 'In Stock' : stockNum > 0 ? 'Low' : 'Out'}
                          </span>
                        </div>

                        {/* 4. Delete Action */}
                        <div className="col-span-1 sm:col-span-1 text-right">
                          {shades.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setShades(shades.filter((_, itemIndex) => itemIndex !== index))
                              }
                              className="p-1 text-[#999999] hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Delete variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Custom Shade Inline Footer */}
                <div className="p-2 bg-[#FAF5F8] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = shades.length + 1;
                      setShades((prev) => [
                        ...prev,
                        { name: `Shade 0${nextNum}`, price: '80', stock: '25' },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFBEDB] hover:border-[#A06A98] hover:bg-[#FDF2F8] text-[#76416F] font-bold text-xs rounded-[0.3rem] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A06A98]" />
                    <span>Add Custom Shade</span>
                  </button>

                  <span className="text-[10px] text-[#888888] italic">
                    Click any value to edit directly
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 2 Action Buttons (Save Changes & Discard) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0]">
              {/* Button 1: Save Product (Primary Orchid-Plum) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-gradient-to-r from-[#A06A98] to-[#76416F] hover:opacity-95 text-white text-xs font-bold rounded-[0.3rem] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
              </button>

              {/* Button 2: Discard */}
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 bg-white border border-[#E2E8F0] hover:border-rose-300 text-[#666666] hover:text-rose-600 text-xs font-bold rounded-[0.3rem] transition-colors cursor-pointer flex items-center justify-center"
              >
                Discard
              </button>
            </div>

          </div>
        </div>

        {error && <div className="mt-3"><Notice variant="error">{error}</Notice></div>}
      </form>
    </Modal>
  );
};
