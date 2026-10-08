import React, { useEffect, useState } from 'react';
import { Layers, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  inputClass,
  Notice,
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from '../ui';

interface CategoryRow {
  databaseId: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export const CategoriesModule: React.FC = () => {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    api<CategoryRow[]>('/admin/categories')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load collections.')
      );
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    try {
      await api('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, slug, description }),
      });
      setName('');
      setDescription('');
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to create collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Collections & Categories"
        subtitle="Organize luxury beauty formulas into brows, lips, eyes, and seasonal curations."
      />

      {error && <Notice variant="error">{error}</Notice>}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Category Creation Panel */}
        <div className="lg:col-span-4">
          <Panel
            title="Create Category"
            subtitle="Add a new catalog collection taxonomy"
          >
            <form className="space-y-4" onSubmit={(event) => void save(event)}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Category Title *
                </label>
                <input
                  className={inputClass}
                  required
                  placeholder="e.g. Eyeshadow Palettes"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                {previewSlug && (
                  <p className="text-[11px] text-[#888888] font-mono mt-1">
                    Slug: <span className="text-[#A06A98]">/en/collection/{previewSlug}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Description
                </label>
                <textarea
                  className={`${inputClass} min-h-24 py-2 text-xs leading-relaxed`}
                  placeholder="Artisanal formulations designed for couture beauty..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <PrimaryButton
                type="submit"
                icon={Plus}
                disabled={isSubmitting || !name.trim()}
                className="w-full mt-2"
              >
                {isSubmitting ? 'Adding Collection…' : 'Add Category'}
              </PrimaryButton>
            </form>
          </Panel>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-8">
          <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
            <header className="px-6 py-4 border-b border-[#E2E8F0] bg-[#FDF2F8]/40 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#A06A98]" />
                  Active Collections
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  {rows.length} taxonomy records listed in storefront
                </p>
              </div>
            </header>

            <DataTable
              columns={['Category Name', 'Routing Slug', 'Description', 'Status']}
              rows={rows.map((row) => [
                <div key="name" className="font-bold text-xs text-[#333333]">
                  {row.name}
                </div>,
                <span
                  key="slug"
                  className="font-mono text-xs text-[#76416F] bg-[#FDF2F8] px-2 py-0.5 rounded-[0.3rem] border border-[#DFBEDB]/50"
                >
                  {row.slug}
                </span>,
                <span key="desc" className="text-xs text-[#666666] line-clamp-1 max-w-xs">
                  {row.description || '—'}
                </span>,
                <StatusBadge key="act" value={row.active !== false ? 'active' : 'draft'} />,
              ])}
              emptyMessage="No categories created yet. Use the form on the left to add your first collection."
            />
          </section>
        </div>
      </div>
    </div>
  );
};
