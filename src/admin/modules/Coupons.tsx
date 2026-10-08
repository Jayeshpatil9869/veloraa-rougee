import React, { useEffect, useMemo, useState } from 'react';
import { Tag, Plus, CheckSquare, Square, Percent, DollarSign, Layers } from 'lucide-react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import {
  DataTable,
  inputClass,
  Notice,
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from '../ui';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    api<CouponRow[]>('/admin/coupons')
      .then(setRows)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Failed to load coupons.')
      );
  };

  useEffect(() => {
    load();
    api<{ items: Product[] }>('/admin/products?pageSize=200')
      .then((result) => setProducts(result.items))
      .catch(() => setProducts([]));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const key = product.categoryName || 'General Formulas';
      map.set(key, [...(map.get(key) ?? []), product]);
    }
    return [...map.entries()];
  }, [products]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAll = () => {
    const allIds = products.map((p) => p.databaseId).filter(Boolean) as string[];
    if (selected.length === allIds.length) {
      setSelected([]);
    } else {
      setSelected(allIds);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (selected.length === 0) {
      setError('Please choose at least one applicable product for this promotion.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          productIds: selected,
        }),
      });
      setCode('');
      setSelected([]);
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to create coupon code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Promotions & Coupons"
        subtitle="Create discount campaigns, promotional codes, and formula-specific price rules."
      />

      {error && <Notice variant="error">{error}</Notice>}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create Coupon Panel */}
        <div className="lg:col-span-5">
          <Panel
            title="Create Promo Code"
            subtitle="Configure percentage or fixed discount rules"
          >
            <form className="space-y-4" onSubmit={(event) => void save(event)}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Promo Code *
                </label>
                <input
                  className={`${inputClass} font-mono uppercase tracking-wider font-bold`}
                  required
                  placeholder="e.g. VELORAA20"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                    Discount Mode
                  </label>
                  <select
                    className={inputClass}
                    value={discountType}
                    onChange={(event) =>
                      setDiscountType(event.target.value as 'percent' | 'fixed')
                    }
                  >
                    <option value="percent">Percentage Off (%)</option>
                    <option value="fixed">Fixed Price (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                    Value *
                  </label>
                  <input
                    className={inputClass}
                    required
                    type="number"
                    min="1"
                    placeholder={discountType === 'percent' ? 'e.g. 15%' : 'e.g. 500'}
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                  />
                </div>
              </div>

              {/* Product Selection List */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#76416F] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Applicable Items ({selected.length} chosen)
                  </label>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] font-bold text-[#A06A98] hover:text-[#774170] cursor-pointer"
                  >
                    {selected.length === products.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-3 p-2 bg-[#FAF5F8]/60 rounded-[0.3rem] border border-[#E2E8F0]">
                  {groups.map(([category, items]) => (
                    <div key={category} className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#76416F]">
                        {category}
                      </p>
                      <div className="grid gap-1 pl-1">
                        {items.map((product) => {
                          const isChecked = Boolean(
                            product.databaseId && selected.includes(product.databaseId)
                          );
                          return (
                            <label
                              key={product.databaseId || product.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-[0.3rem] text-xs transition-colors cursor-pointer ${
                                isChecked ? 'bg-[#FDF2F8] text-[#76416F] font-semibold' : 'text-[#333333] hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="accent-[#A06A98] rounded-xs"
                                checked={isChecked}
                                onChange={() =>
                                  product.databaseId && toggle(product.databaseId)
                                }
                              />
                              <span className="truncate">{product.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <PrimaryButton
                type="submit"
                icon={Plus}
                disabled={isSubmitting || !code.trim() || selected.length === 0}
                className="w-full mt-2"
              >
                {isSubmitting ? 'Generating Promotion…' : 'Activate Promo Code'}
              </PrimaryButton>
            </form>
          </Panel>
        </div>

        {/* Right: Active Promotions Table */}
        <div className="lg:col-span-7">
          <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
            <header className="px-6 py-4 border-b border-[#E2E8F0] bg-[#FDF2F8]/40 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#A06A98]" />
                  Active Campaigns
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  {rows.length} discount rules applied on checkout
                </p>
              </div>
            </header>

            <DataTable
              columns={['Coupon Code', 'Discount Offer', 'Eligible Items', 'Campaign Status']}
              rows={rows.map((row) => [
                <span
                  key="code"
                  className="font-mono font-bold text-xs text-[#76416F] bg-[#FDF2F8] px-2.5 py-1 rounded-[0.3rem] border border-[#DFBEDB]/60 inline-block"
                >
                  {row.code}
                </span>,
                <span key="disc" className="font-bold text-xs text-[#333333]">
                  {row.discount_type === 'percent'
                    ? `${row.discount_value}% OFF`
                    : `₹${(row.discount_value / 100).toFixed(2)} OFF`}
                </span>,
                <span key="prods" className="text-xs text-[#666666]">
                  {row.applicable_product_ids?.length ?? 0} products
                </span>,
                <StatusBadge key="stat" value={row.active ? 'active' : 'draft'} />,
              ])}
              emptyMessage="No active coupon campaigns. Use the builder on the left to launch your first promotion."
            />
          </section>
        </div>
      </div>
    </div>
  );
};
