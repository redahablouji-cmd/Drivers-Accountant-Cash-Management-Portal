import * as React from "react";
import { 
  Plus, 
  Minus, 
  Search, 
  Download, 
  Filter, 
  MoreHorizontal,
  CalendarDays,
  CheckCircle2,
  Save,
  X
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CashTransaction } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  reference: "",
  paymentMethod: "",
  description: "",
  amount: ""
};

export function Caisse() {
  // Using local state to manage live ledger additions
  const [transactions, setTransactions] = React.useState<CashTransaction[]>([]);

  React.useEffect(() => {
    supabase.from('cash_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setTransactions(data || []));
  }, []);
  const [activeForm, setActiveForm] = React.useState<'none' | 'in' | 'out'>('none');
  const [formData, setFormData] = React.useState(emptyForm);

  // Get current running balance safely from the top of the ledger
  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTransaction = () => {
    const txAmount = Number(formData.amount) || 0;
    if (txAmount <= 0) return;

    // Live ledger balance calculation
    const nextBalance = activeForm === 'in' ? currentBalance + txAmount : currentBalance - txAmount;

    // Creating the new record mapping Excel columns to our interface
    const newTx: CashTransaction = {
      id: `TX-${Math.floor(Math.random() * 10000)}`,
      timestamp: formData.date,
      reference: formData.reference || (activeForm === 'in' ? 'ENTRÉE' : 'SORTIE'),
      entity: formData.paymentMethod || 'Espèces', // Storing Payment Method in the 'entity' column for history
      description: formData.description,
      amount: txAmount,
      type: activeForm === 'in' ? 'in' : 'out',
      balance: nextBalance
    };

    supabase.from('cash_transactions').insert({
      reference:      newTx.reference,
      entity:         newTx.entity,
      description:    newTx.description,
      amount:         newTx.amount,
      type:           newTx.type,
      balance:        newTx.balance,
      timestamp:      newTx.timestamp,
    }).then(({ error }) => {
      if (!error) setTransactions([newTx, ...transactions]);
    });
    setActiveForm('none');
    setFormData(emptyForm);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6 bg-white min-h-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">La Caisse (Cash Ledger)</h1>
          <p className="text-sm text-slate-500">Gérez les flux de trésorerie et les dépôts (Entrées / Sorties)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 bg-white">
            <Download size={16} className="mr-2" />
            Export XLS
          </Button>
          
          <Button 
            onClick={() => { setActiveForm('in'); setFormData(emptyForm); }}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Cash In
          </Button>
          
          <Button 
            onClick={() => { setActiveForm('out'); setFormData(emptyForm); }}
            className="h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
          >
            <Minus size={16} className="mr-2" />
            Add Cash Out
          </Button>
        </div>
      </div>

      {/* DYNAMIC INLINE ENTRY FORM */}
      <AnimatePresence mode="wait">
        {activeForm !== 'none' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden"
          >
            <Card className={`border-2 ${activeForm === 'in' ? 'border-emerald-500' : 'border-rose-500'} shadow-md`}>
              <div className={`p-3 flex justify-between items-center border-b ${activeForm === 'in' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${activeForm === 'in' ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {activeForm === 'in' ? 'Nouvelle Entrée de Caisse' : 'Nouvelle Sortie de Caisse'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setActiveForm('none')} className="h-6 w-6 p-0 hover:bg-transparent">
                  <X size={16} className={activeForm === 'in' ? 'text-emerald-600' : 'text-rose-600'} />
                </Button>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Date</Label>
                    <Input type="date" name="date" value={formData.date} onChange={handleInputChange} className="h-9 text-xs font-mono" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">N.B (Référence)</Label>
                    <Input name="reference" value={formData.reference} onChange={handleInputChange} className="h-9 text-xs font-mono" placeholder="Ex: FACT-001" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Mode de Paiement</Label>
                    <Select onValueChange={(val) => handleSelectChange('paymentMethod', val)} value={formData.paymentMethod}>
                      <SelectTrigger className="h-9 text-xs font-medium"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Al-Barid">Al-Barid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Montant (MAD)</Label>
                    <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="h-9 text-sm font-bold bg-slate-50" placeholder="0.00" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Libellé</Label>
                    <div className="flex gap-2">
                      <Input name="description" value={formData.description} onChange={handleInputChange} className="h-9 text-xs flex-1" placeholder="Raison de la transaction..." />
                      <Button 
                        onClick={handleSaveTransaction}
                        className={`h-9 font-bold text-white text-[11px] uppercase tracking-wider px-5 ${activeForm === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                      >
                        <Save size={14} className="mr-2" /> Valider
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher par N.B, Libellé ou Mode de paiement..." 
            className="w-full bg-slate-50 border-none rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-0"
          />
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-900 text-xs">
          <CalendarDays size={14} className="mr-2" />
          Aujourd'hui
        </Button>
        <div className="w-px h-4 bg-slate-200" />
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-slate-900 text-xs">
          <Filter size={14} className="mr-2" />
          Filtres
        </Button>
      </div>

      {/* Ledger Table - Updated Columns to Match Excel */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[120px]">Date</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[120px]">N.B</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 w-[150px]">Mode de Paiement</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500">Libellé</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Entrée (MAD)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Sortie (MAD)</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-slate-500 text-right">Solde</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="text-xs font-medium text-slate-500 font-mono py-3">{tx.timestamp}</TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white text-slate-700 font-mono">
                      {tx.reference}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-700 py-3 uppercase tracking-wider">{tx.entity}</TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 font-medium">{tx.description}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 text-right py-3 bg-emerald-50/30">
                    {tx.type === 'in' ? `+ ${tx.amount.toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-rose-600 text-right py-3 bg-rose-50/30">
                    {tx.type === 'out' ? `- ${tx.amount.toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-[13px] font-black text-slate-900 text-right py-3 font-mono">
                    {tx.balance.toLocaleString()}.00
                  </TableCell>
                  <TableCell className="py-3">
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
                <p className="text-sm font-bold font-mono">0.00</p>
              </div>
              <div className="text-right border-l border-slate-800 pl-6">
                <p className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">Current Target</p>
                <p className="text-lg font-bold font-mono text-emerald-400">{currentBalance.toLocaleString()}.00</p>
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