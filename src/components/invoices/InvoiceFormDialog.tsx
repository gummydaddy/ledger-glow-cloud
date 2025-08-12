import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineItemsEditor } from "@/components/invoices/LineItemsEditor";
const ItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be >= 1").default(1),
  unit_price: z.coerce.number().min(0, "Unit price must be >= 0").default(0),
  discount_percentage: z.coerce.number().min(0).max(100).default(0).optional(),
  tax_percentage: z.coerce.number().min(0).max(100).default(0).optional(),
});

const FormSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  customer_id: z.string().min(1, "Customer is required"),
  invoice_date: z.coerce.date().default(new Date()),
  due_date: z.coerce.date().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  line_items: z.array(ItemSchema).min(1, "Add at least one item").default([
    { description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_percentage: 0 },
  ]),
});

export type InvoiceFormValues = z.infer<typeof FormSchema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InvoiceFormValues;
  invoiceId?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void> | void;
}

export function InvoiceFormDialog({ open, onOpenChange, initialData, invoiceId, onSubmit }: InvoiceFormDialogProps) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<{ id: string; company_name: string }[]>([]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData ?? {
      invoice_number: "",
      customer_id: "",
      invoice_date: new Date(),
      due_date: undefined,
      status: "draft",
      line_items: [{ description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_percentage: 0 }],
    },
  });

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("customers")
        .select("id, company_name")
        .eq("user_id", user.id)
        .order("company_name");
      setCustomers(data || []);
    })();
  }, [open, user]);

  useEffect(() => {
    if (open) {
      form.reset(
        initialData ?? {
          invoice_number: "",
          customer_id: "",
          invoice_date: new Date(),
          due_date: undefined,
          status: "draft",
          line_items: [{ description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_percentage: 0 }],
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const submitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
          <DialogDescription>{initialData ? "Update invoice details" : "Create a new invoice"}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. INV-1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(e) => field.onChange(new Date(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(e) => field.onChange(new Date(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LineItemsEditor />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {initialData ? "Save Changes" : "Create Invoice"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
