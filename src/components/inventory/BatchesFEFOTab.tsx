/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { MedicineBatch } from "../../types";
import { HelpCircle, Calendar, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";

interface BatchesFEFOTabProps {
  searchQuery: string;
  groupFilter: string;
}

export default function BatchesFEFOTab({ searchQuery, groupFilter }: BatchesFEFOTabProps) {
  const { batches, medicines } = useClinic();

  const getBatchStatusLabel = (b: MedicineBatch) => {
    const todayStr = "2026-06-17";
    const expDate = b.expiryDate;
    
    // Expiring date threshold
    const nextMonth = new Date(todayStr);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split("T")[0];

    if (b.currentQty === 0) {
      return (
        <span className="text-[10px] text-slate-400 bg-slate-100 dark:text-slate-500 dark:bg-slate-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          Hết lô
        </span>
      );
    }
    if (expDate < todayStr) {
      return (
        <span className="text-[10px] text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-950/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit border border-red-200 dark:border-red-900/60 whitespace-nowrap">
          <ShieldAlert className="w-3 h-3" /> Đã Hết Hạn
        </span>
      );
    }
    if (expDate <= nextMonthStr) {
      return (
        <span className="text-[10px] text-orange-800 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit animate-pulse border border-orange-200 dark:border-orange-900/60 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3" /> Cận Hạn (&lt;30d)
        </span>
      );
    }
    return (
      <span className="text-[10px] text-teal-800 bg-teal-100 dark:text-teal-400 dark:bg-teal-950/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit border border-teal-200 dark:border-teal-900/60 whitespace-nowrap">
        <CheckCircle className="w-3 h-3" /> Còn hạn tốt
      </span>
    );
  };

  const filteredBatches = batches
    .filter((b) => {
      const med = medicines.find((m) => m.id === b.medicineId);
      if (!med) return false;
      const matchesSearch =
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = groupFilter === "all" || med.group === groupFilter;
      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => b.importDate.localeCompare(a.importDate));

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden text-left bento-card font-semibold text-xs text-slate-700 dark:text-slate-300">
      
      {/* Informative FEFO header */}
      <div className="bg-gradient-to-r from-teal-50/20 to-blue-50/20 dark:from-teal-950/10 dark:to-blue-950/10 p-4 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex items-center gap-3 font-semibold">
        <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <span>
          Nguyên lý <strong>FEFO (First Expired First Out)</strong>: Hệ thống tự động phân phối lượng thuốc cần xuất từ các lô có hạn dùng ngắn nhất lên phía trước, chốt lại ngày hết hạn để đảm bảo dòng lưu thông an toàn cho sức khỏe bệnh nhân.
        </span>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-805/40 border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4 text-left">Mã Số Lô</th>
              <th className="p-4 text-left">Tên Dược Phẩm</th>
              <th className="p-4 text-center">Ngày Nhập Kho</th>
              <th className="p-4 text-center">Ngày Hết Hạn</th>
              <th className="p-4 text-center">ĐVT</th>
              <th className="p-4 text-right">Lượng Tồn (Lô)</th>
              <th className="p-4 text-right">Giá Nhập (Vốn)</th>
              <th className="p-4 text-right">Giá Bán Lẻ</th>
              <th className="p-4 text-center">Thời Hạn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-slate-400 dark:text-slate-500 italic">
                  Chưa có lô dược phẩm nào được nhập kho khớp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const med = medicines.find((m) => m.id === b.medicineId);
                return (
                  <tr key={b.id} className="text-slate-800 dark:text-slate-300 hover:bg-slate-50/40 dark:hover:bg-[#0f172a]/20 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-xs">
                        {b.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-850 dark:text-slate-100">
                      {med?.name}{" "}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">({med?.activeIngredient})</span>
                    </td>
                    <td className="p-4 text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">{formatDate(b.importDate)}</td>
                    <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-300 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {formatDate(b.expiryDate)}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">{med?.unit}</td>
                    <td className="p-4 text-right">
                      <span className={`font-black font-mono ${b.currentQty === 0 ? "text-slate-400 line-through dark:text-slate-550" : "text-slate-800 dark:text-slate-200"}`}>
                        {b.currentQty} <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold font-sans">/ {b.originalQty}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-450 dark:text-slate-400 text-right font-mono font-medium">{formatCurrency(b.importPrice)}</td>
                    <td className="p-4 text-xs font-bold text-indigo-650 dark:text-indigo-400 text-right font-mono">{formatCurrency(b.retailPrice)}</td>
                    <td className="p-4 text-center">{getBatchStatusLabel(b)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view */}
      <div className="block md:hidden p-4 space-y-3">
        {filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 italic">Chưa có lô dược phẩm nào.</div>
        ) : (
          filteredBatches.map((b) => {
            const med = medicines.find((m) => m.id === b.medicineId);
            return (
              <div key={b.id} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-55/30 dark:bg-[#0f172a]/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-extrabold bg-slate-150/50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">
                      Lô: {b.batchNumber}
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200 block mt-2 text-xs">
                      {med?.name} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-sans">({med?.unit})</span>
                    </strong>
                  </div>
                  {getBatchStatusLabel(b)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2 font-semibold">
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Lượng tồn lô</span>
                    <span className="text-slate-800 dark:text-slate-205 font-mono font-black">
                      {b.currentQty} <span className="text-[9px] text-slate-400 dark:text-slate-550 font-medium">/ {b.originalQty}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Hạn sử dụng</span>
                    <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{formatDate(b.expiryDate)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Giá vốn nhập</span>
                    <span className="text-slate-655 dark:text-slate-400 font-mono">{formatCurrency(b.importPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Giá bán ra</span>
                    <span className="text-indigo-650 dark:text-indigo-400 font-mono font-black">{formatCurrency(b.retailPrice)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
