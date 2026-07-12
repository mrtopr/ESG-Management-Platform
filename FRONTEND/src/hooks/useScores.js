import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../api/client';

export const useScores = () => {
  const queryClient = useQueryClient();

  const calculateDepartmentScore = (departmentId) => {
    const config = db.config;
    const period = '2026-Q3';

    // 1. Environmental Score
    const transactions = db.carbonTransactions.filter(t => t.departmentId === departmentId);
    const totalCo2 = transactions.reduce((sum, t) => sum + t.co2Amount, 0);
    const envScore = Math.max(10, Math.round((100 - (totalCo2 / 50)) * 10) / 10);

    // 2. Social Score
    const deptEmployees = db.employees.filter(e => e.departmentId === departmentId).map(e => e.id);
    const approvedCSRCount = db.participations.filter(p => 
      deptEmployees.includes(p.employeeId) && p.approvalStatus === 'APPROVED'
    ).length;
    const socialScore = Math.min(100, 60 + (approvedCSRCount * 10));

    // 3. Governance Score
    const deptAudits = db.audits.filter(a => a.departmentId === departmentId).map(a => a.id);
    const issues = db.complianceIssues.filter(i => deptAudits.includes(i.auditId));
    const openCount = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
    const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
    const govScore = Math.max(0, 100 - (openCount * 15) - (overdueCount * 30));

    // 4. Cumulative Weighted Score
    const totalScore = Math.round(
      ((envScore * config.envWeight) + 
      (socialScore * config.socialWeight) + 
      (govScore * config.govWeight)) * 10
    ) / 10;

    return {
      departmentId,
      environmentalScore: envScore,
      socialScore,
      governanceScore: govScore,
      totalScore,
      period
    };
  };

  const getScoresQuery = useQuery({
    queryKey: ['departmentScores'],
    queryFn: async () => {
      const savedScores = db.departmentScores;
      const depts = db.departments;
      return savedScores.map(score => ({
        ...score,
        department: depts.find(d => d.id === score.departmentId)
      }));
    }
  });

  const recalculateMutation = useMutation({
    mutationFn: async (departmentId) => {
      const computed = calculateDepartmentScore(departmentId);
      const scores = db.departmentScores;
      
      const idx = scores.findIndex(s => s.departmentId === departmentId && s.period === computed.period);
      if (idx !== -1) {
        scores[idx] = {
          ...scores[idx],
          ...computed,
        };
      } else {
        scores.push({
          id: `score-${Date.now()}`,
          ...computed,
          createdAt: new Date().toISOString()
        });
      }
      db.departmentScores = scores;
      return computed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    }
  });

  const getOrgLevelScore = () => {
    const scores = getScoresQuery.data || [];
    if (scores.length === 0) return { env: 75, social: 70, gov: 80, total: 75 };

    const count = scores.length;
    const env = Math.round((scores.reduce((sum, s) => sum + s.environmentalScore, 0) / count) * 10) / 10;
    const social = Math.round((scores.reduce((sum, s) => sum + s.socialScore, 0) / count) * 10) / 10;
    const gov = Math.round((scores.reduce((sum, s) => sum + s.governanceScore, 0) / count) * 10) / 10;
    const total = Math.round((scores.reduce((sum, s) => sum + s.totalScore, 0) / count) * 10) / 10;

    return { env, social, gov, total };
  };

  return {
    scores: getScoresQuery.data || [],
    isLoading: getScoresQuery.isLoading,
    recalculateScore: recalculateMutation.mutate,
    isRecalculating: recalculateMutation.isPending,
    orgScore: getOrgLevelScore(),
    calculateLive: calculateDepartmentScore
  };
};
