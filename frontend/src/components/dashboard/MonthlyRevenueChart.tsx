import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api/api';
import { MonthlyRevenue } from '../../types/Analytics';

export default function MonthlyRevenueChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);

  useEffect(() => {
    analyticsApi.getMonthlyRevenue().then(setData).catch(console.error);
  }, []);

  const chartData = data.map(d => ({
    ...d,
    month: d.yearMonth.substring(5),
    label: new Date(d.yearMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Monthly Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e1e2a', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-6">
        {chartData.slice(-3).map(d => (
          <div key={d.yearMonth} className="text-center">
            <p className="text-xs text-gray-400">{d.label}</p>
            <p className="text-sm font-medium text-gray-200">{d.tripCount} trips</p>
          </div>
        ))}
      </div>
    </div>
  );
}
