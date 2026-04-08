import React from 'react';
import { Trash2 } from 'lucide-react';
import { VehicleExpense, EXPENSE_LABELS, ExpenseCategory } from '../../types/Vehicle';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { expenseApi } from '../../api/api';

interface Props {
  vehicleId: number;
  expenses: VehicleExpense[];
  onRefresh: () => void;
}

const catColors: Partial<Record<ExpenseCategory, string>> = {
  OIL_CHANGE: 'bg-amber-400/10 text-amber-400',
  TIRES: 'bg-gray-400/10 text-gray-400',
  BRAKES: 'bg-red-400/10 text-red-400',
  MAINTENANCE: 'bg-cyan-400/10 text-cyan-400',
  REPAIR: 'bg-red-400/10 text-red-400',
  CAR_WASH: 'bg-indigo-400/10 text-indigo-400',
  INSURANCE: 'bg-emerald-400/10 text-emerald-400',
  GAS_FUEL: 'bg-amber-400/10 text-amber-400',
};
const defaultColor = 'bg-gray-400/10 text-gray-400';

export default function ExpenseHistoryTable({ vehicleId, expenses, onRefresh }: Props) {
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense?')) return;
    await expenseApi.delete(vehicleId, id);
    onRefresh();
  };

  return (
    <div className="bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
      <div className="p-6 border-b border-border-subtle/50">
        <h3 className="text-lg font-medium text-gray-100">Expense History ({expenses.length})</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Category</th>
            <th className="text-left py-3 px-4">Description</th>
            <th className="text-left py-3 px-4">Vendor</th>
            <th className="text-right py-3 px-4">Amount</th>
            <th className="text-right py-3 px-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {expenses.length === 0 ? (
            <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No expenses recorded yet</td></tr>
          ) : (
            expenses.map((e) => (
              <tr key={e.id} className="hover:bg-bg-elevated/70 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-300">{formatDate(e.expenseDate)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${catColors[e.category] || defaultColor}`}>
                    {EXPENSE_LABELS[e.category] || e.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-200">{e.description}</td>
                <td className="py-3 px-4 text-sm text-gray-400">{e.vendor || '—'}</td>
                <td className="py-3 px-4 text-right text-sm text-red-400 font-medium tabular-nums">-{formatCurrency(e.amount)}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
