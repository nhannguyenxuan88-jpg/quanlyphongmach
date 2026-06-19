/**
 * LoginPage - Premium authentication screen for Clinic Cloud SaaS
 * Supports both system login and self-service 30-day trial registration.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Loader2, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const { signIn, isAuthLoading } = useAuth();
  
  // Toggle registration state
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Shared Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Specific Form State
  const [clinicName, setClinicName] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      // Validation for registration
      if (!clinicName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
        setError('Vui lòng nhập đầy đủ thông tin đăng ký.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu đăng ký phải có ít nhất 6 ký tự.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { registerNewClinic } = await import('../../lib/supabaseDb');
        const res = await registerNewClinic(
          clinicName.trim(), 
          email.trim(), 
          password, 
          fullName.trim()
        );

        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        
        // Auto sign-in on success
        const signInResult = await signIn(email.trim(), password);
        if (signInResult.error) {
          setError('Đăng ký thành công nhưng đăng nhập tự động thất bại: ' + signInResult.error);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Đã xảy ra lỗi trong quá trình đăng ký dùng thử.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Validation for login
      if (!email.trim() || !password.trim()) {
        setError('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }

      setIsSubmitting(true);
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
      }
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          <p className="text-blue-300 text-sm font-medium animate-pulse">Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-500/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 my-8">
        {/* Logo & branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-4 animate-bounce duration-1000">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Clinic Cloud
          </h1>
          <p className="text-blue-300/80 text-xs mt-1 font-medium uppercase tracking-wider">
            Hệ thống quản lý phòng khám SaaS
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 text-left">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              {isRegistering ? "Đăng ký dùng thử 30 ngày" : "Đăng nhập hệ thống"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isRegistering && (
              <>
                {/* Clinic Name */}
                <div>
                  <label className="block text-xs font-semibold text-blue-200/80 mb-2 uppercase tracking-wider">
                    Tên phòng khám *
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ví dụ: Phòng Khám Đa Khoa An Bình"
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Manager Name */}
                <div>
                  <label className="block text-xs font-semibold text-blue-200/80 mb-2 uppercase tracking-wider">
                    Họ & tên Quản lý (Chủ phòng khám) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: BS. Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-bold"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-blue-200/80 mb-2 uppercase tracking-wider">
                Email đăng nhập *
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@phongkham.vn"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-semibold"
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-blue-200/80 mb-2 uppercase tracking-wider">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold px-4 py-3 rounded-xl animate-in fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegistering ? 'Đang kích hoạt...' : 'Đang xác thực...'}
                </>
              ) : (
                isRegistering ? 'Đăng ký & Dùng thử ngay' : 'Đăng nhập hệ thống'
              )}
            </button>
          </form>

          {/* Toggle panel links */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold cursor-pointer"
            >
              {isRegistering ? "Đã có phòng khám? Đăng nhập" : "Chưa có tài khoản? Đăng ký dùng thử miễn phí"}
            </button>

            {!isRegistering && (
              <button
                onClick={async () => {
                  if (!email.trim()) {
                    setError('Vui lòng nhập email trước khi yêu cầu khôi phục mật khẩu.');
                    return;
                  }
                  const { error: resetErr } = await (await import('../../lib/supabase')).supabase.auth.resetPasswordForEmail(email.trim());
                  if (resetErr) {
                    setError('Lỗi gửi email khôi phục: ' + resetErr.message);
                  } else {
                    setError(null);
                    alert('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư.');
                  }
                }}
                className="text-xs text-blue-400/50 hover:text-blue-300/80 transition-colors font-medium cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6 font-medium">
          © 2026 Clinic Cloud SaaS · Phần mềm quản lý phòng khám
        </p>
      </div>
    </div>
  );
}
