import * as React from "react";
import { Search, FileText, Plus, Save, X, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockDrivers } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // Adjusted to standard framer-motion import

// Helper for initial form state
const emptyForm = {
  invoiceRef: '', dateDepart: '', agent: 'Admin', depart: '', arrivee: '', client: '', justification: '',
  fraisDeplacement: 0, peage: 0, gendarme: 0, reparation: 0, gasoilExterne: 0, autre: 0, entree: 0
};

export function SettlementWorkspace() {
  const [selectedDriver, setSelectedDriver] = React.useState(mockDrivers[0]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [formData, setFormData] = React.useState(emptyForm);

  // Live Excel Calculations
  const calculatedSortie = Number(formData.fraisDeplacement) + Number(formData.peage) + Number(formData.gendarme) + 
                           Number(formData.reparation) + Number(formData.gasoilExterne) + Number(formData.autre);
  const calculatedSolde = Number(formData.entree) - calculatedSortie;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveToDatabase = () => {
    const finalRecord = {
      ...formData,
      id: `SET-${Math.floor(Math.random() * 10000)}`,
      dateSaisie: new Date().toISOString().split('T')[0],
      codeStatus: 'saz',
      chauffeur: selectedDriver.name,
      sortie: calculatedSortie,
      solde: calculatedSolde
    };
    
    // Placeholder for Supabase Insert
    console.log("SAVING TO SUPABASE:", finalRecord);
    
    // Simulate updating local state for UI responsiveness
    const updatedDriver = { ...selectedDriver, settlements: [finalRecord, ...selectedDriver.settlements] };
    setSelectedDriver(updatedDriver);
    setIsCreating(false);
    setFormData(emptyForm);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      
      {/* Left Pane: Driver Selection */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drivers Queue</span>
        </div>
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search arrivals..." className="w-full bg-slate-100 border-none rounded py-1 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {mockDrivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => { setSelectedDriver(driver); setIsCreating(false); }}
              className={cn("w-full p-4 text-left transition-all", selectedDriver.id === driver.id ? "bg-blue-50/50 border-l-2 border-blue-600" : "hover:bg-slate-100/50")}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn("text-xs font-bold", selectedDriver.id === driver.id ? "text-slate-900" : "text-slate-700")}>{driver.name}</span>
              </div>
              <div className="text-[10px] text-slate-500">Plate: {driver.licensePlate}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Dynamic Workspace */}
      <motion.div key={selectedDriver.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="p-8 max-w-6xl mx-auto space-y-6 pb-24">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Ledger: {selectedDriver.name}</h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider">Truck Plate: {selectedDriver.licensePlate}</p>
              </div>
            </div>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-6">
                <Plus className="w-4 h-4 mr-2" /> New Settlement
              </Button>
            ) : (
              <Button onClick={() => setIsCreating(false)} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>

          {/* Conditional Rendering: History Ledger vs New Form */}
          {!isCreating ? (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Settlement History</h2>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Date Saisie</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Ref (BL-OT)</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Route</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Entrée (MAD)</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Sortie (MAD)</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedDriver.settlements.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">No records found.</td></tr>
                  ) : (
                    selectedDriver.settlements.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[10px]">{record.dateSaisie}</td>
                        <td className="p-3 font-bold">{record.invoiceRef}</td>
                        <td className="p-3 text-slate-600">{record.depart} → {record.arrivee}</td>
                        <td className="p-3 text-right font-medium text-emerald-600">+{record.entree}</td>
                        <td className="p-3 text-right font-medium text-rose-600">-{record.sortie}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{record.solde}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          ) : (
            // ================= NEW SETTLEMENT FORM =================
            <Card className="bg-white border-blue-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-blue-50/50">
                <h2 className="text-[11px] font-bold text-blue-800 uppercase tracking-widest">New Excel-Mapped Record</h2>
              </div>
              <div className="p-6 space-y-8">
                
                {/* SECTION 1: Operational Data */}
                <div>
                  <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Operational Information</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1"><Label className="text-[10px]">N° Fac / BL-OT</Label><Input name="invoiceRef" onChange={handleInputChange} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Date Départ</Label><Input type="date" name="dateDepart" onChange={handleInputChange} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Client</Label><Input name="client" onChange={handleInputChange} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Justification</Label><Input name="justification" onChange={handleInputChange} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Départ (Origin)</Label><Input name="depart" onChange={handleInputChange} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Arrivée (Dest.)</Label><Input name="arrivee" onChange={handleInputChange} className="h-8 text-xs" /></div>
                  </div>
                </div>

                {/* SECTION 2: Financial Grid (The Sortie) */}
                <div>
                  <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Expenses (Sortie)</h3>
                  <div className="grid grid-cols-6 gap-4">
                    <div className="space-y-1"><Label className="text-[10px]">Frais Déplacement</Label><Input type="number" name="fraisDeplacement" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Péage</Label><Input type="number" name="peage" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Gendarme</Label><Input type="number" name="gendarme" onChange={handleInputChange} className="h-8 text-xs font-mono text-rose-600" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Réparation</Label><Input type="number" name="reparation" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Gasoil Externe</Label><Input type="number" name="gasoilExterne" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Autre</Label><Input type="number" name="autre" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                  </div>
                </div>

                {/* SECTION 3: Live Math Calculation */}
                <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-emerald-600 uppercase font-bold">Entrée (Advances)</Label>
                    <Input type="number" name="entree" onChange={handleInputChange} className="h-10 text-lg font-bold text-emerald-600" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-rose-600 uppercase font-bold">Calculated Sortie</Label>
                    <div className="h-10 px-3 flex items-center border border-slate-200 rounded bg-white text-lg font-bold text-rose-600">
                      - {calculatedSortie}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-900 uppercase font-bold">Final Solde</Label>
                    <div className={cn("h-10 px-3 flex items-center border rounded bg-white text-xl font-black", calculatedSolde >= 0 ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200")}>
                      {calculatedSolde}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveToDatabase} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs">
                  <Save className="w-4 h-4 mr-2" /> Finalize & Post to Ledger
                </Button>
              </div>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
  );
}