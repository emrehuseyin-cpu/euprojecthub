'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUpcomingDeadlines } from '@euprojecthub/core/src/erasmus/actions';

export default function ErasmusDeadlineWidget() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getUpcomingDeadlines(supabase)
      .then(setDeadlines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white border rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-4" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}
      </div>
    </div>
  );

  const urgent = deadlines.filter(d => d.days_until <= 30);
  const soon   = deadlines.filter(d => d.days_until > 30 && d.days_until <= 90);
  const later  = deadlines.filter(d => d.days_until > 90);

  const DeadlineRow = ({ d, variant }: { d: any; variant: 'red' | 'amber' | 'green' }) => {
    const colors = {
      red:   { row: 'bg-red-50 border-red-200',   code: 'text-red-700 bg-red-100',   date: 'text-red-700', days: 'text-red-500' },
      amber: { row: 'bg-amber-50 border-amber-200', code: 'text-amber-700 bg-amber-100', date: 'text-amber-700', days: 'text-amber-500' },
      green: { row: 'bg-gray-50 border-gray-200',  code: 'text-gray-700 bg-gray-100', date: 'text-gray-700', days: 'text-gray-400' },
    }[variant];
    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${colors.row}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono shrink-0 ${colors.code}`}>{d.code}</span>
          <span className="text-sm text-gray-800 truncate">{d.name_en}</span>
          {d.managing_body === 'EACEA' && (
            <span className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded shrink-0">EACEA</span>
          )}
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className={`text-sm font-bold ${colors.date}`}>{d.deadline}</div>
          <div className={`text-xs ${colors.days}`}>{d.days_until}d left</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900">Erasmus+ 2026 Deadlines</h2>
          <p className="text-xs text-gray-500 mt-0.5">{deadlines.length} upcoming deadlines</p>
        </div>
        <a href="/erasmus" className="text-xs text-blue-600 hover:underline">View all actions →</a>
      </div>

      {urgent.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">🔴 Urgent — next 30 days</p>
          <div className="space-y-2">
            {urgent.map((d, i) => <DeadlineRow key={i} d={d} variant="red" />)}
          </div>
        </div>
      )}

      {soon.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">🟡 Coming — 30–90 days</p>
          <div className="space-y-2">
            {(showAll ? soon : soon.slice(0, 4)).map((d, i) => <DeadlineRow key={i} d={d} variant="amber" />)}
          </div>
        </div>
      )}

      {(showAll ? later : later.slice(0, 3)).length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🟢 Later — 90+ days</p>
          <div className="space-y-2">
            {(showAll ? later : later.slice(0, 3)).map((d, i) => <DeadlineRow key={i} d={d} variant="green" />)}
          </div>
        </div>
      )}

      {!showAll && deadlines.length > 7 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 text-center py-2 border border-dashed rounded-lg hover:border-gray-400 transition-colors"
        >
          Show all {deadlines.length} deadlines
        </button>
      )}
    </div>
  );
}