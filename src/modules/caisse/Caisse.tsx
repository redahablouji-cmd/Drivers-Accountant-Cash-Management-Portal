import * as React from "react";
import { Plus, Minus, Search, Download, Filter, Pencil, Trash2, CalendarDays, CheckCircle2, Save, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  reference: "", paymentMethod: "", description: "", amount: ""
};

interface CaisseProps { profile?: any; }

export function Caisse({ profile }: CaisseProps) {
  const [transactions,  setTransactions]  = React.useState<any[]>([]);
  const [activeForm,    setActiveForm]    = React.useState<'none' | 'in' | 'out'>('none');
  const [formData,      setFormData]      = React.useState(emptyForm);
  const [editingTx,     setEditingTx]     = React.useState<any | null>(null);
  const [editForm,      setEditForm]      = React.useState<any>({});

  React.useEffect(() => {
    supabase.from('caisse_transactions')
      .select('*').order('created_at', { ascending: false })
      .then(({ data }) => setTransactions(data || []));
  }, []);

  const currentBalance = transactions.length > 0 ? (transactions[0].balance || 0) : 0;

  const handleSaveTransaction = async () => {
    const txAmount = Number(formData.amount) || 0;
    if (txAmount <= 0) return;
    const nextBalance = activeForm === 'in' ? currentBalance + txAmount : currentBalance - txAmount;
    const { data, error } = await supabase.from('caisse_transactions').insert({
      company_id:     profile?.company_id || null,
      accountant_id:  profile?.id         || null,
      reference:      formData.reference  || (activeForm === 'in' ? 'ENTRÉE' : 'SORTIE'),
      entity:         formData.paymentMethod || 'Espèces',
      description:    formData.description,
      amount:         txAmount,
      type:           activeForm === 'in' ? 'in' : 'out',
      balance:        nextBalance,
      payment_method: formData.paymentMethod || 'Espèces',
      date:           formData.date,
    }).select().single();
    if (!error && data) setTransactions([data, ...transactions]);
    else if (error) alert(`Erreur: ${error.message}`);
    setActiveForm('none');
    setFormData(emptyForm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette transaction ?')) return;
    const { error } = await supabase.from('caisse_transactions').delete().eq('id', id);
    if (!error) setTransactions(transactions.filter(t => t.id !== id));
    else alert(`Erreur: ${error.message}`);
  };

  const handleEditSave = async () => {
    const { error } = await supabase.from('caisse_transactions').update({
      reference:      editForm.reference,
      entity:         editForm.entity,
      description:    editForm.description,
      amount:         parseFloat(editForm.amount),
      payment_method: editForm.entity,
      date:           editForm.date,
    }).eq('id', editingTx.id);
    if (!error) {
      setTransactions(transactions.map(t => t.id === editingTx.id ? { ...t, ...editForm } : t));
      setEditingTx(null);
    } else alert(`Erreur: ${error.message}`);
  };

  const exportXLS = () => {
    if (!transactions.length) return;
    const headers = ['Date','N.B','Mode Paiement','Libellé','Entrée','Sortie','Solde'];
    const rows = transactions.map(t => [
      t.date, t.reference, t.entity, t.description,
      t.type === 'in'  ? t.amount : '',
      t.type === 'out' ? t.amount : '',
      t.balance
    ].join('\t'));
    const blob = new Blob([[headers.join('\t'), ...rows].join('\n')], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'caisse.xls'; a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6 bg-white min-h-full">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">La Caisse (Cash Ledger)</h1>
          <p className="text-sm text-slate-500">Gérez les flux de trésorerie et les dépôts (Entrées / Sorties)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportXLS} className="h-9 border-slate-200 text-slate-600 bg-white">
            <Download size={16} className="mr-2" /> Export XLS
          </Button>
          <Button onClick={() => { setActiveForm('in'); setFormData(emptyForm); }}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
            <Plus size={16} className="mr-2" /> Add Cash In
          </Button>
          <Button onClick={() => { setActiveForm('out'); setFormData(emptyForm); }}
            className="h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm">
            <Minus size={16} className="mr-2" /> Add Cash Out
          </Button>
        </div>
      </div>

      {/* Entry Form */}
      <AnimatePresence mode="wait">
        {activeForm !== 'none' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className={`border-2 ${activeForm === 'in' ? 'border-emerald-500' : 'border-rose-500'} shadow-md`}>
              <div className={`p-3 flex justify-between items-center border-b ${activeForm === 'in' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${activeForm === 'in' ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {activeForm === 'in' ? 'Nouvelle Entrée de Caisse' : 'Nouvelle Sortie de Caisse'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setActiveForm('none')} className="h-6 w-6 p-0">
                  <X size={16} className={activeForm === 'in' ? 'text-emerald-600' : 'text-rose-600'} />
                </Button>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Date</Label>
                    <Input type="date" name="date" value={formData.date}
                      onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="h-9 text-xs font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">N.B (Référence)</Label>
                    <Input name="reference" value={formData.reference}
                      onChange={e => setFormData(p => ({ ...p, reference: e.target.value }))}
                      className="h-9 text-xs font-mono" placeholder="Ex: FACT-001" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Mode de Paiement</Label>
                    <Select onValueChange={val => setFormData(p => ({ ...p, paymentMethod: val }))} value={formData.paymentMethod}>
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
                    <Input type="number" name="amount" value={formData.amount}
                      onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                      className="h-9 text-sm font-bold bg-slate-50" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Libellé</Label>
                    <div className="flex gap-2">
                      <Input name="description" value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        className="h-9 text-xs flex-1" placeholder="Raison de la transaction..." />
                      <Button onClick={handleSaveTransaction}
                        className={`h-9 font-bold text-white text-[11px] uppercase tracking-wider px-5 ${activeForm === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
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
          <input type="text" placeholder="Rechercher par N.B, Libellé ou Mode de paiement..."
            className="w-full bg-slate-50 border-none rounded-md py-1.5 pl-9 pr-4 text-xs focus:ring-0" />
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 text-xs">
          <CalendarDays size={14} className="mr-2" /> Aujourd'hui
        </Button>
        <div className="w-px h-4 bg-slate-200" />
        <Button variant="ghost" size="sm" className="h-8 text-slate-500 text-xs">
          <Filter size={14} className="mr-2" /> Filtres
        </Button>
      </div>

      {/* Table */}
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
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    Aucune transaction enregistrée.
                  </TableCell>
                </TableRow>
              ) : transactions.map((tx) => (
                <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="text-xs font-medium text-slate-500 font-mono py-3">{tx.date || tx.timestamp}</TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white text-slate-700 font-mono">
                      {tx.reference}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-700 py-3 uppercase tracking-wider">{tx.entity}</TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 font-medium">{tx.description}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-600 text-right py-3 bg-emerald-50/30">
                    {tx.type === 'in' ? `+ ${Number(tx.amount).toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-rose-600 text-right py-3 bg-rose-50/30">
                    {tx.type === 'out' ? `- ${Number(tx.amount).toLocaleString()}.00` : ''}
                  </TableCell>
                  <TableCell className="text-[13px] font-black text-slate-900 text-right py-3 font-mono">
                    {Number(tx.balance).toLocaleString()}.00
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingTx(tx); setEditForm({ ...tx }); }}
                        className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reconciliation */}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Modifier la Transaction</h3>
              {[
                { label: 'Date',        key: 'date',        type: 'date' },
                { label: 'N.B',         key: 'reference',   type: 'text' },
                { label: 'Libellé',     key: 'description', type: 'text' },
                { label: 'Montant MAD', key: 'amount',      type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                  <input type={type} value={editForm[key] || ''}
                    onChange={e => setEditForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditSave}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer">
                  Enregistrer
                </button>
                <button onClick={() => setEditingTx(null)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg cursor-pointer">
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}