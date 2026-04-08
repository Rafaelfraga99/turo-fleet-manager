import React, { useMemo } from 'react';
import { Trip, VehicleExpense, Vehicle, EXPENSE_LABELS, ExpenseCategory } from '../../types/Vehicle';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  vehicle: Vehicle;
  trips: Trip[];
  expenses: VehicleExpense[];
  startDate: Date | null;
  endDate: Date | null;
}

export default function ProfitabilityCard({ vehicle, trips, expenses, startDate, endDate }: Props) {
  const data = useMemo(() => {
    // Filter expenses by date range
    const filteredExpenses = expenses.filter(e => {
      if (!e.expenseDate) return true;
      const d = new Date(e.expenseDate);
      if (startDate && d < startDate) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (d > end) return false;
      }
      return true;
    });

    // Earnings from filtered trips
    const totalEarnings = trips.reduce((s, t) => s + (t.totalEarnings || 0), 0);

    // Expenses from filtered expenses
    const totalExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    // Fixed monthly costs
    const monthlyFixed =
      (vehicle.monthlyPayment || 0) +
      (vehicle.monthlyInsurance || 0) +
      (vehicle.monthlyParking || 0) +
      ((vehicle.yearlyRegistration || 0) / 12);

    // Calculate months in the selected period
    let months = 0;
    if (startDate && endDate) {
      const diffMs = endDate.getTime() - startDate.getTime();
      months = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)));
    } else if (trips.length > 0) {
      // Use first trip to now
      const dates = trips.map(t => new Date(t.tripStart)).filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        months = Math.max(1, Math.round((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      }
    }
    if (months === 0) months = 1;

    const totalFixedCosts = monthlyFixed * months;
    const netProfit = totalEarnings - totalExpenses - totalFixedCosts;
    const profitMargin = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;

    // By category
    const byCategory: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
    });

    return {
      totalEarnings, totalExpenses, monthlyFixed, months, totalFixedCosts,
      netProfit, profitMargin, byCategory,
      periodLabel: startDate && endDate
        ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'All Time',
    };
  }, [vehicle, trips, expenses, startDate, endDate]);

  const isProfit = data.netProfit >= 0;
  const categories = Object.entries(data.byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-100">Profitability</h3>
        <span className="text-[10px] text-gray-500 bg-bg-elevated px-2 py-0.5 rounded">{data.periodLabel}</span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Earnings</span>
          <span className="text-sm font-medium tabular-nums text-emerald-400">+{formatCurrency(data.totalEarnings)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Expenses</span>
          <span className="text-sm font-medium tabular-nums text-red-400">-{formatCurrency(data.totalExpenses)}</span>
        </div>
        {data.monthlyFixed > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Fixed Costs/mo</span>
              <span className="text-xs font-medium tabular-nums text-gray-500">{formatCurrency(data.monthlyFixed)}/mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Fixed Costs ({data.months} mo)</span>
              <span className="text-sm font-medium tabular-nums text-amber-400">-{formatCurrency(data.totalFixedCosts)}</span>
            </div>
          </>
        )}
        <div className="border-t border-border-subtle pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-200">Net Profit</span>
          <span className={`text-xl font-bold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{formatCurrency(data.netProfit)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Profit Margin</span>
          <span className={`text-sm font-medium tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {data.profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Expenses by Category</p>
          <div className="space-y-2">
            {categories.map(([cat, amount]) => (
              <div key={cat} className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{EXPENSE_LABELS[cat as ExpenseCategory] || cat}</span>
                <span className="text-xs font-medium tabular-nums text-gray-300">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
