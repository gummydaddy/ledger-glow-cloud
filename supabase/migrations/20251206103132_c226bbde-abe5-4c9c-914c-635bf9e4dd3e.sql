-- Create currency settings table
CREATE TABLE public.currency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  display_symbol BOOLEAN DEFAULT true,
  decimal_places INTEGER DEFAULT 2,
  thousand_separator VARCHAR(1) DEFAULT ',',
  decimal_separator VARCHAR(1) DEFAULT '.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own currency settings
CREATE POLICY "Users can manage their own currency settings"
  ON public.currency_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_currency_settings_updated_at
  BEFORE UPDATE ON public.currency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create supported currencies table for dropdown
CREATE TABLE public.supported_currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Insert common currencies
INSERT INTO public.supported_currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('INR', 'Indian Rupee', '₹'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$'),
  ('CHF', 'Swiss Franc', 'CHF'),
  ('CNY', 'Chinese Yuan', '¥'),
  ('SGD', 'Singapore Dollar', 'S$'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('SAR', 'Saudi Riyal', '﷼'),
  ('MXN', 'Mexican Peso', '$'),
  ('BRL', 'Brazilian Real', 'R$'),
  ('ZAR', 'South African Rand', 'R');

-- Make supported_currencies readable by all authenticated users
ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view currencies"
  ON public.supported_currencies
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add currency column to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add currency column to expenses  
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add currency column to purchase_orders
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';