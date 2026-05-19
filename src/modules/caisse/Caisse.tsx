
import * as React from "react";
import { 
  Plus, 
  Minus, 
  Search, 
  Download, 
  Filter, 
  MoreHorizontal,
  CalendarDays,
  CheckCircle2
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTransactions } from "@/lib/mockData";
import { motion } from "motion/react";

export function Caisse() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">La Caisse (Cash Ledger)</h1>
          <p className="text-sm text-slate-500">Manage daily cash flow and bank deposits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600">
            <Download size={16} className="mr-2" />
            Export XLS
          </Button>
          <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Plus size={16} className="mr-2" />
            Add Cash In
          </Button>
          <Button variant="destructive" className="h-9 bg-rose-600 hover:bg-rose-700 font-semibold">
            <Minus size={16} className="mr-2" />
            Add Cash Out
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Filter by reference, driver or entity..." 
            className="w-full bg-slate-50 border-none rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-0"
          />
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-900 text-xs">
          <CalendarDays size={14} className="mr-2" />
          Today: May 16, 2024
        </Button>
        <div className="w-px h-4 bg-slate-200" />
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-900 text-xs">
          <Filter size={14} className="mr-2" />
          Filter
        </Button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[150px]">Date/Time</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[100px]">Ref ID</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Entity/Driver</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Description</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Cash In</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Cash Out</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="text-xs font-medium text-slate-500 font-mono py-2">{tx.timestamp}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-600">
                      {tx.reference}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 py-2">{tx.entity}</TableCell>
                  <TableCell className="text-xs text-slate-500 py-2">{tx.description}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 text-right py-2">
                    {tx.type === 'in' ? `${tx.amount.toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-rose-600 text-right py-2">
                    {tx.type === 'out' ? `${tx.amount.toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900 text-right py-2 font-mono">
                    {tx.balance.toLocaleString()}.00
                  </TableCell>
                  <TableCell className="py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                      <MoreHorizontal size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* End of Day Reconciliation Card */}
      <Card className="bg-slate-900 text-white border-none shadow-lg">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">End of Day Reconciliation</h3>
                <p className="text-[10px] text-slate-400">Physical cash matches digital ledger</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Opening</p>
                <p className="text-sm font-bold font-mono">10,000.00</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Net Flux</p>
                <p className="text-sm font-bold font-mono text-emerald-400">+4,550.00</p>
              </div>
              <div className="text-right border-l border-slate-800 pl-6">
                <p className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">Target</p>
                <p className="text-lg font-bold font-mono">14,550.00</p>
              </div>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-6 h-9 shadow-lg shadow-blue-900/50">
              CLOSE REGISTER
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
