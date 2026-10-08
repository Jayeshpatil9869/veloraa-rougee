import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { DataTable, inputClass, Notice, Panel, PrimaryButton, StatusBadge } from '../ui';

interface CouponRow {
  code: string;
  discount_type: string;
  discount_value: number;
  active: boolean;
  applicable_product_ids: string[];
}

export const CouponsModule: React.FC = () => {
  const [rows, setRows] = useState<CouponRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const load = () => {
    api<CouponRow[]>('/admin/coupons').then(setRows).catch((reason) => setError(reason instanceof Error ? reason.message : 'load_failed'));
  };

  useEffect(() => {
    load();
    api<{ items: Product[] }>('/admin/products?pageSize=200').then((result) => setProducts(result.items)).catch(() => setProducts([]));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const key = product.categoryName || 'Other';
      map.set(key, [...(map.get(key) ?? []), product]);
    }
    return [...map.entries()];
  }, [products]);

  const toggle = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (selected.length === 0) {
      setError('Choose at least one product.');
      return;
    }
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          productIds: selected,
        }),
      });
      setCode('');
      setSelected([]);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'save_failed');
    }
  };

  return (
    <div className="grid gap-6">
      <Panel title="Add a coupon">
        <form className="grid gap-4" onSubmit={(event) => void save(event)}>
          <div className="grid md:grid-cols-3 gap-3">
            <input className={inputClass} required placeholder="Coupon code" value={code} onChange={(event) => setCode(event.target.value)} />
            <select className={inputClass} value={discountType} onChange={(event) => setDiscountType(event.target.value as 'percent' | 'fixed')}>
              <option value="percent">Percent off</option>
              <option value="fixed">Rupees off</option>
            </select>
            <input className={inputClass} required type="number" min="1" placeholder={discountType === 'percent' ? 'Percent' : 'Rupees'} value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} />
          </div>
          <div className="grid gap-4">
            {groups.map(([category, items]) => (
              <fieldset key={category} className="border border-[#E2E8F0] rounded-[0.3rem] p-3">
                <legend className="px-2 text-xs font-bold uppercase tracking-wider text-[#76416F]">{category}</legend>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((product) => (
                    <label key={product.databaseId || product.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-[#A06A98]"
                        checked={Boolean(product.databaseId && selected.includes(product.databaseId))}
                        onChange={() => product.databaseId && toggle(product.databaseId)}
                      />
                      {product.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          {error && <Notice>{error}</Notice>}
          <PrimaryButton type="submit" className="w-fit">Save coupon</PrimaryButton>
        </form>
      </Panel>
      <DataTable
        columns={['Code', 'Discount', 'Products', 'Status']}
        rows={rows.map((row) => [
          row.code,
          row.discount_type === 'percent' ? `${row.discount_value}%` : `₹${(row.discount_value / 100).toFixed(2)}`,
          String(row.applicable_product_ids?.length ?? 0),
          <StatusBadge key={row.code} value={row.active ? 'active' : 'draft'} />,
        ])}
      />
    </div>
  );
};
