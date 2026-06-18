/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Stethoscope, CheckCircle, Clock, Activity, FileText, RefreshCw } from "lucide-react";
import { Visit } from "../../types";
import { formatDate } from "../../lib/utils";

interface ActiveQueueProps {
  onExamClick: (visit: Visit) => void;
}

export default function ActiveQueue({ onExamClick }: ActiveQueueProps) {
  const { visits, patients, users, currentUser, refreshData } = useClinic();

  const [doctorFilter, setDoctorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const doctors = users.filter((u) => u.role === "doctor" && u.status === "active");

  const activeVisits = visits.filter((v) => v.status !== "paid");
  const pastVisits = visits.filter((v) => v.status === "paid");

  const filteredActiveVisits = activeVisits.filter((v) => {
    const matchesDoc = doctorFilter === "all" || v.doctorId === doctorFilter;
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesDoc && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-150 flex items-center gap-1 w-fit whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" /> Chờ khám
          </span>
        );
      case "examining":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-150 flex items-center gap-1 w-fit animate-pulse whitespace-nowrap">
            <Activity className="w-3.5 h-3.5" /> Đang khám
          </span>
        );
      case "prescribed":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150 flex items-center gap-1 w-fit whitespace-nowrap">
            <FileText className="w-3.5 h-3.5" /> Chờ quầy thu phí
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* active visits */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 text-left bento-card">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              Danh Sách Chờ & Đang Khám Hôm Nay
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-semibold">
              Tổng cộng {activeVisits.length} ca đang xếp hàng chờ hoặc đang xử lý.
            </p>
          </div>

          <button
            onClick={refreshData}
            className="p-1 px-3 text-[10px] sm:text-xs text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" /> Làm mới
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-[#0f172a]/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-4 font-bold text-xs text-slate-600 dark:text-slate-350">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Bác sĩ khám:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 font-bold"
            >
              <option value="all">Tất cả bác sĩ</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 font-bold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ khám</option>
              <option value="examining">Đang khám</option>
              <option value="prescribed">Chờ quầy thu phí</option>
            </select>
          </div>
        </div>

        {filteredActiveVisits.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-[#0f172a]/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 font-semibold animate-fade-in">
            Không có ca khám nào khớp với bộ lọc tìm kiếm hàng chờ.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full min-w-[700px] text-xs sm:text-sm font-semibold hidden md:table table-fixed">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs text-left">
                  <th className="pb-2 font-bold uppercase tracking-wider text-[10px] w-[24%] pr-4">Bệnh Nhân</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-[10px] w-[30%] pr-4">Triệu chứng ban đầu</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-[10px] w-[20%] pr-4">Bác sĩ phụ trách</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-[10px] w-[14%] pr-2">Trạng thái</th>
                  <th className="pb-2 font-bold uppercase tracking-wider text-[10px] w-[12%] text-right">Lâm sàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActiveVisits.map((v) => {
                  const pat = patients.find((p) => p.id === v.patientId);
                  const docName = doctors.find((d) => d.id === v.doctorId)?.name || "Khoa khám chung";
                  return (
                    <tr key={v.id} className="text-slate-800 hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 pr-4 overflow-hidden">
                        <div className="font-extrabold text-slate-900 truncate" title={pat?.fullName}>{pat?.fullName || "Bệnh nhân ẩn"}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 bg-slate-150/40 w-fit px-1.5 py-0.5 rounded-lg">
                          Mã ca: {v.id}
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 text-xs pr-4 truncate font-medium" title={v.symptoms}>
                        {v.symptoms}
                      </td>
                      <td className="py-3.5 text-xs text-slate-700 font-bold pr-4 truncate" title={docName}>{docName}</td>
                      <td className="py-3.5 pr-2 overflow-hidden">{getStatusBadge(v.status)}</td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {v.status === "prescribed" ? (
                          <span className="text-xs text-indigo-500 italic font-bold">Chờ thanh toán</span>
                        ) : (
                          <button
                            onClick={() => onExamClick(v)}
                            disabled={currentUser.role !== "doctor" && currentUser.role !== "manager"}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border-2 transition ${
                              currentUser.role === "doctor" || currentUser.role === "manager"
                                ? "border-indigo-600 text-indigo-650 hover:bg-indigo-600 hover:text-white cursor-pointer shadow-sm shadow-indigo-100"
                                : "border-slate-200 text-slate-350 bg-slate-50 cursor-not-allowed"
                            }`}
                            title={currentUser.role !== "doctor" ? "Chỉ dành cho bác sĩ khám bệnh" : ""}
                          >
                            Khám & Kê đơn
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-3">
              {filteredActiveVisits.map((v) => {
                const pat = patients.find((p) => p.id === v.patientId);
                const docName = doctors.find((d) => d.id === v.doctorId)?.name || "Khoa khám chung";
                return (
                  <div key={v.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/40 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{pat?.fullName || "Bệnh nhân ẩn"}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-bold">Mã ca: {v.id}</div>
                      </div>
                      {getStatusBadge(v.status)}
                    </div>
                    
                    <div className="text-xs text-slate-600 font-medium">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Triệu chứng</span>
                      {v.symptoms}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-700">
                        <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wide">Bác sĩ</span>
                        <strong>{docName}</strong>
                      </div>
                      
                      {v.status === "prescribed" ? (
                        <span className="text-[10px] text-indigo-500 italic font-bold">Chờ quầy thu phí</span>
                      ) : (
                        <button
                          onClick={() => onExamClick(v)}
                          disabled={currentUser.role !== "doctor" && currentUser.role !== "manager"}
                          className={`text-[10px] font-bold px-3 py-2 rounded-xl border-2 transition ${
                            currentUser.role === "doctor" || currentUser.role === "manager"
                              ? "border-indigo-650 text-indigo-650 bg-white hover:bg-indigo-650 hover:text-white cursor-pointer"
                              : "border-slate-200 text-slate-350 bg-slate-50 cursor-not-allowed"
                          }`}
                        >
                          Khám & Kê đơn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* completed visits today */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 text-left bento-card">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          Ca Lâm Sàng Đã Hoàn Tất Hôm Nay
        </h3>
        
        {pastVisits.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-100 font-semibold">
            Chưa có ca khám nào thanh toán xong hôm nay.
          </div>
        ) : (
          <div className="space-y-3">
            {pastVisits.map((v) => {
              const pat = patients.find((p) => p.id === v.patientId);
              const docName = doctors.find((d) => d.id === v.doctorId)?.name || "Bác sĩ";
              return (
                <div
                  key={v.id}
                  className="p-3 bg-slate-50/50 hover:bg-slate-100/30 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-all font-semibold"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{pat?.fullName ?? "Bệnh nhân"}</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      Chẩn đoán: <strong className="text-indigo-900">{v.diagnosis}</strong> • BS: {docName}
                    </div>
                  </div>
                  <div className="flex justify-between sm:flex-col items-center sm:items-end gap-1">
                    <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 font-bold px-2 py-0.5 rounded-full">
                      ĐÃ XUẤT THUỐC & ĐÓNG PHIẾU
                    </span>
                    <div className="text-[9px] text-slate-400 font-bold">{formatDate(v.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
