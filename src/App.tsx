/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ClinicProvider, useClinic } from "./context/ClinicContext";
import { ToastProvider, useToast } from "./components/common/Toast";

// Auth pages
import LoginPage from "./components/auth/LoginPage";
import TrialExpiredPage from "./components/auth/TrialExpiredPage";
import TrialBanner from "./components/auth/TrialBanner";

// Main app components
import PatientsAndVisits from "./components/PatientsAndVisits";
import Inventory from "./components/Inventory";
import Billing from "./components/Billing";
import Dashboard from "./components/Dashboard";
import Appointments from "./components/appointments/Appointments";
import Purchase from "./components/purchase/Purchase";
import Suppliers from "./components/suppliers/Suppliers";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";
import Sidebar from "./components/Sidebar";
import Skeleton from "./components/common/Skeleton";
import LobbyTV from "./components/LobbyTV";

import { Menu, LogOut, User as UserIcon } from "lucide-react";

function MainApp() {
  const { currentUser, isLoading, triggerSkeleton } = useClinic();
  const { signOut, user: authUser, trialStatus } = useAuth();
  const { toast, confirm } = useToast();
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "appointments" | "clinic" | "billing" | "inventory" | "purchase" | "suppliers" | "reports" | "settings" | "lobby"
  >("clinic");

  // Sidebar collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-switch tabs when user role changes
  useEffect(() => {
    triggerSkeleton();
    if (currentUser.role === "doctor") {
      setActiveTab("clinic");
    } else if (currentUser.role === "pharmacist") {
      setActiveTab("inventory");
    } else if (currentUser.role === "receptionist") {
      setActiveTab("clinic");
    } else if (currentUser.role === "manager") {
      setActiveTab("dashboard");
    }
  }, [currentUser, triggerSkeleton]);

  const handleSignOut = () => {
    confirm(
      "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      async () => {
        await signOut();
        toast("Đã đăng xuất thành công!", "success");
      },
      "Đăng xuất"
    );
  };

  const renderActiveTabContent = () => {
    if (isLoading) {
      if (activeTab === "dashboard" || activeTab === "reports") {
        return <Skeleton type="dashboard" />;
      }
      if (activeTab === "clinic" || activeTab === "inventory" || activeTab === "suppliers" || activeTab === "appointments") {
        return <Skeleton type="table" rows={6} />;
      }
      if (activeTab === "purchase" || activeTab === "settings") {
        return <Skeleton type="form" />;
      }
      return <Skeleton type="generic" />;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard currentUser={currentUser} onActionTrigger={triggerSkeleton} />;
      case "appointments":
        return <Appointments />;
      case "clinic":
        return <PatientsAndVisits currentUser={currentUser} />;
      case "billing":
        return <Billing currentUser={currentUser} onActionTrigger={triggerSkeleton} />;
      case "inventory":
        return <Inventory currentUser={currentUser} />;
      case "purchase":
        return <Purchase />;
      case "suppliers":
        return <Suppliers />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      case "lobby":
        return <LobbyTV />;
      default:
        return <PatientsAndVisits currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 antialiased flex flex-row" id="main-clinic-container">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Right Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        
        {/* Sticky Header Topbar */}
        <header className="h-16 border-b border-slate-150/85 dark:border-slate-800 bg-white/85 dark:bg-[#1e293b]/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-505 dark:text-slate-350 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider hidden sm:block">
              Clinic Cloud SaaS System
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Trial Banner */}
            <TrialBanner />
            
            {/* User info & sign out */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {authUser?.name || currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    {currentUser.role === 'doctor' ? 'Bác sĩ' : currentUser.role === 'receptionist' ? 'Lễ tân' : currentUser.role === 'pharmacist' ? 'Dược sĩ' : 'Quản lý'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page View workspace panel */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Main workspace header card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] gap-4">
            <div>
              <h1 className="text-md sm:text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {activeTab === "clinic" ? "Tiếp nhận & Phòng khám" : activeTab === "billing" ? "Thanh toán viện phí" : activeTab === "inventory" ? "Kho dược & Lô FEFO" : activeTab === "dashboard" ? "Bảng điều khiển ERP" : activeTab === "appointments" ? "Lịch hẹn phòng khám" : activeTab === "purchase" ? "Tạo phiếu nhập thuốc" : activeTab === "suppliers" ? "Nhà cung cấp dược" : activeTab === "reports" ? "Báo cáo thống kê" : activeTab === "lobby" ? "Tivi Sảnh Chờ Khám" : "Cài đặt cấu hình"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Vận hành hệ thống phòng mạch với vai trò {currentUser.role === 'doctor' ? 'Bác sĩ' : currentUser.role === 'receptionist' ? 'Lễ tân' : currentUser.role === 'pharmacist' ? 'Dược sĩ' : 'Quản lý'}.
              </p>
            </div>
          </div>

          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
}

function AuthRouter() {
  const { session, isAuthLoading, trialStatus, user } = useAuth();

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-blue-300 text-sm font-medium animate-pulse">Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Login page
  if (!session || !user) {
    return <LoginPage />;
  }

  // Trial expired -> Expired page
  if (trialStatus && !trialStatus.active) {
    return <TrialExpiredPage />;
  }

  // Authenticated & active trial -> Main app
  return (
    <ClinicProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ClinicProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}
