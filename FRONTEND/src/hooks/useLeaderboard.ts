import { useQuery } from '@tanstack/react-query';
import { mockHandlers } from '../api/client';

export const useLeaderboard = () => {
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: mockHandlers.getLeaderboard,
  });

  return {
    rankings,
    isLoading,
  };
};
