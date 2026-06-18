/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Coins, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import Modal from "../common/Modal";
import { useToast } from "../common/Toast";

export default function DebtTracker() {
  const { invoices, visits, patients, settlePatientDebt } = useClinic();
  const { toast } = useToast();

  const [selectedDebtInvoice, setSelectedDebtInvoice] = useState<any | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState(0);

  // Calculate debts list
  const getDebtLedger = () => {
    return invoices
      .filter((inv) => inv.paymentStatus === "partially_paid" || inv.paymentStatus === "unpaid")
      .map((inv) => {
        const visit = visits.find((v) => v.id === inv.visitId);
        const pat = patients.find((p) => p.id === visit?.patientId);
        
        const total = inv.consultationFee + inv.drugSubtotal - inv.discount;
        const currentDebt = inv.debt !== undefined ? inv.debt : total - inv.paidAmount;

        return {
          invoice: inv,
          visitId: visit?.id || "",
          patientId: pat?.id || "",
          patientName: pat?.fullName || "Khách ẩn",
          patientPhone: pat?.phone || "",
          visitDate: visit?.date || "",
          totalAmount: total,
          paidAmount: inv.paidAmount,
          debt: currentDebt
        };
      })
      .filter((d) => d.debt > 0);
  };

  const debts = getDebtLedger();

  const handleOpenSettlement = (debtItem: any) => {
    setSelectedDebtInvoice(debtItem);
    setDebtPayAmount(debtItem.debt);
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtInvoice) return;

    const pay = parseFloat(debtPayAmount.toString()) || 0;
    if (pay <= 0 || pay > selectedDebtInvoice.debt) {
      toast("Số tiền chi trả công nợ nhập vào không hợp lệ!", "warning");
      return;
    }

    settlePatientDebt(selectedDebtInvoice.invoice.id, pay);
    toast(`Đã thu hồi thành công ${formatCurrency(pay)} tiền công nợ từ người bệnh!`, "success");
    setSelectedDebtInvoice(null);
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-[28px] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.015)] border border-slate-200/80 dark:border-slate-800 bento-card font-semibold text-xs text-slate-700 dark:text-slate-300 text-left">
      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-150 mb-4 flex items-center gap-1.5 uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
        <Coins className="w-5 h-5 text-yellow-600" />
        Sổ Theo Dõi Công Nợ Người Bệnh ({debts.length})
      </h3>

      {debts.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 rounded-2xl font-semibold">
          Phòng khám tuyệt vời! Không phát hiện khoản công nợ chưa thu hồi.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-xs hidden md:table">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 text-left font-bold uppercase tracking-wider text-[10px] pb-2">
                <th className="pb-2.5">Họ & Tên bệnh nhân</th>
                <th className="pb-2.5">Số điện thoại</th>
                <th className="pb-2.5">Thời gian khám</th>
                <th className="pb-2.5 text-right">Tổng viện phí</th>
                <th className="pb-2.5 text-right">Tiến trình thanh toán</th>
                <th className="pb-2.5 text-right">Khoản nợ tồn đọng</th>
                <th className="pb-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-850 dark:text-slate-200">
              {debts.map((d) => {
                const paidPercent = Math.min(100, Math.max(0, (d.paidAmount / d.totalAmount) * 100));
                return (
                  <tr key={d.invoice.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 text-slate-950 dark:text-white font-extrabold">{d.patientName}</td>
                    <td className="py-3.5 font-mono">{d.patientPhone}</td>
                    <td className="py-3.5 text-slate-450 dark:text-slate-500 font-medium">{formatDate(d.visitDate)}</td>
                    <td className="py-3.5 text-right font-mono font-medium">{formatCurrency(d.totalAmount)}</td>
                    <td className="py-3.5 text-right min-w-[150px]">
                      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                        <span className="font-bold text-emerald-650 dark:text-emerald-450">{paidPercent.toFixed(0)}% đã thu</span>
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${paidPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right text-rose-650 dark:text-rose-400 font-black font-mono">{formatCurrency(d.debt)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleOpenSettlement(d)}
                        className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 hover:bg-indigo-650 hover:text-white dark:hover:bg-indigo-600 transition-all text-indigo-650 dark:text-indigo-400 text-[10px] font-bold px-3.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        Thu hồi nợ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3.5">
            {debts.map((d) => {
              const paidPercent = Math.min(100, Math.max(0, (d.paidAmount / d.totalAmount) * 100));
              return (
                <div key={d.invoice.id} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">{d.patientName}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono font-bold mt-1">{d.patientPhone}</span>
                    </div>
                    <span className="text-xs text-rose-650 dark:text-rose-450 font-black font-mono">{formatCurrency(d.debt)}</span>
                  </div>

                  {/* Progress Bar on mobile */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <span>Tiến trình thanh toán</span>
                      <span className="text-emerald-650 dark:text-emerald-450">{paidPercent.toFixed(0)}% đã thu</span>
                    </div>
                    <div className="w-full bg-slate-105 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${paidPercent}%` }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-[10px]">
                      <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block text-[8px]">Tổng viện phí</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(d.totalAmount)}</strong>
                    </div>
                    
                    <button
                      onClick={() => handleOpenSettlement(d)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-[10px] font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Thu hồi nợ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: COLLECT DEBT SETTLEMENT FOR PATIENTS */}
      {selectedDebtInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDebtInvoice(null)}
          title="Thu hồi nợ gối đầu viện phí"
        >
          <form onSubmit={handlePayDebtSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-1.5 font-bold">
              <div>
                Người bệnh nợ: <strong className="text-slate-900">{selectedDebtInvoice.patientName}</strong>
              </div>
              <div>
                Gốc nợ hiện hữu: <strong className="text-rose-605 font-mono">{formatCurrency(selectedDebtInvoice.debt)}</strong>
              </div>
            </div>

            <div>
              <label className="block text-slate-550 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Số tiền mặt thu nhận đợt này (VNĐ) *
              </label>
              <input
                type="number"
                min={1}
                max={selectedDebtInvoice.debt}
                required
                value={debtPayAmount}
                onChange={(e) => setDebtPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs rounded-xl text-slate-950 font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDebtInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-100 cursor-pointer"
              >
                Xác Nhận Đã Thu Nợ
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
