import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomerFormDialog, CustomerFormValues } from '@/components/customers/CustomerFormDialog';

interface Customer {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  tax_number: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const Customers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load customers', description: error.message, variant: 'destructive' });
      return;
    }
    setCustomers(data || []);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesTerm = !term ||
        c.company_name.toLowerCase().includes(term) ||
        (c.contact_person || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.phone || '').toLowerCase().includes(term) ||
        (c.city || '').toLowerCase().includes(term);
      return matchesTerm;
    });
  }, [customers, searchTerm]);

  const handleCreateOrUpdate = async (values: CustomerFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage customers.', variant: 'destructive' });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('customers')
        .update({
          company_name: values.company_name,
          contact_person: values.contact_person || null,
          email: values.email || null,
          phone: values.phone || null,
          city: values.city || null,
          tax_number: values.tax_number || null,
          is_active: values.is_active,
        })
        .eq('id', editing.id)
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Customer updated' });
        setDialogOpen(false);
        setEditing(null);
        fetchCustomers();
      }
    } else {
      const { error } = await supabase
        .from('customers')
        .insert([
          {
            user_id: user.id,
            company_name: values.company_name,
            contact_person: values.contact_person || null,
            email: values.email || null,
            phone: values.phone || null,
            city: values.city || null,
            tax_number: values.tax_number || null,
            is_active: values.is_active,
          },
        ]);

      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Customer created' });
        setDialogOpen(false);
        fetchCustomers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this customer? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Customer deleted' });
      fetchCustomers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer information
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            A list of all your customers and their contact information
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading customers…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium mb-2">No customers yet</h3>
                <p className="text-sm mb-6">Add your first customer to get started</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Customer
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.company_name}</TableCell>
                    <TableCell>{c.contact_person || '-'}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>{c.city || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setEditing(null); } setDialogOpen(o); }}
        initialData={editing ? {
          company_name: editing.company_name,
          contact_person: editing.contact_person || '',
          email: editing.email || '',
          phone: editing.phone || '',
          city: editing.city || '',
          tax_number: editing.tax_number || '',
          is_active: editing.is_active ?? true,
        } : undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Customers;