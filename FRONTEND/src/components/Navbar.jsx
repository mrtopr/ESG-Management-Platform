import React, { useState } from 'react';
import { 
  Bell, ChevronDown, RefreshCw, Layers, Award, ShieldAlert, CheckCircle, FileText, Trophy
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useScores } from '../hooks/useScores';
import { 
  useComplianceIssues, useParticipations, useChallengeParticipations, 
  useConfig, usePolicies, useEmployeeBadges 
} from '../api/queries';

export const Navbar = () => {
  const { user, allUsers, switchUser } = useAuth();
  const { orgScore } = useScores();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Queries to compute dynamic notification alerts
  const { data: participations = [] } = useParticipations();
  const { data: issues = [] } = useComplianceIssues();
  const { data: challengeParts = [] } = useChallengeParticipations();
  const { data: config } = useConfig();
  const { data: policies = [] } = usePolicies();
  const { data: employeeBadges = [] } = useEmployeeBadges();

  // Filter pending approvals (respect config flags)
  const pendingCsr = (config?.notifyApprovalDecisions ?? true)
    ? participations.filter(p => p.approvalStatus === 'PENDING')
    : [];
  const pendingChallenge = (config?.notifyApprovalDecisions ?? true)
    ? challengeParts.filter(p => p.approvalStatus === 'PENDING')
    : [];
  const overdueIssues = (config?.notifyNewCompliance ?? true)
    ? issues.filter(i => i.status === 'OVERDUE')
    : [];
  const unacknowledgedPolicies = (config?.notifyPolicyReminders ?? true)
    ? policies.filter(pol => !pol.acknowledgements?.some(a => a.employeeId === user?.id))
    : [];
  const unlockedBadges = (config?.notifyBadgeUnlocks ?? true)
    ? employeeBadges.filter(eb => eb.employeeId === user?.id)
    : [];

  const notificationsCount = pendingCsr.length + pendingChallenge.length + overdueIssues.length + unacknowledgedPolicies.length + unlockedBadges.length;

  return (
    <header className="h-16 border-b border-border bg-card/45 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* ESG Scoring Ribbon */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">ESG Org Index:</span>
          <span className="font-display font-extrabold text-sm px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {orgScore.total}
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <span className="text-muted-foreground">E: <strong className="text-esg-env font-medium">{orgScore.env}</strong></span>
          <span className="text-muted-foreground">S: <strong className="text-esg-social font-medium">{orgScore.social}</strong></span>
          <span className="text-muted-foreground">G: <strong className="text-esg-gov font-medium">{orgScore.gov}</strong></span>
        </div>
      </div>

      {/* Actions (Notifications + User Switcher) */}
      <div className="flex items-center space-x-4">
        {/* Quick User Persona Switcher */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-xs bg-muted/60 hover:bg-muted text-foreground border border-border px-3 py-1.5 rounded-xl transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="font-medium">Testing Persona: <strong className="text-primary">{user?.name}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Select Test Persona (Role Simulation)
              </div>
              <div className="max-h-60 overflow-y-auto">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-muted/80 transition-colors ${user?.id === u.id ? 'bg-primary/5 text-primary' : ''}`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {u.name}
                      <span className={`text-[9px] px-1.5 py-0.25 rounded-md ${
                        u.role === 'ESG_ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                        u.role === 'DEPT_HEAD' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{u.departmentName} • {u.xp} XP</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {notificationsCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                {notificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center">
                <span className="text-xs font-bold font-display">System Notifications</span>
                <span className="text-[10px] text-muted-foreground">{notificationsCount} alert(s)</span>
              </div>
              <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
                {notificationsCount === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center space-y-1">
                    <CheckCircle className="w-8 h-8 text-primary/30" />
                    <span>All clear! No pending alerts.</span>
                  </div>
                ) : (
                  <>
                    {pendingCsr.map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] border border-border/30 flex items-start space-x-2">
                        <Award className="w-4.5 h-4.5 text-esg-social flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">CSR Participation Approval Needed</p>
                          <p className="text-muted-foreground text-[10px]">User requested approval for CSR Activity points.</p>
                        </div>
                      </div>
                    ))}
                    {pendingChallenge.map(c => (
                      <div key={c.id} className="p-2 rounded-lg bg-muted/40 hover:bg-muted text-[11px] border border-border/30 flex items-start space-x-2">
                        <Award className="w-4.5 h-4.5 text-esg-points flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Challenge Submission Review</p>
                          <p className="text-muted-foreground text-[10px]">User submitted proof for active gamification challenge.</p>
                        </div>
                      </div>
                    ))}
                    {overdueIssues.map(i => (
                      <div key={i.id} className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-[11px] border border-red-500/15 flex items-start space-x-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-destructive">Compliance Action Overdue</p>
                          <p className="text-muted-foreground text-[10px]">{i.description}</p>
                        </div>
                      </div>
                    ))}
                    {unacknowledgedPolicies.map(pol => (
                      <div key={pol.id} className="p-2 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 text-[11px] border border-yellow-500/15 flex items-start space-x-2">
                        <FileText className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-500">Sign Policy Reminder</p>
                          <p className="text-muted-foreground text-[10px]">Acknowledge and sign: {pol.title}</p>
                        </div>
                      </div>
                    ))}
                    {unlockedBadges.map(eb => (
                      <div key={eb.id} className="p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 text-[11px] border border-emerald-500/15 flex items-start space-x-2">
                        <Trophy className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-400">Badge Earned!</p>
                          <p className="text-muted-foreground text-[10px]">Congratulations! You unlocked "{eb.badge?.name || 'Eco Badge'}"</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
