import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type UserRole = 'admin' | 'moderator' | 'user';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's roles
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserRoleData[];
    },
    enabled: !!user,
  });

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return userRoles.some(userRole => userRole.role === role);
  };

  // Check if user is admin
  const isAdmin = hasRole('admin');
  
  // Check if user is moderator or admin
  const isModerator = hasRole('moderator') || isAdmin;

  // Assign role (server-side RLS enforced)
  const assignRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: UserRole }) => {
      // RLS policy enforces admin-only access, no client-side check needed
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role: role
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign role');
    },
  });

  // Remove role (server-side RLS enforced)
  const removeRoleMutation = useMutation({
    mutationFn: async ({ targetUserId, role }: { targetUserId: string; role: UserRole }) => {
      // RLS policy enforces admin-only access, no client-side check needed
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed successfully');
    },
    onError: (error) => {
      console.error('Error removing role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove role');
    },
  });

  return {
    userRoles,
    isLoading,
    hasRole,
    isAdmin,
    isModerator,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
};