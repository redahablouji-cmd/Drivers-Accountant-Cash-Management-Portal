
import * as React from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './modules/dashboard/Dashboard';
import { Caisse } from './modules/caisse/Caisse';
import { SettlementWorkspace } from './modules/settlement/SettlementWorkspace';
import { DieselVouchers } from './modules/diesel/DieselVouchers';
import { ViewState } from './lib/types';
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'caisse':
        return <Caisse />;
      case 'settlement':
        return <SettlementWorkspace />;
      case 'diesel':
        return <DieselVouchers />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <h2 className="text-xl font-bold">Module Under Development</h2>
            <p className="text-sm">This section of the portal is currently being finalized.</p>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Shell currentView={currentView} setView={setCurrentView}>
        {renderView()}
      </Shell>
    </TooltipProvider>
  );
}
