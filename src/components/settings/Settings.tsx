/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { ClinicConfig, UserRole } from "../../types";
import { useToast } from "../common/Toast";
import { 
  Settings as SettingsIcon, 
  Save, 
  Info, 
  Printer, 
  BellRing, 
  Users, 
  UserPlus, 
  Key, 
  Shield, 
  UserCheck, 
  UserX,
  Lock
} from "lucide-react";

export default function Settings() {
  const { 
    config, 
    saveClinicConfig, 
    users, 
    createStaffMember, 
    resetStaffPassword, 
    updateStaffMember,
    currentUser
  } = useClinic();
  const { toast } = useToast();

  // Settings view active tab
  const [activeTab, setActiveTab] = useState<"config" | "staff">("config");

  // --- Clinic Config Form State ---
  const [name, setName] = useState(config.name);
  const [logo, setLogo] = useState(config.logo);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [email, setEmail] = useState(config.email);
  const [printSize, setPrintSize] = useState<"A4" | "A5">(config.printSize);
  const [enableSTT, setEnableSTT] = useState(config.enableSTT);
  const [reminderTime, setReminderTime] = useState(config.reminderTime);
  const [enableZaloReminder, setEnableZaloReminder] = useState(config.enableZaloReminder);

  // --- Staff Form State ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffFullName, setStaffFullName] = useState("");
  const [staffRole, setStaffRole] = useState<UserRole>("receptionist");
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // --- Reset Password State ---
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleConfigSubmit = (e: React.FormEvent) => {
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

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffPassword.trim() || !staffFullName.trim()) {
      toast("Vui lòng nhập đầy đủ thông tin nhân viên mới.", "error");
      return;
    }

    if (staffPassword.trim().length < 6) {
      toast("Mật khẩu phải chứa ít nhất 6 ký tự.", "error");
      return;
    }

    setIsSubmittingStaff(true);
    try {
      await createStaffMember(
        staffEmail.trim(),
        staffPassword.trim(),
        staffFullName.trim(),
        staffRole
      );
      toast("Tạo tài khoản nhân viên mới thành công!", "success");
      // Reset form
      setStaffEmail("");
      setStaffPassword("");
      setStaffFullName("");
      setStaffRole("receptionist");
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Lỗi tạo tài khoản nhân viên.", "error");
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUserId || !newPassword.trim()) {
      toast("Vui lòng nhập mật khẩu mới.", "error");
      return;
    }

    if (newPassword.trim().length < 6) {
      toast("Mật khẩu phải chứa ít nhất 6 ký tự.", "error");
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetStaffPassword(resettingUserId, newPassword.trim());
      toast("Đã đặt lại mật khẩu nhân viên thành công!", "success");
      setNewPassword("");
      setResettingUserId(null);
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Lỗi đặt lại mật khẩu.", "error");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: "active" | "inactive") => {
    if (userId === currentUser.id) {
      toast("Bạn không thể tự khóa tài khoản của chính mình!", "error");
      return;
    }
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateStaffMember(userId, { status: newStatus });
      toast(`Đã ${newStatus === "active" ? "kích hoạt" : "khóa"} tài khoản nhân viên thành công!`, "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Lỗi cập nhật trạng thái nhân viên.", "error");
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateStaffMember(userId, { role: newRole });
      toast("Đã thay đổi vai trò nhân viên thành công!", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Lỗi cập nhật vai trò nhân viên.", "error");
    }
  };

  return (
    <div className="space-y-6" id="settings-module">
      
      {/* HEADER BAR & TAB SWITCHER */}
      <div className="flex flex-col md:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#0EA5E9]" />
            Cấu Hình Hệ Thống & Quản Trị
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Tùy biến thông tin chi nhánh và quản lý danh sách tài khoản nhân sự
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-slate-50 dark:bg-[#0f172a] p-1 rounded-xl border border-slate-150 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 w-fit">
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "config" ? "bg-[#0EA5E9] text-white shadow-sm" : "hover:text-[#0EA5E9]"}`}
          >
            <Info className="w-4 h-4" />
            Cấu hình phòng khám
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "staff" ? "bg-[#0EA5E9] text-white shadow-sm" : "hover:text-[#0EA5E9]"}`}
          >
            <Users className="w-4 h-4" />
            Quản lý nhân viên
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === "config" ? (
        <form onSubmit={handleConfigSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-850 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
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
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
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
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-805 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
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
      ) : (
        // STAFF MANAGEMENT PANEL
        <div className="space-y-6 text-left">
          
          {/* TOP ACTION BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-[#0EA5E9]" />
              Danh sách nhân sự phòng khám ({users.length} người)
            </h3>
            
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setResettingUserId(null);
              }}
              className="bg-[#0EA5E9] hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow shadow-sky-900/10 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm nhân sự mới</span>
            </button>
          </div>

          {/* ADD STAFF INLINE FORM */}
          {showAddForm && (
            <form onSubmit={handleAddStaffSubmit} className="bg-slate-50 dark:bg-[#0f172a]/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Đăng ký tài khoản nhân viên mới
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: BS. Trần Quốc Bảo"
                    value={staffFullName}
                    onChange={e => setStaffFullName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@phongkham.com"
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mật khẩu đặt trước *</label>
                  <input
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Vai trò hệ thống *</label>
                  <select
                    value={staffRole}
                    onChange={e => setStaffRole(e.target.value as UserRole)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="receptionist">Lễ tân (Tiếp đón & Thu phí)</option>
                    <option value="doctor">Bác sĩ (Khám bệnh & Kê toa)</option>
                    <option value="pharmacist">Dược sĩ (Quản lý kho thuốc)</option>
                    <option value="manager">Quản lý (Full quyền cấu hình)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStaff}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingStaff ? "Đang tạo..." : "Lưu nhân viên"}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD INLINE FORM */}
          {resettingUserId && (
            <form onSubmit={handleResetPasswordSubmit} className="bg-slate-50 dark:bg-[#0f172a]/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200 max-w-md">
              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" />
                Đặt lại mật khẩu nhân viên
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Nhân viên: {users.find(u => u.id === resettingUserId)?.name}
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu tối thiểu 6 ký tự..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-805 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setResettingUserId(null);
                    setNewPassword("");
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? "Đang lưu..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          )}

          {/* STAFF DIRECTORY TABLE */}
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-[800px] w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs text-left">
                <thead>
                  <tr className="text-slate-400 bg-slate-50/60 dark:bg-[#0f172a]/30 uppercase font-black tracking-wider text-[9px]">
                    <th className="px-6 py-3.5">Họ và tên</th>
                    <th className="px-6 py-3.5">Tên đăng nhập (Username)</th>
                    <th className="px-6 py-3.5">Vai trò hệ thống</th>
                    <th className="px-6 py-3.5">Trạng thái</th>
                    <th className="px-6 py-3.5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  {users.map((staff) => {
                    const isSelf = staff.id === currentUser.id;
                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/30 dark:hover:bg-[#0f172a]/10">
                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-indigo-600 text-white flex items-center justify-center font-extrabold uppercase shadow-sm">
                              {staff.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-slate-800 dark:text-slate-200 font-extrabold">
                                {staff.name} {isSelf && <span className="text-[9px] bg-sky-50 dark:bg-sky-950/40 text-[#0EA5E9] px-1.5 py-0.5 rounded ml-1 font-extrabold uppercase">Bạn</span>}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">
                          @{staff.username || "chưa_đặt"}
                        </td>

                        {/* Role Selector */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${staff.role === 'manager' ? 'text-amber-500' : staff.role === 'doctor' ? 'text-[#0EA5E9]' : staff.role === 'pharmacist' ? 'text-emerald-500' : 'text-slate-400'}`} />
                            {isSelf ? (
                              <span className="capitalize font-black text-slate-800 dark:text-slate-200">
                                {staff.role === "manager" ? "Quản lý (Admin)" : staff.role === "doctor" ? "Bác sĩ" : staff.role === "pharmacist" ? "Dược sĩ" : "Lễ tân"}
                              </span>
                            ) : (
                              <select
                                value={staff.role}
                                onChange={(e) => handleRoleChange(staff.id, e.target.value as UserRole)}
                                className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:ring-0 focus:outline-none p-0 cursor-pointer font-bold w-32"
                              >
                                <option value="receptionist">Lễ tân</option>
                                <option value="doctor">Bác sĩ</option>
                                <option value="pharmacist">Dược sĩ</option>
                                <option value="manager">Quản lý</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(staff.id, staff.status)}
                            disabled={isSelf}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                              staff.status === "active"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 hover:bg-emerald-100"
                                : "bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border border-red-100/50 hover:bg-red-100"
                            } ${isSelf ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                          >
                            {staff.status === "active" ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Hoạt động</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Đang khóa</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setResettingUserId(staff.id);
                                setShowAddForm(false);
                                setNewPassword("");
                              }}
                              className="p-2 border border-slate-150 dark:border-slate-800 hover:border-amber-400/50 rounded-xl hover:bg-amber-500/10 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Đặt lại mật khẩu"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
