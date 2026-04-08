export interface VehiclePerformance {
  id: number;
  vehicleName: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  listingName: string;
  totalEarnings: number;
  completedTrips: number;
  totalTrips: number;
  cancelledTrips: number;
  totalTripDays: number;
  revenuePerDay: number;
  completionRate: number;
  avgTripValue: number;
  healthScore: number;
  healthCategory: 'TOP_PERFORMER' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

export interface FleetHealthSummary {
  avgHealthScore: number;
  topPerformers: number;
  needsAttention: number;
  critical: number;
  totalVehicles: number;
  avgRevenuePerDay: number;
}

export interface FleetAlert {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  vehicleId: number | null;
  vehicleName: string;
}

export interface MonthlyRevenue {
  yearMonth: string;
  revenue: number;
  tripCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface RevenueBreakdown {
  tripPrice: number;
  tollsAndTickets: number;
  gasReimbursement: number;
  extras: number;
  delivery: number;
  cancellationFees: number;
  lateFees: number;
  cleaning: number;
  additionalUsage: number;
  excessDistance: number;
  discounts: number;
  total: number;
}

export interface LocationStat {
  location: string;
  tripCount: number;
  totalEarnings: number;
  avgEarnings: number;
}
