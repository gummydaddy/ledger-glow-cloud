import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VendorFormDialog, VendorFormValues } from '@/components/vendors/VendorFormDialog';

interface Vendor {
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

const Vendors = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const fetchVendors = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load vendors', description: error.message, variant: 'destructive' });
      return;
    }
    setVendors(data || []);
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return vendors.filter((v) => {
      const matchesTerm = !term ||
        v.company_name.toLowerCase().includes(term) ||
        (v.contact_person || '').toLowerCase().includes(term) ||
        (v.email || '').toLowerCase().includes(term) ||
        (v.phone || '').toLowerCase().includes(term) ||
        (v.city || '').toLowerCase().includes(term) ||
        (v.tax_number || '').toLowerCase().includes(term);
      return matchesTerm;
    });
  }, [vendors, searchTerm]);

  const handleCreateOrUpdate = async (values: VendorFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage vendors.', variant: 'destructive' });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('vendors')
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
        toast({ title: 'Vendor updated' });
        setDialogOpen(false);
        setEditing(null);
        fetchVendors();
      }
    } else {
      const { error } = await supabase
        .from('vendors')
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
        toast({ title: 'Vendor created' });
        setDialogOpen(false);
        fetchVendors();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this vendor? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Vendor deleted' });
      fetchVendors();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and service providers
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">
              Active vendor relationships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Payments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Paid to vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Outstanding amounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>
            A list of all your vendors and suppliers with their contact information
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading vendors…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-medium mb-2">No vendors yet</h3>
                <p className="text-sm mb-6">Add your suppliers and service providers</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vendor
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
                  <TableHead>Tax Number</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.company_name}</TableCell>
                    <TableCell>{v.contact_person || '-'}</TableCell>
                    <TableCell>{v.email || '-'}</TableCell>
                    <TableCell>{v.phone || '-'}</TableCell>
                    <TableCell>{v.city || '-'}</TableCell>
                    <TableCell>{v.tax_number || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(v); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)}>
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

      <VendorFormDialog
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

export default Vendors;