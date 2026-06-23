import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { dashboardApi } from '../services/api';
import { useToast } from '../components/Toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#7288AE'];

export default function DashboardPage() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineView, setTimelineView] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const { data } = await dashboardApi.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Could not load dashboard metrics. Check if backend is running.');
        toast.error('Load Failed', 'Could not retrieve application statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [toast]);

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Calculate top positions with "Other" grouping if > 4 positions
  const getPositionPieData = () => {
    if (!stats || !stats.positionBreakdown || Object.keys(stats.positionBreakdown).length === 0) return [];
    
    const entries = Object.entries(stats.positionBreakdown)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const total = entries.reduce((sum, e) => sum + e.count, 0);
    
    if (entries.length <= 4) {
      return entries.map(e => ({
        ...e,
        percentage: total > 0 ? Math.round((e.count / total) * 100) : 0
      }));
    }

    const top4 = entries.slice(0, 4);
    const otherCount = entries.slice(4).reduce((sum, e) => sum + e.count, 0);
    
    const result = top4.map(e => ({
      ...e,
      percentage: total > 0 ? Math.round((e.count / total) * 100) : 0
    }));
    
    result.push({
      name: 'Other',
      count: otherCount,
      percentage: total > 0 ? Math.round((otherCount / total) * 100) : 0
    });
    
    return result;
  };

  const funnelData = stats ? [
    { label: 'Applied', count: stats.statusBreakdown?.APPLIED || 0, color: '#3b82f6' },
    { label: 'Shortlisted', count: stats.statusBreakdown?.UNDER_REVIEW || 0, color: '#8b5cf6' },
    { label: 'Interview', count: (stats.statusBreakdown?.INTERVIEW_SCHEDULED || 0) + (stats.statusBreakdown?.INTERVIEWED || 0), color: '#f59e0b' },
    { label: 'Offer', count: stats.statusBreakdown?.OFFER || 0, color: '#10b981' },
    { label: 'Rejected', count: stats.statusBreakdown?.REJECTED || 0, color: '#6b7280' }
  ] : [];

  const pieData = getPositionPieData();

  return (
    <div className="db-container">
      <Sidebar activeTab="dashboard" />
      <main className="db-main">
        <header className="db-header border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-xs text-[var(--steel)] uppercase tracking-wider font-semibold">Overview</span>
            <h1 className="db-header-title text-2xl font-bold text-[var(--navy)] mt-1">Analytics Dashboard</h1>
          </div>
          <div className="db-header-meta">
            <span className="db-date-display text-[var(--steel)] text-sm">{currentDate}</span>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[var(--steel)] text-sm animate-pulse">Loading diagnostic search pipeline stats...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md text-center">
              <h3 className="font-semibold text-lg mb-1">Connection Error</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--brand)] hover:opacity-90 active:scale-95 text-white font-medium text-sm rounded-lg transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 fade-up">
            {/* Top Stats Section: Funnel + Timeline Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Key Rates */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[300px]">
                <div>
                  <span className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider block mb-1">TOTAL SENT</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[var(--navy)]">{stats.totalApplications}</span>
                    <span className="text-[var(--steel)] text-sm font-medium">applications</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-4" />

                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider block">Interview rate</span>
                    <span className="text-2xl font-bold text-blue-600 mt-1 block">
                      {stats.interviewConversionRate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-100" />

                  <div>
                    <span className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider block">Offer rate</span>
                    <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                      {stats.offerRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Column: Horizontal Funnel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider mb-4">CONVERSION FUNNEL</h3>
                  <div className="flex flex-col gap-4">
                    {funnelData.map((item) => {
                      const pct = stats.totalApplications > 0 ? (item.count / stats.totalApplications) * 100 : 0;
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="w-20 text-xs font-semibold text-[var(--navy)] uppercase tracking-wider">{item.label}</span>
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <div className="flex-1 bg-slate-100 h-5 rounded-full overflow-hidden relative border border-slate-200/60">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${pct}%`, backgroundColor: item.color, opacity: 0.85 }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-bold text-[var(--navy)]">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Submission Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider">SUBMISSIONS</h3>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
                      <button
                        onClick={() => setTimelineView('week')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          timelineView === 'week' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-[var(--steel)] hover:text-[var(--navy)]'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setTimelineView('month')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          timelineView === 'month' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-[var(--steel)] hover:text-[var(--navy)]'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setTimelineView('year')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          timelineView === 'year' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-[var(--steel)] hover:text-[var(--navy)]'
                        }`}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                  {(() => {
                    const getTimelineData = () => {
                      if (!stats) return { data: [], dataKey: 'week' };
                      switch (timelineView) {
                        case 'month': return { data: stats.monthlySubmissions || [], dataKey: 'month' };
                        case 'year': return { data: stats.yearlySubmissions || [], dataKey: 'year' };
                        case 'week':
                        default: return { data: stats.weeklySubmissions || [], dataKey: 'week' };
                      }
                    };
                    const { data, dataKey } = getTimelineData();
                    
                    return data.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey={dataKey} stroke="var(--steel)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--steel)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#3b82f6', borderRadius: 8, color: 'var(--navy)' }} 
                            labelStyle={{ color: 'var(--steel)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-[var(--steel)] text-xs italic">
                        No submission timeline data available
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* Bottom Section: Top Companies + Positions Applied */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Bottom Left: Top Companies */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[280px]">
                <h3 className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider mb-4">TOP COMPANIES</h3>
                {stats.topCompanies && stats.topCompanies.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart 
                      data={stats.topCompanies} 
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="var(--steel)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis 
                        dataKey="companyName" 
                        type="category" 
                        stroke="var(--navy)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        width={90}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#8b5cf6', borderRadius: 8, color: 'var(--navy)' }} 
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                        {stats.topCompanies.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-[var(--steel)] text-xs italic">
                    No top companies tracked yet
                  </div>
                )}
              </div>

              {/* Bottom Right: Positions Applied */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[280px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs text-[var(--steel)] font-bold uppercase tracking-wider mb-2">POSITIONS APPLIED</h3>
                  {pieData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-[140px] h-[140px] flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="count"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Custom Legend */}
                      <div className="flex-1 flex flex-col gap-2">
                        {pieData.map((item, index) => (
                          <div key={item.name} className="flex items-center gap-2 text-xs font-semibold text-[var(--steel)]">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span>{item.name} <span className="text-[var(--navy)] ml-1">{item.percentage}%</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[140px] flex items-center justify-center text-[var(--steel)] text-xs italic">
                      No job positions tracked yet
                    </div>
                  )}
                </div>

                {/* Distinct value section */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-[var(--steel)] uppercase tracking-wider font-semibold block mb-2">
                    Distinct Job Titles Applied ({stats.distinctPositions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                    {stats.distinctPositions?.map(pos => (
                      <span key={pos} className="px-2 py-0.5 rounded bg-slate-100 text-[var(--navy)] text-[11px] font-medium border border-slate-200/60">
                        {pos}
                      </span>
                    ))}
                    {(!stats.distinctPositions || stats.distinctPositions.length === 0) && (
                      <span className="text-[11px] text-[var(--steel)] italic">No job titles available</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
