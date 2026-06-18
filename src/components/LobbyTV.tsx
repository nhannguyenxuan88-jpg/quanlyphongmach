/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useClinic } from "../context/ClinicContext";
import { Volume2, Clock, Monitor, UserCheck, Play } from "lucide-react";

export default function LobbyTV() {
  const { visits, patients, users } = useClinic();
  const [timeString, setTimeString] = useState(new Date().toLocaleTimeString("vi-VN"));

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString("vi-VN"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter clinical visits
  const examiningVisits = visits.filter(v => v.status === "examining");
  const pendingVisits = visits.filter(v => v.status === "pending");

  const getPatientName = (patientId: string) => {
    const p = patients.find(pat => pat.id === patientId);
    return p ? p.fullName : "Bệnh nhân ẩn danh";
  };

  const getDoctorNameAndRoom = (docId: string) => {
    const doc = users.find(u => u.id === docId);
    if (!doc) return { name: "Bác sĩ chuyên khoa", room: "Phòng khám 1" };
    // Simulated rooms
    const rooms: Record<string, string> = {
      "u-1": "Phòng khám số 1 (Chuyên khoa Nội)",
      "u-2": "Phòng khám số 2 (Chuyên khoa Tai Mũi Họng)",
      "u-3": "Phòng khám số 3 (Siêu âm & Cận lâm sàng)"
    };
    return {
      name: doc.name,
      room: rooms[docId] || "Phòng khám lâm sàng"
    };
  };

  // Text-To-Speech function using Web Speech API
  const handleCallPatient = (patientName: string, docId: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any current utterance
      window.speechSynthesis.cancel();
      
      const { name: docName, room } = getDoctorNameAndRoom(docId);
      const text = `Mời bệnh nhân ${patientName}, di chuyển vào ${room} để bác sĩ khám bệnh.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.9; // Slightly slower for clear clinic announcements
      
      // Try to find a Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes("VI") || v.lang.includes("vi"));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ tổng hợp giọng nói!");
    }
  };

  return (
    <div className="bg-[#0b0f19] text-white p-6 rounded-3xl border border-slate-900 shadow-2xl space-y-6 select-none font-sans min-h-[600px] flex flex-col justify-between text-left">
      
      {/* Lobby Header */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl shadow-inner relative flex items-center justify-center animate-pulse">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
              Bảng Gọi Số Khám Tự Động
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">
              Hệ thống hiển thị hàng chờ sảnh đón tiếp • Clinic Cloud TV
            </p>
          </div>
        </div>

        {/* Live Ticking Clock */}
        <div className="bg-[#0f172a] px-5 py-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-cyan-400 font-mono text-base font-black shadow-inner">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{timeString}</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 my-2">
        
        {/* Column 1: Now Serving (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#111827]/40 p-5 rounded-3xl border border-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
              ĐANG ĐƯỢC GỌI VÀO PHÒNG KHÁM (NOW SERVING)
            </span>

            {examiningVisits.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-[#0f172a]/20 border border-slate-900 rounded-2xl italic font-semibold my-4">
                Hiện chưa có bệnh nhân nào đang trong phòng khám.
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {examiningVisits.map((v) => {
                  const patName = getPatientName(v.patientId);
                  const { name: docName, room } = getDoctorNameAndRoom(v.doctorId);
                  return (
                    <div
                      key={v.id}
                      className="p-5 bg-gradient-to-r from-emerald-950/20 to-teal-950/20 hover:from-emerald-950/30 hover:to-teal-950/30 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.02)] group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">
                            Số: {v.id.replace("v-", "")}
                          </span>
                          <strong className="text-base font-black text-white tracking-wide">{patName}</strong>
                        </div>
                        <p className="text-[11px] text-cyan-400 font-extrabold uppercase tracking-wide">{room}</p>
                        <p className="text-[10px] text-slate-400 font-medium font-semibold">Bác sĩ phụ trách: <span className="text-slate-205">{docName}</span></p>
                      </div>

                      {/* Speaker Call button */}
                      <button
                        onClick={() => handleCallPatient(patName, v.doctorId)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer w-full sm:w-auto justify-center select-none"
                        title="Phát loa gọi bệnh nhân này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Loa Gọi</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-500 font-extrabold uppercase mt-4 text-center border-t border-slate-900/60 pt-3">
            Bệnh nhân có số được hiển thị vui lòng di chuyển vào phòng khám tương ứng
          </div>
        </div>

        {/* Column 2: Waiting Queue (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#111827]/40 p-5 rounded-3xl border border-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-450 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 block" />
              BỆNH NHÂN CHỜ LƯỢT TIẾP THEO (WAITING QUEUE)
            </span>

            {pendingVisits.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-[#0f172a]/20 border border-slate-900 rounded-2xl italic font-semibold my-4">
                Không có bệnh nhân chờ khám.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {pendingVisits.map((v) => {
                  const patName = getPatientName(v.patientId);
                  return (
                    <div
                      key={v.id}
                      className="p-3 bg-[#0f172a]/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-lg font-mono">
                          #{v.id.replace("v-", "")}
                        </span>
                        <span className="font-extrabold text-slate-200 truncate">{patName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse">
                          Đợi Khám
                        </span>
                        
                        <button
                          onClick={() => handleCallPatient(patName, v.doctorId)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Thử loa gọi số chờ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-500 font-extrabold uppercase mt-4 text-center border-t border-slate-900/60 pt-3">
            Hàng đợi tự động sắp xếp theo thứ tự số phiếu check-in
          </div>
        </div>

      </div>

      {/* Lobby Footer Banner */}
      <div className="bg-[#0f172a] border border-slate-900/80 p-3 rounded-2xl text-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
        <span>Hệ thống gọi số y khoa tích hợp giọng nói tiếng việt thông minh • Clinic Cloud ERP</span>
      </div>

    </div>
  );
}
