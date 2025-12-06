import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface RevenueChartProps {
  data: { month: string; revenue: number; expenses: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No revenue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="month" 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Expenses']}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(142, 76%, 36%)" 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          name="revenue"
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stroke="hsl(0, 84%, 60%)" 
          fillOpacity={1} 
          fill="url(#colorExpenses)" 
          name="expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
