/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Appointment } from "../../types";
import { useToast } from "../common/Toast";
import Modal from "../common/Modal";
import {
  Calendar as CalendarIcon,
  Phone,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  User
} from "lucide-react";
import { SYSTEM_DATE } from "../../lib/utils";

export default function Appointments() {
  const {
    appointments,
    patients,
    users,
    saveAppointment,
    checkInVisit,
    registerPatient,
    refreshData
  } = useClinic();
  
  const { toast } = useToast();
  
  // Date context for calendar view (June 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 = June
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-06-17");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state for new appointment
  const [newPatientName, setNewPatientName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState("2026-06-17");
  const [newTime, setNewTime] = useState("09:00");
  const [newSymptoms, setNewSymptoms] = useState("");

  const doctorsList = useMemo(() => users.filter(u => u.role === "doctor" && u.status === "active"), [users]);

  // Monthly calendar calculation helpers
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayIndex = useMemo(() => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so 0 = Monday
    const day = new Date(currentYear, currentMonth, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentYear, currentMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    // Prev month days padding
    const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = prevMonthDaysCount - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        day: prevDate,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(prevDate).padStart(2, "0")}`
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      });
    }

    // Next month days padding to make it grid of 42
    const totalSlots = 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        day: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateStr: `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      });
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex]);

  // Group appointments by dateStr
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(ap => {
      const date = ap.appointmentDate;
      if (!map[date]) map[date] = [];
      map[date].push(ap);
    });
    return map;
  }, [appointments]);

  // Appointments on the selected date
  const selectedDateAppointments = useMemo(() => {
    const list = appointmentsByDate[selectedDateStr] || [];
    if (searchQuery.trim() === "") return list;
    return list.filter(
      ap =>
        ap.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ap.phone.includes(searchQuery)
    );
  }, [appointmentsByDate, selectedDateStr, searchQuery]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const openDetails = (ap: Appointment) => {
    setSelectedAppointment(ap);
    setDetailModalOpen(true);
  };

  // ACTIONS FOR APPOINTMENT
  const handleMarkCompleted = (ap: Appointment) => {
    const updated: Appointment = { ...ap, status: "đã khám" };
    saveAppointment(updated);
    setSelectedAppointment(updated);
    toast("Đã đánh dấu hoàn thành cuộc hẹn!", "success");
  };

  const handleCheckInVisit = async (ap: Appointment) => {
    // 1. Verify if patient exists
    let existingPatient = patients.find(p => p.phone.trim() === ap.phone.trim());
    
    if (!existingPatient) {
      try {
        // Register them
        existingPatient = await registerPatient({
          fullName: ap.patientName,
          phone: ap.phone,
          gender: "Khác",
          dob: "1990-01-01",
          address: "Đăng ký từ lịch hẹn",
          medicalHistory: "Chưa có",
          drugAllergies: "Không có dị ứng thuốc"
        });
        toast(`Tự động đăng ký bệnh nhân mới: ${ap.patientName}`, "info");
      } catch (error) {
        console.error(error);
        toast("Tự động đăng ký bệnh nhân thất bại!", "error");
        return;
      }
    }

    // 2. Select first doctor as default or receptionist configures
    const defaultDoctorId = doctorsList[0]?.id || "u-doctor-1";

    try {
      // 3. Create visit
      const visit = await checkInVisit(existingPatient.id, defaultDoctorId, ap.symptoms || "Khám bệnh theo lịch hẹn");
      
      // 4. Mark appointment as completed
      await saveAppointment({ ...ap, status: "đã khám" });
      
      setDetailModalOpen(false);
      toast(`Đã tiếp đón bệnh nhân "${ap.patientName}" vào hàng chờ lâm sàng!`, "success");
    } catch (error) {
      console.error(error);
      toast("Tiếp đón bệnh nhân thất bại!", "error");
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPhone.trim()) {
      toast("Vui lòng điền đầy đủ tên và số điện thoại", "error");
      return;
    }

    const newAp: Appointment = {
      id: "ap-" + Math.random().toString(36).substring(2, 9),
      patientName: newPatientName.trim(),
      phone: newPhone.trim(),
      appointmentDate: newDate,
      appointmentTime: newTime,
      symptoms: newSymptoms.trim() || "Khám tổng quát",
      status: "chưa khám"
    };

    saveAppointment(newAp);
    setCreateModalOpen(false);
    
    // Clear inputs
    setNewPatientName("");
    setNewPhone("");
    setNewSymptoms("");
    
    toast("Đã hẹn lịch thành công!", "success");
  };

  // Get status class for background colors
  const getStatusColorClass = (status: Appointment["status"]) => {
    if (status === "đã khám") return "bg-emerald-500 text-white";
    if (status === "chưa khám") return "bg-amber-400 text-slate-900";
    return "bg-rose-500 text-white"; // quá hẹn
  };

  const getStatusLabel = (status: Appointment["status"]) => {
    if (status === "đã khám") return "Đã khám";
    if (status === "chưa khám") return "Chưa khám";
    return "Quá hẹn";
  };

  return (
    <div className="space-y-6" id="appointments-module">
      
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#0EA5E9]" />
            Lịch Hẹn Phòng Khám
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Quản lý và sắp xếp giờ tiếp đón bệnh nhân
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#0EA5E9] hover:bg-sky-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-100 dark:shadow-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Lịch Hẹn
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FULL SCREEN MONTH CALENDAR */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col">
          {/* Calendar Controller */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black text-slate-800 dark:text-slate-205 uppercase tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div>T7</div>
            <div>CN</div>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[350px]">
            {calendarDays.map((dayObj, index) => {
              const dayApps = appointmentsByDate[dayObj.dateStr] || [];
              const isSelected = selectedDateStr === dayObj.dateStr;
              const isToday = dayObj.dateStr === "2026-06-17"; // Demo standard system date

              // Count statuses for this day
              const countPending = dayApps.filter(a => a.status === "chưa khám").length;
              const countDone = dayApps.filter(a => a.status === "đã khám").length;
              const countOverdue = dayApps.filter(a => a.status === "quá hẹn").length;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDateStr(dayObj.dateStr)}
                  className={`min-h-[60px] rounded-xl border p-1 text-left flex flex-col justify-between transition-all cursor-pointer ${
                    dayObj.isCurrentMonth
                      ? "bg-white dark:bg-[#1e293b] text-slate-850 dark:text-slate-200"
                      : "bg-slate-50/50 dark:bg-[#0f172a]/20 text-slate-350 dark:text-slate-600"
                  } ${
                    isSelected
                      ? "border-[#0EA5E9] dark:border-[#0EA5E9] ring-1 ring-[#0EA5E9] scale-[1.02]"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-205 dark:hover:border-slate-700"
                  } ${isToday ? "bg-sky-50/20 dark:bg-sky-950/10" : ""}`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold p-1 rounded-md ${isToday ? "bg-sky-100 dark:bg-sky-900/60 text-[#0EA5E9] dark:text-[#38bdf8]" : ""}`}>
                      {dayObj.day}
                    </span>
                    {dayApps.length > 0 && (
                      <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold px-1 rounded">
                        {dayApps.length}
                      </span>
                    )}
                  </div>

                  {/* Micro color indicators */}
                  <div className="flex flex-wrap gap-1 mt-1 justify-start">
                    {countPending > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${countPending} Chưa khám`} />
                    )}
                    {countDone > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`${countDone} Đã khám`} />
                    )}
                    {countOverdue > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title={`${countOverdue} Quá hẹn`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: APPOINTMENTS OF SELECTED DATE */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Danh sách: {selectedDateStr === "2026-06-17" ? "Hôm nay (17/06)" : selectedDateStr}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              {selectedDateAppointments.length} cuộc hẹn đăng ký
            </p>
          </div>

          {/* Search box within date list */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </span>
            <input
              type="text"
              className="w-full pl-8 pr-4 py-1.5 border border-slate-200 dark:border-slate-805 bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold focus:outline-none focus:border-[#0EA5E9]"
              placeholder="Lọc tên / SĐT..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List items */}
          <div className="space-y-3 overflow-y-auto max-h-[360px] scrollbar-none flex-1">
            {selectedDateAppointments.length > 0 ? (
              selectedDateAppointments.map(ap => (
                <div
                  key={ap.id}
                  onClick={() => openDetails(ap)}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-[#F8FAFC]/50 dark:bg-[#0f172a]/30 hover:bg-slate-50 dark:hover:bg-[#0f172a]/65 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                      {ap.patientName}
                    </span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${getStatusColorClass(ap.status)}`}>
                      {getStatusLabel(ap.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{ap.appointmentTime}</span>
                    <span className="mx-1">•</span>
                    <span>SĐT: {ap.phone}</span>
                  </div>

                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-1 italic font-semibold">
                    Lý do: {ap.symptoms}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 italic text-xs py-8">
                Không có lịch hẹn nào
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: DETAIL APPOINTMENT WITH QUICK ACTIONS */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Thông Tin Lịch Hẹn Chi Tiết"
      >
        {selectedAppointment && (
          <div className="space-y-5 text-left">
            
            {/* Status & Name Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#0f172a]/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {selectedAppointment.patientName}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                  Số điện thoại: {selectedAppointment.phone}
                </p>
              </div>
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStatusColorClass(selectedAppointment.status)}`}>
                {getStatusLabel(selectedAppointment.status)}
              </span>
            </div>

            {/* Time / Symptoms */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">Ngày & Giờ hẹn</span>
                <p className="text-slate-700 dark:text-slate-300 font-extrabold mt-1 font-mono">
                  {selectedAppointment.appointmentDate} - {selectedAppointment.appointmentTime}
                </p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl col-span-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">Trạng thái</span>
                <p className="text-slate-700 dark:text-slate-300 font-extrabold mt-1">
                  {getStatusLabel(selectedAppointment.status)}
                </p>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl col-span-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold">Lý do khám / Triệu chứng</span>
                <p className="text-slate-700 dark:text-slate-300 font-bold mt-1">
                  {selectedAppointment.symptoms}
                </p>
              </div>
            </div>

            {/* Action buttons list */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:flex-wrap items-center gap-2">
              
              {/* Call phone */}
              <a
                href={`tel:${selectedAppointment.phone}`}
                className="w-full sm:w-auto bg-slate-100 dark:bg-[#0f172a]/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-4 h-4 text-sky-505" />
                Gọi điện
              </a>

              {/* Message Zalo */}
              <a
                href={`https://zalo.me/${selectedAppointment.phone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-slate-100 dark:bg-[#0f172a]/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Nhắn Zalo
              </a>

              {/* Check-in / Create Visit */}
              {selectedAppointment.status !== "đã khám" && (
                <button
                  onClick={() => handleCheckInVisit(selectedAppointment)}
                  className="w-full sm:w-auto bg-[#0EA5E9] hover:bg-sky-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Tiếp đón / Phiếu khám
                </button>
              )}

              {/* Mark Completed */}
              {selectedAppointment.status !== "đã khám" && (
                <button
                  onClick={() => handleMarkCompleted(selectedAppointment)}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Đánh dấu hoàn thành
                </button>
              )}

            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: CREATE APPOINTMENT FORM */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Tạo Lịch Hẹn Mới"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-left font-semibold text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên bệnh nhân</label>
              <input
                type="text"
                required
                className="w-full border border-slate-205 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Nhập họ và tên..."
                value={newPatientName}
                onChange={e => setNewPatientName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Số điện thoại</label>
              <input
                type="text"
                required
                className="w-full border border-slate-205 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Ví dụ: 0912345678"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ngày hẹn</label>
              <input
                type="date"
                required
                className="w-full border border-slate-205 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Giờ hẹn</label>
              <input
                type="time"
                required
                className="w-full border border-slate-205 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              />
            </div>

          </div>

          {/* Symptoms */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lý do hẹn / Triệu chứng</label>
            <textarea
              className="w-full border border-slate-205 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-805 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9] h-20"
              placeholder="Ví dụ: Tái khám răng miệng định kỳ..."
              value={newSymptoms}
              onChange={e => setNewSymptoms(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="border border-slate-200 dark:border-slate-750 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-[#0EA5E9] hover:bg-sky-600 text-white px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              Xác nhận hẹn lịch
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
