import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Calendar, Receipt, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExpenseFormDialog, ExpenseFormValues } from '@/components/expenses/ExpenseFormDialog';

interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string | null;
  payment_method: string | null;
  vendor_id: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

const Expenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const categories = [
    'Office Supplies',
    'Travel',
    'Meals & Entertainment',
    'Utilities',
    'Marketing',
    'Professional Services',
    'Equipment',
    'Other'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fetchExpenses = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load expenses', description: error.message, variant: 'destructive' });
      return;
    }
    setExpenses((data || []).map((e: any) => ({ ...e, amount: Number(e.amount) })));
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return expenses.filter((e) => {
      const matchesTerm = !term ||
        e.description.toLowerCase().includes(term) ||
        (e.category || '').toLowerCase().includes(term) ||
        (e.payment_method || '').toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || (e.category || '').toLowerCase() === categoryFilter;
      return matchesTerm && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const handleCreateOrUpdate = async (values: ExpenseFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage expenses.', variant: 'destructive' });
      return;
    }

    // Handle receipt upload if provided
    const file = (values as any).receipt_file as File | undefined;
    let receiptUrl = editing?.receipt_url || null;
    if (file) {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('receipts').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadErr) {
        toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' });
        return;
      }
      const { data: pub } = supabase.storage.from('receipts').getPublicUrl(path);
      receiptUrl = pub.publicUrl;
    }

    const payload = {
      user_id: user.id,
      description: values.description,
      amount: values.amount,
      total_amount: values.amount,
      expense_date: typeof values.expense_date === 'string' ? values.expense_date : values.expense_date?.toISOString().split('T')[0],
      category: values.category || null,
      payment_method: values.payment_method || null,
      vendor_id: values.vendor_id || null,
      receipt_url: receiptUrl,
    };

    if (editing) {
      const { error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', editing.id)
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Expense updated' });
        setDialogOpen(false);
        setEditing(null);
        fetchExpenses();
      }
    } else {
      const { error } = await supabase
        .from('expenses')
        .insert([payload]);

      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Expense created' });
        setDialogOpen(false);
        fetchExpenses();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this expense? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Expense deleted' });
      fetchExpenses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}</div>
            <p className="text-xs text-muted-foreground">Estimated based on listed items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</div>
            <p className="text-xs text-muted-foreground">Total expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average/Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expenses.length ? expenses.reduce((s, e) => s + e.amount, 0) / 12 : 0)}</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>
            A list of all your business expenses with receipts and details
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading expenses…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">🧾</div>
                <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
                <p className="text-sm mb-6">Start tracking your business expenses</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Expense
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell>{e.vendor_id ? e.vendor_id.slice(0, 8) + '…' : '-'}</TableCell>
                    <TableCell>{e.category || '-'}</TableCell>
                    <TableCell>{e.payment_method || '-'}</TableCell>
                    <TableCell>{e.receipt_url ? (
                      <a href={e.receipt_url} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                    ) : (
                      '-' 
                    )}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(e); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>
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

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setEditing(null); } setDialogOpen(o); }}
        initialData={editing ? {
          description: editing.description,
          amount: editing.amount,
          expense_date: new Date(editing.expense_date),
          category: editing.category || '',
          payment_method: editing.payment_method || '',
          vendor_id: editing.vendor_id || '',
        } : undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Expenses;