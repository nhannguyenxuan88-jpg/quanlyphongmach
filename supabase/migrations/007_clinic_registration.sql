-- ============================================================================
-- Clinic Cloud SaaS - Clinic Self-Service Registration (RPC)
-- Migration 007: Hàm RPC hỗ trợ khách hàng đăng ký phòng khám và tài khoản quản lý mới (dùng thử 30 ngày)
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_register_new_clinic(
  p_clinic_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  new_clinic_id UUID;
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- 1. Kiểm tra email đã được đăng ký hay chưa
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email này đã được sử dụng trên hệ thống.');
  END IF;

  new_clinic_id := gen_random_uuid();
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(p_password, gen_salt('bf', 10));

  -- 2. Thêm phòng khám mới (mặc định dùng thử 30 ngày)
  INSERT INTO public.clinics (
    id, name, logo, address, phone, email, 
    print_size, enable_stt, reminder_time, enable_zalo_reminder,
    trial_start_date, trial_end_date, is_active, subscription_status
  )
  VALUES (
    new_clinic_id,
    p_clinic_name,
    '', -- Chưa có logo
    'Chưa cập nhật địa chỉ',
    'Chưa cập nhật SĐT',
    p_email,
    'A5', true, 120, true,
    now(),
    now() + INTERVAL '30 days',
    true,
    'trial'
  );

  -- 3. Thêm tài khoản vào auth.users (xác thực email tự động)
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
    now(),
    now(),
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'role', 'manager', 'clinic_id', new_clinic_id),
    now(),
    now()
  );

  -- 4. Thêm vào bảng auth.identities
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

  -- 5. Thêm profile người dùng vào public.users với vai trò quản lý (manager)
  INSERT INTO public.users (id, clinic_id, full_name, role, username, status)
  VALUES (
    new_user_id,
    new_clinic_id,
    p_full_name,
    'manager',
    split_part(p_email, '@', 1),
    'active'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Đăng ký phòng khám dùng thử thành công!',
    'clinic_id', new_clinic_id,
    'user_id', new_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Cấu hình bảo mật: Cho phép vai trò ẩn danh (chưa đăng nhập) được chạy hàm đăng ký này
REVOKE EXECUTE ON FUNCTION admin_register_new_clinic(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_register_new_clinic(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
