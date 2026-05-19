import * as React from "react";
import { Search, FileText, Plus, Save, X, History, ArrowRight, Receipt, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDrivers } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const emptyForm = {
  invoiceRef: '', dateDepart: '', agent: 'Admin', depart: '', arrivee: '', client: '', justification: '',
  fraisDeplacement: 0, peage: 0, gendarme: 0, reparation: 0, gasoilExterne: 0, autre: 0, entree: 0
};

type CreationStep = 'none' | 'select' | 'depart' | 'arrivee';

export function SettlementWorkspace() {
  const [selectedDriver, setSelectedDriver] = React.useState(mockDrivers[0]);
  const [creationStep, setCreationStep] = React.useState<CreationStep>('none');
  const [formData, setFormData] = React.useState(emptyForm);

  // Live Excel Calculations
  const calculatedSortie = Number(formData.fraisDeplacement) + Number(formData.peage) + Number(formData.gendarme) + 
                           Number(formData.reparation) + Number(formData.gasoilExterne) + Number(formData.autre);
  
  // Solde logic adapts based on type. 
  // For depart: Solde is just the positive advance. For arrivee: Solde is the negative expenses (assuming advance was already logged).
  const calculatedSolde = creationStep === 'depart' ? Number(formData.entree) : -calculatedSortie;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveToDatabase = () => {
    const finalRecord = {
      ...formData,
      id: `SET-${Math.floor(Math.random() * 10000)}`,
      tripType: creationStep, // Tags it as 'depart' or 'arrivee'
      dateSaisie: new Date().toISOString().split('T')[0],
      codeStatus: 'saz',
      chauffeur: selectedDriver.name,
      sortie: calculatedSortie,
      solde: calculatedSolde
    };
    
    console.log(`SAVING ${creationStep.toUpperCase()} TO SUPABASE:`, finalRecord);
    
    // Update local state for UI responsiveness
    const updatedDriver = { ...selectedDriver, settlements: [finalRecord, ...selectedDriver.settlements] };
    setSelectedDriver(updatedDriver);
    setCreationStep('none');
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
              onClick={() => { setSelectedDriver(driver); setCreationStep('none'); }}
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
              <div className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center shadow-sm">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Ledger: {selectedDriver.name}</h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-wider">Truck Plate: {selectedDriver.licensePlate}</p>
              </div>
            </div>
            {creationStep === 'none' ? (
              <Button onClick={() => setCreationStep('select')} className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-6">
                <Plus className="w-4 h-4 mr-2" /> New Settlement
              </Button>
            ) : (
              <Button onClick={() => setCreationStep('none')} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider bg-white">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>

          {/* VIEW 1: HISTORY (When creationStep is 'none') */}
          {creationStep === 'none' && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Settlement History</h2>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Date Saisie</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Type</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Route / Ref</th>
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
                        <td className="p-3">
                          <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider", record.tripType === 'depart' ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700")}>
                            {record.tripType || 'ARRIVÉE'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{record.depart ? `${record.depart} → ${record.arrivee}` : record.invoiceRef}</td>
                        <td className="p-3 text-right font-medium text-emerald-600">{record.entree > 0 ? `+${record.entree}` : '-'}</td>
                        <td className="p-3 text-right font-medium text-rose-600">{record.sortie > 0 ? `-${record.sortie}` : '-'}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{record.solde}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          )}

          {/* VIEW 2: THE SELECTION SCREEN (When creationStep is 'select') */}
          {creationStep === 'select' && (
            <div className="grid grid-cols-2 gap-6 mt-8">
              <Card 
                onClick={() => setCreationStep('depart')}
                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group bg-white border-slate-200"
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <MapPin className="w-8 h-8 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Log Départ</h2>
                    <p className="text-xs text-slate-500 mt-2">Initialize a new trip. Record routing information, assign client, and issue cash advances.</p>
                  </div>
                  <Button variant="ghost" className="text-blue-600 text-xs font-bold uppercase group-hover:bg-blue-50">Select Départ <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </CardContent>
              </Card>

              <Card 
                onClick={() => setCreationStep('arrivee')}
                className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all group bg-white border-slate-200"
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Receipt className="w-8 h-8 text-emerald-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Log Arrivée</h2>
                    <p className="text-xs text-slate-500 mt-2">Reconcile a completed trip. Log physical receipts, toll expenses, maintenance, and fines.</p>
                  </div>
                  <Button variant="ghost" className="text-emerald-600 text-xs font-bold uppercase group-hover:bg-emerald-50">Select Arrivée <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* VIEW 3: THE DYNAMIC FORM (When creationStep is 'depart' or 'arrivee') */}
          {(creationStep === 'depart' || creationStep === 'arrivee') && (
            <Card className={cn("bg-white shadow-sm overflow-hidden border-t-4", creationStep === 'depart' ? "border-t-blue-500" : "border-t-emerald-500")}>
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className={cn("text-[11px] font-bold uppercase tracking-widest", creationStep === 'depart' ? "text-blue-800" : "text-emerald-800")}>
                  {creationStep === 'depart' ? 'New Departure & Advance Log' : 'New Arrival & Expense Reconciliation'}
                </h2>
              </div>
              
              <div className="p-6 space-y-8">
                
                {/* --- DÉPART FIELDS --- */}
                {creationStep === 'depart' && (
                  <>
                    <div>
                      <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Routing Information</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Date Départ</Label><Input type="date" name="dateDepart" onChange={handleInputChange} className="h-8 text-xs" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Client</Label><Input name="client" onChange={handleInputChange} className="h-8 text-xs" placeholder="Nexus Logistics..." /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Départ (Origin)</Label><Input name="depart" onChange={handleInputChange} className="h-8 text-xs" placeholder="Agadir" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Arrivée (Dest.)</Label><Input name="arrivee" onChange={handleInputChange} className="h-8 text-xs" placeholder="Tanger" /></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Financial Advances (Entrée)</h3>
                      <div className="w-1/3 space-y-2">
                        <Label className="text-[10px] font-bold text-emerald-600">Advance Given (MAD)</Label>
                        <Input type="number" name="entree" onChange={handleInputChange} className="h-10 text-lg font-bold text-emerald-600 border-emerald-200" placeholder="0.00" />
                      </div>
                    </div>
                  </>
                )}

                {/* --- ARRIVÉE FIELDS --- */}
                {creationStep === 'arrivee' && (
                  <>
                    <div>
                      <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Reconciliation Metadata</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] font-bold">N° Fac / BL-OT</Label><Input name="invoiceRef" onChange={handleInputChange} className="h-8 text-xs font-mono" placeholder="INV-4011" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Justification / Notes</Label><Input name="justification" onChange={handleInputChange} className="h-8 text-xs" placeholder="All receipts verified..." /></div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Trip Expenses (Sortie)</h3>
                      <div className="grid grid-cols-6 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Frais Dép.</Label><Input type="number" name="fraisDeplacement" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Péage</Label><Input type="number" name="peage" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Gendarme</Label><Input type="number" name="gendarme" onChange={handleInputChange} className="h-8 text-xs font-mono text-rose-600" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Réparation</Label><Input type="number" name="reparation" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Gasoil Ext.</Label><Input type="number" name="gasoilExterne" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-bold">Autre</Label><Input type="number" name="autre" onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Common Action Bar */}
                <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase font-bold">Total Ledger Impact</Label>
                    <div className={cn("text-xl font-black", calculatedSolde >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {calculatedSolde >= 0 ? `+${calculatedSolde}` : calculatedSolde} MAD
                    </div>
                  </div>
                  <Button onClick={handleSaveToDatabase} className={cn("h-10 text-white font-bold uppercase tracking-widest text-xs px-8 shadow-sm", creationStep === 'depart' ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700")}>
                    <Save className="w-4 h-4 mr-2" /> 
                    {creationStep === 'depart' ? 'Post Departure Log' : 'Finalize Trip Expenses'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
  );
}