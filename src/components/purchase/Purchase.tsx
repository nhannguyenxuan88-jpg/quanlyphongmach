/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useClinic } from "../../context/ClinicContext";
import { PurchaseInvoice, PurchaseInvoiceItem, Supplier, Medicine } from "../../types";
import { useToast } from "../common/Toast";
import { Plus, Trash2, Save, Printer, ShoppingCart, ArrowLeftRight } from "lucide-react";
import Modal from "../common/Modal";
import { SYSTEM_DATE } from "../../lib/utils";

export default function Purchase() {
  const { suppliers, medicines, savePurchaseInvoice } = useClinic();
  const { toast } = useToast();

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [importDate, setImportDate] = useState("2026-06-17");
  const [notes, setNotes] = useState("");
  
  // Line items state
  const [items, setItems] = useState<{ medicineId: string; quantity: number; importPrice: number }[]>([
    { medicineId: "", quantity: 1, importPrice: 1000 }
  ]);

  // Printing state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printedInvoice, setPrintedInvoice] = useState<PurchaseInvoice | null>(null);

  const activeSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId);
  }, [suppliers, selectedSupplierId]);

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.importPrice || 0), 0);
  }, [items]);

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { medicineId: "", quantity: 1, importPrice: 1000 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length <= 1) {
      toast("Phiếu nhập phải chứa ít nhất 1 mặt hàng", "warning");
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      return updated;
    });
  };

  const handleSaveInvoice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!selectedSupplierId) {
      toast("Vui lòng chọn nhà cung cấp", "error");
      return;
    }

    const invalidItem = items.some(item => !item.medicineId || item.quantity <= 0 || item.importPrice < 0);
    if (invalidItem) {
      toast("Vui lòng chọn thuốc và nhập số lượng/giá hợp lệ cho tất cả các dòng", "error");
      return;
    }

    const invoiceId = "pi-" + Math.random().toString(36).substring(2, 9);
    
    const invoiceItems: PurchaseInvoiceItem[] = items.map(item => ({
      medicineId: item.medicineId,
      quantity: Number(item.quantity),
      importPrice: Number(item.importPrice),
      totalPrice: Number(item.quantity) * Number(item.importPrice)
    }));

    const invoice: PurchaseInvoice = {
      id: invoiceId,
      supplierId: selectedSupplierId,
      importDate,
      notes,
      items: invoiceItems,
      totalAmount: grandTotal
    };

    savePurchaseInvoice(invoice);
    setPrintedInvoice(invoice);
    toast("Đã lưu phiếu nhập hàng và cập nhật số lượng tồn kho theo lô FEFO!", "success");

    // Reset Form
    setSelectedSupplierId("");
    setNotes("");
    setItems([{ medicineId: "", quantity: 1, importPrice: 1000 }]);
  };

  const handlePrintMockup = () => {
    if (!selectedSupplierId) {
      toast("Vui lòng lập phiếu nhập hàng trước", "error");
      return;
    }
    const invalidItem = items.some(item => !item.medicineId || item.quantity <= 0 || item.importPrice < 0);
    if (invalidItem) {
      toast("Vui lòng điền thông tin hợp lệ trước khi in", "error");
      return;
    }

    const mockInvoice: PurchaseInvoice = {
      id: "pi-temp-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      supplierId: selectedSupplierId,
      importDate,
      notes,
      items: items.map(item => ({
        medicineId: item.medicineId,
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice),
        totalPrice: Number(item.quantity) * Number(item.importPrice)
      })),
      totalAmount: grandTotal
    };

    setPrintedInvoice(mockInvoice);
    setPrintModalOpen(true);
  };

  return (
    <div className="space-y-6" id="purchase-module">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#0EA5E9]" />
            Tạo Phiếu Nhập Thuốc
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Lập hóa đơn nhập kho dược phẩm định kỳ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CREATION FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-xs font-black text-slate-850 dark:text-slate-205 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Thông tin chứng từ phiếu nhập
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Selector */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nhà cung cấp *</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
              >
                <option value="" className="dark:bg-[#0f172a]">-- Chọn nhà cung cấp --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id} className="dark:bg-[#0f172a]">
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ngày nhập kho *</label>
              <input
                type="date"
                required
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                value={importDate}
                onChange={e => setImportDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1 text-left col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ghi chú phiếu nhập</label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Ví dụ: Nhập thuốc Amox đợt hè 2026..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* DYNAMIC LINE ITEMS TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-805 dark:text-slate-200 uppercase tracking-wider">
                Chi tiết mặt hàng
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[10px] font-black text-[#0EA5E9] dark:text-[#38bdf8] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F8FAFC]/50 dark:bg-[#0f172a]/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  
                  {/* Medicine Selector */}
                  <div className="flex-1 text-left min-w-[150px] w-full">
                    <select
                      className="w-full border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                      value={item.medicineId}
                      onChange={e => handleItemChange(idx, "medicineId", e.target.value)}
                    >
                      <option value="" className="dark:bg-[#0f172a]">-- Chọn thuốc --</option>
                      {medicines.map(med => (
                        <option key={med.id} value={med.id} className="dark:bg-[#0f172a]">
                          {med.name} ({med.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    {/* Quantity */}
                    <div className="w-24 text-left">
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-[#0EA5E9] text-center"
                        placeholder="Số lượng"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                      />
                    </div>

                    {/* Import Price */}
                    <div className="w-32 text-left">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2 pl-6 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                          placeholder="Giá nhập"
                          value={item.importPrice}
                          onChange={e => handleItemChange(idx, "importPrice", Number(e.target.value))}
                        />
                        <span className="absolute left-2.5 top-2 text-[10px] text-slate-400 font-extrabold">đ</span>
                      </div>
                    </div>

                    {/* Row Total */}
                    <div className="w-28 text-right font-extrabold text-xs text-slate-800 dark:text-slate-200 px-2 font-mono">
                      {((item.quantity * item.importPrice) || 0).toLocaleString()}đ
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-fit space-y-6 text-left">
          <h3 className="text-xs font-black text-slate-850 dark:text-slate-205 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Tóm tắt phiếu nhập
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-450 dark:text-slate-500 font-semibold">Nhà cung cấp:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-right max-w-[150px] truncate">
                {activeSupplier ? activeSupplier.name : "Chưa chọn"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-455 dark:text-slate-500 font-semibold">Tổng đầu thuốc:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {items.filter(item => item.medicineId).length}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-455 dark:text-slate-500 font-semibold">Tổng số lượng:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Tổng thanh toán:
              </span>
              <span className="text-lg font-black text-[#0EA5E9] dark:text-[#38bdf8] font-mono">
                {grandTotal.toLocaleString()}đ
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleSaveInvoice()}
              className="w-full bg-[#0EA5E9] hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-100 dark:shadow-none cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Lưu & Cập Nhật Lô FEFO
            </button>
            <button
              onClick={handlePrintMockup}
              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In Phiếu Nhập
            </button>
          </div>
        </div>

      </div>

      {/* PRINT SLIP PREVIEW MODAL */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Bản In Phiếu Nhập Kho Dược"
      >
        {printedInvoice && (
          <div className="bg-white dark:bg-white p-6 rounded-xl border border-slate-200 dark:border-slate-200 max-w-2xl mx-auto text-slate-900 dark:text-slate-900 text-left font-serif" id="print-area">
            {/* Header info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
              <h2 className="text-base font-extrabold tracking-wider uppercase">PHÒNG KHÁM ĐA KHOA CLINIC CLOUD</h2>
              <p className="text-[10px] font-sans text-slate-500 mt-1">456 Nguyễn Chí Thanh, Quận 10, TP. Hồ Chí Minh</p>
              <p className="text-[10px] font-sans text-slate-500">SĐT: 1900 6060 - Hotline: 028 3835 1234</p>
              
              <h3 className="text-sm font-black tracking-wide uppercase mt-4 text-slate-900">PHIẾU NHẬP KHO DƯỢC PHẨM</h3>
              <p className="text-[10px] font-sans text-slate-500 mt-0.5">Mã số phiếu: {printedInvoice.id.toUpperCase()}</p>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 font-sans">
              <div>
                <span className="font-bold">Nhà cung cấp:</span> {activeSupplier ? activeSupplier.name : "---"}
              </div>
              <div className="text-right">
                <span className="font-bold">Ngày lập:</span> {printedInvoice.importDate}
              </div>
              <div>
                <span className="font-bold">Liên hệ:</span> {activeSupplier ? activeSupplier.phone : "---"}
              </div>
              <div className="text-right">
                <span className="font-bold">Người lập:</span> Dược sĩ hệ thống
              </div>
              <div className="col-span-2">
                <span className="font-bold">Ghi chú:</span> {printedInvoice.notes || "Không có"}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs font-sans border-collapse mb-6">
              <thead>
                <tr className="border-b border-slate-300 font-extrabold bg-slate-50 text-slate-700">
                  <th className="py-2 text-left">Tên thuốc</th>
                  <th className="py-2 text-center">ĐVT</th>
                  <th className="py-2 text-center">SL</th>
                  <th className="py-2 text-right">Đơn giá</th>
                  <th className="py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printedInvoice.items.map((item, idx) => {
                  const med = medicines.find(m => m.id === item.medicineId);
                  return (
                    <tr key={idx}>
                      <td className="py-2 font-bold">{med ? med.name : "Thuốc đã xóa"}</td>
                      <td className="py-2 text-center text-slate-650">{med ? med.unit : "---"}</td>
                      <td className="py-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 text-right">{item.importPrice.toLocaleString()}đ</td>
                      <td className="py-2 text-right font-extrabold">{item.totalPrice.toLocaleString()}đ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total summary */}
            <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col items-end gap-1 font-sans">
              <div className="flex gap-10 text-xs">
                <span>Tổng giá trị hàng nhập:</span>
                <span className="font-black">{printedInvoice.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex gap-10 text-xs border-t border-slate-200 pt-1.5 mt-1">
                <span className="font-extrabold text-sm">Tổng cộng phải thanh toán:</span>
                <span className="font-black text-sm text-[#0EA5E9]">{printedInvoice.totalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-[10px] mt-10 font-sans font-bold text-slate-500">
              <div>
                <p>Người giao hàng</p>
                <p className="mt-12 text-slate-300">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p>Thủ kho nhận hàng</p>
                <p className="mt-12 text-slate-300">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>

            {/* Print trigger button */}
            <div className="mt-8 flex justify-center font-sans">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Thực hiện lệnh in bản cứng
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
