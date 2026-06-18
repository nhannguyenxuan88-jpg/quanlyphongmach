-- ============================================================================
-- Clinic Cloud SaaS - Trial License Check Functions
-- Provides RPC functions for checking and managing clinic trial status
-- ============================================================================

-- ============================================================================
-- Function 1: Check clinic trial status
-- Called from frontend to determine if clinic can access the app
-- ============================================================================
CREATE OR REPLACE FUNCTION check_clinic_trial(p_clinic_id UUID)
RETURNS JSONB AS $$
DECLARE
  clinic_record RECORD;
  days_remaining INT;
  hours_remaining INT;
BEGIN
  SELECT * INTO clinic_record FROM clinics WHERE id = p_clinic_id;

  IF clinic_record IS NULL THEN
    RETURN jsonb_build_object(
      'active', false,
      'reason', 'not_found',
      'days_remaining', 0,
      'message', 'Không tìm thấy phòng khám.'
    );
  END IF;

  -- Check if manually suspended or expired
  IF clinic_record.subscription_status = 'suspended' THEN
    RETURN jsonb_build_object(
      'active', false,
      'reason', 'suspended',
      'days_remaining', 0,
      'message', 'Phòng khám đã bị tạm ngừng. Vui lòng liên hệ hỗ trợ.'
    );
  END IF;

  IF clinic_record.subscription_status = 'expired' THEN
    RETURN jsonb_build_object(
      'active', false,
      'reason', 'expired',
      'days_remaining', 0,
      'message', 'Thời gian dùng thử đã hết. Vui lòng liên hệ gia hạn.'
    );
  END IF;

  -- If active subscription (paid), always allow
  IF clinic_record.subscription_status = 'active' THEN
    RETURN jsonb_build_object(
      'active', true,
      'reason', 'active',
      'days_remaining', -1,
      'message', 'Tài khoản đang hoạt động.'
    );
  END IF;

  -- Check trial period
  IF clinic_record.subscription_status = 'trial' THEN
    days_remaining := EXTRACT(DAY FROM (clinic_record.trial_end_date - now()))::INT;
    hours_remaining := EXTRACT(EPOCH FROM (clinic_record.trial_end_date - now()))::INT / 3600;

    IF hours_remaining <= 0 THEN
      -- Trial has expired, update status
      UPDATE clinics
      SET subscription_status = 'expired', is_active = false, updated_at = now()
      WHERE id = p_clinic_id;

      RETURN jsonb_build_object(
        'active', false,
        'reason', 'trial_expired',
        'days_remaining', 0,
        'message', 'Thời gian dùng thử 30 ngày đã hết. Vui lòng liên hệ gia hạn để tiếp tục sử dụng.'
      );
    END IF;

    RETURN jsonb_build_object(
      'active', true,
      'reason', 'trial',
      'days_remaining', GREATEST(days_remaining, 0),
      'trial_end_date', clinic_record.trial_end_date,
      'message', 'Đang trong thời gian dùng thử. Còn ' || GREATEST(days_remaining, 0) || ' ngày.'
    );
  END IF;

  -- Fallback
  RETURN jsonb_build_object(
    'active', false,
    'reason', 'unknown',
    'days_remaining', 0,
    'message', 'Trạng thái không xác định.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function 2: Extend clinic trial or activate subscription
-- Admin-only function to manage licenses
-- ============================================================================
CREATE OR REPLACE FUNCTION extend_clinic_license(
  p_clinic_id UUID,
  p_days INT DEFAULT 30,
  p_status TEXT DEFAULT 'active'
)
RETURNS JSONB AS $$
BEGIN
  UPDATE clinics
  SET
    subscription_status = p_status,
    trial_end_date = CASE
      WHEN p_status = 'trial' THEN now() + (p_days || ' days')::INTERVAL
      ELSE trial_end_date
    END,
    is_active = true,
    updated_at = now()
  WHERE id = p_clinic_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy phòng khám.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Đã gia hạn thành công ' || p_days || ' ngày cho phòng khám.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function 3: Get current user profile with clinic info
-- Called after login to get full user context
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
  clinic_record RECORD;
  trial_status JSONB;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = auth.uid();

  IF user_record IS NULL THEN
    RETURN jsonb_build_object('found', false, 'message', 'User profile not found.');
  END IF;

  SELECT * INTO clinic_record FROM clinics WHERE id = user_record.clinic_id;

  trial_status := check_clinic_trial(user_record.clinic_id);

  RETURN jsonb_build_object(
    'found', true,
    'user', jsonb_build_object(
      'id', user_record.id,
      'clinic_id', user_record.clinic_id,
      'full_name', user_record.full_name,
      'role', user_record.role,
      'username', user_record.username,
      'avatar', user_record.avatar,
      'status', user_record.status
    ),
    'clinic', jsonb_build_object(
      'id', clinic_record.id,
      'name', clinic_record.name,
      'logo', clinic_record.logo,
      'address', clinic_record.address,
      'phone', clinic_record.phone,
      'email', clinic_record.email
    ),
    'trial', trial_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Cron-like function: Auto-expire trials (call via Supabase Edge Function or pg_cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_expire_trials()
RETURNS INT AS $$
DECLARE
  expired_count INT;
BEGIN
  UPDATE clinics
  SET subscription_status = 'expired', is_active = false, updated_at = now()
  WHERE subscription_status = 'trial'
    AND trial_end_date < now()
    AND is_active = true;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
