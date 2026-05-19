
export type ViewState = 'dashboard' | 'caisse' | 'settlement' | 'diesel' | 'settings';

export interface CashTransaction {
  id: string;
  timestamp: string;
  reference: string;
  entity: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  balance: number;
}

export interface Driver {
  id: string;
  name: string;
  licensePlate: string;
  status: 'available' | 'on-trip' | 'settling';
  lastTripDate: string;
}

export interface DieselVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  truckPlate: string;
  driverName: string;
  liters: number;
  amount: number;
  consumption?: number; // L/100km
}

export interface SettlementDraft {
  driverId: string;
  advances: number;
  expenses: {
    tolls: number;
    unloading: number;
    maintenance: number;
    other: number;
  };
  fuelDeductions: number;
  netAmount: number;
}
