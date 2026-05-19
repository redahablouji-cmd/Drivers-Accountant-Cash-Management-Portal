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

export interface SettlementRecord {
  id: string;
  tripType: 'depart' | 'arrivee';
  dateSaisie: string;
  codeStatus: string;
  invoiceRef: string;
  dateDepart: string;
  agent: string;
  chauffeur: string;
  depart: string;
  arrivee: string;
  client: string;
  justification: string;
  fraisDeplacement: number;
  peage: number;
  gendarme: number;
  reparation: number;
  gasoilExterne: number;
  autre: number;
  entree: number;
  sortie: number;
  solde: number;
}

export interface Driver {
  id: string;
  name: string;
  licensePlate: string;
  status: 'available' | 'on-trip' | 'settling';
  lastTripDate: string;
  settlements: SettlementRecord[];
}

// THE NEW EXCEL-MAPPED DIESEL VOUCHER INTERFACE
export interface DieselVoucher {
  id: string;
  voucherNumber: string; // N.B
  date: string;          // date
  driverName: string;    // Salarié
  truckPlate: string;    // Immatriculation
  kmPrecedent: number;   // precedent
  kmActuel: number;      // actuel
  kmParcouru: number;    // KM (calculated)
  lavageGraissage: number; // lavage graissage
  gasoilDhs: number;     // gasoil DHS
  gasoilLiters: number;  // gasoil (L)
  consommation: number;  // consommation au 100 (calculated)
  prixLitre: number;     // Prix Litre
  station: string;       // Station
}