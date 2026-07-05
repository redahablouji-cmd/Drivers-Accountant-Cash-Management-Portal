
import * as React from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  HandCoins, 
  Fuel, 
  Wrench,
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Bell,
  Search,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ShellProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  profile: any;
  onSignOut: () => void;
  balance?: number;
}

export function Shell({ currentView, setView, children, profile, onSignOut, balance = 0 }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'caisse', label: 'Caisse', icon: Wallet },
    { id: 'settlement', label: 'Settlements', icon: HandCoins },
    { id: 'diesel', label: 'Diesel & Vouchers', icon: Fuel },
    { id: 'fleetfix', label: 'FleetFix', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "flex flex-col border-r border-slate-200 transition-all duration-300 ease-in-out bg-slate-50 z-20",
          isCollapsed ? "w-16" : "w-52"
        )}
      >
        <div className="p-4 border-t border-slate-200 shrink-0">
  <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs border border-blue-200">
      {profile?.full_name?.charAt(0) || 'U'}
    </div>
    {!isCollapsed && (
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900 truncate">{profile?.full_name}</p>
        <p className="text-[10px] text-slate-500 truncate capitalize">{profile?.role}</p>
      </div>
    )}
    {!isCollapsed && (
      <Button variant="ghost" size="icon"
        onClick={onSignOut}
        className="h-8 w-8 text-slate-400 hover:text-rose-600">
        <LogOut size={16} />
      </Button>
    )}
  </div>
</div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-xs font-medium uppercase tracking-wider rounded-md transition-all group relative",
                currentView === item.id 
                  ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                currentView === item.id ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!isCollapsed && <span className={cn("ml-3 truncate", currentView === item.id ? "font-bold" : "font-medium")}>{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-sm font-semibold text-slate-800 hidden md:block capitalize">{currentView === 'diesel' ? 'Diesel & Vouchers' : currentView}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 hidden lg:flex">
              <span>/</span>
              <span>Active Sessions</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">Internal Ledger</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Current Register Cash</span>
              <span className="text-emerald-600 font-bold text-sm tracking-tight font-mono">
                {balance.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
              </span>
            </div>
            
            <button className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <Search size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 h-8 w-8">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-600 rounded-full border-2 border-white"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
