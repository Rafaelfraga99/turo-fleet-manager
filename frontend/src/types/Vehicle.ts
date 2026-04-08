export interface Vehicle {
  id: number;
  turoVehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  vehicleName: string;
  listingName: string;
  totalEarnings: number;
  completedTrips: number;
  totalTrips: number;
  photoUrl?: string;
  color?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  monthlyPayment?: number;
  monthlyInsurance?: number;
  yearlyRegistration?: number;
  monthlyParking?: number;
  currentOdometer?: number;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  inspectionExpiry?: string;
  bouncieDeviceId?: string;
}

export type ExpenseCategory =
  'OIL_CHANGE' | 'TIRES' | 'BRAKES' | 'MAINTENANCE' | 'REPAIR' |
  'CAR_WASH' | 'DETAILING' | 'INSURANCE' | 'REGISTRATION' | 'PARKING' |
  'TOLLS' | 'GAS_FUEL' | 'EV_CHARGING' | 'DEPRECIATION' | 'LOAN_INTEREST' |
  'TICKET_FINE' | 'TURO_FEE' | 'ACCESSORY' | 'OTHER';

export const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  OIL_CHANGE: 'Oil Change', TIRES: 'Tires', BRAKES: 'Brakes',
  MAINTENANCE: 'Maintenance', REPAIR: 'Repair', CAR_WASH: 'Car Wash',
  DETAILING: 'Detailing', INSURANCE: 'Insurance', REGISTRATION: 'Registration',
  PARKING: 'Parking', TOLLS: 'Tolls', GAS_FUEL: 'Gas/Fuel',
  EV_CHARGING: 'EV Charging', DEPRECIATION: 'Depreciation', LOAN_INTEREST: 'Loan Interest',
  TICKET_FINE: 'Ticket/Fine', TURO_FEE: 'Turo Fee', ACCESSORY: 'Accessory', OTHER: 'Other',
};

export interface VehicleExpense {
  id: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  odometerAtExpense?: number;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ProfitabilitySummary {
  totalEarnings: number;
  totalExpenses: number;
  fixedMonthlyCosts: number;
  monthsActive: number;
  totalFixedCosts: number;
  netProfit: number;
  profitMargin: number;
  expensesByCategory: Record<string, number>;
}

export interface Trip {
  id: number;
  reservationId: string;
  guest: string;
  vehicle: {
    id: number;
    vehicleName: string;
    licensePlate: string;
  };
  tripStart: string;
  tripEnd: string;
  pickupLocation: string;
  returnLocation: string;
  tripStatus: string;
  checkInOdometer: number | null;
  checkOutOdometer: number | null;
  distanceTraveled: number | null;
  tripDays: number;
  tripPrice: number;
  boostPrice: number;
  threeDayDiscount: number;
  oneWeekDiscount: number;
  twoWeekDiscount: number;
  threeWeekDiscount: number;
  oneMonthDiscount: number;
  twoMonthDiscount: number;
  threeMonthDiscount: number;
  nonRefundableDiscount: number;
  earlyBirdDiscount: number;
  hostPromotionalCredit: number;
  delivery: number;
  excessDistance: number;
  extras: number;
  cancellationFee: number;
  additionalUsage: number;
  lateFee: number;
  improperReturnFee: number;
  airportOperationsFee: number;
  airportParkingCredit: number;
  tollsAndTickets: number;
  onTripEvCharging: number;
  postTripEvCharging: number;
  smoking: number;
  cleaning: number;
  finesPaidToHost: number;
  gasReimbursement: number;
  gasFee: number;
  otherFees: number;
  salesTax: number;
  totalEarnings: number;
}

export interface DashboardStats {
  totalVehicles: number;
  totalTrips: number;
  completedTrips: number;
  bookedTrips: number;
  inProgressTrips: number;
  cancelledTrips: number;
  totalEarnings: number;
  totalTripDays: number;
  totalDistance: number;
}
