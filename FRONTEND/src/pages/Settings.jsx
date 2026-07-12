import React, { useState } from 'react';
import { 
  Settings, Sliders, ToggleLeft, Layers, Plus, Save, AlertTriangle, CheckCircle, Bell 
} from 'lucide-react';
import { 
  useConfig, useUpdateConfig, 
  useDepartments, useCreateDepartment, 
  useCategories, useCreateCategory 
} from '../api/queries';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { db } from '../api/client';

export const SettingsPage = () => {
  const { isAdmin } = useAuth();

  // Queries
  const { data: config } = useConfig();
  const { data: depts = [] } = useDepartments();
  const { data: categories = [] } = useCategories();

  // Mutations
  const updateConfig = useUpdateConfig();
  const createDept = useCreateDepartment();
  const createCat = useCreateCategory();

  // Config weights local state
  const [envWeight, setEnvWeight] = useState(config?.envWeight ? Math.round(config.envWeight * 100) : 40);
  const [socialWeight, setSocialWeight] = useState(config?.socialWeight ? Math.round(config.socialWeight * 100) : 30);
  const [govWeight, setGovWeight] = useState(config?.govWeight ? Math.round(config.govWeight * 100) : 30);

  // Form State - Department
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Form State - Category
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('CSR_ACTIVITY');

  // Success Indicators
  const [successToast, setSuccessToast] = useState('');

  // Sync weights when query loads
  React.useEffect(() => {
    if (config) {
      setEnvWeight(Math.round(config.envWeight * 100));
      setSocialWeight(Math.round(config.socialWeight * 100));
      setGovWeight(Math.round(config.govWeight * 100));
    }
  }, [config]);

  // Computations
  const weightsSum = envWeight + socialWeight + govWeight;
  const isWeightsValid = weightsSum === 100;

  const handleWeightsSave = () => {
    if (!isWeightsValid) return;
    updateConfig.mutate({
      envWeight: envWeight / 100,
      socialWeight: socialWeight / 100,
      govWeight: govWeight / 100,
    }, {
      onSuccess: () => {
        triggerToast('ESG scoring weights updated successfully!');
      }
    });
  };

  const handleToggle = (key, val) => {
    updateConfig.mutate({
      [key]: val
    }, {
      onSuccess: () => {
        triggerToast(`Global preference updated successfully!`);
      }
    });
  };

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;

    createDept.mutate({
      name: deptName,
      code: deptCode.toUpperCase(),
      status: 'active',
    }, {
      onSuccess: () => {
        setDeptName('');
        setDeptCode('');
        triggerToast(`Department "${deptName}" added.`);
      }
    });
  };

  const handleCreateCat = (e) => {
    e.preventDefault();
    if (!catName) return;

    createCat.mutate({
      name: catName,
      type: catType,
      status: 'active',
    }, {
      onSuccess: () => {
        setCatName('');
        triggerToast(`Category "${catName}" added.`);
      }
    });
  };

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
          <Settings className="w-8 h-8 text-slate-400 mr-2.5" />
          Platform Configurations
        </h1>
        <p className="text-muted-foreground text-sm">
          Adjust weighted coefficients, configure gamified rules, and manage organizational registries.
        </p>
      </div>

      {/* Access Guard Warning */}
      {!isAdmin && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-2xl flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Viewing in Simulation Mode</p>
            <p className="text-muted-foreground mt-0.5">
              Only ESG Administrators can modify settings, add departments, or update scoring weights. Switch testing personas in the header to modify config values.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: ESG Weight Sliders & Preferences */}
        <div className="space-y-6">
          {/* Weights configuration sliders */}
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sliders className="w-5 h-5 text-primary mr-2" />
                ESG Scoring Coefficients
              </CardTitle>
              <CardDescription>Configure proportional weights for calculating department scores (must sum to 100%)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Environmental slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-esg-env flex items-center">Environmental Weight</span>
                  <span className="text-foreground">{envWeight}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={envWeight}
                  disabled={!isAdmin}
                  onChange={(e) => setEnvWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-esg-env"
                />
              </div>

              {/* Social slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-esg-social flex items-center">Social Weight</span>
                  <span className="text-foreground">{socialWeight}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={socialWeight}
                  disabled={!isAdmin}
                  onChange={(e) => setSocialWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-esg-social"
                />
              </div>

              {/* Governance slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-esg-gov flex items-center">Governance Weight</span>
                  <span className="text-foreground">{govWeight}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={govWeight}
                  disabled={!isAdmin}
                  onChange={(e) => setGovWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-esg-gov"
                />
              </div>

              {/* Validation Warning */}
              <div className="flex justify-between items-center pt-4 border-t border-border/40 text-xs">
                <span className={`flex items-center font-bold ${isWeightsValid ? 'text-primary' : 'text-destructive'}`}>
                  {!isWeightsValid && <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />}
                  Weights Cumulative Sum: {weightsSum}%
                </span>
                
                <button 
                  onClick={handleWeightsSave}
                  disabled={!isAdmin || !isWeightsValid || updateConfig.isPending}
                  className="flex items-center space-x-1 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateConfig.isPending ? 'Saving...' : 'Save Weights'}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Core Toggle Preferences */}
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ToggleLeft className="w-5 h-5 text-esg-social mr-2" />
                Global Preferences
              </CardTitle>
              <CardDescription>Control automation features and security parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-muted/10">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">Auto-Calculate ERP Carbon Outputs</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Directly convert purchases/fleet logs into CO2 equivalents on create</p>
                </div>
                <input 
                  type="checkbox"
                  checked={config?.autoEmissionCalc || false}
                  disabled={!isAdmin}
                  onChange={(e) => handleToggle('autoEmissionCalc', e.target.checked)}
                  className="w-9 h-5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all cursor-pointer border border-border"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-muted/10">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">Audit Evidence Files Required</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Enforce photo/document verification uploads for CSR participations</p>
                </div>
                <input 
                  type="checkbox"
                  checked={config?.evidenceRequired || false}
                  disabled={!isAdmin}
                  onChange={(e) => handleToggle('evidenceRequired', e.target.checked)}
                  className="w-9 h-5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all cursor-pointer border border-border"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-muted/10">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">Badge Automations Auto-Award</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Automatically trigger event checker to unlock badges on XP changes</p>
                </div>
                <input 
                  type="checkbox"
                  checked={config?.badgeAutoAward || false}
                  disabled={!isAdmin}
                  onChange={(e) => handleToggle('badgeAutoAward', e.target.checked)}
                  className="w-9 h-5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all cursor-pointer border border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 text-primary mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure communication channels and alert types for ESG activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-muted/10">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">In-App Alerts</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Show notifications directly in the top navigation bar</p>
                </div>
                <input 
                  type="checkbox"
                  checked={config?.notifyInApp ?? true}
                  disabled={!isAdmin}
                  onChange={(e) => handleToggle('notifyInApp', e.target.checked)}
                  className="w-9 h-5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all cursor-pointer border border-border"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border/40 rounded-2xl bg-muted/10">
                <div className="pr-4">
                  <p className="text-xs font-bold text-foreground">Email Notifications</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Dispatch system digest emails to stakeholders</p>
                </div>
                <input 
                  type="checkbox"
                  checked={config?.notifyEmail ?? false}
                  disabled={!isAdmin}
                  onChange={(e) => handleToggle('notifyEmail', e.target.checked)}
                  className="w-9 h-5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-all cursor-pointer border border-border"
                />
              </div>

              <div className="border-t border-border/40 pt-4 space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trigger Notifications For:</p>

                <div className="flex items-center justify-between p-2 rounded-xl bg-card">
                  <span className="text-xs font-semibold text-foreground">New Compliance Issue Raised</span>
                  <input 
                    type="checkbox"
                    checked={config?.notifyNewCompliance ?? true}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle('notifyNewCompliance', e.target.checked)}
                    className="w-8 h-4.5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all cursor-pointer border border-border"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-card">
                  <span className="text-xs font-semibold text-foreground">CSR / Challenge Approvals</span>
                  <input 
                    type="checkbox"
                    checked={config?.notifyApprovalDecisions ?? true}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle('notifyApprovalDecisions', e.target.checked)}
                    className="w-8 h-4.5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all cursor-pointer border border-border"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-card">
                  <span className="text-xs font-semibold text-foreground">Policy Acknowledgement Reminders</span>
                  <input 
                    type="checkbox"
                    checked={config?.notifyPolicyReminders ?? true}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle('notifyPolicyReminders', e.target.checked)}
                    className="w-8 h-4.5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all cursor-pointer border border-border"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-card">
                  <span className="text-xs font-semibold text-foreground">Badge Unlock Alerts</span>
                  <input 
                    type="checkbox"
                    checked={config?.notifyBadgeUnlocks ?? true}
                    disabled={!isAdmin}
                    onChange={(e) => handleToggle('notifyBadgeUnlocks', e.target.checked)}
                    className="w-8 h-4.5 bg-muted rounded-full appearance-none checked:bg-primary relative before:absolute before:h-3.5 before:w-3.5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-3.5 before:transition-all cursor-pointer border border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Departments & Categories Registry */}
        <div className="space-y-6">
          {/* Department Directory */}
          <Card className="bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Layers className="w-5 h-5 text-esg-gov mr-2" />
                Departments Directory
              </CardTitle>
              <CardDescription>Register corporate branches for scoped reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <form onSubmit={handleCreateDept} className="flex gap-2 pb-4 border-b border-border/40">
                  <input 
                    type="text" 
                    placeholder="Department Name (e.g. Finance)"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:ring-0"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Code (e.g. FIN)"
                    value={deptCode}
                    maxLength={5}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-20 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground text-center focus:ring-0"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={createDept.isPending}
                    className="bg-primary text-primary-foreground p-1.5 rounded-xl hover:bg-primary/95 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              )}
              
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {depts.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-2.5 rounded-xl border border-border/40 bg-card/60 text-xs">
                    <span className="font-semibold text-foreground">{d.name}</span>
                    <span className="font-mono text-muted-foreground bg-muted border border-border/30 px-2 py-0.5 rounded text-[10px]">
                      {d.code}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories configuration */}
          <Card className="bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Sliders className="w-5 h-5 text-esg-points mr-2" />
                Categories Config Registry
              </CardTitle>
              <CardDescription>Configure categories parameters for social items and challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <form onSubmit={handleCreateCat} className="flex gap-2 pb-4 border-b border-border/40">
                  <input 
                    type="text" 
                    placeholder="Category Label (e.g. Clean Energy)"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:ring-0"
                    required
                  />
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:ring-0"
                  >
                    <option value="CSR_ACTIVITY">Social CSR</option>
                    <option value="CHALLENGE">Challenge</option>
                  </select>
                  <button 
                    type="submit"
                    disabled={createCat.isPending}
                    className="bg-primary text-primary-foreground p-1.5 rounded-xl hover:bg-primary/95 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              )}
              
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-2.5 rounded-xl border border-border/40 bg-card/60 text-xs">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      c.type === 'CSR_ACTIVITY' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {c.type === 'CSR_ACTIVITY' ? 'CSR' : 'Challenge'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success alert toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs">{successToast}</span>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
