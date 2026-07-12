import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockHandlers, setSessionUser, getSessionUser, db } from '../api/client';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const sessionUserId = localStorage.getItem('ecosphere_user_id');
      if (!sessionUserId) return null;
      return mockHandlers.getCurrentUser();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email }) => {
      return mockHandlers.login(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const employees = db.employees;
      const newEmp = {
        id: `emp-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        departmentId: data.departmentId,
        xp: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const exists = employees.find(e => e.email === data.email);
      if (exists) throw new Error('Email already exists');
      
      employees.push(newEmp);
      db.employees = employees;
      
      setSessionUser(newEmp.id);
      return { token: 'mock-jwt-token', user: newEmp };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries();
    }
  });

  const switchUserMutation = useMutation({
    mutationFn: async (userId) => {
      setSessionUser(userId);
      return getSessionUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const logout = () => {
    localStorage.removeItem('ecosphere_user_id');
    queryClient.setQueryData(['currentUser'], null);
    queryClient.invalidateQueries();
  };

  const allUsers = db.employees.map(emp => ({
    ...emp,
    departmentName: db.departments.find(d => d.id === emp.departmentId)?.name || 'Unknown'
  }));

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    switchUser: switchUserMutation.mutate,
    isSwitching: switchUserMutation.isPending,
    logout,
    allUsers,
    isAdmin: user?.role === 'ESG_ADMIN',
    isDeptHead: user?.role === 'DEPT_HEAD',
    isEmployee: user?.role === 'EMPLOYEE',
  };
};
