import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockHandlers } from './client';
import { 
  EmissionFactor, CarbonTransaction, EnvironmentalGoal, CsrActivity,
  EsgPolicy, Audit, ComplianceIssue, ComplianceStatus, Challenge,
  Reward, EsgConfig, Department, Category
} from '../types';

// ─────────────── ENVIRONMENTAL HOOKS ───────────────

export const useEmissionFactors = () => {
  return useQuery({
    queryKey: ['emissionFactors'],
    queryFn: mockHandlers.getEmissionFactors,
  });
};

export const useCreateEmissionFactor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EmissionFactor, 'id'>) => mockHandlers.createEmissionFactor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emissionFactors'] });
    },
  });
};

export const useCarbonTransactions = () => {
  return useQuery({
    queryKey: ['carbonTransactions'],
    queryFn: mockHandlers.getCarbonTransactions,
  });
};

export const useCreateCarbonTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CarbonTransaction, 'id' | 'co2Amount' | 'date'>) => 
      mockHandlers.createCarbonTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbonTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: mockHandlers.getGoals,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EnvironmentalGoal, 'id'>) => mockHandlers.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

// ─────────────── SOCIAL HOOKS ───────────────

export const useCSRActivities = () => {
  return useQuery({
    queryKey: ['csrActivities'],
    queryFn: mockHandlers.getCSRActivities,
  });
};

export const useCreateCSRActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CsrActivity, 'id'>) => mockHandlers.createCSRActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
    },
  });
};

export const useParticipations = () => {
  return useQuery({
    queryKey: ['participations'],
    queryFn: mockHandlers.getParticipations,
  });
};

export const useCreateParticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, proofUrl }: { activityId: string; proofUrl: string | null }) => 
      mockHandlers.createParticipation(activityId, proofUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
    },
  });
};

export const useApproveParticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.approveParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useRejectParticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.rejectParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
    },
  });
};

// ─────────────── GOVERNANCE HOOKS ───────────────

export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: mockHandlers.getPolicies,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EsgPolicy, 'id'>) => mockHandlers.createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useAcknowledgePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.acknowledgePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useAudits = () => {
  return useQuery({
    queryKey: ['audits'],
    queryFn: mockHandlers.getAudits,
  });
};

export const useCreateAudit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Audit, 'id'>) => mockHandlers.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });
};

export const useComplianceIssues = () => {
  return useQuery({
    queryKey: ['complianceIssues'],
    queryFn: mockHandlers.getComplianceIssues,
  });
};

export const useCreateComplianceIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ComplianceIssue, 'id' | 'createdAt'>) => mockHandlers.createComplianceIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useUpdateComplianceIssueStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ComplianceStatus }) => 
      mockHandlers.updateComplianceIssueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

// ─────────────── GAMIFICATION HOOKS ───────────────

export const useChallenges = () => {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: mockHandlers.getChallenges,
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Challenge, 'id'>) => mockHandlers.createChallenge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
};

export const useChallengeParticipations = () => {
  return useQuery({
    queryKey: ['challengeParticipations'],
    queryFn: mockHandlers.getChallengeParticipations,
  });
};

export const useParticipateInChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => mockHandlers.participateInChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ participationId, progress, proofUrl }: { participationId: string; progress: number; proofUrl: string | null }) => 
      mockHandlers.updateChallengeProgress(participationId, progress, proofUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useApproveChallengeParticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.approveChallengeParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useRejectChallengeParticipation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.rejectChallengeParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
    },
  });
};

export const useBadges = () => {
  return useQuery({
    queryKey: ['badges'],
    queryFn: mockHandlers.getBadges,
  });
};

export const useEmployeeBadges = () => {
  return useQuery({
    queryKey: ['employeeBadges'],
    queryFn: mockHandlers.getEmployeeBadges,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: mockHandlers.getLeaderboard,
  });
};

export const useRewards = () => {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: mockHandlers.getRewards,
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Reward, 'id'>) => mockHandlers.createReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockHandlers.redeemReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};

// ─────────────── SCORING & CONFIG HOOKS ───────────────

export const useDepartmentScores = () => {
  return useQuery({
    queryKey: ['departmentScores'],
    queryFn: mockHandlers.getDepartmentScores,
  });
};

export const useConfig = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: mockHandlers.getConfig,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EsgConfig>) => mockHandlers.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: mockHandlers.getDepartments,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Department, 'id' | 'employeeCount' | 'createdAt' | 'updatedAt'>) => 
      mockHandlers.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: mockHandlers.getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) => mockHandlers.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
