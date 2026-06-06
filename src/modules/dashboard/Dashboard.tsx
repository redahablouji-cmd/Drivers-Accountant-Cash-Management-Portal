import * as React from "react";
import { 
  Users, 
  Fuel, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";

export function Dashboard() {
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [drivers,      setDrivers]      = React.useState<any[]>([]);
  const [dieselTotal,  setDieselTotal]  = React.useState(0);

  React.useEffect(() => {
    // Fetch recent cash transactions
    supabase.from('cash_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setTransactions(data || []));

    // Fetch active drivers
    supabase.from('staff_profiles')
      .select('id, full_name, vehicle_plate')
      .eq('role', 'driver')
      .eq('is_active', true)
      .then(({ data }) => setDrivers(data || []));

    // Fetch today's diesel total
    const today = new Date().toISOString().split('T')[0];
    supabase.from('diesel_vouchers')
      .select('gasoil_liters')
      .eq('date', today)
      .then(({ data }) => {
        const total = (data || []).reduce((s: number, v: any) => s + (v.gasoil_liters || 0), 0);
        setDieselTotal(total);
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 hover:border-blue-300 transition-all cursor-pointer group bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Settlements</CardTitle>
            <Users className="text-slate-300 group-hover:text-blue-500 transition-colors h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">
              {drivers.length} <span className="text-[10px] font-medium text-slate-400">DRIVERS</span>
            </div>
            <div className="text-[10px] text-amber-600 mt-1 font-medium bg-amber-50 inline-flex px-1.5 py-0.5 rounded border border-amber-100">
              Awaiting reconciliation
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Diesel Issued Today</CardTitle>
            <Fuel className="text-slate-300 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">
              {dieselTotal.toLocaleString()} <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Liters</span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-1 font-medium bg-emerald-50 inline-flex px-1.5 py-0.5 rounded border border-emerald-100">
              <TrendingUp size={10} className="mr-1" /> Aujourd'hui
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-white border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Register Variance</CardTitle>
            <AlertCircle className="text-slate-300 h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 font-mono">
              0.00 <span className="text-[10px] font-medium text-emerald-400 uppercase">MAD</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 inline-flex px-1.5 py-0.5 rounded border border-slate-100 italic">
              Calculated Live
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Transactions */}
        <Card className="shadow-sm border-slate-200 flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-base font-bold">Recent Cash Transactions</CardTitle>
              <CardDescription className="text-xs">Direct ledger monitoring</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 text-xs font-semibold hover:bg-blue-50">
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-0 pt-0">
            <div className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400">
                  Aucune transaction récente.
                </div>
              ) : transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tx.type === 'in' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{tx.entity}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'in' ? '+' : '-'}{tx.amount?.toLocaleString()} MAD
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{tx.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers */}
        <Card className="shadow-sm border-slate-200 flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between shrink-0">
            <div>
              <CardTitle className="text-base font-bold">Drivers Returning Today</CardTitle>
              <CardDescription className="text-xs">Waiting for trip reconciliation</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px]">
              {drivers.length} Pending
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-0 pt-0">
            <div className="divide-y divide-slate-100">
              {drivers.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400">
                  Aucun chauffeur en attente.
                </div>
              ) : drivers.map((driver) => (
                <div key={driver.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Users className="text-slate-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{driver.full_name}</p>
                      <Badge variant="outline" className="text-[10px] py-0 font-medium border-slate-300">
                        {driver.vehicle_plate || '—'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold">
                    Reconcile
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}