/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useClinic } from "../../context/ClinicContext";
import { projectFEFOAllocation } from "../../lib/utils";
import { useToast } from "../common/Toast";
import Modal from "../common/Modal";
import { AlertTriangle, Plus, Trash2, HeartPulse, User } from "lucide-react";
import { Visit, Patient } from "../../types";

interface PrescriptionWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
  patient: Patient | null;
}

export default function PrescriptionWorkspace({
  isOpen,
  onClose,
  visit,
  patient
}: PrescriptionWorkspaceProps) {
  const { medicines, services, prescribeMedications, batches } = useClinic();
  const { toast } = useToast();

  // Consultation States
  const [docDiagnosis, setDocDiagnosis] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [prescribedItems, setPrescribedItems] = useState<{ medicineId: string; quantity: number; instruction: string }[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);

  // Item Form States
  const [rxMedId, setRxMedId] = useState("");
  const [rxQty, setRxQty] = useState(10);
  const [rxInstruction, setRxInstruction] = useState("Sáng 1 viên, chiều 1 viên uống sau ăn");

  // Sync state when visit opens
  useEffect(() => {
    if (visit) {
      setDocDiagnosis(visit.diagnosis || "");
      setDocNotes(visit.prescriptionNotes || "");
      setSelectedServices(visit.services || []);
      
      const mapped = visit.prescriptionItems.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        instruction: item.instruction
      }));
      setPrescribedItems(mapped);
      setAllergyWarnings([]);

      if (medicines.length > 0) {
        setRxMedId(medicines[0].id);
      }
    }
  }, [visit, medicines]);

  // Run dynamic allergy and stock checks
  const checkAllergyAndStock = (itemsList: typeof prescribedItems) => {
    if (!patient) return;
    const warnings: string[] = [];
    const pAllergies = patient.drugAllergies.toLowerCase();
    const hasAllergyInfo = pAllergies && pAllergies !== "không có dị ứng thuốc" && pAllergies !== "no";

    itemsList.forEach((item) => {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) return;

      // 1. Allergy check
      if (hasAllergyInfo) {
        const words = pAllergies.split(/[\s,;.-]+/).filter((w) => w.length > 2);
        const medNameWord = med.name.toLowerCase();
        const activeWord = med.activeIngredient.toLowerCase();

        const isAllergic = words.some((w) => medNameWord.includes(w) || activeWord.includes(w));
        if (isAllergic) {
          warnings.push(
            `⚠️ Cảnh báo dị ứng: Thuốc "${med.name}" (${med.activeIngredient}) phản ứng với tiền sử dị ứng bệnh nhân: "${patient.drugAllergies}"`
          );
        }
      }

      // 2. FEFO Stock Check
      const allocation = projectFEFOAllocation(batches, item.medicineId, item.quantity);
      if (!allocation.satisfied) {
        warnings.push(
          `⚠️ Cảnh báo tồn kho: Thuốc "${med.name}" hiện không đủ lô hàng khả dụng (còn thiếu ${allocation.unmetQty} ${med.unit}).`
        );
      }
    });

    setAllergyWarnings(warnings);
  };

  // Add Item to Temporary Rx List
  const handleAddItem = () => {
    if (!rxMedId) return;

    const existingIdx = prescribedItems.findIndex((i) => i.medicineId === rxMedId);
    let updatedList = [];

    if (existingIdx >= 0) {
      updatedList = [...prescribedItems];
      updatedList[existingIdx].quantity += rxQty;
    } else {
      updatedList = [
        ...prescribedItems,
        {
          medicineId: rxMedId,
          quantity: rxQty,
          instruction: rxInstruction
        }
      ];
    }

    setPrescribedItems(updatedList);
    checkAllergyAndStock(updatedList);
    toast("Đã thêm thuốc vào đơn tạm thời", "success");
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    const updated = prescribedItems.filter((_, i) => i !== index);
    setPrescribedItems(updated);
    checkAllergyAndStock(updated);
    toast("Đã bỏ thuốc ra khỏi đơn", "info");
  };

  // Submit Prescription
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;
    if (prescribedItems.length === 0 && selectedServices.length === 0) {
      toast("Đơn chỉ định rỗng! Vui lòng chọn ít nhất 1 loại thuốc hoặc dịch vụ lâm sàng.", "warning");
      return;
    }

    try {
      const { warningMsgs } = prescribeMedications(
        visit.id,
        docDiagnosis.trim() || "Chưa ghi nhận chẩn đoán",
        docNotes.trim(),
        prescribedItems,
        selectedServices
      );

      if (warningMsgs.length > 0) {
        toast("Kết quả chẩn đoán và kê đơn đã cập nhật (có cảnh báo).", "warning");
      } else {
        toast("Kê đơn hoàn tất! Số liệu hóa đơn đã gửi sang Thu ngân.", "success");
      }
      onClose();
    } catch (err: any) {
      toast(err.message || "Tác vụ kê đơn thất bại!", "error");
    }
  };

  if (!visit || !patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ Sơ Chuẩn Trị & Kê Đơn Bác Sĩ" size="xl">
      <div className="flex flex-col gap-5 text-left font-semibold text-xs text-slate-800">
        
        {/* Patient Summary & Symptoms widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hành chính người bệnh</span>
            <div className="text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              {patient.fullName} ({patient.gender}) • Tuổi: {2026 - parseInt(patient.dob.split("-")[0])}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Dị ứng gốc: <strong className="text-rose-600">{patient.drugAllergies}</strong></div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Triệu chứng lâm sàng ghi nhận</span>
            <div className="text-slate-700 italic font-medium mt-1 leading-relaxed">{visit.symptoms}</div>
          </div>
        </div>

        {/* Real-time Allergy & FEFO Warnings list */}
        {allergyWarnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-xs text-rose-700 uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Cảnh báo an toàn & Tồn kho:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-medium leading-relaxed">
              {allergyWarnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Diagnostic fields (left 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Chẩn đoán lâm sàng *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Viêm họng cấp, cảm cúm nhẹ..."
                value={docDiagnosis}
                onChange={(e) => setDocDiagnosis(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Lời dặn & Chỉ định tái khám
              </label>
              <textarea
                rows={4}
                placeholder="Dặn dò cách nghỉ ngơi, chế độ ăn, hẹn tái khám sau 3 - 7 ngày..."
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none custom-scrollbar"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Chỉ định dịch vụ lâm sàng
              </label>
              <div className="bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {services.map((srv) => {
                  const isChecked = selectedServices.includes(srv.id);
                  return (
                    <label key={srv.id} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-350 font-bold cursor-pointer hover:bg-slate-105 p-1 rounded-lg">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices((prev) => [...prev, srv.id]);
                          } else {
                            setSelectedServices((prev) => prev.filter((id) => id !== srv.id));
                          }
                        }}
                        className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] mt-0.5 w-4 h-4"
                      />
                      <div className="flex-1 text-left leading-tight">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">{srv.name}</div>
                        <div className="text-[9px] text-[#0EA5E9] font-black mt-0.5">
                          {srv.price.toLocaleString()}đ
                        </div>
                      </div>
                    </label>
                  );
                })}
                {services.length === 0 && (
                  <div className="text-center text-slate-400 italic text-[10px] py-4">
                    Không có dịch vụ lâm sàng nào
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rx Medication picker and table (right 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Inline add form */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-3 text-[10px]">Thêm thuốc chỉ định</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-6">
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Dược phẩm</label>
                  <select
                    value={rxMedId}
                    onChange={(e) => setRxMedId(e.target.value)}
                    className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.activeIngredient}) [{m.unit}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    value={rxQty}
                    onChange={(e) => setRxQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 text-center font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Hướng dẫn sử dụng</label>
                  <input
                    type="text"
                    placeholder="Sáng 1 v, tối 1 v sau ăn"
                    value={rxInstruction}
                    onChange={(e) => setRxInstruction(e.target.value)}
                    className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 h-[34px] flex items-center justify-center transition cursor-pointer"
                    title="Thêm thuốc vào toa"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prescribed Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden flex-1 flex flex-col justify-between max-h-60 min-h-40 bg-white">
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 text-left font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-3 w-8 text-center">STT</th>
                      <th className="p-3">Thuốc</th>
                      <th className="p-3 text-center w-24">Số lượng</th>
                      <th className="p-3">Liều dùng & Lời dặn</th>
                      <th className="p-3 w-10 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {prescribedItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          Chưa có thuốc trong đơn. Hãy chọn thuốc phía trên để thêm vào.
                        </td>
                      </tr>
                    ) : (
                      prescribedItems.map((item, idx) => {
                        const med = medicines.find((m) => m.id === item.medicineId);
                        const allocation = projectFEFOAllocation(batches, item.medicineId, item.quantity);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <div className="font-extrabold text-slate-900">{med?.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">({med?.activeIngredient})</div>
                              {allocation.allocated.length > 0 && (
                                <div className="text-[9px] text-teal-600 font-bold mt-1 bg-teal-50 px-1.5 py-0.5 rounded-lg w-fit">
                                  Lô dự kiến (FEFO):{" "}
                                  {allocation.allocated
                                    .map((a) => `${a.batchNumber} (Tồn: ${a.qty})`)
                                    .join(", ")}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center bg-slate-50/30 text-slate-900 font-black">
                              {item.quantity} {med?.unit}
                            </td>
                            <td className="p-3 text-slate-500 font-medium text-[11px] italic">
                              {item.instruction}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action footer inside card */}
              <div className="flex justify-between items-center bg-slate-50/80 border-t border-slate-100 p-3.5">
                <span className="text-[10px] text-slate-400 italic">
                  * Hệ thống tự động khấu trừ lô thuốc sắp hết hạn (FEFO) khi thanh toán.
                </span>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
                  >
                    Lưu & Kết Chuyển HĐ
                  </button>
                </div>
              </div>

            </div>

          </div>

        </form>

      </div>
    </Modal>
  );
}
