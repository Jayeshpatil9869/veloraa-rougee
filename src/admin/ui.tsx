import React from 'react';

export const inputClass = 'h-11 w-full px-3 bg-[#FAF5F8] border border-[#E2E8F0] rounded-[0.3rem] text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#A06A98] focus:bg-white transition-all duration-200';

export function rupees(paise: number) {
  return `₹${(Number(paise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const label = value || 'unknown';
  const tone = ['paid', 'published', 'delivered', 'approved', 'resolved', 'active', 'confirmed'].includes(label)
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : ['pending', 'open', 'in_progress', 'processing', 'packed', 'shipped'].includes(label)
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : ['cancelled', 'refunded', 'rejected', 'failed', 'hidden'].includes(label)
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';
  return <span className={`inline-flex border text-xs font-semibold px-2.5 py-0.5 rounded-[0.3rem] capitalize ${tone}`}>{label.replaceAll('_', ' ')}</span>;
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`bg-[#A06A98] text-[#F8FAFC] hover:bg-[#774170] active:scale-[0.98] rounded-[0.3rem] px-4 py-2.5 font-medium text-sm transition-all duration-200 shadow-sm disabled:opacity-60 ${props.className ?? ''}`}>{children}</button>;
}

export function SoftButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`bg-[#FDF2F8] text-[#76416F] hover:bg-[#FCE7F3] border border-[#DFBEDB]/40 rounded-[0.3rem] px-4 py-2.5 font-medium text-sm transition-all duration-200 ${props.className ?? ''}`}>{children}</button>;
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`text-[#666666] hover:text-[#A06A98] hover:bg-[#FDF2F8] px-2.5 py-1.5 rounded-[0.3rem] text-sm font-medium transition-colors duration-200 ${props.className ?? ''}`}>{children}</button>;
}

export function DangerButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-[0.3rem] px-3 py-1.5 font-medium text-sm transition-all duration-200 ${props.className ?? ''}`}>{children}</button>;
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="bg-white border border-[#E2E8F0] rounded-[0.3rem] p-6 relative overflow-hidden shadow-xs hover:border-[#DFBEDB] transition-all duration-200">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[#A06A98]" />
      <p className="text-xs font-semibold uppercase tracking-wider text-[#666666]">{label}</p>
      <h3 className="text-3xl font-bold text-[#333333] mt-2">{value}</h3>
    </article>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#E2E8F0] rounded-[0.3rem] shadow-xs overflow-hidden">
      <header className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#333333]">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#666666] bg-white border border-[#E2E8F0] rounded-[0.3rem] p-6">No records yet.</p>;
  }
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[0.3rem] overflow-auto shadow-xs">
      <table className="w-full text-sm text-[#333333]">
        <thead className="bg-[#FDF2F8]/80 text-[#76416F] text-xs uppercase tracking-wider font-bold">
          <tr>{columns.map((column) => <th key={column} className="py-3.5 px-4 text-left">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-[#F1F5F9] hover:bg-[#FAF5F8]/50 transition-colors">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="py-3.5 px-4 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white border border-[#DFBEDB]/30 rounded-[0.3rem] shadow-xl" onClick={(event) => event.stopPropagation()}>
        <header className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#333333]">{title}</h2>
          <GhostButton type="button" onClick={onClose}>Close</GhostButton>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#EF4444]">{children}</p>;
}
