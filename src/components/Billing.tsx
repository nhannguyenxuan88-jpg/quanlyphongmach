/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../context/ClinicContext";
import BillQueue from "./billing/BillQueue";
import LedgerPanel from "./billing/LedgerPanel";
import ReceiptPrintSlip from "./billing/ReceiptPrintSlip";
import Modal from "./common/Modal";
import { useToast } from "./common/Toast";
import { Wallet, Landmark, CreditCard, Scissors, Calculator } from "lucide-react";
import { Invoice, Visit, Patient } from "../types";
import { formatCurrency } from "../lib/utils";

interface BillingProps {
  currentUser: any; // Fallback or context
  onActionTrigger?: () => void;
}

export default function Billing({ currentUser, onActionTrigger }: BillingProps) {
  const { receivePayment, visits, patients } = useClinic();
  const { toast } = useToast();

  // Modals visibility states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // checkout form states
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Tiền mặt" | "Chuyển khoản" | "QR VietQR">("Tiền mặt");

  // Print Simulator States
  const [printType, setPrintType] = useState<"prescription" | "invoice">("invoice");
  const [printSlipVisit, setPrintSlipVisit] = useState<Visit | null>(null);
  const [printSlipPatient, setPrintSlipPatient] = useState<Patient | null>(null);
  const [printSlipInvoice, setPrintSlipInvoice] = useState<Invoice | null>(null);

  // Open checkout modal
  const handleOpenCheckout = (invoice: Invoice) => {
    setCheckoutInvoice(invoice);
    setDiscount(invoice.discount);
    
    const totalDue = invoice.consultationFee + (invoice.serviceSubtotal || 0) + invoice.drugSubtotal - invoice.discount;
    setAmountPaid(totalDue);
    setPaymentMethod("Tiền mặt");
    setShowCheckoutModal(true);
  };

  // Submit checkout payment
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInvoice) return;

    const res = receivePayment(
      checkoutInvoice.id,
      amountPaid,
      discount,
      paymentMethod
    );

    if (res.success) {
      toast("Đã thu tiền khám thành công! Dược phẩm kho tự động trừ theo FEFO.", "success");
      setShowCheckoutModal(false);
      setCheckoutInvoice(null);
      if (onActionTrigger) onActionTrigger();

      // Launch invoice print slip immediately
      const v = visits.find((visit) => visit.id === res.invoice.visitId) || null;
      const p = patients.find((pat) => pat.id === v?.patientId) || null;
      
      if (v && p) {
        setPrintType("invoice");
        setPrintSlipVisit(v);
        setPrintSlipPatient(p);
        setPrintSlipInvoice(res.invoice);
        setShowPrintModal(true);
      }
    } else {
      toast(res.errMsg || "Đã xảy ra lỗi khi kết toán hóa đơn!", "error");
    }
  };

  // Launch print template
  const handleOpenPrint = (type: "prescription" | "invoice", inv: Invoice) => {
    const v = visits.find((visit) => visit.id === inv.visitId) || null;
    const p = patients.find((pat) => pat.id === v?.patientId) || null;

    if (v && p) {
      setPrintType(type);
      setPrintSlipVisit(v);
      setPrintSlipPatient(p);
      setPrintSlipInvoice(inv);
      setShowPrintModal(true);
    } else {
      toast("Không tìm thấy dữ liệu ca khám tương ứng để in!", "error");
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<"unpaid" | "ledger">("unpaid");

  return (
    <div className="space-y-6 text-left" id="billing-module">
      
      {/* Header Bar with Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wide flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0EA5E9]" />
            Thanh Toán Viện Phí
          </h2>
          <p className="text-[11px] text-slate-405 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Duyệt thu viện phí lâm sàng, giá thuốc kê đơn và công nợ bệnh nhân
          </p>
        </div>

        {/* Premium Pill Tabs Swticher */}
        <div className="flex bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/60 shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab("unpaid")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSubTab === "unpaid"
                ? "bg-white dark:bg-[#1e293b] text-indigo-650 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Hóa Đơn Chờ Thanh Toán
          </button>
          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSubTab === "ledger"
                ? "bg-white dark:bg-[#1e293b] text-indigo-650 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Landmark className="w-4 h-4" />
            Nhật Ký & Sổ Sách Thu Ngân
          </button>
        </div>
      </div>

      {/* Content Panels */}
      <div className="w-full">
        {activeSubTab === "unpaid" ? (
          <div className="animate-fade-in">
            <BillQueue onCheckoutClick={handleOpenCheckout} onPrintClick={handleOpenPrint} showType="unpaid" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            <div className="lg:col-span-8">
              <BillQueue onCheckoutClick={handleOpenCheckout} onPrintClick={handleOpenPrint} showType="paid" />
            </div>
            <div className="lg:col-span-4">
              <LedgerPanel />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================= MODALS ======================================================= */}

      {/* MODAL 1: CHECKOUT DIALOG CALCULATOR */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false);
          setCheckoutInvoice(null);
        }}
        title="Tính Viện Phí & Khấu Trừ Kho"
      >
        {checkoutInvoice && (() => {
          const finalTotal = checkoutInvoice.consultationFee + (checkoutInvoice.serviceSubtotal || 0) + checkoutInvoice.drugSubtotal - discount;
          const changeDue = amountPaid > finalTotal ? amountPaid - finalTotal : 0;
          const debtAmt = finalTotal > amountPaid ? finalTotal - amountPaid : 0;

          return (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-705 dark:text-slate-300">
              
              {/* invoice review */}
              <div className="bg-slate-50 dark:bg-[#0f172a]/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2 font-bold text-slate-550 dark:text-slate-400">
                <div className="flex justify-between text-xs">
                  <span>Tiền khám bệnh:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatCurrency(checkoutInvoice.consultationFee)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Tiền dịch vụ cận lâm sàng:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatCurrency(checkoutInvoice.serviceSubtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Tiền thuốc kê đơn (Lô FEFO):</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatCurrency(checkoutInvoice.drugSubtotal)}</span>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-750 pt-2 flex justify-between text-sm text-slate-805 dark:text-slate-100 font-extrabold">
                  <span>Tạm tính (chưa giảm):</span>
                  <span>{formatCurrency(checkoutInvoice.consultationFee + (checkoutInvoice.serviceSubtotal || 0) + checkoutInvoice.drugSubtotal)}</span>
                </div>
              </div>

              {/* Discount selector */}
              <div>
                <label className="block text-slate-550 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                  Khấu giảm phí khám y khoa (VNĐ) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={checkoutInvoice.consultationFee + (checkoutInvoice.serviceSubtotal || 0) + checkoutInvoice.drugSubtotal}
                  value={discount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDiscount(val);
                    setAmountPaid((checkoutInvoice.consultationFee + (checkoutInvoice.serviceSubtotal || 0) + checkoutInvoice.drugSubtotal) - val);
                  }}
                  className="w-full bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 text-xs rounded-xl outline-none focus:ring-1 focus:ring-[#0EA5E9] font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Final Total box */}
              <div className="bg-slate-900 dark:bg-[#0f172a] border dark:border-slate-800 text-white p-4 rounded-2xl uppercase tracking-wider flex justify-between items-center shadow-lg shadow-slate-900/10 select-none">
                <span className="text-[10px] text-slate-400 font-bold">Tổng Viện Phí Cần Thu</span>
                <span className="text-lg font-black text-[#0EA5E9]">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              {/* Cash paid by patient */}
              <div>
                <label className="block text-amber-700 dark:text-amber-500 mb-1 uppercase tracking-wide text-[10px] font-bold flex justify-between">
                  <span>Số tiền khách đưa (VNĐ) *</span>
                  <span className="text-[9px] text-slate-400 font-normal">Sẽ được tính tiền thối tự động</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 text-xs rounded-xl text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-right"
                />
                
                {/* Change Due or Debt status */}
                {changeDue > 0 && (
                  <span className="text-[10.5px] text-emerald-600 dark:text-emerald-450 font-extrabold mt-1.5 block">
                    💵 Tiền thối lại cho khách: {formatCurrency(changeDue)}
                  </span>
                )}
                {debtAmt > 0 && (
                  <span className="text-[10.5px] text-amber-600 dark:text-amber-500 font-extrabold mt-1.5 block">
                    ⚠️ Phát sinh công nợ ghi hồ sơ: {formatCurrency(debtAmt)}
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-slate-500 mb-1.5 uppercase tracking-wide text-[10px] font-bold">
                  Hình thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "Tiền mặt", icon: Wallet },
                    { key: "Chuyển khoản", icon: Landmark },
                    { key: "QR VietQR", icon: CreditCard }
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.key as any);
                          if (m.key === "QR VietQR" || m.key === "Chuyển khoản") {
                            setAmountPaid(finalTotal);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 transition border cursor-pointer ${
                          paymentMethod === m.key
                            ? "bg-sky-50 dark:bg-sky-950/40 border-[#0EA5E9] text-[#0EA5E9] font-extrabold"
                            : "bg-slate-50 dark:bg-[#0f172a]/40 border-slate-200 dark:border-slate-750 text-slate-500 hover:bg-slate-100/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {m.key}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Render dynamic VietQR image mockup */}
              {paymentMethod === "QR VietQR" && (
                <div className="bg-[#F8FAFC] dark:bg-[#0f172a]/60 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-3 text-center transition-all duration-300">
                  <div className="text-[10px] font-black text-slate-505 dark:text-slate-400 uppercase tracking-wider">
                    Quét Mã VietQR Chuyển Khoản Nhanh
                  </div>
                  <img
                    src={`https://img.vietqr.io/image/MB-113366668888-compact.png?amount=${finalTotal}&addInfo=${encodeURIComponent(
                      `HD ${checkoutInvoice.id.substring(0, 8).toUpperCase()}`
                    )}&accountName=${encodeURIComponent("PHONG KHAM CLINIC CLOUD")}`}
                    alt="VietQR QR Code"
                    className="w-36 h-36 border-2 border-white rounded-xl shadow-md bg-white p-1"
                  />
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                    <p>Ngân hàng: <strong className="text-slate-800 dark:text-slate-200">MB Bank (Quân Đội)</strong></p>
                    <p>Số tài khoản: <strong className="text-slate-850 dark:text-slate-100">113366668888</strong></p>
                    <p>Chủ TK: <strong className="text-slate-850 dark:text-slate-100">PHONG KHAM CLINIC CLOUD</strong></p>
                    <p>Số tiền: <strong className="text-[#0EA5E9]">{finalTotal.toLocaleString()}đ</strong></p>
                  </div>
                </div>
              )}

              {/* Footer buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutInvoice(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md shadow-emerald-100 cursor-pointer"
                >
                  Thanh Toán
                </button>
              </div>

            </form>
          );
        })()}
      </Modal>

      {/* MODAL 2: PRINT TEMPLATE SLIP DIALOG */}
      <ReceiptPrintSlip
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPrintSlipVisit(null);
          setPrintSlipPatient(null);
          setPrintSlipInvoice(null);
        }}
        type={printType}
        visit={printSlipVisit}
        patient={printSlipPatient}
        invoice={printSlipInvoice}
      />

    </div>
  );
}
