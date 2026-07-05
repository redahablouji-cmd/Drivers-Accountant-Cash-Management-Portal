import * as React from "react";
import { RefreshCw, Plus, Download, Pencil, Trash2, Eye, Loader2, X, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FleetFixProps {
  profile: any;
}

export function FleetFix({ profile }: FleetFixProps) {
  const [mechanics, setMechanics] = React.useState<any[]>([]);
  const [selectedMechanic, setSelectedMechanic] = React.useState<any>(null);
  const [maintenance, setMaintenance] = React.useState<any[]>([]);
  const [topups, setTopups] = React.useState<any[]>([]);
  const [loadingFleet, setLoadingFleet] = React.useState(false);
  const [topupAmount, setTopupAmount] = React.useState('');
  const [topupNotes, setTopupNotes] = React.useState('');
  const [viewingReceipt, setViewingReceipt] = React.useState<string | null>(null);
  const [fleetReservations, setFleetReservations] = React.useState<any[]>([]);
  const [fleetResView, setFleetResView] = React.useState<'calendar' | 'driver'>('calendar');
  const [fleetResDriver, setFleetResDriver] = React.useState('');
  const [fleetResWeekOffset, setFleetResWeekOffset] = React.useState(0);
  const [fleetDrivers, setFleetDrivers] = React.useState<any[]>([]);

  const companyId = profile?.company_id;

  const fetchMechanics = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('staff_profiles')
      .select('id, full_name, employee_code').eq('company_id', companyId).eq('role', 'mechanic');
    setMechanics(data || []);
  };

  const fetchMechanicData = async (mechanicId: string) => {
    setLoadingFleet(true);
    const [{ data: recs }, { data: tops }] = await Promise.all([
      supabase.from('maintenance_records').select('*').eq('mechanic_id', mechanicId).order('created_at', { ascending: false }),
      supabase.from('fund_topups').select('*').eq('mechanic_id', mechanicId).order('created_at', { ascending: false }),
    ]);
    setMaintenance(recs || []);
    setTopups(tops || []);
    setLoadingFleet(false);
  };

  const fetchFleetReservations = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('maintenance_reservations').select('*').eq('company_id', companyId).order('start_time', { ascending: true });
    setFleetReservations(data || []);
  };

  const fetchFleetDrivers = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('fleet_drivers').select('*').eq('company_id', companyId).order('code', { ascending: true });
    setFleetDrivers(data || []);
  };

  React.useEffect(() => {
    if (companyId) { fetchMechanics(); fetchFleetDrivers(); fetchFleetReservations(); }
  }, [companyId]);

  React.useEffect(() => {
    if (selectedMechanic) fetchMechanicData(selectedMechanic.id);
  }, [selectedMechanic?.id]);

  const mechanicBalance = () => {
    const totalIn = topups.reduce((s, t) => s + (t.amount || 0), 0);
    const totalOut = maintenance.reduce((s, r) => s + (r.total_cost || 0), 0);
    return totalIn - totalOut;
  };

  const handleTopup = async () => {
    if (!selectedMechanic || !topupAmount) return;
    const { error } = await supabase.from('fund_topups').insert({
      company_id: companyId, mechanic_id: selectedMechanic.id,
      amount: parseFloat(topupAmount), notes: topupNotes || null,
    });
    if (!error) { setTopupAmount(''); setTopupNotes(''); fetchMechanicData(selectedMechanic.id); }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Supprimer cette fiche ?')) return;
    const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
    if (!error && selectedMechanic) fetchMechanicData(selectedMechanic.id);
  };

  const handleDeleteTopup = async (id: string) => {
    if (!confirm('Supprimer ce versement ?')) return;
    const { error } = await supabase.from('fund_topups').delete().eq('id', id);
    if (!error && selectedMechanic) fetchMechanicData(selectedMechanic.id);
  };

  return (
    <div className="p-6">
      <div className="mb-6 bg-slate-900 text-white rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950 mb-2">
              <Wrench className="w-3.5 h-3.5" /> FleetFix
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">Gestion des Mécaniciens</h1>
            <p className="text-sm text-slate-400 mt-1">Fonds de travail et fiches d'entretien en temps réel.</p>
          </div>
          <button onClick={() => { fetchMechanics(); if (selectedMechanic) fetchMechanicData(selectedMechanic.id); }}
            className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mécaniciens</p>
          {mechanics.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucun mécanicien trouvé.</p>
          ) : mechanics.map(m => (
            <button key={m.id} onClick={() => setSelectedMechanic(m)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all cursor-pointer ${selectedMechanic?.id === m.id ? 'bg-blue-600 border-blue-700 text-white' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'}`}>
              <p className={`text-sm font-bold ${selectedMechanic?.id === m.id ? 'text-white' : 'text-slate-800'}`}>{m.full_name}</p>
              <p className={`text-[10px] font-mono ${selectedMechanic?.id === m.id ? 'text-blue-200' : 'text-slate-400'}`}>{m.employee_code}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!selectedMechanic ? (
            <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center h-48">
              <p className="text-slate-400 text-sm">Sélectionnez un mécanicien</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 text-white rounded-xl p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solde — {selectedMechanic.full_name}</p>
                <p className={`text-3xl font-black ${mechanicBalance() >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {mechanicBalance().toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Entrées: {topups.reduce((s, t) => s + t.amount, 0).toLocaleString('fr-MA')} MAD —
                  Sorties: {maintenance.reduce((s, r) => s + r.total_cost, 0).toLocaleString('fr-MA')} MAD
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ajouter des Fonds</p>
                <div className="flex gap-3">
                  <input type="number" placeholder="Montant (MAD)" value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
                    className="flex-1 h-10 rounded-lg border-2 border-slate-200 px-3 text-sm font-bold focus:outline-none focus:border-blue-500" />
                  <input type="text" placeholder="Note (optionnel)" value={topupNotes} onChange={e => setTopupNotes(e.target.value)}
                    className="flex-1 h-10 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500" />
                  <button onClick={handleTopup}
                    className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-lg flex items-center gap-1.5 cursor-pointer">
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-emerald-50">
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Fonds Accordés — {topups.length} versements</p>
                </div>
                {topups.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-sm">Aucun fonds versé.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>{['Date', 'Montant', 'Note', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {topups.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-xs text-slate-600">{t.created_at?.split('T')[0]}</td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-600">+{Number(t.amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{t.notes || '—'}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDeleteTopup(t.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-rose-50">
                  <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Fiches d'Entretien — {maintenance.length} réparations</p>
                </div>
                {loadingFleet ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /></div>
                ) : maintenance.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">Aucune fiche.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>{['Date', 'Camion', 'Catégorie', 'Pièce', 'Garage', 'Coût', 'Reçu', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {maintenance.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-xs text-slate-600">{r.date}</td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{r.truck_plate}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{r.type}</td>
                            <td className="px-4 py-3 text-xs text-slate-700 font-semibold">{r.part_fixed}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{r.garage_name}</td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-red-600">-{r.total_cost?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3">
                              {r.receipt_url ? (
                                <button onClick={() => setViewingReceipt(r.receipt_url)} className="text-blue-600"><Eye size={16} /></button>
                              ) : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleDeleteRecord(r.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Planning des Réservations */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planning Maintenance</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button onClick={() => setFleetResView('calendar')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase cursor-pointer ${fleetResView === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                Calendrier
              </button>
              <button onClick={() => setFleetResView('driver')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase cursor-pointer ${fleetResView === 'driver' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                Par Chauffeur
              </button>
            </div>
          </div>
          <button onClick={() => { fetchFleetReservations(); fetchFleetDrivers(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} /> Charger
          </button>
        </div>

        {fleetResView === 'calendar' ? (() => {
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay() + 1 + fleetResWeekOffset * 7);
          const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
          const trucks = [...new Set(fleetReservations.map((r: any) => r.truck_plate))].sort();
          const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          return (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setFleetResWeekOffset(p => p - 1)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">← Sem. préc.</button>
                <p className="text-xs font-bold text-slate-700">{days[0].toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' })} — {days[6].toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <button onClick={() => setFleetResWeekOffset(p => p + 1)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">Sem. suiv. →</button>
              </div>
              {trucks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune réservation. Cliquez "Charger" pour actualiser.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase text-left border-b border-slate-200 w-28">Camion</th>
                      {days.map((d, i) => {
                        const isToday = d.toDateString() === new Date().toDateString();
                        return <th key={i} className={`px-2 py-2 text-[9px] font-black uppercase text-center border-b border-slate-200 ${isToday ? 'bg-blue-50 text-blue-700' : 'text-slate-400'}`}>{dayNames[i]}<br />{d.getDate()}/{d.getMonth() + 1}</th>;
                      })}
                    </tr></thead>
                    <tbody>
                      {trucks.map(plate => (
                        <tr key={plate} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-3 py-3 font-mono text-xs font-bold text-blue-600">{plate}</td>
                          {days.map((day, di) => {
                            const dayStr = day.toISOString().split('T')[0];
                            const dayRes = fleetReservations.filter((r: any) => r.truck_plate === plate && r.start_time?.startsWith(dayStr));
                            return (
                              <td key={di} className="px-1 py-2 text-center align-top">
                                {dayRes.length > 0 ? dayRes.map((r: any) => {
                                  const col = r.statut === 'planifié' ? 'bg-amber-100 text-amber-800 border-amber-300' : r.statut === 'en_cours' ? 'bg-blue-100 text-blue-800 border-blue-300' : r.statut === 'terminé' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300';
                                  return <div key={r.id} className={`rounded-lg border px-1.5 py-1 mb-1 ${col}`}>
                                    <p className="text-[8px] font-black uppercase truncate">{r.type_maintenance}</p>
                                    <p className="text-[7px] font-mono">{new Date(r.start_time).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })} · {r.estimated_duration}</p>
                                    {r.driver_name && <p className="text-[7px] truncate">{r.driver_name}</p>}
                                  </div>;
                                }) : <span className="text-[8px] text-emerald-400 font-bold">✓</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })() : (
          <div className="p-4">
            <div className="mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrer par Chauffeur</label>
              <select value={fleetResDriver} onChange={e => setFleetResDriver(e.target.value)}
                className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500">
                <option value="">— Tous les chauffeurs —</option>
                {fleetDrivers.map((d: any) => (
                  <option key={d.id} value={d.nom_prenom}>{d.code} — {d.nom_prenom}</option>
                ))}
              </select>
            </div>
            {(() => {
              const filtered = fleetResDriver ? fleetReservations.filter((r: any) => r.driver_name?.toLowerCase().includes(fleetResDriver.toLowerCase())) : fleetReservations;
              if (filtered.length === 0) return <p className="text-sm text-slate-400 text-center py-8">Aucune réservation trouvée.</p>;
              return (
                <div className="space-y-3">
                  {filtered.map((r: any) => {
                    const start = new Date(r.start_time);
                    const col = r.statut === 'planifié' ? 'border-amber-300 bg-amber-50' : r.statut === 'en_cours' ? 'border-blue-300 bg-blue-50' : r.statut === 'terminé' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50';
                    return (
                      <div key={r.id} className={`rounded-xl border-2 p-4 ${col}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600">{r.truck_plate}</span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/60">{r.statut}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{start.toLocaleDateString('fr-MA')} à {start.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{r.type_maintenance}</p>
                        {r.driver_name && <p className="text-xs text-slate-600 mt-0.5">Chauffeur: <strong>{r.driver_name}</strong></p>}
                        {r.mechanic_name && <p className="text-xs text-slate-500">Mécanicien: {r.mechanic_name}</p>}
                        {r.description && <p className="text-[11px] text-slate-500 mt-1">{r.description}</p>}
                        <p className="text-[10px] font-mono text-slate-400 mt-1">Durée: {r.estimated_duration}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingReceipt(null)}>
          <div className="bg-white rounded-xl p-2 max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <img src={viewingReceipt} alt="Reçu" className="w-full rounded-lg" />
            <button onClick={() => setViewingReceipt(null)} className="mt-2 w-full py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 cursor-pointer">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}