import React from 'react';
import { 
  Trophy, RefreshCw, Layers, TrendingUp, Leaf, Users, ShieldCheck, 
  ArrowUpRight, Clock, Award, Star
} from 'lucide-react';
import { useScores } from '../hooks/useScores';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useToast } from '../hooks/useToast';
import { useCarbonTransactions, useParticipations, useChallengeParticipations, useDepartments } from '../api/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

export const Dashboard = () => {
  const { user, isAdmin, isDeptHead } = useAuth();
  const { orgScore, scores, recalculateScore, isRecalculating } = useScores();
  const { rankings, isLoading: boardLoading } = useLeaderboard();
  const { toast } = useToast();

  const { data: depts = [] } = useDepartments();
  const { data: carbonTxs = [] } = useCarbonTransactions();
  const { data: csrPrts = [] } = useParticipations();
  const { data: challengePrts = [] } = useChallengeParticipations();

  const handleRecalculateAll = () => {
    toast('Recalculating ESG Indexes across all departments...', 'info');
    depts.forEach(dept => {
      recalculateScore(dept.id);
    });
    setTimeout(() => {
      toast('ESG Scoring Ledger recalculation complete!', 'success');
    }, 1000);
  };

  const activities = [
    ...carbonTxs.map(tx => ({
      id: tx.id,
      type: 'ENVIRONMENTAL',
      message: `Carbon log logged: ${tx.co2Amount} kg CO2e for ${tx.sourceType}`,
      user: 'ERP System',
      date: new Date(tx.date)
    })),
    ...csrPrts.map(p => ({
      id: p.id,
      type: 'SOCIAL',
      message: `${p.employee?.name || 'Employee'} participation in CSR activity approved (+50 pts)`,
      user: p.employee?.name || 'System',
      date: new Date(p.createdAt)
    })),
    ...challengePrts.map(ch => ({
      id: ch.id,
      type: 'GAMIFICATION',
      message: `${ch.employee?.name || 'Employee'} achieved challenge progress (${ch.progress}%)`,
      user: ch.employee?.name || 'System',
      date: new Date(ch.createdAt)
    }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5);

  const chartData = scores.map(score => ({
    name: score.department?.name.split(' ')[0] || 'Dept',
    Env: score.environmentalScore,
    Soc: score.socialScore,
    Gov: score.governanceScore,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
            <Layers className="w-8 h-8 text-primary mr-2.5" />
            ESG Scoring Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Operational B2B ledger mapping environmental offsets, social volunteers, and governance indices.
          </p>
        </div>

        {(isAdmin || isDeptHead) && (
          <button 
            onClick={handleRecalculateAll}
            disabled={isRecalculating}
            className="flex items-center space-x-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:scale-95 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Scores</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass className="relative border-primary/20 overflow-hidden md:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <CardHeader className="pb-1">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px] text-primary">Consolidated ESG Index</CardDescription>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-5xl font-extrabold font-display bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent">
                {orgScore.total}
              </span>
              <span className="text-muted-foreground text-xs">/ 100</span>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary mr-1" />
              <span>Fintech-grade sustainability rating</span>
            </div>
          </CardContent>
        </Card>

        <Card glass className="flex flex-col justify-between">
          <CardHeader className="pb-1">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Environmental Index</CardDescription>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-3xl font-extrabold text-esg-env font-display">{orgScore.env}</span>
              <span className="text-muted-foreground text-xs">/ 100</span>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Scope 1 & 2 Emissions</span>
              <span className="font-bold text-foreground flex items-center">
                <Leaf className="w-3.5 h-3.5 text-esg-env mr-1" /> Verified
              </span>
            </div>
          </CardContent>
        </Card>

        <Card glass className="flex flex-col justify-between">
          <CardHeader className="pb-1">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Social Impact Index</CardDescription>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-3xl font-extrabold text-esg-social font-display">{orgScore.social}</span>
              <span className="text-muted-foreground text-xs">/ 100</span>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>CSR Volunteering</span>
              <span className="font-bold text-foreground flex items-center">
                <Users className="w-3.5 h-3.5 text-esg-social mr-1" /> Active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card glass className="flex flex-col justify-between">
          <CardHeader className="pb-1">
            <CardDescription className="uppercase tracking-wider font-semibold text-[10px]">Governance Index</CardDescription>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-3xl font-extrabold text-esg-gov font-display">{orgScore.gov}</span>
              <span className="text-muted-foreground text-xs">/ 100</span>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Integrity & Policies</span>
              <span className="font-bold text-foreground flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-esg-gov mr-1" /> Compliant
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg">Departmental ESG Comparison</CardTitle>
            <CardDescription>Breakdown of Environmental, Social, and Governance performance indexes by business branch</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No score records compiled. Click "Recalculate Scores" to populate.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconSize={10} fontSize={11} />
                  <Bar dataKey="Env" name="Environmental" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Soc" name="Social" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gov" name="Governance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 text-muted-foreground mr-2" />
              Activity Feed
            </CardTitle>
            <CardDescription>Chronological audits of operational log modifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">No activity logged yet.</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-relaxed pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {act.type === 'ENVIRONMENTAL' && <Leaf className="w-4 h-4 text-esg-env" />}
                    {act.type === 'SOCIAL' && <Users className="w-4 h-4 text-esg-social" />}
                    {act.type === 'GAMIFICATION' && <Award className="w-4.5 h-4.5 text-esg-points" />}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{act.user}</span>
                    <span className="text-muted-foreground"> • {act.message}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{act.date.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
            Top Engagement Standings
          </CardTitle>
          <CardDescription>Ranks determined by points ledger contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {boardLoading ? (
              <div className="text-center py-6 text-muted-foreground text-xs">Loading standings...</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground">
                    <th className="py-2.5 px-4 font-semibold uppercase">Rank</th>
                    <th className="py-2.5 px-4 font-semibold uppercase">Employee</th>
                    <th className="py-2.5 px-4 font-semibold uppercase">Department</th>
                    <th className="py-2.5 px-4 font-semibold uppercase text-right">Points Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rankings.slice(0, 3).map((row) => (
                    <tr key={row.id} className={`hover:bg-muted/30 transition-colors ${row.id === user?.id ? 'bg-primary/5 text-primary' : ''}`}>
                      <td className="py-2.5 px-4 font-bold">#{row.rank}</td>
                      <td className="py-2.5 px-4 font-medium text-foreground">{row.name}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{row.department}</td>
                      <td className="py-2.5 px-4 font-bold text-esg-points text-right">{row.xp} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;
