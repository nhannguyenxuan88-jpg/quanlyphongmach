/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import Modal from "../common/Modal";
import { Printer, Download } from "lucide-react";
import { Invoice, Visit, Patient } from "../../types";
import { formatCurrency, formatDate } from "../../lib/utils";

interface ReceiptPrintSlipProps {
  isOpen: boolean;
  onClose: () => void;
  type: "prescription" | "invoice";
  visit: Visit | null;
  patient: Patient | null;
  invoice: Invoice | null;
}

export default function ReceiptPrintSlip({
  isOpen,
  onClose,
  type,
  visit,
  patient,
  invoice
}: ReceiptPrintSlipProps) {
  const { medicines, services } = useClinic();

  if (!visit || !patient || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "prescription" ? "Giả lập bản in Toa Thuốc" : "Giả lập bản in Hóa Đơn"}
      size="lg"
    >
      <div className="flex flex-col gap-4 -mt-2">
        {/* Printable controller bar inside modal */}
        <div className="bg-slate-50 dark:bg-[#0f172a]/20 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center select-none font-bold text-xs">
          <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350">
            <Printer className="w-4.5 h-4.5 text-[#0EA5E9]" />
            <span>Chế độ xem trước bản in (Ấn nút để gửi lệnh tới máy in thật)</span>
          </div>
          <button
            onClick={handlePrint}
            className="bg-[#0EA5E9] hover:bg-sky-600 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1 cursor-pointer shadow-md shadow-sky-100 dark:shadow-none"
          >
            <Download className="w-3.5 h-3.5" /> Gửi Lệnh In
          </button>
        </div>

        {/* Simulated A5 paper sheet with print layout styling */}
        <div
          className="p-8 sm:p-12 text-left bg-white text-slate-900 border border-slate-200 rounded-3xl font-sans leading-relaxed text-xs shadow-inner"
          id="printable-template-slip"
        >
          {/* Clinic Brand Header */}
          <div className="flex justify-between items-start border-b border-slate-900 pb-4 font-semibold">
            <div>
              <h1 className="text-[13px] font-black text-slate-950 tracking-wide uppercase">
                PHÒNG MẠCH Y KHOA TƯ NHÂN CLINIC CLOUD
              </h1>
              <p className="text-[10px] text-slate-500 leading-normal mt-1 font-medium font-semibold">
                Địa chỉ: 120 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh <br />
                Hotline: (028) 3840 9292 • Giờ mở cửa: 7H30 - 20H00 hằng ngày
              </p>
            </div>
            <div className="text-right">
              <div className="border border-slate-800 p-1 px-2.5 text-[9px] uppercase font-bold tracking-wider rounded-lg font-mono">
                Số hồ sơ: {visit.id}
              </div>
              <div className="text-[9px] text-slate-400 mt-1">Ngày lập: {formatDate(visit.date)}</div>
            </div>
          </div>

          {/* Title based on slip type */}
          <div className="my-8 text-center">
            <h2 className="text-base font-black text-slate-900 tracking-widest uppercase">
              {type === "prescription" ? "ĐƠN THUỐC ĐIỀU TRỊ LÂM SÀNG" : "BIÊN LAI THU VIỆN PHÍ & DƯỢC PHẨM"}
            </h2>
            <p className="text-[9px] text-slate-400 italic mt-0.5 font-semibold">
              Hệ thống kết chuyển thuốc chuẩn FEFO - Clinic Cloud
            </p>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-slate-800 border-b border-slate-100 pb-4 mb-4 font-semibold">
            <div>
              <span className="text-slate-400 font-bold inline-block w-20 uppercase text-[9px] tracking-wide">
                Họ và tên:
              </span>
              <strong className="text-slate-950">{patient.fullName}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-bold inline-block w-20 uppercase text-[9px] tracking-wide">
                Giới tính:
              </span>
              <span>{patient.gender}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold inline-block w-20 uppercase text-[9px] tracking-wide">
                Ngày sinh:
              </span>
              <span>{formatDate(patient.dob)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 font-bold inline-block w-20 uppercase text-[9px] tracking-wide">
                Điện thoại:
              </span>
              <span>{patient.phone}</span>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 font-bold inline-block w-20 uppercase text-[9px] tracking-wide">
                Địa chỉ:
              </span>
              <span className="text-slate-700 font-medium">{patient.address}</span>
            </div>

            {type === "prescription" ? (
              <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-[11px] mt-1 font-semibold">
                <div className="font-extrabold text-indigo-700 uppercase text-[9px] tracking-wider mb-0.5">
                  Chẩn đoán y khoa chính:
                </div>
                <p className="text-slate-900 italic">{visit.diagnosis || "Chưa ghi nhận chẩn đoán"}</p>
              </div>
            ) : (
              <div className="col-span-2 text-[11px] font-semibold flex items-center gap-1">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Dị ứng thuốc:</span>
                <span className="text-rose-700 font-extrabold">{patient.drugAllergies}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="mb-6 font-semibold">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 font-bold text-slate-500 uppercase tracking-wide text-[9px]">
                  <th className="py-2 text-left w-8">STT</th>
                  <th className="py-2 text-left">Nội dung dược phẩm / Dịch vụ</th>
                  <th className="py-2 text-center w-24">Số lượng</th>
                  <th className="py-2 text-right w-24">
                    {type === "prescription" ? "Hướng dẫn sử dụng" : "Đơn giá thu"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-slate-850">
                {/* Consultation Fee row inside Invoice receipt */}
                {type === "invoice" && (
                  <tr className="hover:bg-slate-50/20">
                    <td className="py-2.5">1</td>
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900">Chi phí công khám bệnh lâm sàng</span>
                      <p className="text-[9px] text-slate-400 font-normal">Tư vấn chẩn trị và hẹn tái khám</p>
                    </td>
                    <td className="py-2.5 text-center">1 lượt</td>
                    <td className="py-2.5 text-right">{formatCurrency(invoice.consultationFee)}</td>
                  </tr>
                )}

                {/* Clinical Services List */}
                {type === "invoice" && visit.services && visit.services.map((srvId, idx) => {
                  const srv = services.find(s => s.id === srvId);
                  const rowNo = idx + 2;
                  return (
                    <tr key={`srv-${idx}`} className="hover:bg-slate-50/20">
                      <td className="py-2.5">{rowNo}</td>
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900">{srv ? srv.name : "Dịch vụ lâm sàng"}</span>
                        <p className="text-[9px] text-slate-400 font-normal">Chỉ định cận lâm sàng</p>
                      </td>
                      <td className="py-2.5 text-center">1 lượt</td>
                      <td className="py-2.5 text-right">{formatCurrency(srv ? srv.price : 0)}</td>
                    </tr>
                  );
                })}

                {/* Medications List */}
                {visit.prescriptionItems.length === 0 ? (
                  type !== "invoice" ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        Không kê toa thuốc chỉ định.
                      </td>
                    </tr>
                  ) : null
                ) : (
                  visit.prescriptionItems.map((item, idx) => {
                    const med = medicines.find((m) => m.id === item.medicineId);
                    const servicesCount = (type === "invoice" && visit.services) ? visit.services.length : 0;
                    const rowNo = type === "invoice" ? idx + 2 + servicesCount : idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="py-2.5">{rowNo}</td>
                        <td className="py-2.5">
                          <span className="font-bold text-slate-900">{med?.name}</span>
                          <span className="text-[9px] text-slate-400 font-normal block">({med?.activeIngredient})</span>
                        </td>
                        <td className="py-2.5 text-center font-bold text-slate-700">
                          {item.quantity} {med?.unit}
                        </td>
                        <td
                          className={`py-2.5 ${
                            type === "prescription" ? "text-left text-[11px] italic text-slate-500" : "text-right font-mono"
                          }`}
                        >
                          {type === "prescription" ? (
                            item.instruction
                          ) : (
                            formatCurrency(item.price * item.quantity)
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary / Notes section */}
          {type === "invoice" ? (
            <div className="border-t border-slate-300 pt-3 space-y-1.5 text-xs text-slate-700 max-w-xs ml-auto mr-0 font-bold">
              <div className="flex justify-between">
                <span>Tổng viện phí chưa giảm:</span>
                <span className="font-mono">{formatCurrency(invoice.consultationFee + (invoice.serviceSubtotal || 0) + invoice.drugSubtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Khấu trừ giảm giá y tế:</span>
                  <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-slate-950 uppercase">
                <span>Thực thu quỹ:</span>
                <span className="text-indigo-650 font-mono">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              {invoice.debt !== undefined && invoice.debt > 0 && (
                <div className="flex justify-between text-[11px] text-amber-700 bg-amber-50 p-1 px-2 rounded-lg mt-1 font-extrabold border border-amber-100">
                  <span>Công nợ chưa thu (Ghi sổ):</span>
                  <span className="font-mono">{formatCurrency(invoice.debt)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-200 text-xs italic text-slate-600 font-semibold leading-relaxed">
              <strong>Lời dặn điều trị từ bác sĩ phụ trách:</strong> <br />
              <p className="mt-1 text-slate-800 font-medium">
                {visit.prescriptionNotes || "Uống thuốc đúng giờ, hạn chế hoạt động mạnh và đồ ăn nhiều mỡ."}
              </p>
            </div>
          )}

          {/* Signatures & Stamp */}
          <div className="mt-12 grid grid-cols-2 text-center text-xs font-bold text-slate-800 select-none pb-4">
            <div>
              <span>NGƯỜI BỆNH / KHÁCH HÀNG</span>
              <div className="h-20"></div>
              <span className="text-slate-400 font-normal italic text-[10px]">(Ký, ghi rõ họ tên)</span>
            </div>
            <div className="flex flex-col items-center">
              <span>BÁC SĨ CHẨN TRỊ CHUYÊN KHOA</span>
              <div className="h-14 relative flex items-center justify-center">
                {/* Red Circular Medical Stamp mockup */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center text-[7px] text-red-500 font-black p-1 absolute select-none opacity-80 animate-stamp shadow-sm">
                  CLINIC CLOUD STAMP
                </div>
              </div>
              <span className="mt-6 text-slate-900 font-black">BS. Nguyễn Văn An</span>
              <span className="text-slate-400 text-[10px] font-normal italic mt-0.5">(Đã ký xác nhận số)</span>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
}
