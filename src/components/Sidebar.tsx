/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { useClinic } from "../context/ClinicContext";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Receipt,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { currentUser, darkMode, toggleDarkMode, triggerSkeleton } = useClinic();

  const categories = [
    {
      title: "Tổng quan",
      items: [
        { id: "dashboard", label: "Bảng Điều Khiển", icon: LayoutDashboard, roles: ["manager", "doctor", "receptionist", "pharmacist"] }
      ]
    },
    {
      title: "Lâm sàng & Tiếp đón",
      items: [
        { id: "appointments", label: "Lịch Hẹn Phòng Khám", icon: Calendar, roles: ["receptionist", "doctor", "manager"] },
        { id: "clinic", label: "Tiếp Đón & Bệnh Nhân", icon: Stethoscope, roles: ["doctor", "receptionist", "manager"] },
        { id: "lobby", label: "Tivi Sảnh Chờ", icon: Monitor, roles: ["receptionist", "doctor", "manager"] }
      ]
    },
    {
      title: "Tài chính & Thu phí",
      items: [
        { id: "billing", label: "Thanh Toán Viện Phí", icon: Receipt, roles: ["receptionist", "manager"] }
      ]
    },
    {
      title: "Kho dược phẩm",
      items: [
        { id: "inventory", label: "Kho Dược Lô FEFO", icon: Package, roles: ["pharmacist", "manager"] },
        { id: "purchase", label: "Nhập Thuốc NCC", icon: ShoppingCart, roles: ["pharmacist", "manager"] },
        { id: "suppliers", label: "Nhà Cung Cấp", icon: Truck, roles: ["pharmacist", "manager"] }
      ]
    },
    {
      title: "Hệ thống & ERP",
      items: [
        { id: "reports", label: "Báo Báo Thống Kê", icon: BarChart3, roles: ["manager"] },
        { id: "settings", label: "Cài Đặt Cấu Hình", icon: Settings, roles: ["manager"] }
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    triggerSkeleton();
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-150/80 dark:border-slate-800 transition-all duration-300 ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] text-white shadow-md shadow-sky-100 dark:shadow-none">
              <Stethoscope className="h-5 w-5" />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="text-left font-black tracking-wider transition-opacity duration-300">
                <span className="text-sm text-slate-850 dark:text-slate-100">CLINIC</span>
                <span className="text-xs bg-sky-50 border border-sky-100 text-[#0EA5E9] dark:bg-sky-950/40 dark:border-sky-900 px-1 py-0.5 rounded-md font-bold ml-1.5 uppercase select-none">
                  SaaS
                </span>
                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                  Cloud Platform
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse toggle button for desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation Items grouped by functional categories */}
        <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto scrollbar-none text-left">
          {categories.map((cat, catIdx) => {
            // Filter menu items by active user role permissions
            const allowedItems = cat.items.filter(item => item.roles.includes(currentUser.role));
            
            // If no items in this category are allowed for the active role, hide the category entirely
            if (allowedItems.length === 0) return null;

            return (
              <div key={catIdx} className="space-y-1">
                {/* Category header title */}
                {(!isCollapsed || mobileOpen) && (
                  <div className="px-3 pt-2 pb-1 text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest select-none">
                    {cat.title}
                  </div>
                )}
                {isCollapsed && !mobileOpen && (
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2" />
                )}

                {/* Category menu items list */}
                {allowedItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center rounded-2xl p-2.5 text-xs font-bold transition-all duration-200 relative group cursor-pointer ${
                        isActive
                          ? "bg-[#0EA5E9] text-white shadow-lg shadow-sky-100 dark:shadow-none"
                          : "text-slate-605 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#0f172a]/60 hover:text-[#0EA5E9] dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                        {(!isCollapsed || mobileOpen) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {/* Collapsed Tooltip */}
                      {isCollapsed && !mobileOpen && (
                        <div className="absolute left-full ml-4 z-50 rounded-xl bg-slate-900 dark:bg-slate-950 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0f172a]/60 transition-all cursor-pointer ${
              isCollapsed ? "px-0" : "gap-3"
            }`}
          >
            {darkMode ? (
              <>
                <Sun className="h-4.5 w-4.5 text-amber-500" />
                {(!isCollapsed || mobileOpen) && <span>Giao diện sáng</span>}
              </>
            ) : (
              <>
                <Moon className="h-4.5 w-4.5 text-sky-500" />
                {(!isCollapsed || mobileOpen) && <span>Giao diện tối</span>}
              </>
            )}
          </button>



          {/* Current User Quick Info */}
          {(!isCollapsed || mobileOpen) ? (
            <div className="flex items-center gap-2.5 p-2 bg-[#F8FAFC] dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="h-8 w-8 rounded-xl bg-[#0EA5E9] text-white font-extrabold flex items-center justify-center text-xs shadow-inner uppercase">
                {currentUser.name.substring(0, 2)}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[11px] font-extrabold text-slate-850 dark:text-slate-100 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {currentUser.role === "manager" ? "Quản lý (Admin)" : currentUser.role === "doctor" ? "Bác sĩ" : currentUser.role === "pharmacist" ? "Dược sĩ" : "Lễ tân"}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="h-10 w-10 mx-auto rounded-2xl bg-[#0EA5E9] text-white font-extrabold flex items-center justify-center text-sm shadow-inner uppercase cursor-help"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              {currentUser.name.substring(0, 2)}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
