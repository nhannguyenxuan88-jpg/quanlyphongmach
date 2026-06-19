-- ============================================================================
-- Clinic Cloud SaaS - Row Level Security & RPC Hardening
-- Migration 005: Thắt chặt bảo mật chính sách RLS và kiểm soát thực thi hàm RPC
-- ============================================================================

-- 1. Hàm helper lấy vai trò (role) của người dùng hiện tại
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Bảo mật bảng CLINICS: Chỉ quản lý (manager) mới được phép cập nhật cấu hình phòng khám
DROP POLICY IF EXISTS "Managers can update their own clinic" ON clinics;
CREATE POLICY "Managers can update their own clinic"
  ON clinics FOR UPDATE
  USING (
    id = get_my_clinic_id()
    AND get_my_role() = 'manager'
  )
  WITH CHECK (
    id = get_my_clinic_id()
    AND get_my_role() = 'manager'
  );

-- 3. Bảo mật bảng USERS: Tạo trigger kiểm soát cập nhật các trường nhạy cảm
CREATE OR REPLACE FUNCTION check_user_update_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  -- Cho phép các vai trò đặc quyền (postgres, service_role, supabase_admin) bỏ qua các bước kiểm tra này
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') 
     OR current_setting('role', true) IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  -- A. clinic_id là bất biến đối với nhân viên phòng khám
  IF NEW.clinic_id IS DISTINCT FROM OLD.clinic_id THEN
    RAISE EXCEPTION 'Không thể thay đổi mã phòng khám (clinic_id) của người dùng.';
  END IF;

  -- B. Chỉ quản lý (manager) mới được thay đổi vai trò (role) của nhân viên
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF get_my_role() IS DISTINCT FROM 'manager' THEN
      RAISE EXCEPTION 'Chỉ quản lý mới có quyền thay đổi vai trò (role) của người dùng.';
    END IF;
  END IF;

  -- C. Chỉ quản lý (manager) mới được thay đổi trạng thái hoạt động (status) của nhân viên
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF get_my_role() IS DISTINCT FROM 'manager' THEN
      RAISE EXCEPTION 'Chỉ quản lý mới có quyền thay đổi trạng thái hoạt động (status) của người dùng.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_user_update_restrictions ON users;
CREATE TRIGGER trg_check_user_update_restrictions
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_update_restrictions();

-- 4. Bổ sung RLS cho bảng USERS: Cho phép manager cập nhật nhân viên khác thuộc phòng khám của mình
DROP POLICY IF EXISTS "Managers can update same clinic users" ON users;
CREATE POLICY "Managers can update same clinic users"
  ON users FOR UPDATE
  USING (
    clinic_id = get_my_clinic_id()
    AND get_my_role() = 'manager'
  )
  WITH CHECK (
    clinic_id = get_my_clinic_id()
  );

-- 5. Bảo mật các hàm RPC: Thu hồi quyền EXECUTE mặc định từ PUBLIC và cấp phát đúng vai trò
-- A. Hàm gia hạn dùng thử (chỉ dùng bởi backend/service_role)
REVOKE EXECUTE ON FUNCTION extend_clinic_license(UUID, INT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION extend_clinic_license(UUID, INT, TEXT) TO service_role;

-- B. Hàm tự động đánh dấu hết hạn dùng thử (chỉ dùng bởi backend/cron/service_role)
REVOKE EXECUTE ON FUNCTION auto_expire_trials() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION auto_expire_trials() TO service_role;

-- C. Hàm kiểm tra thời gian dùng thử (dùng bởi người dùng đã đăng nhập hoặc service_role)
REVOKE EXECUTE ON FUNCTION check_clinic_trial(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_clinic_trial(UUID) TO authenticated, service_role;

-- D. Hàm lấy thông tin hồ sơ người dùng (dùng bởi người dùng đã đăng nhập hoặc service_role)
REVOKE EXECUTE ON FUNCTION get_user_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated, service_role;
