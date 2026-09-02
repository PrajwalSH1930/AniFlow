import React from 'react';
import { useWatchlist, WATCHLIST_STATUSES } from '../context/WatchlistContext';
import { 
  Clock, 
  Tv, 
  CheckCircle2, 
  PlayCircle, 
  Bookmark, 
  XCircle, 
  Star,
  Film,
  PieChart
} from 'lucide-react';

export default function WatchlistStats() {
  const { stats, watchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500">
        <PieChart className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">Save anime and mark episodes watched to view your statistics.</p>
      </div>
    );
  }

  const {
    totalEntries,
    statusCounts,
    formatCounts,
    totalWatchedEpisodesCount,
    totalDays,
    totalHours,
    remainingMinutes,
    meanScore,
  } = stats;

  const statusColors = {
    [WATCHLIST_STATUSES.COMPLETED]: { color: 'bg-emerald-500', text: 'text-emerald-400', icon: CheckCircle2 },
    [WATCHLIST_STATUSES.WATCHING]: { color: 'bg-brand-primary', text: 'text-brand-primary', icon: PlayCircle },
    [WATCHLIST_STATUSES.PLAN_TO_WATCH]: { color: 'bg-amber-500', text: 'text-amber-400', icon: Bookmark },
    [WATCHLIST_STATUSES.DROPPED]: { color: 'bg-rose-500', text: 'text-rose-400', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      
      {/* Top 4 Quick Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Time Watched */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-4 h-4 text-brand-primary" />
            <span>Time Watched</span>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-white">{totalDays}</span>
            <span className="text-xs text-slate-400 font-semibold">Days</span>
          </div>
          <p className="text-[11px] text-slate-500">
            ~{totalHours} hrs {remainingMinutes} mins total
          </p>
        </div>

        {/* Metric 2: Total Episodes */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Episodes Watched</span>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-white">{totalWatchedEpisodesCount}</span>
            <span className="text-xs text-slate-400 font-semibold">Eps</span>
          </div>
          <p className="text-[11px] text-slate-500">Across {totalEntries} saved titles</p>
        </div>

        {/* Metric 3: Library Mean Rating */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Mean Score</span>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-white">{meanScore}</span>
            <span className="text-xs text-slate-400 font-semibold">%</span>
          </div>
          <p className="text-[11px] text-slate-500">Average community score</p>
        </div>

        {/* Metric 4: Completed Series */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Titles</span>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-white">
              {statusCounts[WATCHLIST_STATUSES.COMPLETED]}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {totalEntries}</span>
          </div>
          <p className="text-[11px] text-slate-500">Finished catalogue series</p>
        </div>

      </div>

      {/* Status Progress Distribution Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Watch Status Breakdown
        </h4>

        {/* Segmented Multi-color Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          {Object.entries(statusCounts).map(([status, count]) => {
            if (count === 0) return null;
            const percentage = (count / totalEntries) * 100;
            const barColor = statusColors[status]?.color || 'bg-slate-700';

            return (
              <div
                key={status}
                style={{ width: `${percentage}%` }}
                className={`${barColor} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                title={`${status}: ${count} (${percentage.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const config = statusColors[status];
            const Icon = config.icon;
            const pct = totalEntries > 0 ? ((count / totalEntries) * 100).toFixed(0) : 0;

            return (
              <div key={status} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <Icon className={`w-4 h-4 ${config.text} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 truncate">{status}</div>
                  <div className="text-xs font-bold text-slate-200">
                    {count} <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Format Breakdown (TV, Movie, OVA) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-brand-primary" /> Format Distribution
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(formatCounts).map(([format, count]) => (
            <div key={format} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs font-medium text-slate-300 uppercase">{format}</span>
              <span className="text-xs font-bold text-brand-primary">{count} titles</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}