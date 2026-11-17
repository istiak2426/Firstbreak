import type { OutletStat } from '../types/news';
import type { Translations } from '../utils/i18n';

interface LeaderboardViewProps {
  stats: OutletStat[];
  t: Translations;
}

export function LeaderboardView({ stats, t }: LeaderboardViewProps) {
  const maxFirstBreaks = Math.max(1, ...stats.map((s) => s.first_to_break));

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          {t.leaderboardTitle}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {t.leaderboardSubtitle}
        </p>
      </div>

      {stats.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Refresh news to compare reporting speed across outlets.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{t.colOutlet}</th>
                <th className="py-3 px-4 text-right">{t.colArticles}</th>
                <th className="py-3 px-4 text-right">{t.colShared}</th>
                <th className="py-3 px-4 text-right">{t.colFirstBreaks}</th>
                <th className="py-3 px-4 text-right">{t.colAvgDelay}</th>
                <th className="py-3 px-4 text-right">{t.colBestLead}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats.map((row) => {
                const barWidth = Math.round((row.first_to_break / maxFirstBreaks) * 100);
                return (
                  <tr
                    key={row.source}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{row.source}</div>
                      <div className="mt-1.5 h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${row.first_to_break > 0 ? Math.max(12, barWidth) : 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.total_articles}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.shared_stories}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {row.first_to_break}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.shared_stories > 0 ? `${row.avg_delay_minutes}m` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {row.fastest_lead_margin > 0 ? `${row.fastest_lead_margin}m` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
