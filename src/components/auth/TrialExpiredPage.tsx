/**
 * TrialExpiredPage - Displayed when clinic trial period has expired
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Phone, Mail, MessageCircle, LogOut, ShieldX } from 'lucide-react';

export default function TrialExpiredPage() {
  const { signOut, clinicName, trialStatus } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Expired icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30 mb-5">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Thời gian dùng thử đã hết
          </h1>
          {clinicName && (
            <p className="text-red-300/60 text-sm mt-2 font-medium">
              Phòng khám: {clinicName}
            </p>
          )}
        </div>

        {/* Main card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Timer info */}
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <Clock className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="text-red-300 text-sm font-bold">
                {trialStatus?.message || 'Giai đoạn dùng thử 30 ngày đã kết thúc.'}
              </p>
              <p className="text-red-400/60 text-xs mt-1">
                Tất cả dữ liệu của bạn vẫn được lưu trữ an toàn và sẽ khôi phục khi gia hạn.
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3 mb-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Liên hệ gia hạn
            </h3>

            <a
              href="tel:19006060"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-blue-300 transition-colors">
                  1900 6060
                </p>
                <p className="text-white/40 text-xs">Hotline hỗ trợ (8h - 22h)</p>
              </div>
            </a>

            <a
              href="mailto:contact@cliniccloud.vn"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-emerald-300 transition-colors">
                  contact@cliniccloud.vn
                </p>
                <p className="text-white/40 text-xs">Email hỗ trợ kỹ thuật</p>
              </div>
            </a>

            <a
              href="https://zalo.me/cliniccloud"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-sky-300 transition-colors">
                  Zalo OA: Clinic Cloud
                </p>
                <p className="text-white/40 text-xs">Chat tư vấn gói gia hạn</p>
              </div>
            </a>
          </div>

          {/* Pricing hint */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <p className="text-amber-200 text-xs font-semibold">
              💡 Gia hạn chỉ từ <span className="text-amber-300 text-sm font-black">500.000 đ/tháng</span> cho gói cơ bản.
              Bao gồm hỗ trợ kỹ thuật 24/7 và cập nhật tính năng miễn phí.
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/70 hover:text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

        <p className="text-center text-white/15 text-xs mt-6 font-medium">
          © 2026 Clinic Cloud SaaS · Dữ liệu được bảo mật tuyệt đối
        </p>
      </div>
    </div>
  );
}
