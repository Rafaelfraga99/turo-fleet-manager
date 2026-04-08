import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, TrendingUp, Calendar, MapPin, Route, Gauge, CalendarDays, ChevronLeft, ChevronRight, Edit, Plus, DollarSign } from 'lucide-react';
import { vehicleApi, tripApi, expenseApi } from '../api/api';
import { Vehicle, Trip, VehicleExpense } from '../types/Vehicle';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Header from '../components/layout/Header';
import EditVehicleModal from '../components/vehicle/EditVehicleModal';
import AddExpenseModal from '../components/vehicle/AddExpenseModal';
import ExpenseHistoryTable from '../components/vehicle/ExpenseHistoryTable';
import ProfitabilityCard from '../components/vehicle/ProfitabilityCard';
import BounciePanel from '../components/vehicle/BounciePanel';
import MaintenancePanel from '../components/vehicle/MaintenancePanel';

type Preset = 'all' | '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

const presets: { label: string; value: Preset }[] = [
  { label: 'All', value: 'all' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: {
  startDate: Date | null; endDate: Date | null;
  onStartChange: (d: Date | null) => void; onEndChange: (d: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    if (selecting === 'start') {
      onStartChange(date);
      if (endDate && date > endDate) onEndChange(null);
      setSelecting('end');
    } else {
      if (startDate && date < startDate) {
        onStartChange(date);
        setSelecting('end');
      } else {
        onEndChange(date);
        setSelecting('start');
        setOpen(false);
      }
    }
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const d = new Date(year, month, day);
    return d > startDate && d < endDate;
  };

  const isStart = (day: number) => startDate && new Date(year, month, day).toDateString() === startDate.toDateString();
  const isEnd = (day: number) => endDate && new Date(year, month, day).toDateString() === endDate.toDateString();

  const fmtDate = (d: Date | null) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-bg-surface rounded-lg px-4 py-2 border border-border-subtle/50 hover:border-primary/50 transition-colors"
      >
        <CalendarDays size={14} className="text-gray-400" />
        <span className="text-xs text-gray-200">{fmtDate(startDate)}</span>
        <span className="text-gray-600 text-xs">→</span>
        <span className="text-xs text-gray-200">{fmtDate(endDate)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-bg-elevated border border-border-subtle rounded-xl p-4 shadow-2xl shadow-black/50 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700/50">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-100">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="p-1 text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700/50">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Selecting indicator */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSelecting('start')}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-colors ${
                selecting === 'start' ? 'bg-primary/20 text-indigo-400 border border-primary/40' : 'bg-gray-800/50 text-gray-400 border border-transparent'
              }`}
            >
              {startDate ? fmtDate(startDate) : 'Start date'}
            </button>
            <button
              onClick={() => setSelecting('end')}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-colors ${
                selecting === 'end' ? 'bg-primary/20 text-indigo-400 border border-primary/40' : 'bg-gray-800/50 text-gray-400 border border-transparent'
              }`}
            >
              {endDate ? fmtDate(endDate) : 'End date'}
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-gray-500 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const start = isStart(day);
              const end = isEnd(day);
              const inRange = isInRange(day);
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`h-8 text-xs font-medium rounded-md transition-all ${
                    start || end
                      ? 'bg-primary text-white'
                      : inRange
                      ? 'bg-primary/15 text-indigo-300'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick clear */}
          <button
            onClick={() => { onStartChange(null); onEndChange(null); setOpen(false); }}
            className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-200 py-1.5 rounded-md hover:bg-gray-700/30 transition-colors"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}

function getMonthKey(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === 'all') { setStartDate(null); setEndDate(null); return; }
    if (p === 'custom') return;
    const end = new Date();
    const start = new Date();
    switch (p) {
      case '7d': start.setDate(start.getDate() - 7); break;
      case '30d': start.setDate(start.getDate() - 30); break;
      case '90d': start.setDate(start.getDate() - 90); break;
      case '6m': start.setMonth(start.getMonth() - 6); break;
      case '1y': start.setFullYear(start.getFullYear() - 1); break;
    }
    setStartDate(start);
    setEndDate(end);
  };

  const handleCalendarStart = (d: Date | null) => { setStartDate(d); setPreset('custom'); };
  const handleCalendarEnd = (d: Date | null) => { setEndDate(d); setPreset('custom'); };

  const loadData = useCallback(() => {
    if (!id) return;
    const vehicleId = Number(id);
    setLoading(true);
    Promise.all([
      vehicleApi.getById(vehicleId),
      tripApi.getByVehicle(vehicleId),
      expenseApi.getByVehicle(vehicleId),
    ])
      .then(([v, t, e]) => { setVehicle(v as any); setAllTrips(t); setExpenses(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTrips = useMemo(() => {
    if (!startDate && !endDate) return allTrips;
    return allTrips.filter(t => {
      if (!t.tripStart) return false;
      const tripDate = new Date(t.tripStart);
      if (startDate && tripDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59);
        if (tripDate > endOfDay) return false;
      }
      return true;
    });
  }, [allTrips, startDate, endDate]);

  const completed = useMemo(() => filteredTrips.filter(t => t.tripStatus === 'Completed'), [filteredTrips]);
  const totalEarnings = useMemo(() => filteredTrips.reduce((s, t) => s + (t.totalEarnings || 0), 0), [filteredTrips]);
  const totalDistance = useMemo(() => completed.reduce((s, t) => s + (t.distanceTraveled || 0), 0), [completed]);
  const totalDays = useMemo(() => completed.reduce((s, t) => s + (t.tripDays || 0), 0), [completed]);
  const avgPerTrip = completed.length > 0 ? totalEarnings / completed.length : 0;
  const avgMilesPerTrip = completed.length > 0 ? totalDistance / completed.length : 0;

  // Monthly breakdown for mileage & earnings
  const monthlyData = useMemo(() => {
    const months: Record<string, { earnings: number; miles: number; trips: number; days: number; key: string }> = {};
    completed.forEach(t => {
      const key = getMonthKey(t.tripStart);
      if (!months[key]) months[key] = { earnings: 0, miles: 0, trips: 0, days: 0, key };
      months[key].earnings += t.totalEarnings || 0;
      months[key].miles += t.distanceTraveled || 0;
      months[key].trips += 1;
      months[key].days += t.tripDays || 0;
    });
    return Object.values(months).sort((a, b) => {
      const da = new Date(a.key);
      const db = new Date(b.key);
      return da.getTime() - db.getTime();
    });
  }, [completed]);

  // Fee breakdown from filtered trips
  const feeBreakdown = useMemo(() => filteredTrips.reduce((acc, t) => {
    acc.tripPrice += t.tripPrice || 0;
    acc.extras += t.extras || 0;
    acc.delivery += t.delivery || 0;
    acc.cancellationFee += t.cancellationFee || 0;
    acc.tollsAndTickets += t.tollsAndTickets || 0;
    acc.gasReimbursement += t.gasReimbursement || 0;
    acc.additionalUsage += t.additionalUsage || 0;
    acc.lateFee += t.lateFee || 0;
    acc.cleaning += t.cleaning || 0;
    acc.discounts += (t.threeDayDiscount || 0) + (t.oneWeekDiscount || 0) + (t.twoWeekDiscount || 0) +
      (t.threeWeekDiscount || 0) + (t.oneMonthDiscount || 0) + (t.earlyBirdDiscount || 0);
    return acc;
  }, {
    tripPrice: 0, extras: 0, delivery: 0, cancellationFee: 0,
    tollsAndTickets: 0, gasReimbursement: 0, additionalUsage: 0,
    lateFee: 0, cleaning: 0, discounts: 0,
  }), [filteredTrips]);

  if (loading) {
    return (<div><Header title="Vehicle Details" /><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></div>);
  }
  if (!vehicle) {
    return (<div><Header title="Vehicle Details" /><div className="flex items-center justify-center h-64 text-gray-400">Vehicle not found</div></div>);
  }

  const cancelledInPeriod = filteredTrips.filter(t => t.tripStatus?.includes('cancellation')).length;
  const cancelRate = filteredTrips.length > 0 ? Math.round((cancelledInPeriod / filteredTrips.length) * 100) : 0;

  return (
    <div>
      <Header title={vehicle.vehicleName || `${vehicle.make} ${vehicle.model}`} />

      <div className="mt-6 flex items-center justify-between">
        <Link to="/vehicles" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Vehicles
        </Link>

        {/* Period Filter: Presets + Calendar */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-bg-surface rounded-lg p-1 border border-border-subtle/50">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => applyPreset(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  preset === p.value ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={handleCalendarStart}
            onEndChange={handleCalendarEnd}
          />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {vehicle.photoUrl ? (
              <img src={vehicle.photoUrl} alt={vehicle.vehicleName} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="p-3 rounded-lg bg-primary/15"><Car size={24} className="text-indigo-400" /></div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-100">{vehicle.listingName || vehicle.vehicleName}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                <span>Plate: <span className="font-mono text-gray-300">{vehicle.licensePlate || '—'}</span></span>
                <span>VIN: <span className="font-mono text-gray-300">{vehicle.vin}</span></span>
                {vehicle.color && <span>Color: <span className="text-gray-300">{vehicle.color}</span></span>}
                {vehicle.currentOdometer && <span>Odometer: <span className="text-gray-300">{formatNumber(vehicle.currentOdometer)} mi</span></span>}
              </div>
              {(vehicle.monthlyPayment || vehicle.monthlyInsurance) && (
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  {vehicle.monthlyPayment ? <span>Payment: {formatCurrency(vehicle.monthlyPayment)}/mo</span> : null}
                  {vehicle.monthlyInsurance ? <span>Insurance: {formatCurrency(vehicle.monthlyInsurance)}/mo</span> : null}
                  {vehicle.purchasePrice ? <span>Purchased: {formatCurrency(vehicle.purchasePrice)}</span> : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-border-subtle rounded-lg px-3 py-2 text-sm font-medium transition-colors">
              <Plus size={14} /> Add Expense
            </button>
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors">
              <Edit size={14} /> Edit Info
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditVehicleModal vehicle={vehicle} isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSaved={loadData} />
      <AddExpenseModal vehicleId={vehicle.id} isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} onSaved={loadData} />

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Earnings" value={formatCurrency(totalEarnings)} icon={TrendingUp} iconColor="text-emerald-400" />
        <StatCard title="Trips" value={`${completed.length} / ${filteredTrips.length}`} icon={MapPin} iconColor="text-indigo-400" />
        <StatCard title="Days Rented" value={totalDays} icon={Calendar} iconColor="text-cyan-400" />
        <StatCard title="Total Miles" value={`${formatNumber(totalDistance)} mi`} icon={Gauge} iconColor="text-amber-400" />
        <StatCard title="Avg/Trip" value={formatCurrency(avgPerTrip)} icon={Route} iconColor="text-emerald-400" />
      </div>

      {/* Compliance */}
      {(vehicle.registrationExpiry || vehicle.insuranceExpiry || vehicle.inspectionExpiry) && (
        <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Registration', date: vehicle.registrationExpiry },
              { label: 'Insurance', date: vehicle.insuranceExpiry },
              { label: 'Inspection', date: vehicle.inspectionExpiry },
            ].map(({ label, date }) => {
              if (!date) return null;
              const expiry = new Date(date);
              const now = new Date();
              const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpired = daysLeft < 0;
              const isWarning = daysLeft >= 0 && daysLeft <= 30;
              const color = isExpired ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
              const bgColor = isExpired ? 'bg-red-400/10' : isWarning ? 'bg-amber-400/10' : 'bg-emerald-400/10';
              return (
                <div key={label} className={`rounded-lg p-4 ${bgColor}`}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                  <p className={`text-lg font-bold mt-1 ${color}`}>
                    {isExpired ? 'EXPIRED' : `${daysLeft} days left`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Expires: {formatDate(date)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Breakdown + Stats */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Mileage & Earnings Table */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
          <div className="p-6 border-b border-border-subtle/50">
            <h3 className="text-lg font-medium text-gray-100">Monthly Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Month</th>
                <th className="text-right py-3 px-4">Trips</th>
                <th className="text-right py-3 px-4">Days</th>
                <th className="text-right py-3 px-4">Miles</th>
                <th className="text-right py-3 px-4">Avg Mi/Trip</th>
                <th className="text-right py-3 px-4">Earnings</th>
                <th className="text-right py-3 px-4">Earn/Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {monthlyData.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500 text-sm">No completed trips in this period</td></tr>
              ) : (
                <>
                  {monthlyData.map((m) => (
                    <tr key={m.key} className="hover:bg-bg-elevated/70 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-200">{m.key}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300">{m.trips}</td>
                      <td className="py-3 px-4 text-right text-sm text-cyan-400">{m.days}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300 tabular-nums">{m.miles > 0 ? formatNumber(m.miles) : '—'}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-400 tabular-nums">
                        {m.trips > 0 && m.miles > 0 ? formatNumber(Math.round(m.miles / m.trips)) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium tabular-nums">{formatCurrency(m.earnings)}</td>
                      <td className="py-3 px-4 text-right text-sm text-indigo-400 tabular-nums">
                        {m.days > 0 ? formatCurrency(m.earnings / m.days) : '—'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-bg-elevated/30 font-medium">
                    <td className="py-3 px-4 text-sm text-gray-100">Total</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-200">{completed.length}</td>
                    <td className="py-3 px-4 text-right text-sm text-cyan-400">{totalDays}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-200 tabular-nums">{totalDistance > 0 ? formatNumber(totalDistance) : '—'}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-300 tabular-nums">
                      {avgMilesPerTrip > 0 ? formatNumber(Math.round(avgMilesPerTrip)) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-emerald-400 tabular-nums">{formatCurrency(totalEarnings)}</td>
                    <td className="py-3 px-4 text-right text-sm text-indigo-400 tabular-nums">
                      {totalDays > 0 ? formatCurrency(totalEarnings / totalDays) : '—'}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
            <h3 className="text-lg font-medium text-gray-100 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Revenue/Day</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-emerald-400">
                  {totalDays > 0 ? formatCurrency(totalEarnings / totalDays) : '$0'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Avg Miles/Trip</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-cyan-400">
                  {avgMilesPerTrip > 0 ? `${formatNumber(Math.round(avgMilesPerTrip))} mi` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Avg Days/Trip</p>
                <p className="text-2xl font-bold tabular-nums mt-1 text-indigo-400">
                  {completed.length > 0 ? (totalDays / completed.length).toFixed(1) : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cancel Rate</p>
                <p className={`text-2xl font-bold tabular-nums mt-1 ${cancelRate > 40 ? 'text-red-400' : cancelRate > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {cancelRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle/50 rounded-xl p-6 shadow-lg shadow-black/30">
            <h3 className="text-lg font-medium text-gray-100 mb-3">Earnings Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: 'Trip Price', value: feeBreakdown.tripPrice, color: 'text-emerald-400' },
                { label: 'Extras', value: feeBreakdown.extras, color: 'text-cyan-400' },
                { label: 'Delivery', value: feeBreakdown.delivery, color: 'text-indigo-400' },
                { label: 'Cancel Fees', value: feeBreakdown.cancellationFee, color: 'text-amber-400' },
                { label: 'Tolls', value: feeBreakdown.tollsAndTickets, color: 'text-gray-300' },
                { label: 'Gas', value: feeBreakdown.gasReimbursement, color: 'text-gray-300' },
                { label: 'Late Fees', value: feeBreakdown.lateFee, color: 'text-red-400' },
                { label: 'Discounts', value: feeBreakdown.discounts, color: 'text-red-400' },
              ].filter(item => item.value !== 0).map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className={`text-xs font-medium tabular-nums ${item.color}`}>{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-border-subtle pt-2 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-200">Total</span>
                <span className="text-sm font-bold tabular-nums text-emerald-400">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPS + Profitability */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <BounciePanel vehicleId={vehicle.id} bouncieDeviceId={(vehicle as any).bouncieDeviceId} />
          <ProfitabilityCard vehicle={vehicle} trips={filteredTrips} expenses={expenses} startDate={startDate} endDate={endDate} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <MaintenancePanel vehicleId={vehicle.id} />
          <ExpenseHistoryTable vehicleId={vehicle.id} expenses={expenses} onRefresh={loadData} />
        </div>
      </div>

      {/* Trip History */}
      <div className="mt-6 bg-bg-surface border border-border-subtle/50 rounded-xl shadow-lg shadow-black/30 overflow-hidden">
        <div className="p-6 border-b border-border-subtle/50">
          <h3 className="text-lg font-medium text-gray-100">Trip History ({filteredTrips.length} trips)</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-bg-elevated/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4">Reservation</th>
              <th className="text-left py-3 px-4">Guest</th>
              <th className="text-left py-3 px-4">Dates</th>
              <th className="text-center py-3 px-4">Days</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Distance</th>
              <th className="text-right py-3 px-4">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTrips.map((t) => (
              <tr key={t.id} className="hover:bg-bg-elevated/70 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-300">{t.reservationId}</td>
                <td className="py-3 px-4 text-sm text-gray-200">{t.guest}</td>
                <td className="py-3 px-4 text-xs text-gray-400">
                  {formatDate(t.tripStart)} → {formatDate(t.tripEnd)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-300 text-center">{t.tripDays}</td>
                <td className="py-3 px-4"><StatusBadge status={t.tripStatus} /></td>
                <td className="py-3 px-4 text-right text-sm text-gray-300 tabular-nums">
                  {t.distanceTraveled ? `${formatNumber(t.distanceTraveled)} mi` : '—'}
                </td>
                <td className="py-3 px-4 text-right text-sm text-emerald-400 font-medium tabular-nums">
                  {t.totalEarnings ? formatCurrency(t.totalEarnings) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
