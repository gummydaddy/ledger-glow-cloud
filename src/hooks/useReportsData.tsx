import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears, format, parseISO } from 'date-fns';

interface Invoice {
  id: string;
  invoice_date: string;
  total_amount: number | null;
  status: string | null;
  customer_id: string;
}

interface Expense {
  id: string;
  expense_date: string;
  total_amount: number;
  category: string | null;
}

interface Customer {
  id: string;
  company_name: string;
}

export const useReportsData = (dateRange: string) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const dateFilter = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (dateRange) {
      case 'this-week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'this-month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'this-quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'this-year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'last-month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'last-quarter':
        start = startOfQuarter(subQuarters(now, 1));
        end = endOfQuarter(subQuarters(now, 1));
        break;
      case 'last-year':
        start = startOfYear(subYears(now, 1));
        end = endOfYear(subYears(now, 1));
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [invoicesRes, expensesRes, customersRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('id, invoice_date, total_amount, status, customer_id')
          .eq('user_id', user.id)
          .gte('invoice_date', dateFilter.start)
          .lte('invoice_date', dateFilter.end),
        supabase
          .from('expenses')
          .select('id, expense_date, total_amount, category')
          .eq('user_id', user.id)
          .gte('expense_date', dateFilter.start)
          .lte('expense_date', dateFilter.end),
        supabase
          .from('customers')
          .select('id, company_name')
          .eq('user_id', user.id),
      ]);

      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (customersRes.data) setCustomers(customersRes.data);

      setLoading(false);
    };

    fetchData();
  }, [user, dateFilter]);

  // Calculate summary data
  const summary = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid' || inv.status === 'sent')
      .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total_amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const transactionCount = invoices.length;
    const avgSale = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      transactionCount,
      avgSale,
      cashInflow: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
      cashOutflow: totalExpenses,
    };
  }, [invoices, expenses]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthMap = new Map<string, { revenue: number; expenses: number }>();

    invoices.forEach(inv => {
      const month = format(parseISO(inv.invoice_date), 'MMM yyyy');
      const current = monthMap.get(month) || { revenue: 0, expenses: 0 };
      current.revenue += inv.total_amount || 0;
      monthMap.set(month, current);
    });

    expenses.forEach(exp => {
      const month = format(parseISO(exp.expense_date), 'MMM yyyy');
      const current = monthMap.get(month) || { revenue: 0, expenses: 0 };
      current.expenses += exp.total_amount;
      monthMap.set(month, current);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [invoices, expenses]);

  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    expenses.forEach(exp => {
      const category = exp.category || 'Uncategorized';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + exp.total_amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Sales by customer
  const salesByCustomer = useMemo(() => {
    const customerMap = new Map<string, { amount: number; count: number }>();

    invoices.forEach(inv => {
      const customer = customers.find(c => c.id === inv.customer_id);
      const name = customer?.company_name || 'Unknown';
      const current = customerMap.get(name) || { amount: 0, count: 0 };
      current.amount += inv.total_amount || 0;
      current.count += 1;
      customerMap.set(name, current);
    });

    return Array.from(customerMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [invoices, customers]);

  return {
    loading,
    summary,
    monthlyTrend,
    expensesByCategory,
    salesByCustomer,
    invoices,
    expenses,
  };
};
