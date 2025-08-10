import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AccountFormDialog, AccountFormValues } from "@/components/accounts/AccountFormDialog";

interface Account {
  id: string;
  user_id: string;
  account_type: string;
  account_name: string;
  account_code: string;
  parent_account_id: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"] as const;

type AccountType = typeof accountTypes[number];

const Accounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  useEffect(() => {
    document.title = "Chart of Accounts | Manage Accounts";
  }, []);

  const fetchAccounts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load accounts", description: error.message, variant: "destructive" });
      return;
    }
    setAccounts(data || []);
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return accounts.filter((a) => {
      const matchesTerm = !term ||
        a.account_name.toLowerCase().includes(term) ||
        a.account_code.toLowerCase().includes(term) ||
        a.account_type.toLowerCase().includes(term);
      const matchesType = typeFilter === "all" || a.account_type.toLowerCase() === typeFilter;
      return matchesTerm && matchesType;
    });
  }, [accounts, searchTerm, typeFilter]);

  const countsByType = useMemo(() => {
    const m = new Map<string, number>();
    accountTypes.forEach((t) => m.set(t, 0));
    accounts.forEach((a) => {
      const key = (a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)) as AccountType;
      if (m.has(key)) m.set(key, (m.get(key) || 0) + 1);
    });
    return m;
  }, [accounts]);

  const handleCreateOrUpdate = async (values: AccountFormValues) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to manage accounts.", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("chart_of_accounts")
        .update({
          account_name: values.account_name,
          account_code: values.account_code,
          account_type: values.account_type,
          is_active: values.is_active,
        })
        .eq("id", editing.id)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account updated" });
        setDialogOpen(false);
        setEditing(null);
        fetchAccounts();
      }
    } else {
      const { error } = await supabase
        .from("chart_of_accounts")
        .insert([
          {
            user_id: user.id,
            account_name: values.account_name,
            account_code: values.account_code,
            account_type: values.account_type,
            is_active: values.is_active,
          },
        ]);

      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created" });
        setDialogOpen(false);
        fetchAccounts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this account? This cannot be undone.");
    if (!ok) return;
    const { error } = await supabase.from("chart_of_accounts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account deleted" });
      fetchAccounts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your accounting structure and account categories</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {accountTypes.map((type) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{type} Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countsByType.get(type) ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>Your complete chart of accounts organized by type and category</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Account Types</SelectItem>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Loading accounts…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-6xl mb-4">🏦</div>
                <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
                <p className="text-sm mb-6">Set up your chart of accounts to organize your finances</p>
                <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Chart of Accounts
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.account_code}</TableCell>
                    <TableCell>{a.account_name}</TableCell>
                    <TableCell className="capitalize">{a.account_type}</TableCell>
                    <TableCell>{a.is_active === false ? "Inactive" : "Active"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(a); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}>
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

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) { setEditing(null); } setDialogOpen(o); }}
        initialData={editing ? {
          account_name: editing.account_name,
          account_code: editing.account_code,
          account_type: editing.account_type.toLowerCase() as AccountFormValues["account_type"],
          is_active: editing.is_active ?? true,
        } : undefined}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Accounts;
