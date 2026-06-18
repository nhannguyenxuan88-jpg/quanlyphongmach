/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { Award, ShoppingBag, RefreshCw } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function PerformanceLeaderboard() {
  const { users, visits, invoices, medicines, batches, refreshData } = useClinic();

  const doctors = users.filter((u) => u.role === "doctor");
  const paidInvoices = invoices.filter(
    (i) => i.paymentStatus === "paid" || i.paymentStatus === "partially_paid"
  );

  // 1. Calculate Doctor performance
  const getDoctorPerformance = () => {
    return doctors
      .map((doc) => {
        const docVisits = visits.filter((v) => v.doctorId === doc.id);
        const visitsCount = docVisits.length;

        let consultationRevenue = 0;
        docVisits.forEach((v) => {
          const correspondingInvoice = paidInvoices.find((i) => i.visitId === v.id);
          if (correspondingInvoice) {
            consultationRevenue += correspondingInvoice.consultationFee;
          }
        });

        return {
          id: doc.id,
          name: doc.name,
          visitsCount,
          consultationRevenue
        };
      })
      .sort((a, b) => b.visitsCount - a.visitsCount);
  };

  // 2. Calculate Top medicines sold
  const getTopSellingMedicines = () => {
    const medSalesMap: Record<string, { qty: number; revenue: number; margin: number }> = {};
    const paidVisits = visits.filter((v) => v.status === "paid");

    paidVisits.forEach((v) => {
      v.prescriptionItems.forEach((item) => {
        if (!medSalesMap[item.medicineId]) {
          medSalesMap[item.medicineId] = { qty: 0, revenue: 0, margin: 0 };
        }

        const sales = medSalesMap[item.medicineId];
        sales.qty += item.quantity;
        sales.revenue += item.price * item.quantity;

        const batch = batches.find((b) => b.id === item.batchId);
        const importCost = batch ? batch.importPrice : item.price * 0.6;
        sales.margin += (item.price - importCost) * item.quantity;
      });
    });

    return medicines
      .map((med) => {
        const sales = medSalesMap[med.id] || { qty: 0, revenue: 0, margin: 0 };
        return {
          id: med.id,
          name: med.name,
          group: med.group,
          qtySold: sales.qty,
          revenue: sales.revenue,
          margin: sales.margin
        };
      })
      .filter((m) => m.qtySold > 0)
      .sort((a, b) => b.qtySold - a.qtySold);
  };

  const docPerformance = getDoctorPerformance();
  const topMeds = getTopSellingMedicines();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left font-semibold text-xs text-slate-700">
      
      {/* Doctor output cards (4 cols) */}
      <div className="lg:col-span-4 bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] bento-card">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
            <Award className="w-5 h-5 text-indigo-500" />
            Hiệu Suất Phụ Trách Bác Sĩ
          </h3>
          <button
            onClick={refreshData}
            className="p-1 px-2.5 text-[10px] text-slate-500 dark:text-slate-405 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {docPerformance.map((doc) => (
            <div key={doc.id} className="p-4 bg-slate-50/60 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                <span>{doc.name}</span>
                <span className="text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 px-2.5 py-0.5 rounded-lg text-[10px]">
                  {doc.visitsCount} lượt khám
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-3.5 font-bold">
                <span>Doanh thu công khám:</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(doc.consultationRevenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medicines leaderboard (8 cols) */}
      <div className="lg:col-span-8 bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] bento-card">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5 uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShoppingBag className="w-5 h-5 text-indigo-500" />
          TOP Dược Phẩm & Biên Lợi Nhuận
        </h3>

        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-left font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Dược phẩm biệt dược</th>
                <th className="pb-2">Phân nhóm y khoa</th>
                <th className="pb-2 text-center">Tổng kê đơn</th>
                <th className="pb-2 text-right">Doanh thu</th>
                <th className="pb-2 text-right">Lợi nhuận gộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              {topMeds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-slate-500 italic">
                    Chưa có đơn thuốc nào bán ra hoàn thành hôm nay.
                  </td>
                </tr>
              ) : (
                topMeds.map((m) => (
                  <tr key={m.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-extrabold text-slate-900 dark:text-white">{m.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{m.group}</td>
                    <td className="py-3 text-center font-black text-slate-800 dark:text-slate-200 font-mono">
                      {m.qtySold}
                    </td>
                    <td className="py-3 text-right font-mono font-medium">{formatCurrency(m.revenue)}</td>
                    <td className="py-3 text-right text-emerald-650 dark:text-emerald-400 font-black font-mono">
                      +{formatCurrency(m.margin)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {topMeds.length === 0 ? (
            <div className="p-4 text-center text-slate-400 dark:text-slate-500 italic">Chưa phát sinh bán dược phẩm hôm nay.</div>
          ) : (
            topMeds.map((m) => (
              <div key={m.id} className="p-3.5 bg-slate-50/40 dark:bg-slate-800/10 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">{m.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-bold mt-0.5">{m.group}</span>
                  </div>
                  <span className="text-xs text-emerald-650 dark:text-emerald-400 font-black font-mono">
                    +{formatCurrency(m.margin)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 font-bold">
                  <span>Kê đơn: {m.qtySold} đợt</span>
                  <span>Doanh thu: {formatCurrency(m.revenue)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
