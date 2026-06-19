-- ============================================================================
-- Clinic Cloud SaaS - Staff Management API (RPC)
-- Migration 006: Thêm các hàm RPC hỗ trợ Quản lý (manager) tạo và đặt lại mật khẩu nhân viên
-- ============================================================================

-- 1. Hàm tạo tài khoản nhân viên mới từ giao diện Admin
CREATE OR REPLACE FUNCTION admin_create_staff_member(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_clinic_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- A. Kiểm tra quyền của người gọi: Phải là manager
  IF (SELECT role FROM public.users WHERE id = auth.uid()) IS DISTINCT FROM 'manager' THEN
    RAISE EXCEPTION 'Chỉ quản lý mới được phép tạo tài khoản nhân viên.';
  END IF;

  -- B. Đảm bảo người gọi chỉ tạo tài khoản cho phòng khám của chính họ
  IF (SELECT clinic_id FROM public.users WHERE id = auth.uid()) IS DISTINCT FROM p_clinic_id THEN
    RAISE EXCEPTION 'Bạn không thể tạo tài khoản cho phòng khám khác.';
  END IF;

  -- C. Kiểm tra email đã tồn tại hay chưa
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email này đã được đăng ký trên hệ thống.';
  END IF;

  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(p_password, gen_salt('bf', 10));

  -- D. Thêm vào bảng auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    encrypted_pw,
    now(), -- Xác nhận email tự động
    now(), -- phone_confirmed_at
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', p_role, 'clinic_id', p_clinic_id),
    now(),
    now()
  );

  -- E. Thêm vào bảng auth.identities để đảm bảo GoTrue nhận diện đăng nhập bằng email
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', p_email),
    'email',
    new_user_id,
    now(),
    now(),
    now()
  );

  -- F. Thêm vào bảng public.users
  INSERT INTO public.users (id, clinic_id, full_name, role, username, status)
  VALUES (
    new_user_id,
    p_clinic_id,
    p_full_name,
    p_role,
    split_part(p_email, '@', 1), -- username mặc định là phần trước @
    'active'
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Hàm đặt lại mật khẩu của nhân viên từ giao diện Admin
CREATE OR REPLACE FUNCTION admin_reset_staff_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  -- A. Kiểm tra quyền của người gọi: Phải là manager
  IF (SELECT role FROM public.users WHERE id = auth.uid()) IS DISTINCT FROM 'manager' THEN
    RAISE EXCEPTION 'Chỉ quản lý mới có quyền đặt lại mật khẩu nhân viên.';
  END IF;

  -- B. Xác thực nhân viên cần đổi thuộc cùng phòng khám với manager
  v_clinic_id := (SELECT clinic_id FROM public.users WHERE id = auth.uid());
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id AND clinic_id = v_clinic_id) THEN
    RAISE EXCEPTION 'Nhân viên không tồn tại hoặc không thuộc phòng khám của bạn.';
  END IF;

  -- C. Cập nhật mật khẩu trong auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
    updated_at = now()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cấu hình bảo mật quyền thực thi hàm RPC
REVOKE EXECUTE ON FUNCTION admin_create_staff_member(TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_create_staff_member(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION admin_reset_staff_password(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_reset_staff_password(UUID, TEXT) TO authenticated, service_role;
