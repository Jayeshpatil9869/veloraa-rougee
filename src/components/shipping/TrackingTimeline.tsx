import React from 'react';
import { Package, Truck, MapPin, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

export interface TrackingEventView {
  at: string;
  label: string;
  location?: string | null;
  code?: string | null;
}

export interface TrackingView {
  status: string;
  courierName?: string | null;
  awb?: string | null;
  etdAt?: string | null;
  trackingUrl?: string | null;
  lastSyncedAt?: string | null;
  events: TrackingEventView[];
}

function statusIcon(status: string) {
  const key = status.toLowerCase();
  if (key.includes('deliver')) return CheckCircle2;
  if (key.includes('exception') || key.includes('delay') || key.includes('rto')) return AlertTriangle;
  if (key.includes('transit') || key.includes('out_for')) return Truck;
  if (key.includes('pickup') || key.includes('created') || key.includes('awb')) return Package;
  return Clock3;
}

function prettyStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export const TrackingTimeline: React.FC<{
  tracking: TrackingView | null | undefined;
  emptyMessage?: string;
  compact?: boolean;
}> = ({ tracking, emptyMessage = 'Not yet shipped. Tracking will appear once a courier is assigned.', compact = false }) => {
  if (!tracking) {
    return (
      <div className="rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4 text-xs text-[var(--text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  const Icon = statusIcon(tracking.status);

  return (
    <div className={`rounded-[0.3rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] ${compact ? 'p-4' : 'p-5'} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Icon className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
            <p className="text-sm font-bold uppercase tracking-wider">{prettyStatus(tracking.status)}</p>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {tracking.courierName || 'Courier pending'}
            {tracking.awb ? ` · AWB ${tracking.awb}` : ''}
          </p>
          {tracking.etdAt && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              ETA {new Date(tracking.etdAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        {tracking.trackingUrl && (
          <a
            href={tracking.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] hover:underline shrink-0"
          >
            Carrier link
          </a>
        )}
      </div>

      {tracking.events.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">No scan events yet.</p>
      ) : (
        <ol className="space-y-3 border-l border-[var(--border-subtle)] pl-4">
          {[...tracking.events].reverse().map((event, index) => (
            <li key={`${event.at}-${event.label}-${index}`} className="relative">
              <span className="absolute -left-[1.35rem] top-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">{event.label}</p>
              <p className="text-[11px] text-[var(--text-muted)] flex flex-wrap gap-x-2">
                <span>{new Date(event.at).toLocaleString('en-IN')}</span>
                {event.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ol>
      )}

      {tracking.lastSyncedAt && (
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          Last update {new Date(tracking.lastSyncedAt).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
};
