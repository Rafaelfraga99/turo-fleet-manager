import axios from 'axios';
import { Vehicle, Trip, DashboardStats, VehicleExpense, ProfitabilitySummary } from '../types/Vehicle';
import { VehiclePerformance, FleetHealthSummary, FleetAlert, MonthlyRevenue, RevenueBreakdown, LocationStat } from '../types/Analytics';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:9090/api',
});

export const vehicleApi = {
  getAll: () => api.get<Vehicle[]>('/vehicles').then(r => r.data),
  getById: (id: number) => api.get<Vehicle>(`/vehicles/${id}`).then(r => r.data),
  update: (id: number, data: Partial<Vehicle>) => api.put<Vehicle>(`/vehicles/${id}`, data).then(r => r.data),
  getDashboardStats: () => api.get<DashboardStats>('/vehicles/dashboard').then(r => r.data),
};

export const expenseApi = {
  getByVehicle: (vehicleId: number) =>
    api.get<VehicleExpense[]>(`/vehicles/${vehicleId}/expenses`).then(r => r.data),
  getSummary: (vehicleId: number) =>
    api.get<ProfitabilitySummary>(`/vehicles/${vehicleId}/expenses/summary`).then(r => r.data),
  create: (vehicleId: number, data: Partial<VehicleExpense>) =>
    api.post<VehicleExpense>(`/vehicles/${vehicleId}/expenses`, data).then(r => r.data),
  update: (vehicleId: number, id: number, data: Partial<VehicleExpense>) =>
    api.put<VehicleExpense>(`/vehicles/${vehicleId}/expenses/${id}`, data).then(r => r.data),
  delete: (vehicleId: number, id: number) =>
    api.delete(`/vehicles/${vehicleId}/expenses/${id}`),
};

export const tripApi = {
  getAll: () => api.get<Trip[]>('/trips').then(r => r.data),
  getById: (id: number) => api.get<Trip>(`/trips/${id}`).then(r => r.data),
  getByVehicle: (vehicleId: number) => api.get<Trip[]>(`/trips/vehicle/${vehicleId}`).then(r => r.data),
  getByStatus: (status: string) => api.get<Trip[]>(`/trips/status/${status}`).then(r => r.data),
};

export const analyticsApi = {
  getVehicleRankings: (sortBy?: string) =>
    api.get<VehiclePerformance[]>('/analytics/vehicle-rankings', { params: { sortBy } }).then(r => r.data),
  getVehiclePerformance: (id: number) =>
    api.get<VehiclePerformance>(`/analytics/vehicle/${id}/performance`).then(r => r.data),
  getFleetHealth: () =>
    api.get<FleetHealthSummary>('/analytics/fleet-health').then(r => r.data),
  getMonthlyRevenue: () =>
    api.get<MonthlyRevenue[]>('/analytics/monthly-revenue').then(r => r.data),
  getAlerts: () =>
    api.get<FleetAlert[]>('/analytics/alerts').then(r => r.data),
  getRevenueBreakdown: () =>
    api.get<RevenueBreakdown>('/analytics/revenue-breakdown').then(r => r.data),
  getLocationStats: () =>
    api.get<LocationStat[]>('/analytics/location-stats').then(r => r.data),
};

export const maintenanceApi = {
  getByVehicle: (vehicleId: number) =>
    api.get<any[]>(`/vehicles/${vehicleId}/maintenance`).then(r => r.data),
  create: (vehicleId: number, data: any) =>
    api.post<any>(`/vehicles/${vehicleId}/maintenance`, data).then(r => r.data),
  markCompleted: (id: number, serviceDate: string, serviceOdometer?: number) =>
    api.put<any>(`/maintenance/${id}/complete`, { serviceDate, serviceOdometer }).then(r => r.data),
  delete: (id: number) => api.delete(`/maintenance/${id}`),
  getUpcoming: () => api.get<any[]>('/maintenance/upcoming').then(r => r.data),
};

export const reportApi = {
  exportTrips: () => window.open(`${api.defaults.baseURL}/reports/trips/csv`),
  exportExpenses: (vehicleId?: number) =>
    window.open(`${api.defaults.baseURL}/reports/expenses/csv${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  exportProfitability: () => window.open(`${api.defaults.baseURL}/reports/profitability/csv`),
  getTaxSummary: () => api.get<any>('/reports/tax-summary').then(r => r.data),
};

export const bouncieApi = {
  getAuthUrl: () => api.get<{ url: string }>('/bouncie/auth').then(r => r.data),
  getStatus: () => api.get<{ connected: boolean; vehicleCount?: number }>('/bouncie/status').then(r => r.data),
  getDevices: () => api.get<any[]>('/bouncie/vehicles').then(r => r.data),
  linkDevice: (vehicleId: number, deviceId: string) =>
    api.post(`/bouncie/link/${vehicleId}`, { deviceId }).then(r => r.data),
  getLocation: (vehicleId: number) =>
    api.get<any>(`/bouncie/vehicle/${vehicleId}/location`).then(r => r.data),
  getTrips: (vehicleId: number, startDate?: string, endDate?: string) =>
    api.get<any[]>(`/bouncie/vehicle/${vehicleId}/trips`, { params: { startDate, endDate } }).then(r => r.data),
};

export const importApi = {
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export default api;
