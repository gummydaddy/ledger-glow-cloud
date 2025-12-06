import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RevenueChart } from '@/components/reports/RevenueChart';
import { ExpensePieChart } from '@/components/reports/ExpensePieChart';
import { SalesBarChart } from '@/components/reports/SalesBarChart';
import { CurrencySettings } from '@/components/reports/CurrencySettings';
import { useReportsData } from '@/hooks/useReportsData';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/skeleton';

const Reports = () => {
  const [dateRange, setDateRange] = useState('this-month');
  const { loading, summary, monthlyTrend, expensesByCategory, salesByCustomer } = useReportsData(dateRange);
  const { formatCurrency, settings } = useCurrency();

  const reportCards = [
    {
      title: "Total Revenue",
      value: summary.totalRevenue,
      description: "From paid & sent invoices",
      icon: TrendingUp,
      trend: summary.totalRevenue > 0 ? 'positive' : 'neutral',
    },
    {
      title: "Total Expenses", 
      value: summary.totalExpenses,
      description: "All recorded expenses",
      icon: TrendingDown,
      trend: 'negative',
    },
    {
      title: "Net Profit",
      value: summary.netProfit,
      description: "Revenue minus expenses",
      icon: DollarSign,
      trend: summary.netProfit >= 0 ? 'positive' : 'negative',
    },
    {
      title: "Transactions",
      value: summary.transactionCount,
      description: `Avg: ${formatCurrency(summary.avgSale)}`,
      icon: Receipt,
      isCount: true,
    }
  ];

  const handleExport = () => {
    const data = {
      dateRange,
      summary,
      monthlyTrend,
      expensesByCategory,
      salesByCustomer,
      generatedAt: new Date().toISOString(),
      currency: settings.base_currency,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${dateRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Analyze your business performance with detailed reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CurrencySettings />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-4 w-4 ${
                    card.trend === 'positive' ? 'text-green-600' : 
                    card.trend === 'negative' ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`} />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className={`text-2xl font-bold ${
                        card.trend === 'positive' ? 'text-green-600' : 
                        card.trend === 'negative' && card.title === 'Net Profit' && card.value < 0 ? 'text-red-600' : ''
                      }`}>
                        {card.isCount ? card.value : formatCurrency(card.value)}
                      </div>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Expense Trend</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <RevenueChart data={monthlyTrend} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ExpensePieChart data={expensesByCategory} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                Summary of revenues, costs, and expenses for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-6 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h3 className="font-medium text-green-700 dark:text-green-400">Total Revenue</h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mx-auto mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
                    )}
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h3 className="font-medium text-red-700 dark:text-red-400">Total Expenses</h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mx-auto mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
                    )}
                  </div>
                  <div className={`text-center p-6 border rounded-lg ${
                    summary.netProfit >= 0 
                      ? 'bg-blue-50 dark:bg-blue-950/20' 
                      : 'bg-orange-50 dark:bg-orange-950/20'
                  }`}>
                    <h3 className={`font-medium ${
                      summary.netProfit >= 0 
                        ? 'text-blue-700 dark:text-blue-400' 
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>Net Profit</h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mx-auto mt-2" />
                    ) : (
                      <p className={`text-3xl font-bold ${
                        summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}>{formatCurrency(summary.netProfit)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-4">Expense Categories</h4>
                  {loading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : expensesByCategory.length > 0 ? (
                    <div className="space-y-2">
                      {expensesByCategory.map((cat) => (
                        <div key={cat.name} className="flex justify-between items-center p-3 border rounded">
                          <span>{cat.name}</span>
                          <span className="font-medium">{formatCurrency(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No expense categories to display</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>
                Financial position showing assets, liabilities, and equity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Assets (Receivables)</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(summary.totalRevenue - summary.cashInflow)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Unpaid invoices</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Cash Position</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(summary.cashInflow - summary.cashOutflow)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Cash in - Cash out</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Retained Earnings</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(summary.netProfit)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Net profit for period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
              <CardDescription>
                Cash receipts and payments during the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-6 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <h3 className="font-medium text-green-700 dark:text-green-400">Cash Inflow</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.cashInflow)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">From paid invoices</p>
                </div>
                <div className="text-center p-6 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <h3 className="font-medium text-red-700 dark:text-red-400">Cash Outflow</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(summary.cashOutflow)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Total expenses</p>
                </div>
                <div className={`text-center p-6 border rounded-lg ${
                  summary.cashInflow - summary.cashOutflow >= 0 
                    ? 'bg-blue-50 dark:bg-blue-950/20' 
                    : 'bg-orange-50 dark:bg-orange-950/20'
                }`}>
                  <h3 className={`font-medium ${
                    summary.cashInflow - summary.cashOutflow >= 0 
                      ? 'text-blue-700 dark:text-blue-400' 
                      : 'text-orange-700 dark:text-orange-400'
                  }`}>Net Cash Flow</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className={`text-3xl font-bold ${
                      summary.cashInflow - summary.cashOutflow >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>{formatCurrency(summary.cashInflow - summary.cashOutflow)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Net change in cash</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Monthly Cash Flow</h4>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <RevenueChart data={monthlyTrend} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                Detailed analysis of sales performance and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Total Sales</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                  )}
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Transactions</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{summary.transactionCount}</p>
                  )}
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-medium text-muted-foreground">Average Sale</h3>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mx-auto mt-2" />
                  ) : (
                    <p className="text-3xl font-bold">{formatCurrency(summary.avgSale)}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Top Customers by Sales</h4>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <SalesBarChart data={salesByCustomer} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
