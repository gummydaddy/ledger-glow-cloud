import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function LineItemsEditor() {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "line_items" as const });

  const items = watch("line_items") as Array<{
    description?: string;
    quantity?: number;
    unit_price?: number;
    discount_percentage?: number;
    tax_percentage?: number;
  }> | undefined;

  const calc = () => {
    const list = items ?? [];
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let total = 0;

    list.forEach((it) => {
      const qty = Number(it?.quantity ?? 0);
      const price = Number(it?.unit_price ?? 0);
      const discP = Number(it?.discount_percentage ?? 0) / 100;
      const taxP = Number(it?.tax_percentage ?? 0) / 100;
      const base = qty * price;
      const disc = base * discP;
      const afterDisc = base - disc;
      const tax = afterDisc * taxP;
      const lineTotal = afterDisc + tax;
      subtotal += base;
      discountTotal += disc;
      taxTotal += tax;
      total += lineTotal;
    });

    return { subtotal, discountTotal, taxTotal, total };
  };

  const totals = calc();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Line Items</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            append({ description: "", quantity: 1, unit_price: 0, discount_percentage: 0, tax_percentage: 0 })
          }
        >
          Add item
        </Button>
      </div>

      <div className="grid gap-3">
        {fields.length === 0 && (
          <p className="text-sm opacity-80">No items yet. Click "Add item" to get started.</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <FormField
                control={control}
                name={`line_items.${index}.description` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Design services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`line_items.${index}.quantity` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step="1"
                        value={field.value ?? 1}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`line_items.${index}.unit_price` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`line_items.${index}.discount_percentage` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={control}
                name={`line_items.${index}.tax_percentage` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-1">
              <Button type="button" variant="outline" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-1 md:w-1/2 md:ml-auto">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span>-{totals.discountTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>{totals.taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{totals.total.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}
