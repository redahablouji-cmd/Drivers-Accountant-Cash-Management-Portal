import * as React from 'react';
import { Hash, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

const ALLOWED_ROLES = ['accountant', 'dispatcher'];

interface LoginPageProps {
  onLoginSuccess: (profile: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [employeeCode, setEmployeeCode] = React.useState('');
  const [email,        setEmail]        = React.useState('');
  const [password,     setPassword]     = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error,        setError]        = React.useState<string | null>(null);
  const [loading,      setLoading]      = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Check employee code in staff_profiles
      const { data: profile, error: profileErr } = await supabase
        .from('staff_profiles')
        .select('id, full_name, role, is_active, auth_user_id, company_id')
        .eq('employee_code', employeeCode.trim())
        .maybeSingle();

      if (profileErr) throw profileErr;
      if (!profile)             throw new Error("Code employé invalide.");
      if (!profile.is_active)   throw new Error("Ce compte est désactivé.");
      if (!ALLOWED_ROLES.includes(profile.role))
        throw new Error("Accès refusé. Portail réservé aux comptables et dispatchers.");

      // 2. Sign in with Supabase auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(), password: password.trim(),
      });
      if (authErr) throw new Error("Email ou mot de passe invalide.");

      // 3. Auto-fix auth_user_id if missing
      if (!profile.auth_user_id) {
        await supabase.from('staff_profiles')
          .update({ auth_user_id: authData.user.id })
          .eq('id', profile.id);
      }

      onLoginSuccess({ ...profile, auth_user_id: authData.user.id });
    } catch (err: any) {
      setError(err.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
          <span className="text-white font-black text-xl">LF</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">LOGI-FLOW</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          Portail Caisse & Chauffeurs
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full max-w-sm mx-auto">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Code Employé
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input type="text" required placeholder="Ex: ACC-001"
                value={employeeCode} onChange={e => setEmployeeCode(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input type="email" required placeholder="email@entreprise.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50 pl-10 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest transition-all mt-2">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}