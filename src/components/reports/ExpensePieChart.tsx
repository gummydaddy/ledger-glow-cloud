import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface ExpenseCategory {
  name: string;
  value: number;
}

interface ExpensePieChartProps {
  data: ExpenseCategory[];
}

const COLORS = [
  'hsl(222, 47%, 31%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(280, 67%, 50%)',
  'hsl(200, 80%, 50%)',
  'hsl(30, 80%, 50%)',
  'hsl(160, 60%, 45%)',
];

export const ExpensePieChart = ({ data }: ExpensePieChartProps) => {
  const { formatCurrency } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No expense data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
