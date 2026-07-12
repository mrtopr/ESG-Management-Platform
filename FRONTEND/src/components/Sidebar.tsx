import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Leaf, Users, ShieldCheck, Award, FileSpreadsheet, Settings, 
  ChevronLeft, ChevronRight, HelpCircle, User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Environmental', path: '/environmental', icon: Leaf, color: 'text-esg-env' },
    { name: 'Social Impact', path: '/social', icon: Users, color: 'text-esg-social' },
    { name: 'Governance', path: '/governance', icon: ShieldCheck, color: 'text-esg-gov' },
    { name: 'Gamification', path: '/gamification', icon: Award, color: 'text-esg-points' },
    { name: 'Reports Builder', path: '/reports', icon: FileSpreadsheet, color: 'text-emerald-400' },
    { name: 'Configurations', path: '/settings', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <aside 
      className={cn(
        "h-screen border-r border-border bg-card/60 backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-30 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          <div className={cn("flex items-center space-x-2 overflow-hidden", collapsed && "justify-center w-full")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display font-extrabold text-xl bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-wide">
                EcoSphere
              </span>
            )}
          </div>
          
          {!collapsed && (
            <button 
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", item.color)} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Info / Footer */}
      <div className="p-4 border-t border-border/50 bg-muted/30">
        {collapsed ? (
          <div className="flex justify-center group relative cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            {/* Tooltip */}
            <div className="absolute left-16 bottom-4 ml-2 bg-popover border border-border text-popover-foreground text-xs rounded px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              <p className="font-bold">{user?.name}</p>
              <p className="text-muted-foreground text-[10px]">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="bg-background rounded-lg p-2.5 border border-border/60">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground">Gamified XP</span>
                <span className="font-bold text-primary">{user?.xp} XP</span>
              </div>
              {/* Simple Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((user?.xp || 0) % 500) / 5)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                Level {Math.floor((user?.xp || 0) / 500) + 1}
              </p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <button 
            onClick={() => setCollapsed(false)}
            className="w-full py-2 mt-4 rounded-lg bg-muted text-muted-foreground hover:text-foreground flex justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
