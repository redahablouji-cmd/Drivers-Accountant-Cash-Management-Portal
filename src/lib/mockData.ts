import { CashTransaction, Driver, DieselVoucher, SettlementRecord } from './types';

export const mockTransactions: CashTransaction[] = [
  { id: '1', timestamp: '2024-05-16 09:00', reference: 'C-1001', entity: 'OMAR BENALI', description: 'Diesel Advance', amount: 500, type: 'out', balance: 14550 },
  { id: '2', timestamp: '2024-05-16 10:30', reference: 'R-502', entity: 'TOTAL ENERGIES', description: 'Recharge Caisse', amount: 5000, type: 'in', balance: 15050 },
  { id: '3', timestamp: '2024-05-16 11:15', reference: 'C-1002', entity: 'KHALID SAIDI', description: 'Toll Reimbursement', amount: 120, type: 'out', balance: 14930 },
];

export const mockDrivers: Driver[] = [
  { 
    id: 'd1', name: 'Omar Benali', licensePlate: '12345-A-10', status: 'settling', lastTripDate: '2024-05-15',
    settlements: [
      {
        id: 'SET-100', dateSaisie: '2024-05-15', codeStatus: 'saz', invoiceRef: 'INV-4011', dateDepart: '2024-05-13',
        agent: 'Admin', chauffeur: 'Omar Benali', depart: 'Agadir', arrivee: 'Tanger', client: 'Nexus Logistics', justification: 'Standard Route',
        fraisDeplacement: 150, peage: 320, gendarme: 0, reparation: 0, gasoilExterne: 0, autre: 50,
        entree: 1500, sortie: 520, solde: 980
      }
    ]
  },
  { id: 'd2', name: 'Khalid Saidi', licensePlate: '98765-B-40', status: 'available', lastTripDate: '2024-05-14', settlements: [] },
  { id: 'd3', name: 'Youssef Idrissi', licensePlate: '44556-C-25', status: 'on-trip', lastTripDate: '2024-05-16', settlements: [] },
];

export const mockVouchers: DieselVoucher[] = [
  { id: 'v1', voucherNumber: 'VN-9901', date: '2024-05-16', truckPlate: '12345-A-10', driverName: 'Omar Benali', liters: 450, amount: 5200, consumption: 32.5 },
];