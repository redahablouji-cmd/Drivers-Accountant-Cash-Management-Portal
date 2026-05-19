
import * as React from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Info,
  Calculator,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileText
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockDrivers } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function SettlementWorkspace() {
  const [selectedDriver, setSelectedDriver] = React.useState(mockDrivers[0]);
  
  // Dummy state for inputs
  const [advances, setAdvances] = React.useState(1500);
  const [tolls, setTolls] = React.useState(320);
  const [unloading, setUnloading] = React.useState(150);
  const [fuelDeductions, setFuelDeductions] = React.useState(4200);
  const [tripEarnings, setTripEarnings] = React.useState(7500);

  const netTotal = tripEarnings - advances - tolls - unloading - fuelDeductions;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Pane: Driver Selection */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-3 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drivers Queue</span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600">{mockDrivers.length}</span>
        </div>
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search arrivals..." 
              className="w-full bg-slate-100 border-none rounded py-1 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {mockDrivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className={cn(
                "w-full p-4 text-left transition-all relative group",
                selectedDriver.id === driver.id 
                  ? "bg-blue-50/50 border-l-2 border-blue-600" 
                  : "hover:bg-slate-100/50 px-4"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn("text-xs font-bold", selectedDriver.id === driver.id ? "text-slate-900" : "text-slate-700")}>
                  {driver.name}
                </span>
                <span className={cn("text-[10px] font-semibold font-mono", selectedDriver.id === driver.id ? "text-blue-600" : "text-slate-400")}>
                  #{driver.id.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Plate: {driver.licensePlate}</span>
                {driver.status === 'settling' && (
                  <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-amber-100 text-amber-700 border-none tracking-tighter uppercase font-bold">In Progress</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Workspace */}
      <motion.div 
        key={selectedDriver.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto bg-slate-50/30 font-sans"
      >
        <div className="p-8 max-w-5xl mx-auto space-y-6 pb-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">Settlement Workspace</h1>
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                  Session: <span className="text-slate-900">#8829-TR</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  Trip Hash: <span className="text-slate-700 font-mono">Agadir → Tanger</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider border-slate-200 px-4">
                Save Draft
              </Button>
              <Button className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-6">
                Post Ledger
              </Button>
            </div>
          </div>

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-24">
            <Card className="bg-white p-3 border border-slate-200 rounded shadow-sm">
              <CardContent className="p-0">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Advances Issued</div>
                <div className="text-lg font-bold text-slate-900">{advances.toLocaleString()}.00 <span className="text-xs font-normal text-slate-400">MAD</span></div>
                <div className="text-[10px] text-slate-500 mt-1 italic tracking-tight">Verified in Register</div>
              </CardContent>
            </Card>
            <Card className="bg-white p-3 border border-slate-200 rounded shadow-sm">
              <CardContent className="p-0">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Diesel Consumption</div>
                <div className="text-lg font-bold text-slate-900">450 <span className="text-xs font-normal text-slate-400">LITERS</span></div>
                <div className="text-[10px] text-rose-600 mt-1 font-bold">38.2 L/100km (Warning)</div>
              </CardContent>
            </Card>
            <Card className="bg-white p-3 border border-slate-200 rounded shadow-sm border-l-4 border-l-emerald-500">
              <CardContent className="p-0">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Projected Reimbursement</div>
                <div className="text-lg font-bold text-emerald-600">+{netTotal.toLocaleString()}.00 <span className="text-xs font-normal text-emerald-400">MAD</span></div>
                <div className="text-[10px] text-emerald-600/70 mt-1 font-bold">Calculated Live</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200 overflow-hidden bg-white">
            <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Route Expenses Worksheet</h2>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600 font-bold hover:bg-blue-50">
                + ADD EXPENSE
              </Button>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Description</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Category</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Reference</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Amount (MAD)</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-slate-700 font-medium">Autoroute Tolls (A3 - Casablanca/Tanger)</td>
                    <td className="p-3"><Badge variant="outline" className="text-[9px] border-slate-200 font-bold uppercase tracking-tighter">Tolls</Badge></td>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">#TL-4491</td>
                    <td className="p-3 text-right font-bold text-slate-900">{tolls.toLocaleString()}.00</td>
                    <td className="p-3 text-slate-300 hover:text-rose-500 cursor-pointer text-center font-bold">×</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-700 font-medium">Unloading Assistants (Tanger Med)</td>
                    <td className="p-3"><Badge variant="outline" className="text-[9px] border-slate-200 font-bold uppercase tracking-tighter">Labor</Badge></td>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">#UL-902</td>
                    <td className="p-3 text-right font-bold text-slate-900">{unloading.toLocaleString()}.00</td>
                    <td className="p-3 text-slate-300 hover:text-rose-500 cursor-pointer text-center font-bold">×</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Area */}
              <div className="p-6 bg-slate-50/50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-2 block tracking-widest">Accounting Notes</Label>
                  <textarea 
                    className="w-full h-20 border border-slate-200 rounded p-2 text-xs text-slate-600 resize-none bg-white focus:ring-1 focus:ring-blue-500 outline-none" 
                    placeholder="Missing one toll receipt, approved by Fleet Manager..."
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium">Total Expenses:</span>
                    <span className="font-bold text-slate-900">{(tolls + unloading).toLocaleString()}.00 MAD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium">Initial Advances:</span>
                    <span className="font-bold text-rose-600">- {advances.toLocaleString()}.00 MAD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium">Fuel Deductions:</span>
                    <span className="font-bold text-rose-600">- {fuelDeductions.toLocaleString()}.00 MAD</span>
                  </div>
                  <Separator className="my-2 bg-slate-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-900 uppercase">Net Settlement:</span>
                    <span className={cn(
                      "text-xl font-bold font-mono tracking-tighter",
                      netTotal >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {netTotal.toLocaleString()}.00 <span className="text-[10px] font-medium uppercase text-slate-400">MAD Due</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
