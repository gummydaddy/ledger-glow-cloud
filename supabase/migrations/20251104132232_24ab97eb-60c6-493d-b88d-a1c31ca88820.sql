-- Add recurring invoice support
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(20) CHECK (recurrence_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_start_date DATE,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS next_recurrence_date DATE,
ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;

-- Create purchase_orders table for inventory management
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  po_number VARCHAR NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description VARCHAR NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_percentage NUMERIC DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  received_quantity NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on purchase_order_items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchase_orders
CREATE POLICY "Users can manage their own purchase orders"
ON public.purchase_orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for purchase_order_items
CREATE POLICY "Users can manage PO items for their purchase orders"
ON public.purchase_order_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.purchase_orders
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND purchase_orders.user_id = auth.uid()
  )
);

-- Add trigger for purchase_orders updated_at
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON public.invoices(is_recurring, next_recurrence_date) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_products_stock_alert ON public.products(current_stock, reorder_level) WHERE track_inventory = true;

-- Add comments
COMMENT ON COLUMN public.invoices.is_recurring IS 'Whether this invoice should recur automatically';
COMMENT ON COLUMN public.invoices.recurrence_frequency IS 'How often the invoice should recur: weekly, monthly, quarterly, yearly';
COMMENT ON COLUMN public.invoices.next_recurrence_date IS 'When the next invoice should be generated';
COMMENT ON TABLE public.purchase_orders IS 'Purchase orders for inventory restocking';
COMMENT ON TABLE public.purchase_order_items IS 'Line items for purchase orders';