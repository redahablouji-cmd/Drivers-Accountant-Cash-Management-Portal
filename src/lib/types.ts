export type ViewState = 'dashboard' | 'caisse' | 'settlement' | 'diesel' | 'fleetfix' | 'settings';

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

export interface DieselVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  driverName: string;
  truckPlate: string;
  kmPrecedent: number;
  kmActuel: number;
  kmParcouru: number;
  lavageGraissage: number;
  gasoilDhs: number;
  gasoilLiters: number;
  consommation: number;
  prixLitre: number;
  station: string;
}