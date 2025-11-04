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
import { POLineItemsEditor } from "./POLineItemsEditor";

const ItemSchema = z.object({
  product_id: z.string().optional(),
  description: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().min(1, "Qty must be >= 1").default(1),
  unit_price: z.coerce.number().min(0, "Unit price must be >= 0").default(0),
  tax_percentage: z.coerce.number().min(0).max(100).default(0).optional(),
});

const FormSchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  vendor_id: z.string().optional(),
  order_date: z.coerce.date().default(new Date()),
  expected_delivery_date: z.coerce.date().optional(),
  status: z.enum(["pending", "approved", "ordered", "received", "cancelled"]).default("pending"),
  line_items: z.array(ItemSchema).min(1, "Add at least one item").default([
    { description: "", quantity: 1, unit_price: 0, tax_percentage: 0 },
  ]),
});

export type PurchaseOrderFormValues = z.infer<typeof FormSchema>;

interface PurchaseOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PurchaseOrderFormValues;
  orderId?: string;
  onSubmit: (values: PurchaseOrderFormValues) => Promise<void> | void;
}

export function PurchaseOrderFormDialog({ open, onOpenChange, initialData, orderId, onSubmit }: PurchaseOrderFormDialogProps) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([]);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData ?? {
      po_number: "",
      vendor_id: "",
      order_date: new Date(),
      expected_delivery_date: undefined,
      status: "pending",
      line_items: [{ description: "", quantity: 1, unit_price: 0, tax_percentage: 0 }],
    },
  });

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id, company_name")
        .eq("user_id", user.id)
        .order("company_name");
      setVendors(data || []);
    })();
  }, [open, user]);

  useEffect(() => {
    if (open) {
      form.reset(
        initialData ?? {
          po_number: "",
          vendor_id: "",
          order_date: new Date(),
          expected_delivery_date: undefined,
          status: "pending",
          line_items: [{ description: "", quantity: 1, unit_price: 0, tax_percentage: 0 }],
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const submitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
          <DialogDescription>{initialData ? "Update purchase order details" : "Create a new purchase order"}</DialogDescription>
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
              name="po_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. PO-1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="ordered">Ordered</SelectItem>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(e) => field.onChange(new Date(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""} onChange={(e) => field.onChange(new Date(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <POLineItemsEditor />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {initialData ? "Save Changes" : "Create Purchase Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
