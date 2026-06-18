/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../context/ClinicContext";
import PatientRegistry from "./clinic/PatientRegistry";
import ActiveQueue from "./clinic/ActiveQueue";
import PrescriptionWorkspace from "./clinic/PrescriptionWorkspace";
import Modal from "./common/Modal";
import { useToast } from "./common/Toast";
import { UserPlus, Stethoscope, Activity } from "lucide-react";
import { Patient, Visit, User } from "../types";

interface PatientsAndVisitsProps {
  currentUser: User;
  onActionTrigger?: () => void; // Optional fallback
}

export default function PatientsAndVisits({ currentUser, onActionTrigger }: PatientsAndVisitsProps) {
  const { registerPatient, checkInVisit, users, patients, visits } = useClinic();
  const { toast } = useToast();

  // Selected Patient
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Active clinical workspace sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"reception" | "queue">("reception");

  // Auto switch sub-tabs based on roles
  React.useEffect(() => {
    if (currentUser.role === "doctor") {
      setActiveSubTab("queue");
    } else if (currentUser.role === "receptionist") {
      setActiveSubTab("reception");
    }
  }, [currentUser.role]);

  // Modal Triggers
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Active examination states
  const [activeExamVisit, setActiveExamVisit] = useState<Visit | null>(null);

  // Form States - Patient
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [newPatientDOB, setNewPatientDOB] = useState("1990-01-01");
  const [newPatientAddress, setNewPatientAddress] = useState("");
  const [newPatientHistory, setNewPatientHistory] = useState("");
  const [newPatientAllergies, setNewPatientAllergies] = useState("Không có dị ứng thuốc");

  // Form States - Visit check-in
  const [checkInDoctorId, setCheckInDoctorId] = useState("");
  const [checkInSymptoms, setCheckInSymptoms] = useState("");

  const doctors = users.filter((u) => u.role === "doctor" && u.status === "active");

  // Open add patient modal
  const handleOpenAddPatient = () => {
    setNewPatientName("");
    setNewPatientPhone("");
    setNewPatientGender("Nam");
    setNewPatientDOB("1990-01-01");
    setNewPatientAddress("");
    setNewPatientHistory("");
    setNewPatientAllergies("Không có dị ứng thuốc");
    setShowAddPatientModal(true);
  };

  // Submit patient registration
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      toast("Vui lòng nhập họ tên và số điện thoại bệnh nhân!", "warning");
      return;
    }

    const newPat = registerPatient({
      fullName: newPatientName.trim(),
      phone: newPatientPhone.trim(),
      gender: newPatientGender,
      dob: newPatientDOB,
      address: newPatientAddress.trim(),
      medicalHistory: newPatientHistory.trim() || "Không có tiền sử bệnh án đặc biệt",
      drugAllergies: newPatientAllergies.trim() || "Không có dị ứng thuốc"
    });

    setSelectedPatient(newPat);
    setShowAddPatientModal(false);
    toast(`Đã đăng ký hồ sơ bệnh nhân "${newPat.fullName}" thành công!`, "success");
    if (onActionTrigger) onActionTrigger();
  };

  // Open check-in modal
  const handleOpenCheckIn = () => {
    if (doctors.length > 0) {
      setCheckInDoctorId(doctors[0].id);
    }
    setCheckInSymptoms("");
    setShowCheckInModal(true);
  };

  // Submit check-in
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!checkInDoctorId) {
      toast("Vui lòng chọn bác sĩ khám bệnh!", "warning");
      return;
    }

    const visit = checkInVisit(
      selectedPatient.id,
      checkInDoctorId,
      checkInSymptoms.trim() || "Khám sức khỏe tổng quát"
    );

    setShowCheckInModal(false);
    toast(`Xếp số thành công ca khám "${visit.id}" cho bệnh nhân ${selectedPatient.fullName}!`, "success");
    if (onActionTrigger) onActionTrigger();
  };

  // Open consultation prescription workspace
  const handleOpenPrescription = (visit: Visit) => {
    // If pending, mark as examining automatically (local memory update will be done inside onSubmit but we can trigger state in db)
    if (visit.status === "pending") {
      visit.status = "examining";
      // Auto assign current doctor if applicable
      if (currentUser.role === "doctor") {
        visit.doctorId = currentUser.id;
      }
      
      const allVisits = [...visits];
      const idx = allVisits.findIndex(v => v.id === visit.id);
      if (idx >= 0) {
        allVisits[idx] = visit;
        localStorage.setItem("clinic_visits", JSON.stringify(allVisits));
      }
    }

    const pat = patients.find((p) => p.id === visit.patientId) || null;
    setActiveExamVisit(visit);
    setSelectedPatient(pat);
    setShowPrescriptionModal(true);
  };

  return (
    <div className="space-y-6" id="patients-visits-module">
      
      {/* Tab Selector Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide">
            Phòng Khám Lâm Sàng
          </h2>
          <p className="text-[11px] text-slate-405 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Quản lý tiếp nhận hồ sơ & hàng chờ khám lâm sàng
          </p>
        </div>

        {/* Premium Pill Tabs Swticher */}
        <div className="flex bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/60 shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab("reception")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSubTab === "reception"
                ? "bg-white dark:bg-[#1e293b] text-indigo-650 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Bàn Tiếp Đón Bệnh Nhân
          </button>
          <button
            onClick={() => setActiveSubTab("queue")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              activeSubTab === "queue"
                ? "bg-white dark:bg-[#1e293b] text-indigo-650 dark:text-indigo-400 shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Activity className="w-4 h-4" />
            Hàng Chờ Lâm Sàng
          </button>
        </div>
      </div>

      {/* Content Panels */}
      <div className="w-full">
        {activeSubTab === "reception" ? (
          <div className="animate-fade-in">
            <PatientRegistry
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
              onAddPatientClick={handleOpenAddPatient}
              onCheckInClick={handleOpenCheckIn}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Info bar */}
            <div className="bg-gradient-to-r from-indigo-50/20 via-sky-50/10 to-teal-50/10 dark:from-[#0f172a]/20 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)] bento-card">
              <div className="p-3 bg-indigo-650 rounded-2xl text-white shadow-md shadow-indigo-150 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm uppercase tracking-tight">Quy trình Hàng Chờ Khám Lâm Sàng</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                  Danh sách hiển thị các bệnh nhân đang đợi hoặc đang được chuẩn bệnh. 
                  Nhấp vào nút <strong>&quot;Khám & Kê đơn&quot;</strong> để mở không gian làm việc lâm sàng chuyên dụng cho bác sĩ.
                </p>
              </div>
            </div>

            <ActiveQueue onExamClick={handleOpenPrescription} />
          </div>
        )}
      </div>

      {/* ======================================================= MODALS ======================================================= */}

      {/* MODAL 1: ADD PATIENT */}
      <Modal isOpen={showAddPatientModal} onClose={() => setShowAddPatientModal(false)} title="Đăng ký hồ sơ bệnh nhân">
        <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Họ và tên bệnh nhân *</label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="09xx xxx xxx"
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Giới tính</label>
              <select
                value={newPatientGender}
                onChange={(e) => setNewPatientGender(e.target.value as any)}
                className="w-full bg-slate-50 px-3 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition font-bold"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Ngày sinh *</label>
              <input
                type="date"
                required
                value={newPatientDOB}
                onChange={(e) => setNewPatientDOB(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Địa chỉ thường trú</label>
            <input
              type="text"
              placeholder="Số nhà, tên đường, phường xã, TP..."
              value={newPatientAddress}
              onChange={(e) => setNewPatientAddress(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Tiền sử bệnh lý (nếu có)</label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Đau dạ dày, cao huyết áp sử dụng thuốc thường xuyên..."
              value={newPatientHistory}
              onChange={(e) => setNewPatientHistory(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none custom-scrollbar"
            />
          </div>

          <div>
            <label className="block text-rose-500 mb-1 uppercase tracking-wide text-[10px]">Dị ứng thuốc * (để hệ thống FEFO kiểm tra chéo)</label>
            <input
              type="text"
              placeholder="Ví dụ: Aspirin, Penicillin. Ghi 'Không' nếu không dị ứng."
              value={newPatientAllergies}
              onChange={(e) => setNewPatientAllergies(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-rose-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-rose-700 font-bold transition"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddPatientModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
            >
              Lưu bệnh nhân
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CHECK IN VISIT */}
      <Modal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} title="Tiếp nhận ca bệnh mới">
        {selectedPatient && (
          <form onSubmit={handleCheckInSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-700">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Người bệnh đăng ký</div>
              <div className="text-sm font-extrabold text-slate-800 mt-1">{selectedPatient.fullName}</div>
              <div className="text-xs text-slate-500 mt-1">
                Giới tính: {selectedPatient.gender} • Dị ứng: <span className="text-rose-600 font-bold">{selectedPatient.drugAllergies}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Chỉ định bác sĩ phụ trách *</label>
              <select
                value={checkInDoctorId}
                onChange={(e) => setCheckInDoctorId(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition font-bold"
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 uppercase tracking-wide text-[10px]">Triệu chứng lâm sàng ban đầu *</label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Sốt 38 độ kèm ho khan kéo dài, đau rát họng..."
                value={checkInSymptoms}
                onChange={(e) => setCheckInSymptoms(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none custom-scrollbar"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
              >
                Xếp Số Chờ Khám
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: PRESCRIPTION WORKSPACE FOR DOCTORS */}
      <PrescriptionWorkspace
        isOpen={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false);
          setActiveExamVisit(null);
        }}
        visit={activeExamVisit}
        patient={selectedPatient}
      />

    </div>
  );
}
