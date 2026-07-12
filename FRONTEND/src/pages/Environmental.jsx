import React, { useState } from 'react';
import { 
  Plus, Leaf, ArrowUpRight, BarChart3
} from 'lucide-react';
import { 
  useCarbonTransactions, useCreateCarbonTransaction, 
  useEmissionFactors, useGoals, useDepartments, useConfig 
} from '../api/queries';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Dialog } from '../components/Dialog';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

export const Environmental = () => {
  const { user, isAdmin, isDeptHead } = useAuth();
  
  // Queries
  const { data: transactions = [], isLoading: txLoading } = useCarbonTransactions();
  const { data: factors = [] } = useEmissionFactors();
  const { data: goals = [] } = useGoals();
  const { data: depts = [] } = useDepartments();

  // Mutations
  const createTx = useCreateCarbonTransaction();

  const { data: config } = useConfig();

  // Component State
  const [modalOpen, setModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState('Purchase');
  const [sourceId, setSourceId] = useState('');
  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [deptId, setDeptId] = useState(user?.departmentId || '');
  const [quantity, setQuantity] = useState('');
  const [manualCo2, setManualCo2] = useState('');

  // Calculate stats
  const totalEmissions = transactions.reduce((sum, tx) => sum + tx.co2Amount, 0);
  const averageEmissions = transactions.length ? Math.round(totalEmissions / transactions.length) : 0;

  // Chart data aggregation: Group emissions by source type
  const chartData = transactions.map(tx => ({
    date: new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: tx.co2Amount,
    source: tx.sourceType,
  }));

  const handleCreateTx = (e) => {
    e.preventDefault();
    if (!selectedFactorId || !sourceId || !deptId) return;

    const autoCalc = config?.autoEmissionCalc ?? true;
    const payload = {
      departmentId: deptId,
      emissionFactorId: selectedFactorId,
      sourceType,
      sourceId,
    };

    if (autoCalc) {
      if (!quantity) return;
      payload.quantity = Number(quantity);
    } else {
      if (!manualCo2) return;
      payload.co2Amount = Number(manualCo2);
    }

    createTx.mutate(payload, {
      onSuccess: () => {
        setModalOpen(false);
        setSourceId('');
        setQuantity('');
        setManualCo2('');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
            <Leaf className="w-8 h-8 text-esg-env mr-2.5 animate-pulse" />
            Environmental Performance
          </h1>
          <p className="text-muted-foreground text-sm">
            Log raw corporate operational logs and automatically transform them into verified carbon equivalents.
          </p>
        </div>
        
        {(isAdmin || isDeptHead) && (
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Log Carbon Log</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Total Emissions (Scope 1 & 2)</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-esg-env">{totalEmissions.toLocaleString()} kg CO2e</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-400 font-bold flex items-center mr-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> 2.4%
              </span>
              emissions change vs previous month
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Avg Transaction Footprint</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-foreground">{averageEmissions.toLocaleString()} kg</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              Based on {transactions.length} active ledger logs
            </p>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Goals Underway</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-primary">
              {goals.filter(g => g.status === 'active').length} Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Primary carbon reduction goal progress:</span>
              <span className="font-bold text-foreground">76%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Chart and Goal Progress Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="w-5 h-5 text-esg-env mr-2" />
              Emissions Timeline Analysis
            </CardTitle>
            <CardDescription>Visualizing recent carbon impact transactions (in kilograms CO2 equivalents)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {txLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No emissions logged yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="amount" name="CO2 Offset Target" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress Card */}
        <Card className="bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Environmental Goals</CardTitle>
            <CardDescription>Target status and target deadline checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map(goal => {
              const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <div key={goal.id} className="space-y-2 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">{goal.title}</h4>
                      <p className="text-[10px] text-muted-foreground">Deadline: {goal.deadline}</p>
                    </div>
                    <span className="text-xs font-bold text-esg-env">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-esg-env h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Current: {goal.currentValue} {goal.unit}</span>
                    <span>Target: {goal.targetValue} {goal.unit}</span>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Log Table */}
      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle className="text-lg">Carbon Transaction Ledger</CardTitle>
          <CardDescription>Direct audits of ERP events transformed into CO2e metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse text-foreground" summary="Carbon transactions logs and emissions equivalents">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Source Code</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Type</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Department</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Emission Activity</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Equivalent Weight</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{tx.sourceId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        tx.sourceType === 'Purchase' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        tx.sourceType === 'Manufacturing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        tx.sourceType === 'Fleet' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {tx.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{tx.department?.name || 'Loading...'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{tx.emissionFactor?.activity || 'Unknown'}</td>
                    <td className="py-3 px-4 font-bold text-esg-env">{tx.co2Amount} kg CO2e</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Modal dialog */}
      <Dialog 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Log Carbon Transaction"
      >
        <form onSubmit={handleCreateTx} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Source Activity Category</label>
            <select 
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Purchase">Purchase Log (Materials/Hardware)</option>
              <option value="Manufacturing">Manufacturing Operations</option>
              <option value="Fleet">Corporate Logistics/Fleet Vehicles</option>
              <option value="Expense">Office Facilities Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">ERP Log Identifier</label>
            <input 
              type="text" 
              placeholder="e.g. PO-890, EXP-711, VEH-04"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Emission Factor Coefficient</label>
            <select 
              value={selectedFactorId}
              onChange={(e) => setSelectedFactorId(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select Coefficient Factor...</option>
              {factors.map(ef => (
                <option key={ef.id} value={ef.id}>{ef.activity} ({ef.factorValue} {ef.unit})</option>
              ))}
            </select>
          </div>

          {config?.autoEmissionCalc ?? true ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Activity Quantity {selectedFactorId && `(${factors.find(f => f.id === selectedFactorId)?.unit.split('/')[1]?.trim() || ''})`}
              </label>
              <input 
                type="number"
                step="any"
                placeholder="e.g. 1500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Manual CO2 Amount (kg CO2e)
              </label>
              <input 
                type="number"
                step="any"
                placeholder="e.g. 350"
                value={manualCo2}
                onChange={(e) => setManualCo2(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Reporting Department</label>
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
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createTx.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center"
            >
              {createTx.isPending ? 'Calculating...' : 'Commit to Ledger'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
export default Environmental;
