export type MaintenanceType =
  'OIL_CHANGE' | 'TIRE_ROTATION' | 'TIRE_REPLACEMENT' | 'BRAKE_INSPECTION' |
  'BRAKE_REPLACEMENT' | 'AIR_FILTER' | 'TRANSMISSION_FLUID' | 'COOLANT_FLUSH' |
  'BATTERY_CHECK' | 'ALIGNMENT' | 'SPARK_PLUGS' | 'TIMING_BELT' | 'FULL_INSPECTION' | 'OTHER';

export const MAINTENANCE_LABELS: Record<MaintenanceType, string> = {
  OIL_CHANGE: 'Oil Change', TIRE_ROTATION: 'Tire Rotation', TIRE_REPLACEMENT: 'Tire Replacement',
  BRAKE_INSPECTION: 'Brake Inspection', BRAKE_REPLACEMENT: 'Brake Replacement',
  AIR_FILTER: 'Air Filter', TRANSMISSION_FLUID: 'Transmission Fluid',
  COOLANT_FLUSH: 'Coolant Flush', BATTERY_CHECK: 'Battery Check',
  ALIGNMENT: 'Alignment', SPARK_PLUGS: 'Spark Plugs', TIMING_BELT: 'Timing Belt',
  FULL_INSPECTION: 'Full Inspection', OTHER: 'Other',
};

export const DEFAULT_INTERVALS: Partial<Record<MaintenanceType, { miles: number; months: number }>> = {
  OIL_CHANGE: { miles: 5000, months: 6 },
  TIRE_ROTATION: { miles: 7500, months: 6 },
  BRAKE_INSPECTION: { miles: 15000, months: 12 },
  AIR_FILTER: { miles: 15000, months: 12 },
  TRANSMISSION_FLUID: { miles: 30000, months: 24 },
  COOLANT_FLUSH: { miles: 30000, months: 24 },
  FULL_INSPECTION: { miles: 30000, months: 12 },
};

export interface MaintenanceSchedule {
  id: number;
  vehicleId: number;
  type: MaintenanceType;
  description: string;
  lastServiceDate: string;
  lastServiceOdometer: number;
  intervalMiles: number;
  intervalMonths: number;
  nextDueDate: string;
  nextDueOdometer: number;
  completed: boolean;
}
