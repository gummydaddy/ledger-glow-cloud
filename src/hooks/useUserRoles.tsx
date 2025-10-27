import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'accountant' | 'user';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsAdmin(false);
      setIsAccountant(false);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        const userRoles = data.map((r) => r.role as UserRole);
        setRoles(userRoles);
        setIsAdmin(userRoles.includes('admin'));
        setIsAccountant(userRoles.includes('accountant'));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  return { roles, isAdmin, isAccountant, loading };
};
