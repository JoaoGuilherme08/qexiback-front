import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteRegistration from "./pages/CompleteRegistration";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CreateCompany from "./pages/CreateCompany";
import CreateInstitution from "./pages/CreateInstitution";
import CompanyUsers from "./pages/CompanyUsers";
import Wallet from "./pages/Wallet";
import StoreDashboard from "./pages/StoreDashboard";
import StoreProducts from "./pages/StoreProducts";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WithdrawalApproval from "./pages/WithdrawalApproval";
import InstitutionApproval from "./pages/InstitutionApproval";
import ManageCompanies from "./pages/ManageCompanies";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-registration" element={<CompleteRegistration />} />
          
          {/* Rotas Protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/company/create" element={<ProtectedRoute><CreateCompany /></ProtectedRoute>} />
          <Route path="/company/users" element={<ProtectedRoute><CompanyUsers /></ProtectedRoute>} />
          <Route path="/institution/create" element={<ProtectedRoute><CreateInstitution /></ProtectedRoute>} />
          <Route path="/store/dashboard" element={<ProtectedRoute><StoreDashboard /></ProtectedRoute>} />
          <Route path="/store/products" element={<ProtectedRoute><StoreProducts /></ProtectedRoute>} />
          <Route path="/institution/dashboard" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/withdrawals" element={<ProtectedRoute><WithdrawalApproval /></ProtectedRoute>} />
          <Route path="/admin/institutions" element={<ProtectedRoute><InstitutionApproval /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute><ManageCompanies /></ProtectedRoute>} />
          <Route path="/offers/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
