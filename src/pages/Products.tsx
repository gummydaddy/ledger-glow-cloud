import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Package, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductFormDialog, ProductFormValues } from '@/components/products/ProductFormDialog';

interface Product {
  id: string;
  user_id: string;
  name: string;
  product_code: string | null;
  is_service: boolean | null;
  category: string | null;
  unit_price: number | null;
  current_stock: number | null;
  track_inventory: boolean | null;
  reorder_level: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Automotive',
    'Health & Beauty',
    'Services'
  ];

  const formatCurrency = (amount: number | null | undefined) => {
    const n = Number(amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(n);
  };

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load products', description: error.message, variant: 'destructive' });
      return;
    }
    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm = !term ||
        p.name.toLowerCase().includes(term) ||
        (p.product_code || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || (p.category || '').toLowerCase() === categoryFilter;
      const matchesType = typeFilter === 'all' || (typeFilter === 'service' ? !!p.is_service : !p.is_service);
      return matchesTerm && matchesCategory && matchesType;
    });
  }, [products, searchTerm, categoryFilter, typeFilter]);

  const handleCreateOrUpdate = async (values: ProductFormValues) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to manage products.', variant: 'destructive' });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('products')
        .update({
          name: values.name,
          product_code: values.product_code || null,
          is_service: values.is_service,
          category: values.category || null,
          unit_price: values.unit_price,
          current_stock: values.current_stock,
          track_inventory: values.track_inventory,
          reorder_level: values.reorder_level,
          is_active: values.is_active,
        })
        .eq('id', editing.id)
        .eq('user_id', user.id);

      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Product updated' });
        setDialogOpen(false);
        setEditing(null);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            name: values.name,
            product_code: values.product_code || null,
            is_service: values.is_service,
            category: values.category || null,
            unit_price: values.unit_price,
            current_stock: values.current_stock,
            track_inventory: values.track_inventory,
            reorder_level: values.reorder_level,
            is_active: values.is_active,
          },
        ]);

      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Product created' });
        setDialogOpen(false);
        fetchProducts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this product? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted' });
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">
            Manage your inventory and service offerings
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Active products & services
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => !p.is_service && (p.current_stock || 0) <= (p.reorder_level || 0)).length}</div>
            <p className="text-xs text-muted-foreground">
              Items below reorder level
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(products.reduce((sum, p) => sum + Number((p.unit_price || 0) * (p.current_stock || 0)), 0))}</div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => !!p.is_service).length}</div>
            <p className="text-xs text-muted-foreground">
              Service offerings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products & Services</CardTitle>
          <CardDescription>
            Manage your product catalog and service offerings
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
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
            <div className="text-sm text-muted-foreground py-12 text-center">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p className="text-sm mb-6">Add products and services to your catalog</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.product_code || '-'}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="capitalize">{p.is_service ? 'service' : 'product'}</TableCell>
                    <TableCell>{p.category || '-'}</TableCell>
                    <TableCell>{formatCurrency(p.unit_price)}</TableCell>
                    <TableCell>{p.is_service ? '-' : (p.current_stock ?? 0)}</TableCell>
                    <TableCell>{p.is_active === false ? 'Inactive' : 'Active'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
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

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setEditing(null); } setDialogOpen(o); }}
        initialData={editing ? {
          name: editing.name,
          product_code: editing.product_code || '',
          is_service: editing.is_service ?? false,
          category: editing.category || '',
          unit_price: Number(editing.unit_price || 0),
          current_stock: Number(editing.current_stock || 0),
          track_inventory: editing.track_inventory ?? true,
          reorder_level: Number(editing.reorder_level || 0),
          is_active: editing.is_active ?? true,
        } : undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Products;