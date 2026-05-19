import * as React from "react";
import { 
  Plus, Fuel, Truck, User, Hash, CalendarIcon, 
  ArrowUpRight, AlertTriangle, CheckCircle2, ListFilter, Save, Droplets
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

const emptyForm = {
  voucherNumber: '', date: new Date().toISOString().split('T')[0], truckPlate: '', driverName: '',
  kmPrecedent: '', kmActuel: '', lavageGraissage: '', gasoilDhs: '', gasoilLiters: '', prixLitre: '', station: ''
};

// Initial Station List with frequency counters
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
  const [vouchers, setVouchers] = React.useState<DieselVoucher[]>(mockVouchers);
  const [formData, setFormData] = React.useState(emptyForm);
  const [stationList, setStationList] = React.useState(defaultStations);

  // Live Excel Calculations
  const kmPrev = Number(formData.kmPrecedent) || 0;
  const kmCurr = Number(formData.kmActuel) || 0;
  const calculatedKm = kmCurr > kmPrev ? kmCurr - kmPrev : 0;
  const liters = Number(formData.gasoilLiters) || 0;
  
  // Formula: =(gasoil(L)/KM)*100
  const calculatedConsumption = calculatedKm > 0 ? (liters / calculatedKm) * 100 : 0;

  // Sort stations by most frequently used (highest count first)
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
      truckPlate: formData.truckPlate,
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
    
    // Auto-sort logic: Increment the usage count of the selected station
    if (formData.station) {
      setStationList(prev => prev.map(s => 
        s.name === formData.station ? { ...s, count: s.count + 1 } : s
      ));
    }

    setFormData(emptyForm); // Reset form for rapid entry
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Diesel & Fuel Ledger</h1>
          <p className="text-sm text-slate-500">Live Excel-mapped data entry and fleet history</p>
        </div>
        <div className="bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100">
          <CheckCircle2 className="text-emerald-500 w-4 h-4" />
          <span className="text-xs font-bold text-blue-700">Database Sync: Active</span>
        </div>
      </div>

      {/* Rapid Entry Form */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="h-1 bg-blue-600 w-full" />
        <CardHeader className="py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wide">Enter New Voucher</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Section 1: Identity & Routing */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">N.B (Voucher No.)</Label>
              <Input name="voucherNumber" value={formData.voucherNumber} onChange={handleInputChange} className="h-8 text-xs font-mono" placeholder="VN-000" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} className="h-8 text-xs font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Immatriculation</Label>
              <Select onValueChange={(val) => handleSelectChange('truckPlate', val)} value={formData.truckPlate}>
                <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select Truck" /></SelectTrigger>
                <SelectContent>
                  {mockDrivers.map(d => (<SelectItem key={d.id} value={d.licensePlate}>{d.licensePlate}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Salarié</Label>
              <Select onValueChange={(val) => handleSelectChange('driverName', val)} value={formData.driverName}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                <SelectContent>
                  {mockDrivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Station</Label>
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

          {/* Section 2: Mileage & Financials */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end bg-slate-50 p-4 rounded-md border border-slate-100">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">KM Précédent</Label>
              <Input type="number" name="kmPrecedent" value={formData.kmPrecedent} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">KM Actuel</Label>
              <Input type="number" name="kmActuel" value={formData.kmActuel} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Gasoil (Liters)</Label>
              <Input type="number" name="gasoilLiters" value={formData.gasoilLiters} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white border-blue-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Gasoil (DHS)</Label>
              <Input type="number" name="gasoilDhs" value={formData.gasoilDhs} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Prix Litre</Label>
              <Input type="number" name="prixLitre" value={formData.prixLitre} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Droplets size={12}/> Lavage/Graissage</Label>
              <Input type="number" name="lavageGraissage" value={formData.lavageGraissage} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
            </div>
          </div>

          {/* Section 3: Live Output & Action */}
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
              <ArrowUpRight size={10} /> Live calculating: <span className="font-bold font-mono px-1">=(Liters/KM)*100</span>
           </p>
        </div>
      </Card>

      {/* Recent Voucher Entries Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Truck size={16} className="text-slate-400" /> Vehicle Fuel History
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Date / N.B</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Immatriculation</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">KM Actuel</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Distance (KM)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Gasoil (L/DHS)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-center">Consommation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id} className="border-slate-100 hover:bg-slate-50/50 group">
                  <TableCell className="py-2">
                    <div className="text-xs font-medium text-slate-900">{v.date}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-mono">{v.voucherNumber}</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="text-xs font-bold text-blue-700 underline decoration-blue-200 cursor-pointer">{v.truckPlate}</div>
                    <div className="text-[10px] text-slate-500">{v.driverName}</div>
                  </TableCell>
                  <TableCell className="py-2 text-right text-xs font-mono text-slate-500">{v.kmActuel.toLocaleString()}</TableCell>
                  <TableCell className="py-2 text-right text-xs font-mono font-bold text-slate-700">{v.kmParcouru.toLocaleString()}</TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="text-xs font-bold text-slate-900">{v.gasoilLiters} L</div>
                    <div className="text-[10px] text-slate-500">{v.gasoilDhs.toLocaleString()} MAD</div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex justify-center">
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1.5",
                        v.consommation > 35 ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      )}>
                        {v.consommation > 35 && <AlertTriangle size={10} />}
                        {v.consommation.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
}