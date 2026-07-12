import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle, ShieldAlert, Plus, Calendar, AlertTriangle, UserCheck
} from 'lucide-react';
import { 
  usePolicies, useCreatePolicy, useAcknowledgePolicy,
  useAudits, useCreateAudit, 
  useComplianceIssues, useCreateComplianceIssue, useUpdateComplianceIssueStatus,
  useDepartments, useEmployees
} from '../api/queries';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Dialog } from '../components/Dialog';
import { db } from '../api/client';

export const Governance: React.FC = () => {
  const { user, isAdmin, isDeptHead } = useAuth();

  // Queries
  const { data: policies = [] } = usePolicies();
  const { data: audits = [] } = useAudits();
  const { data: issues = [] } = useComplianceIssues();
  const { data: depts = [] } = useDepartments();

  // Mutations
  const createPolicy = useCreatePolicy();
  const acknowledgePolicy = useAcknowledgePolicy();
  const createAudit = useCreateAudit();
  const createIssue = useCreateComplianceIssue();
  const updateIssueStatus = useUpdateComplianceIssueStatus();

  // Modals state
  const [polModalOpen, setPolModalOpen] = useState(false);
  const [audModalOpen, setAudModalOpen] = useState(false);
  const [issModalOpen, setIssModalOpen] = useState(false);

  // Form State - Policy
  const [polTitle, setPolTitle] = useState('');
  const [polContent, setPolContent] = useState('');

  // Form State - Audit
  const [audDeptId, setAudDeptId] = useState('');
  const [audDate, setAudDate] = useState('');
  const [auditor, setAuditor] = useState('');

  // Form State - Compliance Issue
  const [issAuditId, setIssAuditId] = useState('');
  const [issSeverity, setIssSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [issDesc, setIssDesc] = useState('');
  const [issOwnerId, setIssOwnerId] = useState('');
  const [issDueDate, setIssDueDate] = useState('');

  // Computations
  const totalEmployees = db.employees.length;
  const openIssues = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS');
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!polTitle || !polContent) return;

    createPolicy.mutate({
      title: polTitle,
      content: polContent,
      version: 1,
    }, {
      onSuccess: () => {
        setPolModalOpen(false);
        setPolTitle('');
        setPolContent('');
      }
    });
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audDeptId || !audDate || !auditor) return;

    createAudit.mutate({
      departmentId: audDeptId,
      date: audDate,
      auditor,
      status: 'scheduled',
    }, {
      onSuccess: () => {
        setAudModalOpen(false);
        setAudDate('');
        setAuditor('');
      }
    });
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issAuditId || !issDesc || !issOwnerId || !issDueDate) return;

    createIssue.mutate({
      auditId: issAuditId,
      severity: issSeverity,
      description: issDesc,
      ownerId: issOwnerId,
      dueDate: issDueDate,
      status: 'OPEN',
    }, {
      onSuccess: () => {
        setIssModalOpen(false);
        setIssDesc('');
        setIssDueDate('');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
            <ShieldCheck className="w-8 h-8 text-esg-gov mr-2.5" />
            Governance & Auditing
          </h1>
          <p className="text-muted-foreground text-sm">
            Review corporate code boundaries, conduct compliance inspections, and track regulatory issue ownership.
          </p>
        </div>

        {isAdmin && (
          <div className="flex space-x-3">
            <button 
              onClick={() => setPolModalOpen(true)}
              className="flex items-center space-x-2 border border-border bg-card hover:bg-muted text-foreground font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-esg-gov" />
              <span>Publish Policy</span>
            </button>
            <button 
              onClick={() => setAudModalOpen(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Audit</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Published Policies</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-esg-gov">{policies.length} Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Global requirements across operations
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Audit Log</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-foreground">
              {audits.length} Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-400 font-medium">
              {audits.filter(a => a.status === 'completed').length} completed, {audits.filter(a => a.status !== 'completed').length} scheduled
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Open Compliance Issues</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-destructive flex items-center">
              {openIssues.length} Warning(s)
              {criticalIssues.length > 0 && (
                <span className="ml-2 text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full flex items-center animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {criticalIssues.length} Critical
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Violations assigned to department compliance owners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Policies & Audits Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policies Listing */}
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 text-esg-gov mr-2" />
              Policy E-Sign Dashboard
            </CardTitle>
            <CardDescription>Review and acknowledge guidelines to maintain institutional integrity (+20 XP)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {policies.map(pol => {
              const acknowledged = pol.acknowledgements?.some(a => a.employeeId === user?.id);
              const ackPercentage = Math.round(((pol.acknowledgements?.length || 0) / totalEmployees) * 100);
              
              return (
                <div key={pol.id} className="p-4 border border-border/50 bg-muted/10 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-sm flex items-center">
                        {pol.title}
                        <span className="text-[10px] ml-2 px-1.5 py-0.25 rounded bg-muted text-muted-foreground border border-border/40 font-mono">
                          v{pol.version}
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Acknowledgement Rate: {ackPercentage}%</p>
                    </div>
                    {acknowledged ? (
                      <span className="flex items-center space-x-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Acknowledged</span>
                      </span>
                    ) : (
                      <button 
                        onClick={() => acknowledgePolicy.mutate(pol.id)}
                        disabled={acknowledgePolicy.isPending}
                        className="text-xs bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-xl hover:bg-primary/95 active:scale-95 transition-all"
                      >
                        Acknowledge Sign
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed bg-background/40 p-2.5 rounded-lg border border-border/40">
                    {pol.content}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Audits Calendar */}
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 text-esg-social mr-2" />
              Institutional Inspections
            </CardTitle>
            <CardDescription>Scheduled inspections and historical compliance review reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {audits.map(aud => (
                <div key={aud.id} className="p-3 border border-border/40 rounded-xl flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Inspection Auditor: {aud.auditor}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                      <span>Department: {aud.department?.name}</span>
                      <span>•</span>
                      <span>Target Date: {aud.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      aud.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {aud.status}
                    </span>
                    {aud.status === 'completed' && (isAdmin || isDeptHead) && (
                      <button 
                        onClick={() => {
                          setIssAuditId(aud.id);
                          setIssModalOpen(true);
                        }}
                        className="text-[10px] text-destructive hover:underline flex items-center font-bold"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Flag Issue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Issues Panel */}
      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShieldAlert className="w-5 h-5 text-destructive mr-2" />
            Active Warning Red Flags
          </CardTitle>
          <CardDescription>Regulatory infractions, assigned resolution timelines, and warning flags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Severity</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Infraction Description</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Assignee Owner</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Target Due Date</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {issues.map(iss => (
                  <tr key={iss.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        iss.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                        iss.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        iss.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {iss.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">{iss.description}</td>
                    <td className="py-3 px-4 text-muted-foreground">{iss.owner?.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{iss.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        iss.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        iss.status === 'OVERDUE' ? 'bg-red-500/15 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {iss.status !== 'RESOLVED' && (isAdmin || isDeptHead || user?.id === iss.ownerId) ? (
                        <button 
                          onClick={() => updateIssueStatus.mutate({ id: iss.id, status: 'RESOLVED' })}
                          disabled={updateIssueStatus.isPending}
                          className="flex items-center space-x-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all duration-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Checked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Publish Policy Modal */}
      <Dialog 
        isOpen={polModalOpen} 
        onClose={() => setPolModalOpen(false)} 
        title="Publish ESG Policy"
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Policy Title</label>
            <input 
              type="text" 
              placeholder="e.g. Anti-Bribery Policy, Net Zero Facility Mandates"
              value={polTitle}
              onChange={(e) => setPolTitle(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Policy Content Body</label>
            <textarea 
              placeholder="Provide full legal guidelines, requirements, and compliance parameters..."
              value={polContent}
              onChange={(e) => setPolContent(e.target.value)}
              rows={5}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setPolModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createPolicy.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Publish Policy
            </button>
          </div>
        </form>
      </Dialog>

      {/* Schedule Audit Modal */}
      <Dialog 
        isOpen={audModalOpen} 
        onClose={() => setAudModalOpen(false)} 
        title="Schedule Inspection Audit"
      >
        <form onSubmit={handleCreateAudit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Inspected Department</label>
            <select 
              value={audDeptId}
              onChange={(e) => setAudDeptId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select Department...</option>
              {depts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Inspecting Agency / Auditor Name</label>
            <input 
              type="text" 
              placeholder="e.g. ISO-14001 Assessor, Corporate Governance Committee"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Scheduled Audit Date</label>
            <input 
              type="date" 
              value={audDate}
              onChange={(e) => setAudDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setAudModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createAudit.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Schedule Audit
            </button>
          </div>
        </form>
      </Dialog>

      {/* Flag Compliance Issue Modal */}
      <Dialog 
        isOpen={issModalOpen} 
        onClose={() => setIssModalOpen(false)} 
        title="Flag Compliance Infraction"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Infraction Severity</label>
            <select 
              value={issSeverity}
              onChange={(e) => setIssSeverity(e.target.value as any)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="LOW">LOW (Policy warning)</option>
              <option value="MEDIUM">MEDIUM (Requires logging)</option>
              <option value="HIGH">HIGH (Audit violation)</option>
              <option value="CRITICAL">CRITICAL (Regulatory threat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Detailed Description</label>
            <textarea 
              placeholder="Describe the compliance violation in detail..."
              value={issDesc}
              onChange={(e) => setIssDesc(e.target.value)}
              rows={3}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Compliance Officer Assignee (Owner)</label>
            <select 
              value={issOwnerId}
              onChange={(e) => setIssOwnerId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select Owner...</option>
              {db.employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role.replace('_', ' ')})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Resolution Due Date</label>
            <input 
              type="date" 
              value={issDueDate}
              onChange={(e) => setIssDueDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setIssModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createIssue.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Log Violation
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
