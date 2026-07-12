import React, { useState } from 'react';
import { 
  Users, Calendar, Check, X as CloseIcon, Plus, Eye, Send, Award, Clock
} from 'lucide-react';
import { 
  useCSRActivities, useCreateCSRActivity, 
  useParticipations, useCreateParticipation,
  useApproveParticipation, useRejectParticipation, useDepartments, useCategories
} from '../api/queries';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Dialog } from '../components/Dialog';

export const Social: React.FC = () => {
  const { user, isAdmin, isDeptHead } = useAuth();
  
  // Queries
  const { data: activities = [] } = useCSRActivities();
  const { data: participations = [], isLoading: prtLoading } = useParticipations();
  const { data: depts = [] } = useDepartments();
  const { data: categories = [] } = useCategories();

  // Mutations
  const createActivity = useCreateCSRActivity();
  const createParticipation = useCreateParticipation();
  const approveParticipation = useApproveParticipation();
  const rejectParticipation = useRejectParticipation();

  // Modals state
  const [actModalOpen, setActModalOpen] = useState(false);
  const [prtModalOpen, setPrtModalOpen] = useState(false);
  const [viewProofOpen, setViewProofOpen] = useState(false);
  const [activeProofUrl, setActiveProofUrl] = useState('');

  // Form State - CSR Activity
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [catId, setCatId] = useState('');
  const [deptId, setDeptId] = useState(user?.departmentId || '');
  const [date, setDate] = useState('');

  // Form State - Request Participation
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  // Computations
  const totalApprovedVolunteers = participations.filter(p => p.approvalStatus === 'APPROVED').length;
  const pendingApprovalsCount = participations.filter(p => p.approvalStatus === 'PENDING').length;
  const filteredCategories = categories.filter(c => c.type === 'CSR_ACTIVITY');

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !catId || !deptId || !date) return;

    createActivity.mutate({
      title,
      description,
      categoryId: catId,
      departmentId: deptId,
      date
    }, {
      onSuccess: () => {
        setActModalOpen(false);
        setTitle('');
        setDescription('');
        setDate('');
      }
    });
  };

  const handleRequestParticipation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) return;

    createParticipation.mutate({
      activityId: selectedActivityId,
      proofUrl: proofUrl || null,
    }, {
      onSuccess: () => {
        setPrtModalOpen(false);
        setSelectedActivityId('');
        setProofUrl('');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
            <Users className="w-8 h-8 text-esg-social mr-2.5" />
            Social Engagement
          </h1>
          <p className="text-muted-foreground text-sm">
            Empower employees through active CSR participation and community volunteering milestones.
          </p>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => setPrtModalOpen(true)}
            className="flex items-center space-x-2 border border-border bg-card hover:bg-muted text-foreground font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            <Send className="w-4 h-4 text-esg-social" />
            <span>Request Points</span>
          </button>
          
          {(isAdmin || isDeptHead) && (
            <button 
              onClick={() => setActModalOpen(true)}
              className="flex items-center space-x-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Approved CSR Credits</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-esg-social">{totalApprovedVolunteers} Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Active community contributions logged this quarter
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Pending Approvals</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-esg-points">{pendingApprovalsCount} Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Require approval checks by department leaders
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Points Distributed</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-foreground">
              {(totalApprovedVolunteers * 50).toLocaleString()} Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Points distributed via corporate social ledger
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg">CSR Impact Activities</CardTitle>
              <CardDescription>Browse scheduled community volunteering campaigns and corporate offsets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No CSR campaigns scheduled yet.</div>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="flex justify-between items-center p-4 border border-border/50 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-esg-social/10 text-esg-social border border-esg-social/20 font-bold uppercase tracking-wider">
                          {act.category?.name || 'CSR Activity'}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> {act.date}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm leading-snug">{act.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{act.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-semibold text-muted-foreground">Owner: {act.department?.name}</p>
                      <p className="text-xs font-bold text-primary flex items-center justify-end mt-1">
                        <Award className="w-4 h-4 mr-0.5 text-esg-points" /> +50 Points
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approvals / Verification Dashboard */}
        <Card className="bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 text-esg-points mr-2" />
              Approvals Board
            </CardTitle>
            <CardDescription>
              {(isAdmin || isDeptHead) 
                ? 'Review proof submissions and issue points' 
                : 'Your pending submissions and points ledger'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prtLoading ? (
              <div className="text-center py-6 text-muted-foreground text-xs">Loading ledger...</div>
            ) : participations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">No participations requested yet.</div>
            ) : (
              participations.map(prt => (
                <div key={prt.id} className="p-3 border border-border/50 bg-card/65 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-foreground truncate">{prt.employee?.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{prt.activity?.title}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      prt.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      prt.approvalStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {prt.approvalStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-border/40 text-[10px]">
                    <span className="text-muted-foreground font-mono">{new Date(prt.createdAt).toLocaleDateString()}</span>
                    
                    <div className="flex items-center space-x-2">
                      {prt.proofUrl && (
                        <button 
                          onClick={() => {
                            setActiveProofUrl(prt.proofUrl!);
                            setViewProofOpen(true);
                          }}
                          className="text-primary hover:underline flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-0.5" /> View Proof
                        </button>
                      )}

                      {prt.approvalStatus === 'PENDING' && (isAdmin || isDeptHead) && (
                        <div className="flex items-center space-x-1.5 ml-2">
                          <button 
                            onClick={() => approveParticipation.mutate(prt.id)}
                            disabled={approveParticipation.isPending}
                            className="p-1 rounded bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => rejectParticipation.mutate(prt.id)}
                            disabled={rejectParticipation.isPending}
                            className="p-1 rounded bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Dialog Modal */}
      <Dialog 
        isOpen={actModalOpen} 
        onClose={() => setActModalOpen(false)} 
        title="Schedule CSR Campaign"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Campaign Title</label>
            <input 
              type="text" 
              placeholder="e.g. Tree Planting CSR, Old Age Home Visit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Campaign Description</label>
            <textarea 
              placeholder="Provide a detailed description of the social initiative and instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Social Activity Type</label>
              <select 
                value={catId}
                onChange={(e) => setCatId(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select Type...</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Scheduled Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Hosting Department</label>
            <select 
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              {depts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setActModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createActivity.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </Dialog>

      {/* Request Points / Proof Modal */}
      <Dialog 
        isOpen={prtModalOpen} 
        onClose={() => setPrtModalOpen(false)} 
        title="Request Points Credit"
      >
        <form onSubmit={handleRequestParticipation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Select Volunteered Campaign</label>
            <select 
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select Activity...</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Participation Proof Evidence (Image URL)</label>
            <input 
              type="url" 
              placeholder="e.g. https://images.unsplash.com/... or cloud storage URL"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Provide a valid link to a selfie, registration pass, or group photo as evidence for verification audits.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setPrtModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createParticipation.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Request Approval
            </button>
          </div>
        </form>
      </Dialog>

      {/* View Proof Image Dialog */}
      <Dialog
        isOpen={viewProofOpen}
        onClose={() => setViewProofOpen(false)}
        title="Evidence Audit Pass"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-border overflow-hidden bg-muted aspect-video flex items-center justify-center">
            {activeProofUrl ? (
              <img 
                src={activeProofUrl} 
                alt="Audit Evidence File" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = "https://images.unsplash.com/photo-1595275313396-64010506b30a?w=400";
                }}
              />
            ) : (
              <span className="text-xs text-muted-foreground">No visual evidence uploaded.</span>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-border/50">
            <button 
              onClick={() => setViewProofOpen(false)}
              className="px-4 py-2 bg-muted text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-colors"
            >
              Close Audit
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
