/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Search, Printer, Receipt, RefreshCw } from "lucide-react";
import { Invoice } from "../../types";
import { formatCurrency } from "../../lib/utils";

interface BillQueueProps {
  onCheckoutClick: (invoice: Invoice) => void;
  onPrintClick: (type: "prescription" | "invoice", invoice: Invoice) => void;
  showType?: "unpaid" | "paid" | "all";
}

export default function BillQueue({ onCheckoutClick, onPrintClick, showType = "all" }: BillQueueProps) {
  const { invoices, visits, patients, medicines, currentUser, refreshData } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");

  const getPatientForInvoice = (inv: Invoice) => {
    const visit = visits.find((v) => v.id === inv.visitId);
    if (!visit) return null;
    return patients.find((p) => p.id === visit.patientId) || null;
  };

  const getFilteredInvoices = (isPaid: boolean) => {
    return invoices.filter((inv) => {
      const visit = visits.find((v) => v.id === inv.visitId);
      if (!visit) return false;

      const pat = patients.find((p) => p.id === visit.patientId);
      const patientName = pat?.fullName.toLowerCase() || "";
      const matchesSearch =
        patientName.includes(searchQuery.toLowerCase()) || visit.id.includes(searchQuery);

      const statusMatches = isPaid
        ? inv.paymentStatus === "paid"
        : inv.paymentStatus !== "paid";

      return statusMatches && matchesSearch;
    });
  };

  const pendingInvoices = getFilteredInvoices(false);
  const paidInvoices = getFilteredInvoices(true);

  const getPayStatusTag = (status: string) => {
    switch (status) {
      case "unpaid":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-150 px-2.5 py-1 text-[10px] font-bold rounded-full dark:bg-rose-950/40 dark:text-rose-450 dark:border-rose-900/60 whitespace-nowrap">
            Chưa trả
          </span>
        );
      case "partially_paid":
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-1 text-[10px] font-bold rounded-full dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/60 whitespace-nowrap">
            Nợ gối đầu
          </span>
        );
      default:
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-1 text-[10px] font-bold rounded-full font-mono dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/60 whitespace-nowrap">
            Đã thu
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col text-left bento-card">
      
      {/* Header controls */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {showType === "unpaid" ? "Danh Sách Hóa Đơn Chờ" : showType === "paid" ? "Lịch Sử Quyết Toán" : "Hàng Chờ Hóa Đơn & Thanh Toán"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 font-semibold">
            {showType === "unpaid" 
              ? "Duyệt thu tiền khám y khoa và tiền dược phẩm kê đơn"
              : showType === "paid"
              ? "Theo dõi các giao dịch đã hoàn tất thanh toán trong ngày"
              : "Duyệt thu tiền khám, phân tách tiền dược FEFO và nợ bệnh nhân."}
          </p>
        </div>

        <button
          onClick={refreshData}
          className="p-1 px-3 text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Tải lại
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân hoặc mã ca..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-55 dark:bg-[#0f172a]/40 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-[#0f172a]/60 dark:text-slate-205 transition font-semibold"
        />
      </div>

      {/* Unpaid section */}
      {(showType === "all" || showType === "unpaid") && (
        <div className="space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-350">
          <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-rose-500 border-b border-rose-50 dark:border-rose-950/40 pb-2">
            Hóa đơn chờ kết toán ({pendingInvoices.length})
          </h3>

          {pendingInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl italic">
              Không có ca bệnh nào đang chờ thanh toán.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvoices.map((inv) => {
                const pat = getPatientForInvoice(inv);
                const visit = visits.find((v) => v.id === inv.visitId);
                const rxCount = visit?.prescriptionItems.length || 0;
                const totalAmount = inv.consultationFee + inv.drugSubtotal - inv.discount;
                return (
                  <div
                    key={inv.id}
                    className="p-4 bg-slate-50/50 dark:bg-[#0f172a]/20 rounded-2xl border border-slate-150 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-slate-900 dark:text-slate-100 text-sm font-extrabold">{pat?.fullName}</strong>
                        {getPayStatusTag(inv.paymentStatus)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
                        Mã ca: {visit?.id} • SĐT: {pat?.phone}
                      </div>

                      <div className="mt-3 border-t border-b border-dashed border-slate-200/80 dark:border-slate-800 py-2.5 space-y-1.5 text-slate-500 dark:text-slate-400 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>Tiền khám lâm sàng:</span>
                          <span className="font-bold text-slate-850 dark:text-slate-200">{formatCurrency(inv.consultationFee)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Tiền dược ({rxCount} loại):</span>
                          <span className="font-bold text-slate-850 dark:text-slate-200">{formatCurrency(inv.drugSubtotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-[8px] text-slate-400 dark:text-slate-550 uppercase tracking-wider font-bold">Tổng chi thu</div>
                        <div className="text-sm font-black text-rose-600 dark:text-rose-450">{formatCurrency(totalAmount)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onPrintClick("prescription", inv)}
                          className="p-2 border border-slate-200 dark:border-slate-800 hover:border-slate-355 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition cursor-pointer"
                          title="In đơn thuốc"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCheckoutClick(inv)}
                          disabled={currentUser.role === "doctor" || currentUser.role === "pharmacist"}
                          className={`text-[11px] font-bold px-3.5 py-2 rounded-xl text-white transition shadow-sm ${
                            currentUser.role === "doctor" || currentUser.role === "pharmacist"
                              ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed"
                              : "bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-750 cursor-pointer shadow-indigo-150 dark:shadow-none"
                          }`}
                        >
                          Thu Viện Phí
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Paid Section */}
      {(showType === "all" || showType === "paid") && (
        <div className={`${showType === "all" ? "mt-8" : ""} space-y-4 font-semibold text-xs text-slate-700 dark:text-slate-350`}>
          <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-450 border-b border-emerald-50 dark:border-emerald-950/40 pb-2">
            Hóa đơn đã thanh toán hôm nay ({paidInvoices.length})
          </h3>

          {paidInvoices.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-2xl italic">
              Chưa có hóa đơn nào được quyết toán xong hôm nay.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-805 border border-slate-200 dark:border-slate-805 rounded-2xl bg-slate-50/20 dark:bg-[#0f172a]/10 overflow-hidden shadow-sm">
              {paidInvoices.map((inv) => {
                const pat = getPatientForInvoice(inv);
                const visit = visits.find((v) => v.id === inv.visitId);
                return (
                  <div
                    key={inv.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1e293b] hover:bg-slate-50/40 dark:hover:bg-[#1e293b]/60 transition-colors"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{pat?.fullName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
                        Ca: {visit?.id} • Hoàn thành: {inv.paymentDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{formatCurrency(inv.totalAmount)}</div>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/60 px-1.5 py-0.5 rounded-full inline-block mt-1 font-bold">
                          Thu quỹ: {inv.cashierId?.slice(-4) ?? "sys"}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onPrintClick("prescription", inv)}
                          className="p-1.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 font-extrabold transition cursor-pointer"
                        >
                          Toa thuốc
                        </button>
                        <button
                          onClick={() => onPrintClick("invoice", inv)}
                          className="p-1.5 px-3 border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold transition cursor-pointer"
                        >
                          Hóa đơn
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
