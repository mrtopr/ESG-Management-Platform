import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockHandlers, db } from './client';
import { useToast } from '../hooks/useToast';

// ─────────────── ENVIRONMENTAL HOOKS ───────────────

export const useEmissionFactors = () => {
  return useQuery({
    queryKey: ['emissionFactors'],
    queryFn: mockHandlers.getEmissionFactors,
  });
};

export const useCreateEmissionFactor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createEmissionFactor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emissionFactors'] });
      toast('New emission factor registered successfully.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createCarbonTransaction(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carbonTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast(`Carbon logged successfully! +${data.co2Amount} kg CO2e committed to ledger.`, 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast('ESG Environmental Goal established.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createCSRActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
      toast('CSR activity campaign scheduled successfully.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ activityId, proofUrl }) => 
      mockHandlers.createParticipation(activityId, proofUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      toast('Participation points request logged. Awaiting admin review.', 'info');
    },
    onError: (err) => {
      toast(err.message || 'Already requested points for this activity.', 'error');
    }
  });
};

export const useApproveParticipation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.approveParticipation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast(`Volunteering approved! Employee awarded +50 Points & XP.`, 'success');
      
      const badges = db.employeeBadges.filter(eb => eb.employeeId === data.employeeId);
      const prevCount = localStorage.getItem(`badge_count_${data.employeeId}`) || '0';
      if (badges.length > Number(prevCount)) {
        localStorage.setItem(`badge_count_${data.employeeId}`, String(badges.length));
        const newBadge = db.badges.find(b => b.id === badges[badges.length - 1].badgeId);
        if (newBadge) {
          setTimeout(() => {
            toast(`Congratulations! Unlocked "${newBadge.name}" Badge: ${newBadge.description}`, 'badge');
          }, 1000);
        }
      }
    },
  });
};

export const useRejectParticipation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.rejectParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      toast('CSR participation points request rejected.', 'error');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast('Integrity policy published successfully.', 'success');
    },
  });
};

export const useAcknowledgePolicy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.acknowledgePolicy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast('Governance policy e-signature recorded. +20 XP awarded.', 'success');
      
      const badges = db.employeeBadges.filter(eb => eb.employeeId === data.employeeId);
      const prevCount = localStorage.getItem(`badge_count_${data.employeeId}`) || '0';
      if (badges.length > Number(prevCount)) {
        localStorage.setItem(`badge_count_${data.employeeId}`, String(badges.length));
        const newBadge = db.badges.find(b => b.id === badges[badges.length - 1].badgeId);
        if (newBadge) {
          setTimeout(() => {
            toast(`Congratulations! Unlocked "${newBadge.name}" Badge: ${newBadge.description}`, 'badge');
          }, 1000);
        }
      }
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast('Governance inspection audit scheduled.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createComplianceIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast('Compliance red flag warning issued.', 'warning');
    },
  });
};

export const useUpdateComplianceIssueStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }) => 
      mockHandlers.updateComplianceIssueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast('Compliance warning status updated successfully.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createChallenge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast('New corporate environmental challenge created.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (challengeId) => mockHandlers.participateInChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      toast('Joined challenge! Update progress parameters as you complete tasks.', 'success');
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ participationId, progress, proofUrl }) => 
      mockHandlers.updateChallengeProgress(participationId, progress, proofUrl),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      
      if (data.approvalStatus === 'APPROVED') {
        toast(`Challenge completed! Awarded +${data.xpAwarded} XP points.`, 'success');
        
        const badges = db.employeeBadges.filter(eb => eb.employeeId === data.employeeId);
        const prevCount = localStorage.getItem(`badge_count_${data.employeeId}`) || '0';
        if (badges.length > Number(prevCount)) {
          localStorage.setItem(`badge_count_${data.employeeId}`, String(badges.length));
          const newBadge = db.badges.find(b => b.id === badges[badges.length - 1].badgeId);
          if (newBadge) {
            setTimeout(() => {
              toast(`Congratulations! Unlocked "${newBadge.name}" Badge: ${newBadge.description}`, 'badge');
            }, 1000);
          }
        }
      } else {
        toast(`Challenge progress updated to ${data.progress}%. Awaiting proof check.`, 'info');
      }
    },
  });
};

export const useApproveChallengeParticipation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.approveChallengeParticipation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['employeeBadges'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast(`Challenge submission approved! +${data.xpAwarded} XP issued.`, 'success');

      const badges = db.employeeBadges.filter(eb => eb.employeeId === data.employeeId);
      const prevCount = localStorage.getItem(`badge_count_${data.employeeId}`) || '0';
      if (badges.length > Number(prevCount)) {
        localStorage.setItem(`badge_count_${data.employeeId}`, String(badges.length));
        const newBadge = db.badges.find(b => b.id === badges[badges.length - 1].badgeId);
        if (newBadge) {
          setTimeout(() => {
            toast(`Congratulations! Unlocked "${newBadge.name}" Badge: ${newBadge.description}`, 'badge');
          }, 1000);
        }
      }
    },
  });
};

export const useRejectChallengeParticipation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.rejectChallengeParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeParticipations'] });
      toast('Challenge submission proof rejected.', 'error');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast('Sustainable store reward registered.', 'success');
    },
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id) => mockHandlers.redeemReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast('Reward voucher redeemed successfully! Check points ledger.', 'success');
    },
    onError: (err) => {
      toast(err.message || 'Redemption failed.', 'error');
    }
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast('Global configurations synchronized successfully.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => 
      mockHandlers.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast('Department registry added.', 'success');
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data) => mockHandlers.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast('ESG category criteria registered.', 'success');
    },
  });
};
