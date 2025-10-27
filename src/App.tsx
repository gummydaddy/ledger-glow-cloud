import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Expenses from "./pages/Expenses";
import Vendors from "./pages/Vendors";
import Products from "./pages/Products";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for dashboard pages
const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<DashboardPage><Profile /></DashboardPage>} />
            <Route path="/invoices" element={<DashboardPage><Invoices /></DashboardPage>} />
            <Route path="/customers" element={<DashboardPage><Customers /></DashboardPage>} />
            <Route path="/expenses" element={<DashboardPage><Expenses /></DashboardPage>} />
            <Route path="/vendors" element={<DashboardPage><Vendors /></DashboardPage>} />
            <Route path="/products" element={<DashboardPage><Products /></DashboardPage>} />
            <Route path="/accounts" element={<DashboardPage><Accounts /></DashboardPage>} />
            <Route path="/reports" element={<DashboardPage><Reports /></DashboardPage>} />
            <Route path="/settings" element={<DashboardPage><Settings /></DashboardPage>} />
            <Route path="/users" element={<DashboardPage><UserManagement /></DashboardPage>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
