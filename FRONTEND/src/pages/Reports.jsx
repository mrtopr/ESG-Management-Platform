import React, { useState } from 'react';
import { 
  FileText, Filter, RefreshCw, BarChart2, CheckCircle, 
  FileSpreadsheet, Table, FileArchive, Eye
} from 'lucide-react';
import { useCarbonTransactions, useCSRActivities, useComplianceIssues, useDepartments } from '../api/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/Card';
import { db } from '../api/client';

export const Reports = () => {
  // Queries
  const { data: depts = [] } = useDepartments();
  const { data: transactions = [] } = useCarbonTransactions();
  const { data: csrActivities = [] } = useCSRActivities();
  const { data: issues = [] } = useComplianceIssues();

  // Filters State
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-07-01');
  const [dateTo, setDateTo] = useState('2026-07-31');
  const [includeEnv, setIncludeEnv] = useState(true);
  const [includeSocial, setIncludeSocial] = useState(true);
  const [includeGov, setIncludeGov] = useState(true);

  // Exporters State
  const [generating, setGenerating] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Computations
  const filteredTxs = transactions.filter(tx => {
    const deptMatch = !selectedDeptId || tx.departmentId === selectedDeptId;
    const date = new Date(tx.date).toISOString().split('T')[0];
    const dateMatch = date >= dateFrom && date <= dateTo;
    return deptMatch && dateMatch;
  });

  const filteredCsrs = csrActivities.filter(act => {
    const deptMatch = !selectedDeptId || act.departmentId === selectedDeptId;
    const dateMatch = act.date >= dateFrom && act.date <= dateTo;
    return deptMatch && dateMatch;
  });

  function auditsWithDept(auditId) {
    if (!selectedDeptId) return true;
    const audit = db.audits.find(a => a.id === auditId);
    return audit?.departmentId === selectedDeptId;
  }

  const filteredIssues = issues.filter(iss => {
    const auditMatch = auditsWithDept(iss.auditId);
    const date = new Date(iss.createdAt).toISOString().split('T')[0];
    const dateMatch = date >= dateFrom && date <= dateTo;
    return auditMatch && dateMatch;
  });

  // Aggregate stats
  const totalCo2 = filteredTxs.reduce((sum, tx) => sum + tx.co2Amount, 0);
  const totalCsrCount = filteredCsrs.length;
  const totalIssuesCount = filteredIssues.length;
  const resolvedIssues = filteredIssues.filter(i => i.status === 'RESOLVED').length;

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowPreview(true);
    }, 800);
  };

  const handleExport = (type) => {
    setExportType(type);
    
    const params = new URLSearchParams({
      format: type,
      departmentId: selectedDeptId,
      dateFrom,
      dateTo,
      includeEnv: includeEnv ? 'true' : 'false',
      includeSocial: includeSocial ? 'true' : 'false',
      includeGov: includeGov ? 'true' : 'false'
    });

    const link = document.createElement('a');
    link.href = `/api/reports/export?${params.toString()}`;
    const ext = type === 'excel' ? 'xls' : type === 'pdf' ? 'txt' : 'csv';
    link.setAttribute('download', `esg-report-${new Date().toISOString().split('T')[0]}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setExportType(null);
      setSuccessToast(`ESG_Report_${new Date().toISOString().split('T')[0]}.${ext} compiled & downloaded successfully!`);
      setTimeout(() => setSuccessToast(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
          <FileText className="w-8 h-8 text-emerald-400 mr-2.5" />
          ESG Reports Builder
        </h1>
        <p className="text-muted-foreground text-sm">
          Select parameters to compile audited sustainability disclosures in standard PDF, Excel, and CSV templates.
        </p>
      </div>

      {/* Main Grid: Filters Form & Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Form */}
        <Card className="bg-card/45">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 text-primary mr-2" />
              Report Parameters
            </CardTitle>
            <CardDescription>Filter parameters for compiling audit outputs</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Department Scope</label>
                <select 
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="">All Corporate Departments</option>
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date Range From</label>
                  <input 
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date Range To</label>
                  <input 
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Scope Modules</label>
                <div className="space-y-2.5">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeEnv}
                      onChange={(e) => setIncludeEnv(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-0 w-4 h-4"
                    />
                    <span>Environmental (Carbon & Target Goals)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeSocial}
                      onChange={(e) => setIncludeSocial(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-0 w-4 h-4"
                    />
                    <span>Social (Volunteering & CSR Activities)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeGov}
                      onChange={(e) => setIncludeGov(e.target.checked)}
                      className="rounded border-border bg-muted text-primary focus:ring-0 w-4 h-4"
                    />
                    <span>Governance (Policies & Audit Violations)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/95 transition-all duration-200"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aggregating Ledger...</span>
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    <span>Generate Auditor Preview</span>
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Live Preview Panel */}
        <div className="lg:col-span-2">
          {showPreview ? (
            <Card className="bg-card/35 h-full flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-border/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">ESG Disclosure Auditing Preview</CardTitle>
                      <CardDescription>
                        Scope: {selectedDeptId ? depts.find(d => d.id === selectedDeptId)?.name : 'Consolidated Corporation'} • {dateFrom} to {dateTo}
                      </CardDescription>
                    </div>
                    
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Audited
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Aggregated stats row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {includeEnv && (
                      <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl">
                        <p className="text-[9px] uppercase font-bold text-esg-env tracking-wider">Carbon Logged</p>
                        <p className="text-xl font-extrabold mt-1">{totalCo2.toLocaleString()} kg</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Across {filteredTxs.length} carbon entries</p>
                      </div>
                    )}
                    
                    {includeSocial && (
                      <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl">
                        <p className="text-[9px] uppercase font-bold text-esg-social tracking-wider">CSR Initiatives</p>
                        <p className="text-xl font-extrabold mt-1">{totalCsrCount} Events</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Campaigns volunteering log</p>
                      </div>
                    )}
                    
                    {includeGov && (
                      <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl">
                        <p className="text-[9px] uppercase font-bold text-esg-gov tracking-wider">Audit Warning Infractions</p>
                        <p className="text-xl font-extrabold mt-1">{totalIssuesCount} Infractions</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{resolvedIssues} resolved, {totalIssuesCount - resolvedIssues} active</p>
                      </div>
                    )}
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-3 bg-muted/10 p-4 border border-border/30 rounded-2xl text-xs">
                    <h4 className="font-bold text-foreground">Disclosures Audit Narrative Summary</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      This summary report logs the organizational boundary disclosures for {selectedDeptId ? depts.find(d => d.id === selectedDeptId)?.name : 'EcoSphere Corporation'} during the active period from {dateFrom} to {dateTo}. 
                      A total of {filteredTxs.length} carbon logs have been converted with verified emission factors. 
                      {includeSocial && ` Social modules register ${totalCsrCount} campaigns with volunteering proof files verified.`} 
                      {includeGov && ` Governance audit highlights ${totalIssuesCount} total infractions with a resolution rate of ${totalIssuesCount ? Math.round((resolvedIssues / totalIssuesCount) * 100) : 100}%.`}
                    </p>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="flex justify-between items-center py-4 bg-muted/25">
                <span className="text-[10px] text-muted-foreground font-mono">Generated: {new Date().toLocaleString()}</span>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleExport('pdf')}
                    disabled={!!exportType}
                    className="flex items-center space-x-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold px-3 py-1.5 rounded-xl transition-all duration-200 text-xs"
                  >
                    {exportType === 'pdf' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                    <span>PDF</span>
                  </button>

                  <button 
                    onClick={() => handleExport('excel')}
                    disabled={!!exportType}
                    className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold px-3 py-1.5 rounded-xl transition-all duration-200 text-xs"
                  >
                    {exportType === 'excel' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                    <span>Excel</span>
                  </button>

                  <button 
                    onClick={() => handleExport('csv')}
                    disabled={!!exportType}
                    className="flex items-center space-x-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 font-bold px-3 py-1.5 rounded-xl transition-all duration-200 text-xs"
                  >
                    {exportType === 'csv' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Table className="w-3.5 h-3.5" />}
                    <span>CSV</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-card/25 border-dashed border-border/80 h-full flex flex-col items-center justify-center py-20 text-center text-xs text-muted-foreground">
              <Eye className="w-12 h-12 text-muted-foreground/30 mb-2.5" />
              <p className="font-semibold text-foreground">No Auditable Preview Compiled</p>
              <p className="max-w-xs mt-1 leading-relaxed">
                Configure scope modules, dates range bounds, and department scopes on the parameters panel and click generate to review audit disclosures.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Exporter Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs">{successToast}</span>
        </div>
      )}
    </div>
  );
};
export default Reports;
