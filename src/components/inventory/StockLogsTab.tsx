/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { FileText, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDate } from "../../lib/utils";

export default function StockLogsTab() {
  const { stockLogs, medicines } = useClinic();

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden text-left bento-card font-semibold text-xs text-slate-700 dark:text-slate-300">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-805/10">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase">
          <FileText className="w-4 h-4 text-indigo-500" />
          Sổ Nhật Ký Giao Dịch Kho Dược
        </h3>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-semibold">
          Ghi nhận toàn bộ vết lịch sử cập nhật nhập kho và xuất kho phân phối theo đơn bác sĩ kê.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-805/40 text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-805">
              <th className="p-4 text-left">Thời Điểm</th>
              <th className="p-4 text-left">Dược Phẩm</th>
              <th className="p-4 text-center">Số Lô</th>
              <th className="p-4 text-center">Phân Loại</th>
              <th className="p-4 text-right">Số Lượng</th>
              <th className="p-4 text-left">Nội dung / Lý do</th>
              <th className="p-4 text-right">Nhân viên</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {stockLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-405 dark:text-slate-500 italic">
                  Chưa có giao dịch kho nào được ghi nhận.
                </td>
              </tr>
            ) : (
              stockLogs.map((log) => {
                const med = medicines.find((m) => m.id === log.medicineId);
                const isImport = log.type === "import";
                return (
                  <tr key={log.id} className="text-slate-800 dark:text-slate-300 hover:bg-slate-50/40 dark:hover:bg-[#0f172a]/20 transition-colors">
                    <td className="p-4 text-xs text-slate-450 dark:text-slate-500 font-medium">
                      {formatDate(log.date)}
                    </td>
                    <td className="p-4 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{med?.name || "Dược phẩm"}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold block">({med?.activeIngredient})</span>
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-center text-slate-600 dark:text-slate-400">{log.batchNumber}</td>
                    <td className="p-4">
                      {isImport ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/60 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit mx-auto whitespace-nowrap">
                          <ArrowDownLeft className="w-3 h-3" /> NHẬP KHO
                        </span>
                      ) : (
                        <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-150 dark:bg-rose-955/40 dark:text-rose-450 dark:border-rose-900/60 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit mx-auto whitespace-nowrap">
                          <ArrowUpRight className="w-3 h-3" /> XUẤT KHO
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-black text-right font-mono">
                      <span className={isImport ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-450"}>
                        {isImport ? "+" : "-"}{log.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 italic font-medium bg-slate-50/30 dark:bg-[#0f172a]/10">{log.reason}</td>
                    <td className="p-4 text-xs text-slate-700 dark:text-slate-300 text-right font-bold">{log.user}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden p-4 space-y-3">
        {stockLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 italic">Chưa có giao dịch kho nào.</div>
        ) : (
          stockLogs.map((log) => {
            const med = medicines.find((m) => m.id === log.medicineId);
            const isImport = log.type === "import";
            return (
              <div key={log.id} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-[#0f172a]/20 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-205 text-xs">{med?.name}</strong>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">Lô: {log.batchNumber}</span>
                  </div>
                  {isImport ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/60 font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 whitespace-nowrap">
                      <ArrowDownLeft className="w-3 h-3" /> NHẬP
                    </span>
                  ) : (
                    <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-150 dark:bg-rose-955/40 dark:text-rose-450 dark:border-rose-900/60 font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 whitespace-nowrap">
                      <ArrowUpRight className="w-3 h-3" /> XUẤT
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-b border-dashed border-slate-150 dark:border-slate-800 py-2 italic font-medium">
                  Lý do: {log.reason}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>Thời điểm: {formatDate(log.date)}</span>
                  <span className="text-right">NV: {log.user}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
