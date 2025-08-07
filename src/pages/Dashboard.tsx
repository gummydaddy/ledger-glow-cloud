import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Revenue",
      value: "$0.00",
      description: "This month",
      icon: DollarSign,
      trend: "+0%"
    },
    {
      title: "Invoices Sent",
      value: "0",
      description: "This month",
      icon: FileText,
      trend: "+0%"
    },
    {
      title: "Total Customers",
      value: "0",
      description: "Active customers",
      icon: Users,
      trend: "+0%"
    },
    {
      title: "Outstanding",
      value: "$0.00",
      description: "Pending payments",
      icon: TrendingUp,
      trend: "+0%"
    }
  ];

  const quickActions = [
    { title: "Create Invoice", description: "Bill your customers", action: () => navigate('/invoices') },
    { title: "Add Expense", description: "Track your expenses", action: () => navigate('/expenses') },
    { title: "Add Customer", description: "Manage customer information", action: () => navigate('/customers') },
    { title: "Add Product", description: "Manage your inventory", action: () => navigate('/products') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your accounting dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.trend}</span> {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <div key={action.title} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <Button size="sm" onClick={action.action}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Start by creating your first invoice or expense</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;