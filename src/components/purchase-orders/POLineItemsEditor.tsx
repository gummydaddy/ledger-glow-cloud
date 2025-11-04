import { useEffect, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function POLineItemsEditor() {
  const { user } = useAuth();
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "line_items" });
  const [products, setProducts] = useState<{ id: string; name: string; unit_price: number }[]>([]);

  const items = watch("line_items");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, unit_price")
        .eq("user_id", user.id)
        .order("name");
      setProducts((data || []).map((p: any) => ({ ...p, unit_price: Number(p.unit_price) })));
    })();
  }, [user]);

  const calc = () => {
    let subtotal = 0;
    let taxTotal = 0;
    items.forEach((it: any) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unit_price) || 0;
      const tax = Number(it.tax_percentage) || 0;
      subtotal += qty * price;
      taxTotal += (qty * price * tax) / 100;
    });
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  };

  const { subtotal, taxTotal, total } = calc();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Line Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ description: "", quantity: 1, unit_price: 0, tax_percentage: 0 })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.map((field, idx) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Item {idx + 1}</span>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`line_items.${idx}.product_id`}>Product (Optional)</Label>
              <Select
                value={(items[idx] as any).product_id || ""}
                onValueChange={(val) => {
                  const product = products.find((p) => p.id === val);
                  if (product) {
                    setValue(`line_items.${idx}.product_id`, val);
                    setValue(`line_items.${idx}.description`, product.name);
                    setValue(`line_items.${idx}.unit_price`, product.unit_price);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`line_items.${idx}.description`}>Description</Label>
              <Input
                id={`line_items.${idx}.description`}
                {...control.register(`line_items.${idx}.description`)}
                placeholder="Item description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`line_items.${idx}.quantity`}>Quantity</Label>
              <Input
                id={`line_items.${idx}.quantity`}
                type="number"
                step="1"
                min="1"
                {...control.register(`line_items.${idx}.quantity`, { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`line_items.${idx}.unit_price`}>Unit Price</Label>
              <Input
                id={`line_items.${idx}.unit_price`}
                type="number"
                step="0.01"
                min="0"
                {...control.register(`line_items.${idx}.unit_price`, { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`line_items.${idx}.tax_percentage`}>Tax %</Label>
              <Input
                id={`line_items.${idx}.tax_percentage`}
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...control.register(`line_items.${idx}.tax_percentage`, { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax:</span>
          <span>${taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
