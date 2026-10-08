import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { DangerButton, DataTable, GhostButton, inputClass, Modal, Notice, PrimaryButton, StatusBadge } from '../ui';

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    api<{ items: Product[] }>('/admin/products').then((result) => setProducts(result.items)).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  };

  useEffect(() => {
    load();
    api<CategoryOption[]>('/admin/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  const remove = async (product: Product) => {
    if (!product.databaseId || !window.confirm(`Delete ${product.name}?`)) return;
    try {
      await api(`/admin/products/${product.databaseId}`, { method: 'DELETE' });
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'delete_failed');
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <PrimaryButton type="button" onClick={() => { setEditing(null); setOpen(true); }}>Add product</PrimaryButton>
      </div>
      {error && <Notice>{error}</Notice>}
      <DataTable
        columns={['Product', 'Category', 'Price', 'Status', 'Actions']}
        rows={products.map((product) => [
          product.name,
          product.categoryName,
          product.variants[0] ? `₹${product.variants[0].price}` : '—',
          <StatusBadge key="status" value={product.status} />,
          <span key="actions" className="flex gap-2 justify-end">
            <GhostButton type="button" onClick={() => { setEditing(product); setOpen(true); }}>Edit</GhostButton>
            <DangerButton type="button" onClick={() => void remove(product)}>Delete</DangerButton>
          </span>,
        ])}
      />
      {open && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); load(); }}
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
  const matchedCategory = categories.find((category) => category.slug === product?.categoryId || category.id === product?.categoryId);
  const [categorySlug, setCategorySlug] = useState(matchedCategory?.slug ?? categories[0]?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageUrl, setImageUrl] = useState(product?.images[0]?.src ?? '');
  const [status, setStatus] = useState(product?.status ?? 'published');
  const [shades, setShades] = useState<Shade[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({ databaseId: variant.databaseId, name: variant.name, price: String(variant.price), stock: String(variant.stock ?? 0) }))
      : [emptyShade()],
  );
  const [error, setError] = useState('');

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const body = {
      name,
      slug: product?.slug || slug,
      categorySlug,
      description,
      shortDescription: description,
      status,
      images: imageUrl ? [{ url: imageUrl, alt: name }] : [],
      variants: shades.map((shade, index) => ({
        id: shade.databaseId,
        name: shade.name,
        price: Number(shade.price),
        stock: Number(shade.stock),
        isDefault: index === 0,
        images: [],
      })),
    };
    try {
      if (product?.databaseId) await api(`/admin/products/${product.databaseId}`, { method: 'PUT', body: JSON.stringify(body) });
      else await api('/admin/products', { method: 'POST', body: JSON.stringify(body) });
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'save_failed');
    }
  };

  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form className="grid gap-3" onSubmit={(event) => void save(event)}>
        <input className={inputClass} required placeholder="Product name" value={name} onChange={(event) => setName(event.target.value)} />
        <select className={inputClass} required value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
          <option value="">Category</option>
          {categories.map((category) => <option key={category.databaseId || category.slug} value={category.slug}>{category.name}</option>)}
        </select>
        <textarea className={`${inputClass} min-h-24 py-2`} placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <input className={inputClass} placeholder="Image URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
        <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        {shades.map((shade, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <input className={inputClass} required placeholder="Shade" value={shade.name} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} />
            <input className={inputClass} required placeholder="Price ₹" value={shade.price} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} />
            <input className={inputClass} required placeholder="Stock" value={shade.stock} onChange={(event) => setShades(shades.map((item, itemIndex) => itemIndex === index ? { ...item, stock: event.target.value } : item))} />
          </div>
        ))}
        <GhostButton type="button" onClick={() => setShades([...shades, emptyShade()])}>Add shade</GhostButton>
        {error && <Notice>{error}</Notice>}
        <PrimaryButton type="submit">Save product</PrimaryButton>
      </form>
    </Modal>
  );
};
