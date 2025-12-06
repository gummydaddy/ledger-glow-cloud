import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencySettings {
  id?: string;
  base_currency: string;
  display_symbol: boolean;
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
}

const DEFAULT_SETTINGS: CurrencySettings = {
  base_currency: 'USD',
  display_symbol: true,
  decimal_places: 2,
  thousand_separator: ',',
  decimal_separator: '.',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SGD: 'S$',
  AED: 'د.إ',
  SAR: '﷼',
  MXN: '$',
  BRL: 'R$',
  ZAR: 'R',
};

export const useCurrency = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CurrencySettings>(DEFAULT_SETTINGS);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      const { data } = await supabase
        .from('supported_currencies')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (data) {
        setCurrencies(data);
      }
    };

    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('currency_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setSettings({
          id: data.id,
          base_currency: data.base_currency,
          display_symbol: data.display_symbol ?? true,
          decimal_places: data.decimal_places ?? 2,
          thousand_separator: data.thousand_separator ?? ',',
          decimal_separator: data.decimal_separator ?? '.',
        });
      }
      setLoading(false);
    };

    fetchCurrencies();
    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<CurrencySettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    const { error } = await supabase
      .from('currency_settings')
      .upsert({
        user_id: user.id,
        base_currency: updatedSettings.base_currency,
        display_symbol: updatedSettings.display_symbol,
        decimal_places: updatedSettings.decimal_places,
        thousand_separator: updatedSettings.thousand_separator,
        decimal_separator: updatedSettings.decimal_separator,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating currency settings:', error);
    }
  };

  const formatCurrency = useCallback((amount: number, currencyCode?: string) => {
    const code = currencyCode || settings.base_currency;
    const symbol = CURRENCY_SYMBOLS[code] || code;
    
    const absoluteAmount = Math.abs(amount);
    const isNegative = amount < 0;
    
    // Format the number
    const parts = absoluteAmount.toFixed(settings.decimal_places).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator);
    const decimalPart = parts[1];
    
    let formatted = settings.decimal_places > 0 
      ? `${integerPart}${settings.decimal_separator}${decimalPart}`
      : integerPart;
    
    if (settings.display_symbol) {
      formatted = `${symbol}${formatted}`;
    } else {
      formatted = `${formatted} ${code}`;
    }
    
    return isNegative ? `-${formatted}` : formatted;
  }, [settings]);

  const getSymbol = useCallback((currencyCode?: string) => {
    const code = currencyCode || settings.base_currency;
    return CURRENCY_SYMBOLS[code] || code;
  }, [settings.base_currency]);

  return {
    settings,
    currencies,
    loading,
    formatCurrency,
    updateSettings,
    getSymbol,
  };
};
