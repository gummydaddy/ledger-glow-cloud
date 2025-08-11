import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvoiceFormDialog, InvoiceFormValues } from '@/components/invoices/InvoiceFormDialog';

interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string | null;
  status: string | null;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
}

const Invoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load invoices', description: error.message, variant: 'destructive' });
      return;
    }
    setInvoices(data || []);
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.filter((i) => {
      const matchesTerm = !term ||
        i.invoice_number.toLowerCase().includes(term) ||
        (i.status || '').toLowerCase().includes(term);
      return matchesTerm;
    });
  }, [invoices, searchTerm]);

  const handleCreateOrUpdate = async (values: InvoiceFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage invoices.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      invoice_number: values.invoice_number,
      customer_id: values.customer_id,
      invoice_date: typeof values.invoice_date === 'string' ? values.invoice_date : values.invoice_date?.toISOString().split('T')[0],
      due_date: values.due_date ? (typeof values.due_date === 'string' ? values.due_date : values.due_date.toISOString().split('T')[0]) : null,
      status: values.status,
    };

    if (editing) {
      const { error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', editing.id)
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invoice updated' });
        setDialogOpen(false);
        setEditing(null);
        fetchInvoices();
      }
    } else {
      const { error } = await supabase
        .from('invoices')
        .insert([payload]);

      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Invoice created' });
        setDialogOpen(false);
        fetchInvoices();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this invoice? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Invoice deleted' });
      fetchInvoices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your customer invoices
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            A list of all your invoices including their status and amounts
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading invoices…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                <p className="text-sm mb-6">Get started by creating your first invoice</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.invoice_number}</TableCell>
                    <TableCell>{i.customer_id.slice(0, 8)}…</TableCell>
                    <TableCell>{new Date(i.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{i.due_date ? new Date(i.due_date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor((i.status || 'draft').toLowerCase())}`}>
                        {(i.status || 'draft').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">${Number(i.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(i); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(i.id)}>
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

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setEditing(null); } setDialogOpen(o); }}
        initialData={editing ? {
          invoice_number: editing.invoice_number,
          customer_id: editing.customer_id,
          invoice_date: new Date(editing.invoice_date),
          due_date: editing.due_date ? new Date(editing.due_date) : undefined,
          status: (editing.status as any) || 'draft',
        } : undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Invoices;