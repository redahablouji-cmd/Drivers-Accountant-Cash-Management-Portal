import * as React from "react";
import { Plus, Truck, ArrowUpRight, AlertTriangle, CheckCircle2, Save, Droplets, Search, X, History, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DieselVoucher } from "@/lib/types";

const defaultStations = [
  { name: 'Afriquia',     count: 0 },
  { name: 'TotalEnergies', count: 0 },
  { name: 'Shell',        count: 0 },
  { name: 'Winxo',        count: 0 },
  { name: 'Petrom',       count: 0 },
  { name: 'Ziz',          count: 0 },
  { name: 'Ola Energy',   count: 0 },
];

export function DieselVouchers() {
  const [drivers,       setDrivers]       = React.useState<any[]>([]);
  const [selectedTruck, setSelectedTruck] = React.useState('');
  const [isCreating,    setIsCreating]    = React.useState(false);
  const [vouchers,      setVouchers]      = React.useState<DieselVoucher[]>([]);
  const [stationList,   setStationList]   = React.useState(defaultStations);
  const [editingVoucher, setEditingVoucher] = React.useState<any | null>(null);
  const [editForm,      setEditForm]      = React.useState<any>({});

  const [formData, setFormData] = React.useState({
    voucherNumber: '', date: new Date().toISOString().split('T')[0],
    truckPlate: '', driverName: '', kmPrecedent: '', kmActuel: '',
    lavageGraissage: '', gasoilDhs: '', gasoilLiters: '', prixLitre: '', station: ''
  });

  // Load drivers
  React.useEffect(() => {
    supabase.from('staff_profiles')
      .select('id, full_name, vehicle_plate, employee_code')
      .eq('role', 'driver').eq('is_active', true)
      .then(({ data }) => {
        const list = data || [];
        setDrivers(list);
        if (list.length > 0) setSelectedTruck(list[0].vehicle_plate || '');
      });
  }, []);

  // Load vouchers when truck changes
  React.useEffect(() => {
    if (!selectedTruck) return;
    supabase.from('diesel_vouchers')
      .select('*').eq('truck_plate', selectedTruck)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVouchers((data || []).map(d => ({
          id:              d.id,
          voucherNumber:   d.voucher_number,
          date:            d.date,
          driverName:      d.driver_name,
          truckPlate:      d.truck_plate,
          kmPrecedent:     d.km_precedent,
          kmActuel:        d.km_actuel,
          kmParcouru:      d.km_parcouru,
          lavageGraissage: d.lavage_graissage,
          gasoilDhs:       d.gasoil_dhs,
          gasoilLiters:    d.gasoil_liters,
          consommation:    d.consommation,
          prixLitre:       d.prix_litre,
          station:         d.station,
        })));
      });
  }, [selectedTruck]);

  // Sync truck in form
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, truckPlate: selectedTruck }));
  }, [selectedTruck]);

  const filteredVouchers = vouchers.filter(v => v.truckPlate === selectedTruck);

  const kmPrev = Number(formData.kmPrecedent) || 0;
  const kmCurr = Number(formData.kmActuel)    || 0;
  const calculatedKm = kmCurr > kmPrev ? kmCurr - kmPrev : 0;
  const liters = Number(formData.gasoilLiters) || 0;
  const calculatedConsumption = calculatedKm > 0 ? (liters / calculatedKm) * 100 : 0;
  const sortedStations = [...stationList].sort((a, b) => b.count - a.count);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save to Supabase
  const handleSave = async () => {
    const selectedDriverObj = drivers.find(d => d.id === formData.driverName);
    const { data, error } = await supabase.from('diesel_vouchers').insert({
      driver_id:        selectedDriverObj?.id        || null,
      driver_name:      selectedDriverObj?.full_name || formData.driverName,
      truck_plate:      selectedTruck,
      voucher_number:   formData.voucherNumber,
      date:             formData.date,
      km_precedent:     kmPrev,
      km_actuel:        kmCurr,
      km_parcouru:      calculatedKm,
      gasoil_liters:    liters,
      gasoil_dhs:       Number(formData.gasoilDhs)      || 0,
      prix_litre:       Number(formData.prixLitre)      || 0,
      consommation:     calculatedConsumption,
      lavage_graissage: Number(formData.lavageGraissage) || 0,
      station:          formData.station,
    }).select().single();

    if (!error && data) {
      const newRecord: DieselVoucher = {
        id: data.id, voucherNumber: data.voucher_number, date: data.date,
        driverName: data.driver_name, truckPlate: data.truck_plate,
        kmPrecedent: data.km_precedent, kmActuel: data.km_actuel, kmParcouru: data.km_parcouru,
        lavageGraissage: data.lavage_graissage, gasoilDhs: data.gasoil_dhs,
        gasoilLiters: data.gasoil_liters, consommation: data.consommation,
        prixLitre: data.prix_litre, station: data.station,
      };
      setVouchers([newRecord, ...vouchers]);
      if (formData.station) {
        setStationList(prev => prev.map(s =>
          s.name === formData.station ? { ...s, count: s.count + 1 } : s
        ));
      }
    } else if (error) {
      alert(`Erreur: ${error.message}`);
    }

    setIsCreating(false);
    setFormData({
      voucherNumber: '', date: new Date().toISOString().split('T')[0],
      truckPlate: selectedTruck, driverName: '', kmPrecedent: '', kmActuel: '',
      lavageGraissage: '', gasoilDhs: '', gasoilLiters: '', prixLitre: '', station: ''
    });
  };

  // Delete
  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Supprimer ce voucher ?')) return;
    const { error } = await supabase.from('diesel_vouchers').delete().eq('id', id);
    if (!error) setVouchers(vouchers.filter(v => v.id !== id));
    else alert(`Erreur: ${error.message}`);
  };

  // Edit save
  const handleEditVoucherSave = async () => {
    const { error } = await supabase.from('diesel_vouchers').update({
      voucher_number:   editForm.voucherNumber,
      date:             editForm.date,
      gasoil_liters:    parseFloat(editForm.gasoilLiters)    || 0,
      gasoil_dhs:       parseFloat(editForm.gasoilDhs)       || 0,
      prix_litre:       parseFloat(editForm.prixLitre)       || 0,
      lavage_graissage: parseFloat(editForm.lavageGraissage) || 0,
      station:          editForm.station,
    }).eq('id', editingVoucher.id);

    if (!error) {
      setVouchers(vouchers.map(v => v.id === editingVoucher.id ? { ...v, ...editForm } : v));
      setEditingVoucher(null);
    } else alert(`Erreur: ${error.message}`);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* Left Pane */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Fleet Trucks</span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600">{drivers.length}</span>
        </div>
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search license plate..."
              className="w-full bg-slate-100 border-none rounded py-1 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {drivers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">Aucun chauffeur trouvé.</div>
          ) : drivers.map((driver) => (
            <button key={driver.id}
              onClick={() => { setSelectedTruck(driver.vehicle_plate || ''); setIsCreating(false); }}
              className={cn("w-full p-4 text-left transition-all",
                selectedTruck === driver.vehicle_plate
                  ? "bg-blue-50/50 border-l-2 border-blue-600" : "hover:bg-slate-100/50")}>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold font-mono tracking-tight",
                  selectedTruck === driver.vehicle_plate ? "text-blue-700" : "text-slate-800")}>
                  {driver.vehicle_plate || '—'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Driver: {driver.full_name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <motion.div key={selectedTruck} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="p-8 max-w-6xl mx-auto space-y-6 pb-24">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" /> Diesel Monitoring Dashboard
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Active Target: <span className="text-slate-800 font-mono">{selectedTruck}</span>
              </p>
            </div>
            <div className="bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100">
              <CheckCircle2 className="text-emerald-500 w-4 h-4" />
              <span className="text-xs font-bold text-blue-700">Database Sync: Active</span>
            </div>
          </div>

          {!isCreating ? (
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Fuel History & Consumption Logs</h2>
                </div>
                <Button onClick={() => setIsCreating(true)}
                  className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-4">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Voucher
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200">
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Date / N.B</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500">Salarié</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">KM Actuel</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Distance</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Fuel Details</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-center">Conso au 100</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-12 text-center text-xs text-slate-400 font-medium">
                        No voucher logs found for {selectedTruck}. Click "+ New Voucher" to register.
                      </TableCell>
                    </TableRow>
                  ) : filteredVouchers.map((v) => (
                    <TableRow key={v.id} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="py-3">
                        <div className="text-xs font-medium text-slate-900">{v.date}</div>
                        <div className="text-[10px] font-bold text-slate-400 font-mono">{v.voucherNumber}</div>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-medium text-slate-700">{v.driverName}</TableCell>
                      <TableCell className="py-3 text-right text-xs font-mono text-slate-500">{v.kmActuel?.toLocaleString()}</TableCell>
                      <TableCell className="py-3 text-right text-xs font-mono font-bold text-slate-700">{v.kmParcouru?.toLocaleString()}</TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="text-xs font-bold text-slate-900">{v.gasoilLiters} L</div>
                        <div className="text-[10px] text-slate-400 font-medium">{v.station} ({v.gasoilDhs?.toLocaleString()} MAD)</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-center">
                          <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold font-mono border",
                            v.consommation > 35
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100")}>
                            {v.consommation?.toFixed(2)} L
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingVoucher(v); setEditForm({ ...v }); }}
                            className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDeleteVoucher(v.id)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="bg-white border-blue-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                <h2 className="text-[11px] font-bold text-blue-800 uppercase tracking-widest">Mandatory Fuel Ledger Saisie</h2>
                <Button onClick={() => setIsCreating(false)} variant="ghost" size="sm"
                  className="h-6 text-slate-500 font-bold hover:bg-slate-200/50">
                  <X className="w-4 h-4 mr-1" /> Close Form
                </Button>
              </div>
              <CardContent className="p-6 space-y-6">
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
                    <Select onValueChange={val => handleSelectChange('driverName', val)} value={formData.driverName}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Driver" /></SelectTrigger>
                      <SelectContent>
                        {drivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Station</Label>
                    <Select onValueChange={val => handleSelectChange('station', val)} value={formData.station}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Station" /></SelectTrigger>
                      <SelectContent>
                        {sortedStations.map(s => (<SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                    <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Droplets size={12} /> Lavage/Graissage
                    </Label>
                    <Input type="number" name="lavageGraissage" value={formData.lavageGraissage} onChange={handleInputChange} className="h-8 text-xs font-mono bg-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-8">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Calculated Distance (KM)</Label>
                      <div className="text-xl font-bold font-mono text-slate-800">{calculatedKm > 0 ? calculatedKm : "0"}</div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Consommation au 100</Label>
                      <div className={cn("text-xl font-bold font-mono flex items-center gap-2",
                        calculatedConsumption > 35 ? "text-rose-600" : "text-emerald-600")}>
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
                  <ArrowUpRight size={10} /> Live Excel Calculating Engine:
                  <span className="font-bold font-mono px-1">=(Liters/KM)*100</span>
                </p>
              </div>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Edit Voucher Modal */}
      <AnimatePresence>
        {editingVoucher && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Modifier le Voucher</h3>
              {[
                { label: 'N.B (Voucher)',    key: 'voucherNumber',   type: 'text'   },
                { label: 'Date',             key: 'date',            type: 'date'   },
                { label: 'Gasoil (L)',       key: 'gasoilLiters',    type: 'number' },
                { label: 'Gasoil (DHS)',     key: 'gasoilDhs',       type: 'number' },
                { label: 'Prix Litre',       key: 'prixLitre',       type: 'number' },
                { label: 'Lavage/Graissage', key: 'lavageGraissage', type: 'number' },
                { label: 'Station',          key: 'station',         type: 'text'   },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                  <input type={type} value={editForm[key] || ''}
                    onChange={e => setEditForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditVoucherSave}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer">
                  Enregistrer
                </button>
                <button onClick={() => setEditingVoucher(null)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg cursor-pointer">
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}