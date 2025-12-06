import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export const CurrencySettings = () => {
  const { settings, currencies, updateSettings, loading } = useCurrency();
  const [open, setOpen] = useState(false);

  const handleCurrencyChange = (currency: string) => {
    updateSettings({ base_currency: currency });
  };

  const handleSymbolToggle = (checked: boolean) => {
    updateSettings({ display_symbol: checked });
  };

  const handleDecimalPlacesChange = (value: string) => {
    updateSettings({ decimal_places: parseInt(value) });
  };

  // Use static list if currencies haven't loaded
  const currencyOptions = currencies.length > 0 ? currencies : [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Currency Settings</DialogTitle>
          <DialogDescription>
            Configure your preferred currency display format
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Base Currency</Label>
            <Select value={settings.base_currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Display Symbol</Label>
              <p className="text-sm text-muted-foreground">
                Show currency symbol instead of code
              </p>
            </div>
            <Switch
              checked={settings.display_symbol}
              onCheckedChange={handleSymbolToggle}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimals">Decimal Places</Label>
            <Select value={settings.decimal_places.toString()} onValueChange={handleDecimalPlacesChange}>
              <SelectTrigger id="decimals">
                <SelectValue placeholder="Select decimal places" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (e.g., $100)</SelectItem>
                <SelectItem value="2">2 (e.g., $100.00)</SelectItem>
                <SelectItem value="3">3 (e.g., $100.000)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Preview: <span className="font-mono font-medium">
                {settings.display_symbol 
                  ? `${currencyOptions.find(c => c.code === settings.base_currency)?.symbol || '$'}1,234${settings.decimal_places > 0 ? '.' + '0'.repeat(settings.decimal_places) : ''}`
                  : `1,234${settings.decimal_places > 0 ? '.' + '0'.repeat(settings.decimal_places) : ''} ${settings.base_currency}`
                }
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
