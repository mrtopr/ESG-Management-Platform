import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockHandlers, setSessionUser, getSessionUser } from '../api/client';
import { db } from '../api/client';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: mockHandlers.getCurrentUser,
  });

  const switchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      setSessionUser(userId);
      return getSessionUser();
    },
    onSuccess: () => {
      // Invalidate everything to refresh data from new user perspective
      queryClient.invalidateQueries();
    },
  });

  const allUsers = db.employees.map(emp => ({
    ...emp,
    departmentName: db.departments.find(d => d.id === emp.departmentId)?.name || 'Unknown'
  }));

  return {
    user,
    isLoading,
    switchUser: switchUserMutation.mutate,
    isSwitching: switchUserMutation.isPending,
    allUsers,
    isAdmin: user?.role === 'ESG_ADMIN',
    isDeptHead: user?.role === 'DEPT_HEAD',
    isEmployee: user?.role === 'EMPLOYEE',
  };
};
