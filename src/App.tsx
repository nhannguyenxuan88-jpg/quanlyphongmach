/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ClinicProvider, useClinic } from "./context/ClinicContext";
import { ToastProvider, useToast } from "./components/common/Toast";
import RoleSelector from "./components/RoleSelector";
import PatientsAndVisits from "./components/PatientsAndVisits";
import Inventory from "./components/Inventory";
import Billing from "./components/Billing";
import Dashboard from "./components/Dashboard";

// New modules
import Appointments from "./components/appointments/Appointments";
import Purchase from "./components/purchase/Purchase";
import Suppliers from "./components/suppliers/Suppliers";
import Reports from "./components/reports/Reports";
import Settings from "./components/settings/Settings";
import Sidebar from "./components/Sidebar";
import Skeleton from "./components/common/Skeleton";
import LobbyTV from "./components/LobbyTV";

import { Menu } from "lucide-react";

function AppContent() {
  const { currentUser, resetDb, isLoading, triggerSkeleton } = useClinic();
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

  const handleDatabaseReset = () => {
    confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại để đưa về dữ liệu mẫu mặc định ban đầu?",
      () => {
        resetDb();
        toast("Đã khôi phục lại dữ liệu mẫu gốc phòng mạch!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      "Khởi tạo lại dữ liệu"
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
        onResetDb={handleDatabaseReset}
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
        </header>

        {/* Page View workspace panel */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Main workspace header card with role selector switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] gap-4">
            <div>
              <h1 className="text-md sm:text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {activeTab === "clinic" ? "Tiếp nhận & Phòng khám" : activeTab === "billing" ? "Thanh toán viện phí" : activeTab === "inventory" ? "Kho dược & Lô FEFO" : activeTab === "dashboard" ? "Bảng điều khiển ERP" : activeTab === "appointments" ? "Lịch hẹn phòng khám" : activeTab === "purchase" ? "Tạo phiếu nhập thuốc" : activeTab === "suppliers" ? "Nhà cung cấp dược" : activeTab === "reports" ? "Báo cáo thống kê" : activeTab === "lobby" ? "Tivi Sảnh Chờ Khám" : "Cài đặt cấu hình"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Vận hành hệ thống phòng mạch với vai trò công việc tương ứng.
              </p>
            </div>
            <RoleSelector />
          </div>

          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ClinicProvider>
  );
}
