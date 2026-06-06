import * as React from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './modules/dashboard/Dashboard';
import { Caisse } from './modules/caisse/Caisse';
import { SettlementWorkspace } from './modules/settlement/SettlementWorkspace';
import { DieselVouchers } from './modules/diesel/DieselVouchers';
import { ViewState } from './lib/types';
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from './pages/LoginPage';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');
  const [profile,     setProfile]     = React.useState<any>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [caissBalance, setCaissBalance] = React.useState(0);

  // Restore session on load
  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('staff_profiles')
          .select('id, full_name, role, is_active, company_id, auth_user_id, employee_code')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (data && ['accountant', 'dispatcher'].includes(data.role) && data.is_active) {
          setProfile(data);
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-black text-lg">LF</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!profile) {
    return <LoginPage onLoginSuccess={(p) => setProfile(p)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':   return <Dashboard />;
      case 'caisse':      return <Caisse />;
      case 'settlement':  return <SettlementWorkspace />;
      case 'diesel':      return <DieselVouchers />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <h2 className="text-xl font-bold">Module en cours de développement</h2>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Shell
        currentView={currentView}
        setView={setCurrentView}
        profile={profile}
        onSignOut={handleSignOut}
        balance={caissBalance}
      >
        {renderView()}
      </Shell>
    </TooltipProvider>
  );
}