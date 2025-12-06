import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface SalesData {
  name: string;
  amount: number;
  count: number;
}

interface SalesBarChartProps {
  data: SalesData[];
  dataKey?: 'amount' | 'count';
}

export const SalesBarChart = ({ data, dataKey = 'amount' }: SalesBarChartProps) => {
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No sales data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="name" 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => dataKey === 'amount' ? formatCurrency(value) : value.toString()}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            dataKey === 'amount' ? formatCurrency(value) : value,
            name === 'amount' ? 'Sales Amount' : 'Transaction Count'
          ]}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey={dataKey} 
          fill="hsl(222, 47%, 31%)" 
          radius={[4, 4, 0, 0]}
          name={dataKey === 'amount' ? 'Sales Amount' : 'Transaction Count'}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
