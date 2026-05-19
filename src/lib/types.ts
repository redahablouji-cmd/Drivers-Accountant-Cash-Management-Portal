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

// THE NEW EXCEL-MAPPED INTERFACE
export interface SettlementRecord {
  id: string;
  dateSaisie: string;        // Date of entry
  codeStatus: string;        // B (Status/Code)
  invoiceRef: string;        // N° fac - BL-OT
  dateDepart: string;        // Date de Départ
  agent: string;             // Agent
  chauffeur: string;         // Chauffeur (Usually matches Driver ID/Name)
  depart: string;            // Origin
  arrivee: string;           // Destination
  client: string;            // Client Name
  justification: string;     // Notes
  
  // Expenses (Sortie)
  fraisDeplacement: number;
  peage: number;
  gendarme: number;
  reparation: number;
  gasoilExterne: number;
  autre: number;
  
  // Financials
  entree: number;            // Advances given to driver
  sortie: number;            // Total of all expenses calculated automatically
  solde: number;             // Running balance for this specific trip
}

export interface Driver {
  id: string;
  name: string;
  licensePlate: string;
  status: 'available' | 'on-trip' | 'settling';
  lastTripDate: string;
  settlements: SettlementRecord[]; // Attached ledger history
}

export interface DieselVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  truckPlate: string;
  driverName: string;
  liters: number;
  amount: number;
  consumption?: number; 
}