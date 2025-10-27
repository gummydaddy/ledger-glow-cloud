import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Shield, UserCog, User as UserIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      toast({ title: 'Failed to load roles', description: rolesError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Group roles by user_id
    const rolesByUser: Record<string, string[]> = {};
    rolesData?.forEach((r) => {
      if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
      rolesByUser[r.user_id].push(r.role);
    });

    // Fetch profiles to get user info
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, created_at');

    if (profilesError) {
      toast({ title: 'Failed to load users', description: profilesError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Get auth users for emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      toast({ title: 'Failed to load user emails', description: authError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const authUsers = authData?.users || [];

    const usersWithRoles: UserWithRoles[] = profilesData.map((profile) => {
      const authUser = authUsers.find((u: { id: string }) => u.id === profile.user_id);
      return {
        id: profile.user_id,
        email: authUser?.email || 'Unknown',
        created_at: profile.created_at,
        roles: rolesByUser[profile.user_id] || [],
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    if (!rolesLoading && isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, rolesLoading]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Remove all existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      toast({ title: 'Failed to update role', description: deleteError.message, variant: 'destructive' });
      return;
    }

    // Add new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: newRole as 'admin' | 'accountant' | 'user' }]);

    if (insertError) {
      toast({ title: 'Failed to assign role', description: insertError.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Role updated successfully' });
    fetchUsers();
  };

  const getRoleBadgeIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'accountant':
        return <UserCog className="h-3 w-3 mr-1" />;
      default:
        return <UserIcon className="h-3 w-3 mr-1" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'accountant':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (rolesLoading) {
    return <div className="text-center py-12">Loading permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Assign roles to control user access levels</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right">Manage Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline">No roles</Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              <span className="flex items-center">
                                {getRoleBadgeIcon(role)}
                                {role}
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.roles[0] || 'user'}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[150px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <span className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2" />
                              User
                            </span>
                          </SelectItem>
                          <SelectItem value="accountant">
                            <span className="flex items-center">
                              <UserCog className="h-4 w-4 mr-2" />
                              Accountant
                            </span>
                          </SelectItem>
                          <SelectItem value="admin">
                            <span className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Admin
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
