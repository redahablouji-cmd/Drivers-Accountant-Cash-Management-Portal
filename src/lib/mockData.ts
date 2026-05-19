import { CashTransaction, Driver, DieselVoucher } from './types';

// ==========================================
// 1. PHYSICAL LEDGER BALANCE DEPARTURE STATE
// ==========================================
export const mockTransactions: CashTransaction[] = [
  { id: 'TX-101', timestamp: '2026-05-19 08:30', reference: 'RECH-01', entity: 'CAISSE CENTRALE', description: 'Opening Balance Allocation', amount: 100000, type: 'in', balance: 100000 },
];

// ==========================================
// 2. COMPLETE EXCEL-MAPPED DRIVER & TRUCK FLEET (ALL 38 ENTRIES)
// ==========================================
export const mockDrivers: Driver[] = [
  { id: 'DRV-001', name: 'MOHAMED BENALI', licensePlate: '12345-A-70', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-002', name: 'YOUSSEF EL IDRISSI', licensePlate: '67890-B-40', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-003', name: 'MUSTAPHA NACIRI', licensePlate: '11223-H-11', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-004', name: 'TARIK SAIDI', licensePlate: '44556-F-05', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-005', name: 'RACHID EL FASSI', licensePlate: '77889-M-20', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-006', name: 'KHALID BOUAZZA', licensePlate: '99001-D-15', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-007', name: 'AMINE JABRI', licensePlate: '55667-G-33', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-008', name: 'HASSAN CHAKIR', licensePlate: '22334-A-10', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-009', name: 'ABDELILAH MANSOURI', licensePlate: '88990-B-12', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-010', name: 'SAID MAALOUF', licensePlate: '33445-E-18', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-011', name: 'JAOUAD EL AMRAOUI', licensePlate: '66778-F-22', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-012', name: 'BRAHIM TAZI', licensePlate: '11224-H-09', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-013', name: 'AZIZ CHERKAOUI', licensePlate: '55443-J-45', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-014', name: 'HICHAM ALAMI', licensePlate: '99887-K-30', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-015', name: 'ADIL BENJELLOUN', licensePlate: '44332-L-14', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-016', name: 'REDA TOUHAMI', licensePlate: '77665-M-27', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-017', name: 'YASSINE EL KHATIB', licensePlate: '22110-A-36', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-018', name: 'OTMANE BELKADIR', licensePlate: '88554-B-02', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-019', name: 'BADR OUSSOU', licensePlate: '44991-C-41', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-020', name: 'SIMOHAMED FAWZI', licensePlate: '33221-D-50', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-021', name: 'ANASS MEZZOUR', licensePlate: '66112-E-62', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-022', name: 'ZAKARIA CHRAIBI', licensePlate: '99445-F-71', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-023', name: 'FOUAD BOUSSAID', licensePlate: '12778-G-19', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-024', name: 'MEHDI SABRI', licensePlate: '55112-H-80', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-025', name: 'YASSIR TAJ', licensePlate: '88334-J-06', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-026', name: 'HAMZA SBAI', licensePlate: '44778-K-13', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-027', name: 'MOUHCINE DAOUDI', licensePlate: '22990-L-95', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-028', name: 'NABIL SLAOUI', licensePlate: '77441-M-52', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-029', name: 'WALID RADI', licensePlate: '11995-A-88', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-030', name: 'OUSSAMA KABBAGE', licensePlate: '66332-B-47', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-031', name: 'MAROUANE CHAHIN', licensePlate: '99114-C-39', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-032', name: 'ISMAIL FILALI', licensePlate: '33778-D-16', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-033', name: 'AYMOUB EL HACHIMI', licensePlate: '55221-E-25', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-034', name: 'ILYAS JALAL', licensePlate: '88665-F-74', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-035', name: 'AHLAM SOUIRI', licensePlate: '22441-G-08', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-036', name: 'NOUREDDINE GUESSOUS', licensePlate: '77112-H-91', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-037', name: 'SALAH EDDINE LAYANI', licensePlate: '44009-J-34', status: 'available', lastTripDate: '2026-05-19', settlements: [] },
  { id: 'DRV-038', name: 'ZOUHAIR SEBTI', licensePlate: '11554-K-60', status: 'available', lastTripDate: '2026-05-19', settlements: [] }
];

// ==========================================
// 3. INITIAL VOUCHER ARCHIVE STATE
// ==========================================
export const mockVouchers: DieselVoucher[] = [
  { 
    id: 'VCH-INIT-01', voucherNumber: 'VN-10042', date: '2026-05-19', truckPlate: '12345-A-70', driverName: 'MOHAMED BENALI', 
    kmPrecedent: 245000, kmActuel: 246150, kmParcouru: 1150, lavageGraissage: 0, gasoilDhs: 4800, gasoilLiters: 410, 
    consommation: 35.65, prixLitre: 11.70, station: 'Afriquia'
  }
];