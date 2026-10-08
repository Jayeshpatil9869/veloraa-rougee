import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DataTable, inputClass, Notice, Panel, PrimaryButton } from '../ui';

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

  const load = () => {
    api<CategoryRow[]>('/admin/categories').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  };

  useEffect(() => { load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      await api('/admin/categories', { method: 'POST', body: JSON.stringify({ name, slug, description }) });
      setName('');
      setDescription('');
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'save_failed');
    }
  };

  return (
    <div className="grid gap-6">
      <Panel title="Add a category">
        <form className="grid gap-3 max-w-xl" onSubmit={(event) => void save(event)}>
          <input className={inputClass} required placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} />
          <textarea className={`${inputClass} min-h-24 py-2`} placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          {error && <Notice>{error}</Notice>}
          <PrimaryButton type="submit" className="w-fit">Add category</PrimaryButton>
        </form>
      </Panel>
      <DataTable
        columns={['Name', 'Slug', 'Description']}
        rows={rows.map((row) => [row.name, row.slug, row.description || '—'])}
      />
    </div>
  );
};
