/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { TrendingUp, Stethoscope, AlertCircle, Coins, DollarSign, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function StatsOverview() {
  const { dashboardStats } = useClinic();
  const stats = dashboardStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 text-left font-semibold">
      
      {/* Metric 1 - Revenue */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-150/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-[24px] flex justify-between bento-card shadow-sm group">
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">Doanh Thu Toàn Quỹ</span>
            <span className="text-xl sm:text-2xl font-black mt-1.5 block font-mono tracking-tight text-slate-850 dark:text-white">
              {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-3">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-lg text-[10px]">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5%
            </span>
            <span className="truncate">Tháng này: <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(stats.revenueThisMonth)}</span></span>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end gap-4 shrink-0">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner select-none transition-transform duration-300 group-hover:scale-110">
            <DollarSign className="w-5 h-5" />
          </div>
          {/* Custom SVG Sparkline */}
          <svg className="w-20 h-7 text-indigo-500 dark:text-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30">
            <path
              d="M 0,25 Q 15,15 30,22 T 60,12 T 90,8 T 100,2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 2 - Profit */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-150/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-[24px] flex justify-between bento-card shadow-sm group">
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">Lợi Nhuận Thực Thu</span>
            <span className="text-xl sm:text-2xl font-black mt-1.5 block font-mono tracking-tight text-slate-850 dark:text-white">
              {formatCurrency(stats.totalProfit)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-450 mt-3 block font-bold leading-normal">
            Lô FEFO tự động trừ giá vốn dược phẩm
          </span>
        </div>

        <div className="flex flex-col justify-between items-end gap-4 shrink-0">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-2xl shadow-inner select-none transition-transform duration-300 group-hover:scale-110">
            <Coins className="w-5 h-5" />
          </div>
          {/* Custom SVG Sparkline */}
          <svg className="w-20 h-7 text-emerald-500 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30">
            <path
              d="M 0,28 L 20,24 L 40,16 L 60,18 L 80,8 L 100,4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 3 - Clinic Visits */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-150/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-[24px] flex justify-between bento-card shadow-sm group">
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block">Lâm Sàng Hôm Nay</span>
            <span className="text-xl sm:text-2xl font-black mt-1.5 block tracking-tight text-slate-850 dark:text-white">
              {stats.visitsToday} Ca Khám
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-3">
            <span className="flex items-center gap-0.5 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-1.5 py-0.5 rounded-lg text-[10px]">
              <ArrowUpRight className="w-3.5 h-3.5" /> Chờ: {stats.pendingVisits}
            </span>
            <span className="truncate">Hôm nay xếp hàng</span>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end gap-4 shrink-0">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 rounded-2xl shadow-inner select-none transition-transform duration-300 group-hover:scale-110">
            <Stethoscope className="w-5 h-5" />
          </div>
          {/* Custom SVG Sparkline */}
          <svg className="w-20 h-7 text-sky-500 dark:text-sky-450 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30">
            <path
              d="M 0,15 C 20,5 40,25 60,10 C 80,0 90,20 100,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 4 - Stock alerts */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-150/80 dark:border-slate-800/80 p-5 sm:p-6 rounded-[24px] flex justify-between bento-card shadow-sm group border-rose-100 dark:border-rose-950/30">
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-widest block">Cảnh báo chênh lệch kho</span>
            <span className="text-xl sm:text-2xl font-black mt-1.5 block tracking-tight text-slate-850 dark:text-white">
              {stats.lowStockItemsCount + stats.nearExpiryItemsCount} Sự cố
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-455 mt-3 block font-bold leading-normal">
            {stats.lowStockItemsCount} thiếu kho • {stats.nearExpiryItemsCount} cận hạn dùng
          </span>
        </div>

        <div className="flex flex-col justify-between items-end gap-4 shrink-0">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/45 text-rose-600 dark:text-rose-450 rounded-2xl shadow-inner select-none transition-transform duration-300 group-hover:scale-110 animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
          {/* Custom SVG Sparkline */}
          <svg className="w-20 h-7 text-rose-500 dark:text-rose-450 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 30">
            <path
              d="M 0,5 L 20,8 L 40,12 L 60,8 L 80,22 L 100,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

    </div>
  );
}
