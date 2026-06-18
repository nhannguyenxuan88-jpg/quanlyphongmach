/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { Calculator, Coins, Wallet, Landmark, CreditCard, RefreshCw, Download } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import { exportToCSV } from "../../lib/exportUtils";

export default function LedgerPanel() {
  const { payments, invoices, visits, patients, refreshData } = useClinic();
  
  // Custom local currency formatter just to be safe
  const localFormatCurrency = (val: number) => val.toLocaleString("vi-VN") + " đ";

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.debt || 0), 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Chuyển khoản":
        return <Landmark className="w-3.5 h-3.5 text-indigo-500" />;
      case "Thẻ GSK":
        return <CreditCard className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <Wallet className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const handleExportLedger = () => {
    if (payments.length === 0) return;
    const exportData = payments.map((p, idx) => {
      const inv = invoices.find((i) => i.id === p.invoiceId);
      const visit = visits.find((v) => v.id === inv?.visitId);
      const pat = patients.find((pat) => pat.id === visit?.patientId);
      return {
        index: idx + 1,
        fullName: pat?.fullName || "Khách vãng lai",
        amount: p.amount,
        method: p.method,
        date: p.date,
        visitId: visit?.id || ""
      };
    });

    exportToCSV(exportData, "Nhat_ky_thu_quy_phong_kham", {
      index: "STT",
      fullName: "Họ và Tên Bệnh Nhân",
      amount: "Số Tiền Thu (đ)",
      method: "Phương Thức",
      date: "Ngày Thu",
      visitId: "Mã Ca Khám"
    });
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none text-left h-fit bento-card">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-tight">
          <Calculator className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
          Sổ Ghi Nhận Quỹ & Nợ
        </h3>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportLedger}
            disabled={payments.length === 0}
            className="p-1 px-2 text-[10px] text-emerald-650 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold"
            title="Xuất nhật ký thu quỹ sang Excel"
          >
            <Download className="w-3 h-3" />
            <span>Xuất</span>
          </button>
          
          <button
            onClick={refreshData}
            className="p-1 px-2.5 text-[10px] text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Funds summary metrics */}
      <div className="grid grid-cols-1 gap-3 mb-6 font-semibold">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-2xl">
          <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold tracking-wide uppercase">Tổng thực thu quỹ y khoa</div>
          <div className="text-xl font-black text-emerald-950 dark:text-emerald-300 mt-1 block font-mono">
            {localFormatCurrency(totalCollected)}
          </div>
        </div>
        
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 rounded-2xl">
          <div className="text-[10px] text-amber-800 dark:text-amber-400 font-bold tracking-wide uppercase flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> Tổng công nợ gối đầu
          </div>
          <div className="text-md font-black text-amber-950 dark:text-amber-300 mt-1 block font-mono">
            {localFormatCurrency(totalDebt)}
          </div>
        </div>
      </div>

      {/* Recent Ledger Transaction logs list */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
        Lịch sử thu quỹ gần đây ({payments.length})
      </span>

      <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar font-semibold text-xs text-slate-700 dark:text-slate-300">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-2xl italic font-semibold">
            Chưa phát sinh giao dịch thu ngân.
          </div>
        ) : (
          payments.map((p) => {
            const inv = invoices.find((i) => i.id === p.invoiceId);
            const visit = visits.find((v) => v.id === inv?.visitId);
            const pat = patients.find((pat) => pat.id === visit?.patientId);
            
            return (
              <div
                key={p.id}
                className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 hover:bg-slate-100/40 dark:hover:bg-[#0f172a]/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs transition flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-center">
                  <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{pat?.fullName || "Khách vãng lai"}</strong>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-right text-emerald-700 dark:text-emerald-400">
                    +{localFormatCurrency(p.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    {getMethodIcon(p.method)}
                    {p.method} • {p.date.split(" ")[1] || ""}
                  </span>
                  <span>Mã ca: {visit?.id || ""}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
