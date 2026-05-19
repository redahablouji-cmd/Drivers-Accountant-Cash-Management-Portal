import * as React from "react";
import { 
  Plus, Fuel, Truck, User, Hash, CalendarIcon, 
  ArrowUpRight, AlertTriangle, CheckCircle2, Save, Droplets, Search, X, History
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockVouchers, mockDrivers } from "@/lib/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DieselVoucher } from "@/lib/types";

const defaultStations = [
  { name: 'Afriquia', count: 0 },
  { name: 'TotalEnergies', count: 0 },
  { name: 'Shell', count: 0 },
  { name: 'Winxo', count: 0 },
  { name: 'Petrom', count: 0 },
  { name: 'Ziz', count: 0 },
  { name: 'Ola Energy', count: 0 },
];

export function DieselVouchers() {
  // Use unique license plates from drivers to form our vehicle queue
  const [selectedTruck, setSelectedTruck] = React.useState(mockDrivers[0].licensePlate);
  const [isCreating, setIsCreating] = React.useState(false);
  const [vouchers, setVouchers] = React.useState<DieselVoucher[]>(mockVouchers);
  const [stationList, setStationList] = React.useState(defaultStations);
  
  // Initialize form with the selected truck pre-filled
  const [formData, setFormData] = React.useState({
    voucherNumber: '', date: new Date().toISOString().split('T')[0], truckPlate: selectedTruck, driverName: '',
    kmPrecedent: '', kmActuel: '', lavageGraissage: '', gasoilDhs: '', gasoilLiters: '', prixLitre: '', station: ''
  });

  // Sync truck plate form field whenever selected truck changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, truckPlate: selectedTruck }));
  }, [selectedTruck]);

  // Filter vouchers exclusively for the active vehicle
  const filteredVouchers = vouchers.filter(v => v.truckPlate === selectedTruck);

  // Live Excel Calculations
  const kmPrev = Number(formData.kmPrecedent) || 0;
  const kmCurr = Number(formData.kmActuel) || 0;
  const calculatedKm = kmCurr > kmPrev ? kmCurr - kmPrev : 0;
  const liters = Number(formData.gasoilLiters) || 0;
  
  // Formula: =(gasoil(L)/KM)*100
  const calculatedConsumption = calculatedKm > 0 ? (liters / calculatedKm) * 100 : 0;

  // Station frequency sorter
  const sortedStations = [...stationList].sort((a, b) => b.count - a.count);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const newRecord: DieselVoucher = {
      id: `VCH-${Math.floor(Math.random() * 10000)}`,
      voucherNumber: formData.voucherNumber,
      date: formData.date,
      driverName: mockDrivers.find(d => d.id === formData.driverName)?.name || formData.driverName,
      truckPlate: selectedTruck, // Lock to active vehicle
      kmPrecedent: kmPrev,
      kmActuel: kmCurr,
      kmParcouru: calculatedKm,
      lavageGraissage: Number(formData.lavageGraissage) || 0,
      gasoilDhs: Number(formData.gasoilDhs) || 0,
      gasoilLiters: liters,
      consommation: calculatedConsumption,
      prixLitre: Number(formData.prixLitre) || 0,
      station: formData.station
    };

    console.log("SAVING VOUCHER TO SUPABASE:", newRecord);
    setVouchers([newRecord, ...vouchers]);
    
    if (formData.station) {
      setStationList(prev => prev.map(s => 
        s.name === formData.station ? { ...s, count: s.count + 1 } : s
      ));
    }

    setIsCreating(false);
    setFormData({
      voucherNumber: '', date: new Date().toISOString().split('T')[0], truckPlate: selectedTruck, driverName: '',
      kmPrecedent: '', kmActuel: '', lavageGraissage: '', gasoilDhs: '', gasoilLiters: '', prixLitre: '', station: ''
    });
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      
      {/* Left Pane: Vehicle Selection Queue */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Fleet Trucks</span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600">{mockDrivers.length}</span>
        </div>
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search license plate..." className="w-full bg-slate-100 border-none rounded py-1 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {mockDrivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => { setSelectedTruck(driver.licensePlate); setIsCreating(false); }}
              className={cn(
                "w-full p-4 text-left transition-all", 
                selectedTruck === driver.licensePlate ? "bg-blue-50/50 border-l-2 border-blue-600" : "hover:bg-slate-100/50"
              )}
            >
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold font-mono tracking-tight", selectedTruck === driver.licensePlate ? "text-blue-700" : "text-slate-800")}>
                  {driver.licensePlate}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Driver: {driver.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Ledger Workspace */}
      <motion.div key={selectedTruck} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="p-8 max-w-6xl mx-auto space-y-6 pb-24">
          
          {/* Main Top Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" /> Diesel Monitoring Dashboard
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Target: <span className="text-slate-800 font-mono">{selectedTruck}</span></p>
            </div>
            <div className="bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100">
              <CheckCircle2 className="text-emerald-500 w-4 h-4" />
              <span className="text-xs font-bold text-blue-700">Database Sync: Active</span>
            </div>
          </div>

          {/* DYNAMIC VIEW SWITCH */}
          {!isCreating ? (
            
            // ================= VIEW A: VEHICLE FUEL HISTORY =================
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Fuel History & Consumption Logs</h2>
                </div>
                {/* BUTTON AT TOP RIGHT CORNER OF HISTORY SECTION */}
                <Button onClick={() => setIsCreating(true)} className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-4">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Voucher
                </Button>
              </div>

              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200">
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Date / N.B</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Salarié / Driver</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">KM Actuel</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Distance (KM)</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Fuel Details</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-center">Consommation au 100</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-12 text-center text-xs text-slate-400 font-medium">
                        No voucher logs found for vehicle {selectedTruck}. Click "+ New Voucher" to register transactions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVouchers.map((v) => (
                      <TableRow key={v.id} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="py-3">
                          <div className="text-xs font-medium text-slate-900">{v.date}</div>
                          <div className="text-[10px] font-bold text-slate-400 font-mono">{v.voucherNumber}</div>
                        </TableCell>
                        <td className="py-3 text-xs font-medium text-slate-700">{v.driverName}</td>
                        <TableCell className="py-3 text-right text-xs font-mono text-slate-500">{v.kmActuel.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right text-xs font-mono font-bold text-slate-700">{v.kmParcouru.toLocaleString()}</TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="text-xs font-bold text-slate-900">{v.gasoilLiters} L</div>
                          <div className="text-[10px] text-slate-400 font-medium">{v.station} ({v.gasoilDhs.toLocaleString()} MAD)</div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex justify-center">
                            <div className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                              v.consommation > 35 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                              {v.consommation.toFixed(2)} L
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            
            // ================= VIEW B: NEW VOUCHER EXPANDED FORM =================
            <Card className="bg-white border-blue-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                <h2 className="text-[11px] font-bold text-blue-800 uppercase tracking-widest">Mandatory Fuel Ledger Saisie</h2>
                <Button onClick={() => setIsCreating(false)} variant="ghost" size="sm" className="h-6 text-slate-500 font-bold hover:bg-slate-200/50">
                  <X className="w-4 h-4 mr-1" /> Close Form
                </Button>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {/* Row 1: Identity Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">N.B (Voucher No.)</Label>
                    <Input name="voucherNumber" value={formData.voucherNumber} onChange={handleInputChange} className="h-8 text-xs font-mono" placeholder="VN-000" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Date</Label>
                    <Input type="date" name="date" value={formData.date} onChange={handleInputChange} className="h-8 text-xs font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Immatriculation</Label>
                    <Input value={selectedTruck} disabled className="h-8 text-xs font-mono bg-slate-100 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Salarié (Driver)</Label>
                    <Select onValueChange={(val) => handleSelectChange('driverName', val)} value={formData.driverName}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                      <SelectContent>
                        {mockDrivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Station Dropdown</Label>
                    <Select onValueChange={(val) => handleSelectChange('station', val)} value={formData.station}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Station" /></SelectTrigger>
                      <SelectContent>
                        {sortedStations.map(s => (
                          <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Metrics Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">KM Précédent</Label>
                    <Input type="number" name="kmPrecedent" value={formData.kmPrecedent} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">KM Actuel</Label>
                    <Input type="number" name="kmActuel" value={formData.kmActuel} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Gasoil (Liters)</Label>
                    <Input type="number" name="gasoilLiters" value={formData.gasoilLiters} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white border-blue-200" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Gasoil (DHS)</Label>
                    <Input type="number" name="gasoilDhs" value={formData.gasoilDhs} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Prix Litre</Label>
                    <Input type="number" name="prixLitre" value={formData.prixLitre} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Droplets size={12}/> Lavage/Graissage</Label>
                    <Input type="number" name="lavageGraissage" value={formData.lavageGraissage} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                </div>

                {/* Calculations Output & Save Action */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-8">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Calculated Distance (KM)</Label>
                      <div className="text-xl font-bold font-mono text-slate-800">{calculatedKm > 0 ? calculatedKm : "0"}</div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Consommation au 100</Label>
                      <div className={cn("text-xl font-bold font-mono flex items-center gap-2", calculatedConsumption > 35 ? "text-rose-600" : "text-emerald-600")}>
                        {calculatedConsumption > 0 ? calculatedConsumption.toFixed(2) : "0.00"} L
                        {calculatedConsumption > 35 && <AlertTriangle size={16} className="text-rose-500" />}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSave} className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md">
                    <Save size={16} className="mr-2" /> RECORD VOUCHER
                  </Button>
                </div>
              </CardContent>
              <div className="bg-slate-50/50 p-2 border-t border-slate-100 flex items-center justify-center">
                 <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ArrowUpRight size={10} /> Live Excel Calculating Engine: <span className="font-bold font-mono px-1">=(Liters/KM)*100</span>
                 </p>
              </div>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
  );
}