import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrderFormDialog, PurchaseOrderFormValues } from '@/components/purchase-orders/PurchaseOrderFormDialog';

interface PurchaseOrder {
  id: string;
  user_id: string;
  vendor_id: string | null;
  po_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  created_at: string;
}

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<PurchaseOrderFormValues | undefined>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('order_date', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load purchase orders', description: error.message, variant: 'destructive' });
      return;
    }
    setOrders((data || []).map((po: any) => ({ ...po, total_amount: Number(po.total_amount) })));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((po) => {
      return !term ||
        po.po_number.toLowerCase().includes(term) ||
        po.status.toLowerCase().includes(term);
    });
  }, [orders, searchTerm]);

  const startEdit = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', orderId);

    setEditing(orderId);
    setEditingValues({
      po_number: order.po_number,
      vendor_id: order.vendor_id || '',
      order_date: new Date(order.order_date),
      expected_delivery_date: order.expected_delivery_date ? new Date(order.expected_delivery_date) : undefined,
      status: order.status,
      line_items: (items || []).map((it: any) => ({
        product_id: it.product_id || undefined,
        description: it.description,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        tax_percentage: Number(it.tax_percentage) || 0,
      })),
    });
    setDialogOpen(true);
  };

  const handleCreateOrUpdate = async (values: PurchaseOrderFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage purchase orders.', variant: 'destructive' });
      return;
    }

    const items = values.line_items;
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
    const taxTotal = items.reduce((sum, it) => sum + (it.quantity * it.unit_price * (it.tax_percentage || 0) / 100), 0);
    const total = subtotal + taxTotal;

    const poPayload = {
      user_id: user.id,
      po_number: values.po_number,
      vendor_id: values.vendor_id || null,
      order_date: typeof values.order_date === 'string' ? values.order_date : values.order_date?.toISOString().split('T')[0],
      expected_delivery_date: values.expected_delivery_date
        ? (typeof values.expected_delivery_date === 'string'
          ? values.expected_delivery_date
          : values.expected_delivery_date.toISOString().split('T')[0])
        : null,
      status: values.status,
      subtotal,
      tax_amount: taxTotal,
      total_amount: total,
    };

    if (editing) {
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update(poPayload)
        .eq('id', editing)
        .eq('user_id', user.id);

      if (poError) {
        toast({ title: 'Update failed', description: poError.message, variant: 'destructive' });
        return;
      }

      await supabase.from('purchase_order_items').delete().eq('purchase_order_id', editing);

      const itemsPayload = items.map((it) => ({
        purchase_order_id: editing,
        product_id: it.product_id || null,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tax_percentage: it.tax_percentage || 0,
        line_total: it.quantity * it.unit_price * (1 + (it.tax_percentage || 0) / 100),
        received_quantity: 0,
      }));

      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsPayload);

      if (itemsError) {
        toast({ title: 'Update failed', description: itemsError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Purchase order updated' });
        setDialogOpen(false);
        setEditing(null);
        setEditingValues(undefined);
        fetchOrders();
      }
    } else {
      const { data: newPO, error: poError } = await supabase
        .from('purchase_orders')
        .insert([poPayload])
        .select('id')
        .single();

      if (poError || !newPO) {
        toast({ title: 'Create failed', description: poError?.message || 'Unknown error', variant: 'destructive' });
        return;
      }

      const itemsPayload = items.map((it) => ({
        purchase_order_id: newPO.id,
        product_id: it.product_id || null,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tax_percentage: it.tax_percentage || 0,
        line_total: it.quantity * it.unit_price * (1 + (it.tax_percentage || 0) / 100),
        received_quantity: 0,
      }));

      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsPayload);

      if (itemsError) {
        toast({ title: 'Create failed', description: itemsError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Purchase order created' });
        setDialogOpen(false);
        fetchOrders();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this purchase order? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Purchase order deleted' });
      fetchOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      approved: 'secondary',
      ordered: 'default',
      received: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage inventory purchase orders and track deliveries
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setEditingValues(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending' || o.status === 'approved').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'ordered').length}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0))}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
          <CardDescription>
            Track and manage all your inventory purchase orders
          </CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading purchase orders…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">No purchase orders yet</h3>
                <p className="text-sm mb-6">Create your first purchase order to manage inventory</p>
                <Button onClick={() => { setEditing(null); setEditingValues(undefined); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Purchase Order
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(po.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(po.id)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(po.id)}>
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

      <PurchaseOrderFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null);
            setEditingValues(undefined);
          }
          setDialogOpen(o);
        }}
        initialData={editingValues}
        orderId={editing || undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default PurchaseOrders;
