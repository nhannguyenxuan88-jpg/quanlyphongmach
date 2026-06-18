/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { AlertTriangle, ShieldAlert, Calendar } from "lucide-react";
import { formatDate } from "../../lib/utils";

export default function AlertsTab() {
  const { batches, medicines } = useClinic();

  const getMedicineStockTotal = (medId: string) => {
    return batches
      .filter((b) => b.medicineId === medId)
      .reduce((sum, b) => sum + b.currentQty, 0);
  };

  const expiringBatches = batches.filter((b) => {
    if (b.currentQty <= 0) return false;
    const todayStr = "2026-06-17";
    const nextMonth = new Date(todayStr);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split("T")[0];
    return b.expiryDate <= nextMonthStr;
  });

  const lowStockMedicines = medicines.filter(
    (m) => getMedicineStockTotal(m.id) < m.minStock
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-semibold text-xs text-slate-705 dark:text-slate-300">
      
      {/* Expiring batches */}
      <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col bento-card">
        <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 border-b border-rose-50 dark:border-rose-950/40 pb-3 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400" />
          Lô thuốc Hết hạn & Cận hạn (&lt;30 ngày)
        </h3>
        
        {expiringBatches.length === 0 ? (
          <div className="flex-1 p-8 text-center text-xs text-slate-405 dark:text-slate-500 italic bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-center">
            An toàn tuyệt đối! Không phát hiện lô cận hạn hoặc hết hạn.
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
            {expiringBatches.map((b) => {
              const med = medicines.find((m) => m.id === b.medicineId);
              const isExpired = b.expiryDate < "2026-06-17";
              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-2xl border flex justify-between items-center ${
                    isExpired 
                      ? "bg-red-50/50 dark:bg-red-950/20 border-red-150 dark:border-red-900/60 text-red-800 dark:text-red-400" 
                      : "bg-orange-50/50 dark:bg-orange-950/20 border-orange-150 dark:border-orange-900/60 text-orange-850 dark:text-orange-400"
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{med?.name}</div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-bold">
                      Lô: <strong className="font-mono text-slate-700 dark:text-slate-300">{b.batchNumber}</strong> • Tần:{" "}
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {b.currentQty} {med?.unit}
                      </strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold font-mono ${isExpired ? "text-red-650 dark:text-red-400" : "text-orange-700 dark:text-orange-400"}`}>
                      Hạn: {formatDate(b.expiryDate)}
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase">
                      {isExpired ? "Cần thu hồi hủy" : "Ưu tiên xuất FEFO"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Understock limit warnings */}
      <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col bento-card">
        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 border-b border-amber-50 dark:border-amber-950/40 pb-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-450" />
          Cảnh báo tồn dưới mức an toàn (Min Stock)
        </h3>
        
        {lowStockMedicines.length === 0 ? (
          <div className="flex-1 p-8 text-center text-xs text-slate-405 dark:text-slate-500 italic bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-center">
            Kho dược an toàn! Tất cả dược phẩm đều trên mức sàn tối thiểu.
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
            {lowStockMedicines.map((m) => {
              const totStock = getMedicineStockTotal(m.id);
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-amber-50/40 dark:bg-amber-955/20 border border-amber-100/60 dark:border-amber-900/40 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{m.name}</div>
                    <div className="text-[10px] text-slate-455 dark:text-slate-500 mt-1 font-bold">
                      Hoạt chất: {m.activeIngredient} • Nhóm: {m.group}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">Tồn: {totStock} {m.unit}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Yêu cầu sàn: {m.minStock}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
