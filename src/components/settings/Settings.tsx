/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { ClinicConfig } from "../../types";
import { useToast } from "../common/Toast";
import { Settings as SettingsIcon, Save, Info, Printer, BellRing } from "lucide-react";

export default function Settings() {
  const { config, saveClinicConfig } = useClinic();
  const { toast } = useToast();

  // Form State initialized from config
  const [name, setName] = useState(config.name);
  const [logo, setLogo] = useState(config.logo);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [email, setEmail] = useState(config.email);
  const [printSize, setPrintSize] = useState<"A4" | "A5">(config.printSize);
  const [enableSTT, setEnableSTT] = useState(config.enableSTT);
  const [reminderTime, setReminderTime] = useState(config.reminderTime);
  const [enableZaloReminder, setEnableZaloReminder] = useState(config.enableZaloReminder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedConfig: ClinicConfig = {
      name: name.trim(),
      logo: logo.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      printSize,
      enableSTT,
      reminderTime: Number(reminderTime),
      enableZaloReminder
    };

    saveClinicConfig(updatedConfig);
    toast("Đã lưu thiết lập cấu hình phòng khám thành công!", "success");
  };

  return (
    <div className="space-y-6" id="settings-module">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#0EA5E9]" />
            Cài Đặt Cấu Hình Hệ Thống
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Tùy biến thông tin phòng khám, khổ in hóa đơn và thông báo nhắc lịch
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT TWO COLUMNS: SYSTEM SETTINGS FORM */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE SECTION */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm space-y-5 text-left">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Info className="w-4 h-4 text-[#0EA5E9]" />
              Hồ sơ phòng khám
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên phòng khám *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="Nhập tên hiển thị trên tiêu đề hóa đơn..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Logo URL */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ảnh Logo (URL)</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="https://images.unsplash.com/..."
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hotline liên hệ *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="Ví dụ: 1900 6060"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email phòng khám</label>
                <input
                  type="email"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-805 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="contact@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Địa chỉ chi nhánh *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="Nhập địa chỉ cụ thể..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* HARDWARE PRINT SIZE & STT */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm space-y-5 text-left">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Printer className="w-4 h-4 text-[#0EA5E9]" />
              In ấn & Số thứ tự (STT)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Print size selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Khổ in hóa đơn mặc định</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="printSize"
                      checked={printSize === "A4"}
                      onChange={() => setPrintSize("A4")}
                      className="text-[#0EA5E9] focus:ring-[#0EA5E9]"
                    />
                    Khổ giấy A4 (Chuẩn báo cáo)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="printSize"
                      checked={printSize === "A5"}
                      onChange={() => setPrintSize("A5")}
                      className="text-[#0EA5E9] focus:ring-[#0EA5E9]"
                    />
                    Khổ giấy A5 (Chuẩn toa thuốc)
                  </label>
                </div>
              </div>

              {/* STT Toggle check */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Xếp hàng tự động STT</label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableSTT}
                    onChange={e => setEnableSTT(e.target.checked)}
                    className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4.5 h-4.5"
                  />
                  Tự động sinh số thứ tự tiếp đón khám
                </label>
              </div>
            </div>
          </div>

          {/* SMS / ZALO NOTIFICATION REMINDERS */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm space-y-5 text-left">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BellRing className="w-4 h-4 text-[#0EA5E9]" />
              Thông báo nhắc lịch hẹn khách hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reminder time */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Gửi nhắc hẹn trước (phút)</label>
                <input
                  type="number"
                  min="5"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  value={reminderTime}
                  onChange={e => setReminderTime(Number(e.target.value))}
                />
              </div>

              {/* Enable Zalo checkbox */}
              <div className="space-y-2 flex items-end pb-2.5">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableZaloReminder}
                    onChange={e => setEnableZaloReminder(e.target.checked)}
                    className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4.5 h-4.5"
                  />
                  Kích hoạt gửi tin nhắn Zalo OA tự động
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW BRAND HEADER */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-fit text-left space-y-6">
          <div>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Xem trước hóa đơn in
            </h3>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-[#F8FAFC]/50 dark:bg-[#0f172a]/20 mt-4 space-y-3 font-sans text-[10px] text-slate-500 dark:text-slate-400">
              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-800 pb-2">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase truncate">{name || "Tên phòng khám"}</h4>
                <p className="mt-1">{address || "Địa chỉ..."}</p>
                <p>SĐT: {phone || "Số điện thoại..."}</p>
              </div>
              <div className="space-y-1">
                <p>Bệnh nhân: Nguyễn Văn A</p>
                <p>Khổ giấy bản in: <span className="font-black text-slate-700 dark:text-slate-200">{printSize}</span></p>
                <p>Mã hóa đơn: INV-XXXXXX</p>
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-2 text-right">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">Tổng thu: 100,000đ</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0EA5E9] hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-100 dark:shadow-none cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Toàn Bộ Cấu Hình
          </button>
        </div>

      </form>

    </div>
  );
}
