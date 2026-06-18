/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { useClinic } from "../context/ClinicContext";
import { Key, Landmark, Stethoscope, Package, Users, ChevronDown } from "lucide-react";

export default function RoleSelector() {
  const { users, currentUser, changeUser } = useClinic();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleLabelVietnamese = (role: string) => {
    switch (role) {
      case "receptionist":
        return "Quầy Lễ Tân (Tiếp đón & Thu phí)";
      case "doctor":
        return "Y Bác Sĩ (Chuẩn trị & Kê đơn)";
      case "pharmacist":
        return "Dược Sĩ Quầy (Quản lý kho dược)";
      case "manager":
        return "Chủ Phòng Mạch (Báo cáo & ERP)";
      default:
        return "Nhân viên phòng ban";
    }
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "receptionist":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-500",
          badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
          border: "border-emerald-500/80 bg-emerald-50/40 text-emerald-900 shadow-emerald-100/10 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300"
        };
      case "doctor":
        return {
          bg: "bg-indigo-500",
          text: "text-indigo-500",
          badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
          border: "border-indigo-500/80 bg-indigo-50/30 text-indigo-900 shadow-indigo-100/10 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-indigo-300"
        };
      case "pharmacist":
        return {
          bg: "bg-sky-500",
          text: "text-sky-500",
          badgeBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
          border: "border-sky-500/80 bg-sky-50/40 text-sky-900 shadow-sky-100/10 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-300"
        };
      case "manager":
        return {
          bg: "bg-slate-700",
          text: "text-slate-700",
          badgeBg: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-350",
          border: "border-slate-850/80 bg-slate-50 text-slate-900 shadow-slate-200/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
        };
      default:
        return {
          bg: "bg-slate-500",
          text: "text-slate-500",
          badgeBg: "bg-slate-200 text-slate-800",
          border: "border-slate-200"
        };
    }
  };

  const getRoleIcon = (role: string, className = "w-4 h-4") => {
    switch (role) {
      case "receptionist":
        return <Users className={className} />;
      case "doctor":
        return <Stethoscope className={className} />;
      case "pharmacist":
        return <Package className={className} />;
      case "manager":
        return <Landmark className={className} />;
      default:
        return <Users className={className} />;
    }
  };

  const activeTheme = getRoleTheme(currentUser.role);

  return (
    <div className="relative" ref={dropdownRef} id="role-selector-dropdown">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-4 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-150/50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm text-left select-none outline-none focus:ring-2 focus:ring-indigo-500/20"
        type="button"
      >
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white ${activeTheme.bg} shadow-inner shrink-0 transition-transform duration-200`}>
          {getRoleIcon(currentUser.role, "w-4 h-4 text-white")}
        </div>
        <div className="hidden sm:block">
          <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
            {currentUser.name}
          </p>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
            {currentUser.role === "manager" ? "Quản lý (Admin)" : currentUser.role === "doctor" ? "Bác sĩ" : currentUser.role === "pharmacist" ? "Dược sĩ" : "Lễ tân"}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#1e293b] border border-slate-200/80 dark:border-slate-800 rounded-[24px] shadow-2xl z-50 p-5 space-y-4 animate-scale-up text-left">
          
          {/* Header Info */}
          <div className="flex items-start gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-850">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Key className="w-4.5 h-4.5 shrink-0" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-150 uppercase tracking-tight">
                Giả Lập Phân Quyền Vận Hành
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-normal">
                Giao diện và các nút thao tác nghiệp vụ sẽ tự động cấu hình phù hợp với vai trò tương ứng.
              </p>
            </div>
          </div>

          {/* List of Users */}
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = u.id === currentUser.id;
              const theme = getRoleTheme(u.role);
              
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    changeUser(u);
                    setIsOpen(false);
                  }}
                  type="button"
                  className={`w-full p-3 rounded-2xl transition-all duration-200 border text-left flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? `border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20`
                      : "border-slate-100/50 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/10 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center text-white ${theme.bg} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      {getRoleIcon(u.role, "w-4 h-4 text-white")}
                    </div>
                    <div className="overflow-hidden">
                      <strong className={`block text-xs truncate ${isSelected ? "text-slate-950 dark:text-white font-extrabold" : "text-slate-700 dark:text-slate-300 font-bold"}`}>
                        {u.name}
                      </strong>
                      <span className="text-[9px] text-slate-400 dark:text-slate-550 block truncate mt-0.5 font-semibold">
                        {getRoleLabelVietnamese(u.role)}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 ml-2 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
