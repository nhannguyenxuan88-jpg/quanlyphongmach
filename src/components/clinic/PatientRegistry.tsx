/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Search, UserPlus, FolderHeart, AlertTriangle, ChevronRight, Users, Stethoscope } from "lucide-react";
import { Patient } from "../../types";
import { calculateAge, formatDate } from "../../lib/utils";

interface PatientRegistryProps {
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient | null) => void;
  onAddPatientClick: () => void;
  onCheckInClick: () => void;
}

export default function PatientRegistry({
  selectedPatient,
  setSelectedPatient,
  onAddPatientClick,
  onCheckInClick
}: PatientRegistryProps) {
  const { patients, visits, medicines, currentUser } = useClinic();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [historyQuery, setHistoryQuery] = useState("");

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesGender = genderFilter === "all" || p.gender === genderFilter;

    // Age filtering logic
    const age = calculateAge(p.dob);
    let matchesAge = true;
    if (ageFilter === "child") {
      matchesAge = age < 15;
    } else if (ageFilter === "adult") {
      matchesAge = age >= 15 && age <= 60;
    } else if (ageFilter === "senior") {
      matchesAge = age > 60;
    }

    const matchesHistory =
      !historyQuery.trim() ||
      p.medicalHistory.toLowerCase().includes(historyQuery.toLowerCase()) ||
      p.drugAllergies.toLowerCase().includes(historyQuery.toLowerCase());

    return matchesSearch && matchesGender && matchesAge && matchesHistory;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "examining":
        return "bg-amber-100 text-amber-800";
      case "prescribed":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-emerald-100 text-emerald-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ khám";
      case "examining":
        return "Đang khám";
      case "prescribed":
        return "Chờ thanh toán";
      default:
        return "Đã xong";
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col h-fit bento-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md sm:text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
          Hồ Sơ Khách Hàng
        </h2>
        {(currentUser.role === "receptionist" || currentUser.role === "manager") && (
          <button
            onClick={onAddPatientClick}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition duration-200 shadow-sm shadow-indigo-150 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Thêm Bệnh Nhân
          </button>
        )}
      </div>

      {/* Search box & Advanced Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0f172a]/40 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-[#0f172a]/60 dark:text-slate-200 transition font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-600 dark:text-slate-350">
          {/* Gender filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0f172a]/20 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide shrink-0">Giới tính:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-250 w-full outline-none text-[11px] font-bold"
            >
              <option value="all">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Age group filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0f172a]/20 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide shrink-0">Độ tuổi:</span>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-250 w-full outline-none text-[11px] font-bold"
            >
              <option value="all">Tất cả</option>
              <option value="child">Trẻ em (&lt;15)</option>
              <option value="adult">Người lớn (15-60)</option>
              <option value="senior">Người cao tuổi (&gt;60)</option>
            </select>
          </div>

          {/* Medical history search */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0f172a]/20 px-2 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Tiền sử bệnh, dị ứng..."
              value={historyQuery}
              onChange={(e) => setHistoryQuery(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 w-full outline-none text-[11px] font-bold pl-1"
            />
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="overflow-y-auto max-h-60 border border-slate-100 rounded-xl divide-y divide-slate-100 mb-4 bg-slate-50">
        {filteredPatients.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic">Không tìm thấy bệnh nhân nào.</div>
        ) : (
          filteredPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={`p-3 text-left hover:bg-white cursor-pointer transition flex items-center justify-between border-l-4 ${
                selectedPatient?.id === p.id ? "border-l-indigo-600 bg-indigo-50/45" : "border-l-transparent"
              }`}
            >
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">{p.fullName}</h4>
                <div className="flex gap-2 text-[10px] sm:text-xs text-slate-400 mt-1 font-semibold">
                  <span>SĐT: {p.phone}</span>
                  <span>•</span>
                  <span>Tuổi: {calculateAge(p.dob)} ({p.gender})</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ))
        )}
      </div>

      {/* Selected Patient Details Card */}
      {selectedPatient ? (
        <div className="mt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-150/80 text-left">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 border-b border-slate-200/80 pb-2 flex justify-between items-center">
            Chi tiết: {selectedPatient.fullName}
            <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-lg font-mono">
              ID: {selectedPatient.id}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 mt-3 font-semibold">
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Điện thoại</span>
              <span className="text-slate-800">{selectedPatient.phone}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Ngày sinh</span>
              <span className="text-slate-800">{formatDate(selectedPatient.dob)}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Địa chỉ thường trú</span>
              <span className="text-slate-700 font-medium">{selectedPatient.address}</span>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200/60 pt-3">
            <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider">Tiền sử bệnh lý</span>
            <p className="text-xs text-slate-800 mt-1 bg-white p-2.5 rounded-xl border border-slate-100 shadow-inner italic font-medium">
              {selectedPatient.medicalHistory}
            </p>
          </div>

          <div className="mt-3">
            <span className="font-bold block text-rose-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Dị ứng thuốc
            </span>
            <p
              className={`text-xs mt-1 p-2.5 rounded-xl border font-bold ${
                selectedPatient.drugAllergies.toLowerCase().includes("không") ||
                selectedPatient.drugAllergies.toLowerCase().includes("no")
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-rose-50 border-rose-100 text-rose-700"
              }`}
            >
              {selectedPatient.drugAllergies}
            </p>
          </div>

          {/* Visit History of this patient */}
          <div className="mt-4">
            <span className="font-bold text-slate-400 text-[10px] block uppercase tracking-wider mb-2">
              Lịch sử điều trị
            </span>
            {visits.filter((v) => v.patientId === selectedPatient.id).length === 0 ? (
              <div className="text-[11px] text-slate-400 italic p-3 bg-white rounded-xl border border-slate-100 text-center font-medium">
                Chưa có lịch sử khám bệnh
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                {visits
                  .filter((v) => v.patientId === selectedPatient.id)
                  .map((v) => (
                    <div key={v.id} className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Ngày {formatDate(v.date.split(" ")[0])}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(v.status)}`}>
                          {getStatusLabel(v.status)}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-500 font-medium">
                        <strong className="text-slate-700">Chẩn đoán:</strong> {v.diagnosis || "(Chưa có)"}
                      </div>
                      {v.prescriptionItems.length > 0 && (
                        <div className="mt-1 text-slate-400 text-[10px] leading-relaxed">
                          <strong>Thuốc kê:</strong>{" "}
                          {v.prescriptionItems
                            .map((item) => medicines.find((m) => m.id === item.medicineId)?.name || "")
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Check-in visit button */}
          {(currentUser.role === "receptionist" || currentUser.role === "manager") && (
            <button
              onClick={onCheckInClick}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 text-xs shadow-md shadow-indigo-150 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" /> Tiếp Nhận Khám Bệnh
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
          <FolderHeart className="w-10 h-10 text-slate-350" />
          <span>Vui lòng chọn một bệnh nhân từ danh sách hoặc bấm &quot;Thêm Bệnh Nhân&quot;.</span>
        </div>
      )}
    </div>
  );
}
