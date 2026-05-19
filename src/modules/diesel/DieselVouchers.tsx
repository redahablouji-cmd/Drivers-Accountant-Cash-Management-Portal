
import * as React from "react";
import { 
  Plus, 
  Fuel, 
  Truck, 
  User, 
  Hash, 
  CalendarIcon, 
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockVouchers, mockDrivers } from "@/lib/mockData";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function DieselVouchers() {
  const [liters, setLiters] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Diesel & Fuel Vouchers</h1>
          <p className="text-sm text-slate-500">Rapid data entry for fuel consumption monitoring</p>
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Hash size={12} className="text-slate-400" /> Voucher Number
              </Label>
              <Input placeholder="VN-00000" className="h-9 text-sm font-mono border-slate-200 focus-visible:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <CalendarIcon size={12} className="text-slate-400" /> Date
              </Label>
              <Input type="date" defaultValue="2024-05-16" className="h-9 text-sm border-slate-200 focus-visible:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Truck size={12} className="text-slate-400" /> Truck Plate
              </Label>
              <Select>
                <SelectTrigger className="h-9 text-xs border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select Truck" />
                </SelectTrigger>
                <SelectContent>
                  {mockDrivers.map(d => (
                    <SelectItem key={d.id} value={d.licensePlate}>{d.licensePlate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <User size={12} className="text-slate-400" /> Driver
              </Label>
              <Select>
                <SelectTrigger className="h-9 text-xs border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select Driver" />
                </SelectTrigger>
                <SelectContent>
                  {mockDrivers.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Fuel size={12} className="text-slate-400" /> Liters
              </Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="h-9 text-sm font-bold border-slate-200 focus-visible:ring-blue-500" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                Amount (MAD)
              </Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-sm font-bold border-slate-200 focus-visible:ring-blue-500" 
                />
                <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 shadow-md shadow-blue-600/20 shrink-0">
                  SAVE
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="bg-slate-50/50 p-2 border-t border-slate-100 flex items-center justify-center">
           <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowUpRight size={10} /> Keyboard Shortcut: <span className="font-bold border border-slate-300 px-1 rounded bg-white">Ctrl + Enter</span> to save and add next
           </p>
        </div>
      </Card>

      {/* Recent Voucher Entries Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ListFilter size={16} className="text-slate-400" />
            Recent Voucher Entries
          </h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> High Consumption ({'>'}35L)
             </div>
             <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Normal Range
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Voucher No.</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Date</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Truck / Driver</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Qty (L)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Price (MAD)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-center">Avg. Consumption</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVouchers.map((voucher) => (
                <TableRow key={voucher.id} className="border-slate-100 hover:bg-slate-50/50 group">
                  <TableCell className="py-2 text-xs font-bold text-blue-700 font-mono italic underline underline-offset-2 decoration-blue-200 cursor-pointer">
                    {voucher.voucherNumber}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-medium text-slate-500">
                    {voucher.date}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">{voucher.truckPlate}</span>
                      <span className="text-[10px] text-slate-500">{voucher.driverName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-right text-xs font-bold text-slate-700">
                    {voucher.liters.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2 text-right text-xs font-bold text-slate-700">
                    {voucher.amount.toLocaleString()}.00
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex justify-center">
                      {voucher.consumption && (
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5",
                          voucher.consumption > 35 
                            ? "bg-rose-50 text-rose-700 border border-rose-100" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        )}>
                          {voucher.consumption > 35 && <AlertTriangle size={10} />}
                          {voucher.consumption.toFixed(1)} L/100km
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 group-hover:text-slate-600 transition-colors">
                      <ListFilter size={14} className="rotate-90" />
                    </Button>
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
