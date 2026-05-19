
import { CashTransaction, Driver, DieselVoucher } from './types';

export const mockTransactions: CashTransaction[] = [
  { id: '1', timestamp: '2024-05-16 09:00', reference: 'C-1001', entity: 'OMAR BENALI', description: 'Diesel Advance', amount: 500, type: 'out', balance: 14550 },
  { id: '2', timestamp: '2024-05-16 10:30', reference: 'R-502', entity: 'TOTAL ENERGIES', description: 'Recharge Caisse', amount: 5000, type: 'in', balance: 15050 },
  { id: '3', timestamp: '2024-05-16 11:15', reference: 'C-1002', entity: 'KHALID SAIDI', description: 'Toll Reimbursement', amount: 120, type: 'out', balance: 14930 },
  { id: '4', timestamp: '2024-05-16 14:00', reference: 'C-1003', entity: 'YOUSSEF IDRISSI', description: 'Unloading Fee', amount: 250, type: 'out', balance: 14680 },
  { id: '5', timestamp: '2024-05-16 16:45', reference: 'C-1004', entity: 'AHMED NACIRI', description: 'Trip Result Settlement', amount: 130, type: 'out', balance: 14550 },
];

export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Omar Benali', licensePlate: '12345-A-10', status: 'settling', lastTripDate: '2024-05-15' },
  { id: 'd2', name: 'Khalid Saidi', licensePlate: '98765-B-40', status: 'available', lastTripDate: '2024-05-14' },
  { id: 'd3', name: 'Youssef Idrissi', licensePlate: '44556-C-25', status: 'on-trip', lastTripDate: '2024-05-16' },
  { id: 'd4', name: 'Ahmed Naciri', licensePlate: '77889-D-05', status: 'settling', lastTripDate: '2024-05-15' },
  { id: 'd5', name: 'Brahim El Fassi', licensePlate: '11223-E-15', status: 'available', lastTripDate: '2024-05-10' },
];

export const mockVouchers: DieselVoucher[] = [
  { id: 'v1', voucherNumber: 'VN-9901', date: '2024-05-16', truckPlate: '12345-A-10', driverName: 'Omar Benali', liters: 450, amount: 5200, consumption: 32.5 },
  { id: 'v2', voucherNumber: 'VN-9902', date: '2024-05-16', truckPlate: '98765-B-40', driverName: 'Khalid Saidi', liters: 520, amount: 6100, consumption: 38.2 },
  { id: 'v3', voucherNumber: 'VN-9903', date: '2024-05-15', truckPlate: '44556-C-25', driverName: 'Youssef Idrissi', liters: 400, amount: 4600, consumption: 31.0 },
];
