import * as React from "react";
import { RefreshCw, Plus, Download, Search, X, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function PrestationView({ profile: _profile }: { profile: any }) {
  const [profile, setProfile] = React.useState<any>(_profile);
  React.useEffect(() => {
    if (_profile) { setProfile(_profile); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      supabase.from('staff_profiles').select('id, full_name, role, company_id').eq('auth_user_id', session.user.id).maybeSingle()
        .then(({ data }) => { if (data) setProfile(data); });
    });
  }, [_profile]);

  const [suiviList, setSuiviList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [month, setMonth] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const [clientsList, setClientsList] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({ date: new Date().toISOString().split('T')[0], client: '', bl_client: '', client_dautre: '', matricule: '', type: '', facture: '', bon_commande: '', ot_bl_bs_be: '', depart: '', arrivee: '', manutention: '', immobilisation: '', prix_ht: '', prix_ttc: '', cout_revient: '', benefice: '' });

  const companyId = profile?.company_id;

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('suivi_prestation').select('*').eq('company_id', companyId).order('date', { ascending: false });
    setSuiviList(data || []);
    setLoading(false);
  };

  const fetchClients = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('clients').select('id, nom, ice').eq('company_id', companyId).order('nom');
    setClientsList(data || []);
  };

  React.useEffect(() => { if (companyId) { fetchData(); fetchClients(); } }, [companyId]);

  const handleSave = async () => {
    const payload = {
      company_id: companyId, date: form.date || null, client: form.client || null,
      bl_client: form.bl_client || null, client_dautre: form.client_dautre || null,
      matricule: form.matricule || null, type: form.type || null, facture: form.facture || null,
      bon_commande: form.bon_commande || null, ot_bl_bs_be: form.ot_bl_bs_be || null,
      depart: form.depart || null, arrivee: form.arrivee || null,
      manutention: parseFloat(form.manutention) || 0, immobilisation: parseFloat(form.immobilisation) || 0,
      prix_ht: parseFloat(form.prix_ht) || 0, prix_ttc: parseFloat(form.prix_ttc) || 0,
      cout_revient: parseFloat(form.cout_revient) || 0, benefice: parseFloat(form.benefice) || 0,
    };
    if (editing) {
      const { error } = await supabase.from('suivi_prestation').update(payload).eq('id', editing.id);
      if (!error) { setEditing(null); setShowForm(false); fetchData(); } else alert('Erreur: ' + error.message);
    } else {
      const { error } = await supabase.from('suivi_prestation').insert(payload);
      if (!error) { setShowForm(false); fetchData(); } else alert('Erreur: ' + error.message);
    }
    setForm({ date: new Date().toISOString().split('T')[0], client: '', bl_client: '', client_dautre: '', matricule: '', type: '', facture: '', bon_commande: '', ot_bl_bs_be: '', depart: '', arrivee: '', manutention: '', immobilisation: '', prix_ht: '', prix_ttc: '', cout_revient: '', benefice: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('suivi_prestation').delete().eq('id', id);
    fetchData();
  };

  const filtered = suiviList.filter((s: any) => {
    if (month && !(s.date || '').startsWith(month)) return false;
    if (search) {
      const q = search.toLowerCase();
      const h = [s.date, s.client, s.matricule, s.type, s.facture, s.depart, s.arrivee, s.bl_client, s.client_dautre, String(s.prix_ht), String(s.prix_ttc)].filter(Boolean).join(' ').toLowerCase();
      if (!h.includes(q)) return false;
    }
    return true;
  });

  const fmt = (n: any) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  const generatePDF = () => {
    const sel = suiviList.filter((s: any) => selectedRows.includes(s.id));
    if (sel.length === 0) return;
    const totals = sel.reduce((a: any, s: any) => ({ manutention: a.manutention + (Number(s.manutention) || 0), immobilisation: a.immobilisation + (Number(s.immobilisation) || 0), prix_ht: a.prix_ht + (Number(s.prix_ht) || 0), prix_ttc: a.prix_ttc + (Number(s.prix_ttc) || 0), cout_revient: a.cout_revient + (Number(s.cout_revient) || 0), benefice: a.benefice + (Number(s.benefice) || 0) }), { manutention: 0, immobilisation: 0, prix_ht: 0, prix_ttc: 0, cout_revient: 0, benefice: 0 });
    const rows = sel.map((s: any) => '<tr>' + ['date','matricule','type','facture','bon_commande','ot_bl_bs_be','client','depart','arrivee','client_dautre','bl_client'].map(f => '<td style="border:1px solid #999;padding:4px 6px;font-size:8pt">' + (s[f] || '') + '</td>').join('') + ['manutention','immobilisation','prix_ht','prix_ttc','cout_revient','benefice'].map(f => '<td style="border:1px solid #999;padding:4px 6px;font-size:8pt;text-align:right">' + fmt(s[f]) + '</td>').join('') + '</tr>').join('');
    const totalRow = '<tr style="background:#1F3864;color:white;font-weight:bold"><td colspan="11" style="border:1px solid #999;padding:6px;font-size:9pt;text-align:right">TOTAUX</td>' + ['manutention','immobilisation','prix_ht','prix_ttc','cout_revient','benefice'].map(f => '<td style="border:1px solid #999;padding:6px;font-size:9pt;text-align:right">' + fmt(totals[f]) + '</td>').join('') + '</tr>';
    const headers = ['Date','Matricule','Type','Factures','N° Bon Cmd','OT/BL','Clients','Départ','Arrivée','Client/Livraison','BL Livraison','Manutention','Immobilisation','Prix HT','Prix TTC','Coût Revient','Bénéfice'];
    const thRow = headers.map(h => '<th style="border:1px solid #999;padding:6px;font-size:8pt;background:#1F3864;color:white;text-align:center;white-space:nowrap">' + h + '</th>').join('');
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,sans-serif}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}table{border-collapse:collapse;width:100%}</style></head><body><div style="padding:10mm"><div style="text-align:center;margin-bottom:15px"><h1 style="font-size:14pt;color:#1F3864;margin:0">FOTRAL SARL</h1><h2 style="font-size:12pt;color:#1F3864;margin:8px 0">SUIVI DES PRESTATIONS</h2><p style="font-size:9pt;color:#888">' + sel.length + ' prestation(s)</p></div><table><thead><tr>' + thRow + '</tr></thead><tbody>' + rows + totalRow + '</tbody></table></div></body></html>';
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 600); }
  };

  return (
    <div className="p-6">
      <div className="mb-6 bg-slate-900 text-white rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white mb-2"><FileText className="w-3.5 h-3.5" /> Suivi Prestation</span>
            <h1 className="text-2xl font-extrabold">Suivi des Prestations</h1>
            <p className="text-sm text-slate-400 mt-1">{suiviList.length} enregistrements</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchData} className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"><RefreshCw size={14} /> Actualiser</button>
            {selectedRows.length > 0 && (
              <button onClick={generatePDF} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"><FileText size={14} /> PDF ({selectedRows.length})</button>
            )}
            <button onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], client: '', bl_client: '', client_dautre: '', matricule: '', type: '', facture: '', bon_commande: '', ot_bl_bs_be: '', depart: '', arrivee: '', manutention: '', immobilisation: '', prix_ht: '', prix_ttc: '', cout_revient: '', benefice: '' }); setEditing(null); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"><Plus size={14} /> Nouveau</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 bg-white rounded-xl border-2 border-blue-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{editing ? 'Modifier' : 'Nouvelle'} Prestation</p>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: 'Date', key: 'date', type: 'date' },
              { label: 'Client', key: 'client', type: 'select', options: clientsList.map(c => c.nom) },
              { label: 'BL Client', key: 'bl_client', type: 'text' },
              { label: 'Client Autre', key: 'client_dautre', type: 'text' },
              { label: 'Matricule', key: 'matricule', type: 'text' },
              { label: 'Type', key: 'type', type: 'text' },
              { label: 'Facture', key: 'facture', type: 'text' },
              { label: 'N° Bon Cmd', key: 'bon_commande', type: 'text' },
              { label: 'OT/BL', key: 'ot_bl_bs_be', type: 'text' },
              { label: 'Départ', key: 'depart', type: 'text' },
              { label: 'Arrivée', key: 'arrivee', type: 'text' },
              { label: 'Manutention', key: 'manutention', type: 'number' },
              { label: 'Immobilisation', key: 'immobilisation', type: 'number' },
              { label: 'Prix HT', key: 'prix_ht', type: 'number' },
              { label: 'Prix TTC', key: 'prix_ttc', type: 'number' },
              { label: 'Coût Revient', key: 'cout_revient', type: 'number' },
              { label: 'Bénéfice', key: 'benefice', type: 'number' },
            ].map(({ label, key, type, options }) => (
              <div key={key}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                {type === 'select' ? (
                  <select value={(form as any)[key] || ''} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                    className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">— Sélectionner —</option>
                    {(options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={(form as any)[key] || ''} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                    className="w-full mt-1 h-9 rounded-lg border-2 border-slate-200 px-3 text-sm focus:outline-none focus:border-blue-500" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase rounded-lg cursor-pointer">Enregistrer</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="h-9 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-lg cursor-pointer">Annuler</button>
          </div>
        </div>
      )}

      <div className="mb-3 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Rechercher partout..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border-2 border-slate-200 pl-11 pr-10 text-sm focus:outline-none focus:border-blue-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>}
        </div>
        <select value={month} onChange={e => { setMonth(e.target.value); setSelectedRows([]); }}
          className="h-10 rounded-xl border-2 border-slate-200 px-3 text-xs font-bold min-w-[200px]">
          <option value="">— Tous les mois —</option>
          {[...new Set(suiviList.map((s: any) => (s.date || '').substring(0, 7)).filter(Boolean))].sort().reverse().map(m => (
            <option key={m} value={m}>{m} ({suiviList.filter((s: any) => (s.date || '').startsWith(m)).length})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1400px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 w-8"><input type="checkbox" onChange={e => setSelectedRows(e.target.checked ? filtered.map(s => s.id) : [])} className="accent-blue-600" /></th>
                  {['Date','Client','BL Client','Client Autre','Matricule','Type','Facture','N° Bon Cmd','OT/BL','Départ','Arrivée','Manut.','Immob.','HT','TTC','Coût Rev.','Bénéfice','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={19} className="px-4 py-10 text-center text-sm text-slate-400">Aucune prestation.</td></tr>
                ) : filtered.map((s: any) => (
                  <tr key={s.id} className={`hover:bg-slate-50 ${selectedRows.includes(s.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-3 py-3 w-8"><input type="checkbox" checked={selectedRows.includes(s.id)} onChange={e => setSelectedRows(e.target.checked ? [...selectedRows, s.id] : selectedRows.filter(id => id !== s.id))} className="accent-blue-600" /></td>
                    <td className="px-3 py-3 text-xs">{s.date}</td>
                    <td className="px-3 py-3 text-xs font-semibold">{s.client || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.bl_client || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.client_dautre || '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs font-bold text-blue-600">{s.matricule || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.type || '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{s.facture || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.bon_commande || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.ot_bl_bs_be || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.depart || '—'}</td>
                    <td className="px-3 py-3 text-xs">{s.arrivee || '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{fmt(s.manutention)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{fmt(s.immobilisation)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{fmt(s.prix_ht)}</td>
                    <td className="px-3 py-3 font-mono text-xs font-bold">{fmt(s.prix_ttc)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-amber-700">{fmt(s.cout_revient)}</td>
                    <td className="px-3 py-3 font-mono text-xs font-bold text-emerald-600">{fmt(s.benefice)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(s); setForm({ date: s.date, client: s.client, bl_client: s.bl_client || '', client_dautre: s.client_dautre || '', matricule: s.matricule, type: s.type, facture: s.facture, bon_commande: s.bon_commande, ot_bl_bs_be: s.ot_bl_bs_be, depart: s.depart, arrivee: s.arrivee, manutention: String(s.manutention), immobilisation: String(s.immobilisation), prix_ht: String(s.prix_ht), prix_ttc: String(s.prix_ttc), cout_revient: String(s.cout_revient), benefice: String(s.benefice) }); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}