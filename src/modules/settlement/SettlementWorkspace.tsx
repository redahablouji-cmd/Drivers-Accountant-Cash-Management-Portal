import * as React from "react";
import { Search, FileText, Plus, Save, X, History, ArrowRight, Receipt, MapPin, Pencil, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const emptyForm = {
  invoiceRef: '', dateDepart: new Date().toISOString().split('T')[0], agent: 'Admin', depart: '', arrivee: '', client: '', justification: '',
  fraisDeplacement: 0, peage: 0, gendarme: 0, reparation: 0, gasoilExterne: 0, autre: 0, entree: 0
};

type ViewMode = 'history' | 'depart' | 'arrivee' | 'edit';

export function SettlementWorkspace({ profile }: { profile: any }) {
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = React.useState<any>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('history');
  const [formData, setFormData] = React.useState(emptyForm);
  const [editingRecord, setEditingRecord] = React.useState<any | null>(null);
  const [editForm, setEditForm] = React.useState<any>({});
  const [completingTrip, setCompletingTrip] = React.useState<any | null>(null);
  const [blOtList, setBlOtList] = React.useState<string[]>(['']);
  const [driverSearch, setDriverSearch] = React.useState('');
  const [clientsList, setClientsList] = React.useState<any[]>([]);
  const [clientSearch, setClientSearch] = React.useState('');

  React.useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from('clients').select('id, nom').eq('company_id', profile.company_id).order('nom', { ascending: true })
      .then(({ data }) => setClientsList(data || []));
    supabase.from('fleet_drivers')
      .select('id, nom_prenom, immatriculation, code')
      .eq('company_id', profile.company_id)
      .order('code', { ascending: true })
      .then(({ data }) => {
        const list = (data || []).map((d: any) => ({
          id: d.id, full_name: d.nom_prenom, vehicle_plate: d.immatriculation, employee_code: d.code,
        }));
        setDrivers(list);
        if (list.length > 0) setSelectedDriver({ ...list[0], settlements: [] });
      });
  }, [profile?.company_id]);

  const fetchSettlements = React.useCallback(() => {
    if (!selectedDriver?.id) return;
    supabase.from('settlement_records')
      .select('*')
      .eq('driver_id', selectedDriver.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSelectedDriver((prev: any) => prev ? ({ ...prev, settlements: data || [] }) : prev);
      });
  }, [selectedDriver?.id]);

  React.useEffect(() => { fetchSettlements(); }, [fetchSettlements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatedSortie =
    Number(formData.fraisDeplacement) + Number(formData.peage) +
    Number(formData.gendarme) + Number(formData.reparation) +
    Number(formData.gasoilExterne) + Number(formData.autre);

  // Running balance across all trips
  const runningBalance = React.useMemo(() => {
    if (!selectedDriver?.settlements) return 0;
    return selectedDriver.settlements.reduce((acc: number, s: any) => {
      return acc + (Number(s.entree) || 0) - (Number(s.sortie) || 0);
    }, 0);
  }, [selectedDriver?.settlements]);

  const openTrips = React.useMemo(() => {
    if (!selectedDriver?.settlements) return [];
    return selectedDriver.settlements.filter((s: any) => s.trip_status === 'en_route');
  }, [selectedDriver?.settlements]);

  // SAVE DEPART
  const handleSaveDepart = async () => {
    if (!selectedDriver) return;
    const { error } = await supabase.from('settlement_records').insert({
      driver_id: selectedDriver.id,
      driver_name: selectedDriver.full_name,
      trip_type: 'depart',
      trip_status: 'en_route',
      date_saisie: new Date().toISOString().split('T')[0],
      date_depart: formData.dateDepart || null,
      client: formData.client,
      depart: formData.depart,
      arrivee: formData.arrivee,
      invoice_ref: null,
      justification: null,
      frais_deplacement: 0, peage: 0, gendarme: 0, reparation: 0, gasoil_externe: 0, autre: 0,
      entree: Number(formData.entree) || 0,
      sortie: 0,
      solde: Number(formData.entree) || 0,
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    setFormData(emptyForm);
    setViewMode('history');
    fetchSettlements();
  };

  // COMPLETE ARRIVEE (update existing depart record)
  const handleCompleteArrivee = async () => {
    if (!completingTrip) return;
    const refs = blOtList.filter(r => r.trim()).join(', ');
    const sortie = calculatedSortie;
    const newSolde = (Number(completingTrip.entree) || 0) - sortie;
    const { error } = await supabase.from('settlement_records').update({
      trip_type: 'completed',
      trip_status: 'completed',
      invoice_ref: refs || null,
      justification: formData.justification || null,
      frais_deplacement: Number(formData.fraisDeplacement) || 0,
      peage: Number(formData.peage) || 0,
      gendarme: Number(formData.gendarme) || 0,
      reparation: Number(formData.reparation) || 0,
      gasoil_externe: Number(formData.gasoilExterne) || 0,
      autre: Number(formData.autre) || 0,
      sortie: sortie,
      solde: newSolde,
    }).eq('id', completingTrip.id);
    if (error) { alert('Erreur: ' + error.message); return; }
    setCompletingTrip(null);
    setFormData(emptyForm);
    setBlOtList(['']);
    setViewMode('history');
    fetchSettlements();
  };

  // DELETE
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    const { error } = await supabase.from('settlement_records').delete().eq('id', id);
    if (!error) fetchSettlements();
    else alert('Erreur: ' + error.message);
  };

  // EDIT SAVE
  const handleEditRecordSave = async () => {
    const { error } = await supabase.from('settlement_records').update({
      client: editForm.client,
      depart: editForm.depart,
      arrivee: editForm.arrivee,
      invoice_ref: editForm.invoice_ref,
      entree: parseFloat(editForm.entree) || 0,
      sortie: parseFloat(editForm.sortie) || 0,
      solde: parseFloat(editForm.solde) || 0,
    }).eq('id', editingRecord.id);
    if (!error) { setEditingRecord(null); fetchSettlements(); }
    else alert('Erreur: ' + error.message);
  };

  const filteredDrivers = driverSearch
    ? drivers.filter(d => d.full_name?.toLowerCase().includes(driverSearch.toLowerCase()) || d.vehicle_plate?.toLowerCase().includes(driverSearch.toLowerCase()))
    : drivers;

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* Left Pane — Driver list */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chauffeurs</span>
        </div>
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Rechercher..." value={driverSearch} onChange={e => setDriverSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded py-1 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredDrivers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">Aucun chauffeur trouvé.</div>
          ) : filteredDrivers.map((driver) => (
            <button key={driver.id}
              onClick={() => { if (selectedDriver?.id === driver.id) return; setSelectedDriver({ ...driver, settlements: [] }); setViewMode('history'); setCompletingTrip(null); }}
              className={cn("w-full p-4 text-left transition-all",
                selectedDriver?.id === driver.id ? "bg-blue-50/50 border-l-2 border-blue-600" : "hover:bg-slate-100/50")}>
              <span className={cn("text-xs font-bold", selectedDriver?.id === driver.id ? "text-slate-900" : "text-slate-700")}>
                {driver.full_name}
              </span>
              <div className="text-[10px] text-slate-500 mt-0.5">Plaque: {driver.vehicle_plate || '—'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30">
        {!selectedDriver ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Sélectionnez un chauffeur</p>
          </div>
        ) : (
          <div className="p-8 max-w-6xl mx-auto space-y-6 pb-24">

            {/* Header + Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center shadow-sm">
                  <FileText className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{selectedDriver.full_name}</h1>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider">Plaque: {selectedDriver.vehicle_plate || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Solde Global</p>
                  <p className={cn("text-xl font-black", runningBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {runningBalance >= 0 ? '+' : ''}{runningBalance.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                  </p>
                  <p className="text-[8px] text-slate-400">{runningBalance > 0 ? 'Le chauffeur doit à la société' : runningBalance < 0 ? 'La société doit au chauffeur' : 'Aucune dette'}</p>
                </div>
                {viewMode === 'history' ? (
                  <Button onClick={() => { setFormData(emptyForm); setViewMode('depart'); }}
                    className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider px-6">
                    <Plus className="w-4 h-4 mr-2" /> Nouveau Départ
                  </Button>
                ) : (
                  <Button onClick={() => { setViewMode('history'); setCompletingTrip(null); setFormData(emptyForm); setBlOtList(['']); }} variant="outline"
                    className="h-8 text-[10px] font-bold uppercase tracking-wider bg-white">
                    <X className="w-4 h-4 mr-2" /> Annuler
                  </Button>
                )}
              </div>
            </div>

            {/* Open trips alert */}
            {viewMode === 'history' && openTrips.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{openTrips.length} voyage(s) en cours</p>
                </div>
                <div className="space-y-2">
                  {openTrips.map((trip: any) => (
                    <div key={trip.id} className="flex items-center justify-between bg-white rounded-lg border border-amber-200 p-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{trip.depart} → {trip.arrivee}</p>
                        <p className="text-[10px] text-slate-500">Client: {trip.client || '—'} · Avance: {Number(trip.entree).toLocaleString('fr-MA')} MAD · {trip.date_depart || trip.date_saisie}</p>
                      </div>
                      <Button onClick={() => {
                        setCompletingTrip(trip);
                        setFormData(emptyForm);
                        setBlOtList(['']);
                        setViewMode('arrivee');
                      }}
                        className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase px-4">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Compléter Arrivée
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HISTORY VIEW */}
            {viewMode === 'history' && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Historique des Voyages</h2>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Date</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Statut</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Client</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Trajet</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">BL/OT</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Avance</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Dépenses</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px] text-right">Solde</th>
                      <th className="p-3 font-bold text-slate-500 uppercase text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!selectedDriver.settlements || selectedDriver.settlements.length === 0 ? (
                      <tr><td colSpan={9} className="p-6 text-center text-slate-400">Aucun enregistrement.</td></tr>
                    ) : selectedDriver.settlements.map((r: any) => {
                      const isOpen = r.trip_status === 'en_route';
                      return (
                        <tr key={r.id} className={cn("hover:bg-slate-50", isOpen && "bg-amber-50/30")}>
                          <td className="p-3 font-mono text-[10px]">{r.date_depart || r.date_saisie}</td>
                          <td className="p-3">
                            <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                              isOpen ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                              {isOpen ? 'En Route' : 'Terminé'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">{r.client || '—'}</td>
                          <td className="p-3 text-slate-600">{r.depart && r.arrivee ? r.depart + ' → ' + r.arrivee : '—'}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">{r.invoice_ref || '—'}</td>
                          <td className="p-3 text-right font-medium text-emerald-600">{Number(r.entree) > 0 ? '+' + Number(r.entree).toLocaleString('fr-MA') : '—'}</td>
                          <td className="p-3 text-right font-medium text-rose-600">{Number(r.sortie) > 0 ? '-' + Number(r.sortie).toLocaleString('fr-MA') : '—'}</td>
                          <td className={cn("p-3 text-right font-bold", Number(r.solde) >= 0 ? "text-emerald-700" : "text-rose-700")}>
                            {Number(r.solde).toLocaleString('fr-MA')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {isOpen && (
                                <button onClick={() => { setCompletingTrip(r); setFormData(emptyForm); setBlOtList(['']); setViewMode('arrivee'); }}
                                  className="p-1.5 rounded hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-colors" title="Compléter">
                                  <CheckCircle2 size={13} />
                                </button>
                              )}
                              <button onClick={() => { setEditingRecord(r); setEditForm({ ...r, invoiceRef: r.invoice_ref }); }}
                                className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => handleDeleteRecord(r.id)}
                                className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {/* DEPART FORM */}
            {viewMode === 'depart' && (
              <Card className="bg-white shadow-sm overflow-hidden border-t-4 border-t-blue-500">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-blue-800">Nouveau Départ — Avance Chauffeur</h2>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Informations du Voyage</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Date Départ</Label><Input type="date" name="dateDepart" value={formData.dateDepart} onChange={handleInputChange} className="h-8 text-xs" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Client</Label>
                        <div className="relative">
                          <input type="text" value={formData.client} placeholder="Rechercher client..."
                            onChange={e => { setFormData(p => ({ ...p, client: e.target.value })); setClientSearch(e.target.value); }}
                            onFocus={() => setClientSearch(formData.client || '')}
                            className="w-full h-8 rounded-md border border-slate-200 px-3 text-xs focus:outline-none focus:border-blue-500" />
                          {clientSearch !== null && clientsList.filter(c => c.nom?.toLowerCase().includes((formData.client || '').toLowerCase())).length > 0 && formData.client && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                              {clientsList.filter(c => c.nom?.toLowerCase().includes(formData.client.toLowerCase())).map(c => (
                                <button key={c.id} onClick={() => { setFormData(p => ({ ...p, client: c.nom })); setClientSearch(''); }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer">{c.nom}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Départ</Label><Input name="depart" value={formData.depart} onChange={handleInputChange} className="h-8 text-xs" placeholder="Ville départ" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Arrivée</Label><Input name="arrivee" value={formData.arrivee} onChange={handleInputChange} className="h-8 text-xs" placeholder="Ville arrivée" /></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Avance Accordée</h3>
                    <div className="w-1/3 space-y-2">
                      <Label className="text-[10px] font-bold text-emerald-600">Montant Avance (MAD)</Label>
                      <Input type="number" name="entree" value={formData.entree || ''} onChange={handleInputChange}
                        className="h-10 text-lg font-bold text-emerald-600 border-emerald-200" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center justify-between">
                    <div>
                      <Label className="text-[10px] text-slate-500 uppercase font-bold">Avance à remettre</Label>
                      <div className="text-xl font-black text-emerald-600">+{Number(formData.entree) || 0} MAD</div>
                    </div>
                    <Button onClick={handleSaveDepart} disabled={!formData.depart || !formData.arrivee}
                      className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs px-8">
                      <Save className="w-4 h-4 mr-2" /> Enregistrer Départ
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* ARRIVEE FORM (completing an open trip) */}
            {viewMode === 'arrivee' && completingTrip && (
              <Card className="bg-white shadow-sm overflow-hidden border-t-4 border-t-emerald-500">
                <div className="p-4 border-b border-slate-200 bg-emerald-50/50">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                    Arrivée — {completingTrip.depart} → {completingTrip.arrivee}
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Client: {completingTrip.client || '—'} · Avance: {Number(completingTrip.entree).toLocaleString('fr-MA')} MAD · Départ: {completingTrip.date_depart || completingTrip.date_saisie}
                  </p>
                </div>
                <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">N° Fac / BL-OT</h3>
                    <div className="space-y-2">
                      {blOtList.map((ref, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={ref} onChange={e => { const nw = [...blOtList]; nw[i] = e.target.value; setBlOtList(nw); }}
                            className="h-8 text-xs font-mono flex-1" placeholder={`BL-OT #${i + 1}`} />
                          {blOtList.length > 1 && (
                            <button onClick={() => setBlOtList(blOtList.filter((_, j) => j !== i))}
                              className="p-1 text-rose-400 hover:text-rose-600"><X size={14} /></button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => setBlOtList([...blOtList, ''])}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                        <Plus size={12} /> Ajouter un BL-OT
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Justification</h3>
                    <Input name="justification" value={formData.justification} onChange={handleInputChange} className="h-8 text-xs" placeholder="Notes, reçus vérifiés..." />
                  </div>
                  <div>
                    <h3 className="text-[10px] text-slate-400 uppercase font-bold mb-4 border-b pb-2">Dépenses du Voyage (Sortie)</h3>
                    <div className="grid grid-cols-6 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Frais Dép.</Label><Input type="number" name="fraisDeplacement" value={formData.fraisDeplacement || ''} onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Péage</Label><Input type="number" name="peage" value={formData.peage || ''} onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Gendarme</Label><Input type="number" name="gendarme" value={formData.gendarme || ''} onChange={handleInputChange} className="h-8 text-xs font-mono text-rose-600" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Réparation</Label><Input type="number" name="reparation" value={formData.reparation || ''} onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Gasoil Ext.</Label><Input type="number" name="gasoilExterne" value={formData.gasoilExterne || ''} onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold">Autre</Label><Input type="number" name="autre" value={formData.autre || ''} onChange={handleInputChange} className="h-8 text-xs font-mono" /></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-[10px] text-slate-500 uppercase font-bold">Avance Donnée</Label>
                        <div className="text-lg font-black text-emerald-600">+{Number(completingTrip.entree).toLocaleString('fr-MA')} MAD</div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 uppercase font-bold">Total Dépenses</Label>
                        <div className="text-lg font-black text-rose-600">-{calculatedSortie.toLocaleString('fr-MA')} MAD</div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 uppercase font-bold">Solde du Voyage</Label>
                        {(() => {
                          const solde = Number(completingTrip.entree) - calculatedSortie;
                          return (
                            <div>
                              <div className={cn("text-lg font-black", solde >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {solde >= 0 ? '+' : ''}{solde.toLocaleString('fr-MA')} MAD
                              </div>
                              <p className="text-[8px] text-slate-400 mt-0.5">
                                {solde > 0 ? 'Chauffeur doit rendre' : solde < 0 ? 'Société doit au chauffeur' : 'Équilibré'}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleCompleteArrivee}
                        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs px-8">
                        <Save className="w-4 h-4 mr-2" /> Finaliser le Voyage
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Modifier</h3>
              {[
                { label: 'Client', key: 'client', type: 'text' },
                { label: 'Départ', key: 'depart', type: 'text' },
                { label: 'Arrivée', key: 'arrivee', type: 'text' },
                { label: 'N° BL-OT', key: 'invoice_ref', type: 'text' },
                { label: 'Avance MAD', key: 'entree', type: 'number' },
                { label: 'Dépenses MAD', key: 'sortie', type: 'number' },
                { label: 'Solde MAD', key: 'solde', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                  <input type={type} value={editForm[key] || ''}
                    onChange={e => setEditForm((p: any) => ({ ...p, [key]: e.target.value }))}
                    className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditRecordSave} className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer">Enregistrer</button>
                <button onClick={() => setEditingRecord(null)} className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg cursor-pointer">Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}