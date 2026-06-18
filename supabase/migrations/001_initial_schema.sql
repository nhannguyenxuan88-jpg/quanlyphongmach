-- ============================================================================
-- Clinic Cloud SaaS - Initial Database Schema
-- Multi-tenant PostgreSQL schema for Supabase
-- ============================================================================

-- 1. Bảng phòng khám (Multi-tenant root entity)
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  print_size TEXT DEFAULT 'A5' CHECK (print_size IN ('A4', 'A5')),
  enable_stt BOOLEAN DEFAULT true,
  reminder_time INT DEFAULT 120,
  enable_zalo_reminder BOOLEAN DEFAULT true,
  trial_start_date TIMESTAMPTZ DEFAULT now(),
  trial_end_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng người dùng (liên kết Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('receptionist', 'doctor', 'pharmacist', 'manager')),
  username TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng bệnh nhân
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
  dob DATE,
  address TEXT DEFAULT '',
  medical_history TEXT DEFAULT '',
  drug_allergies TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng thuốc
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active_ingredient TEXT DEFAULT '',
  unit TEXT DEFAULT '',
  "group" TEXT DEFAULT '',
  manufacturer TEXT DEFAULT '',
  min_stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng lô thuốc (FEFO management)
CREATE TABLE IF NOT EXISTS medicine_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  original_qty INT NOT NULL DEFAULT 0,
  current_qty INT NOT NULL DEFAULT 0,
  import_price NUMERIC(12,0) DEFAULT 0,
  retail_price NUMERIC(12,0) DEFAULT 0,
  import_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Bảng dịch vụ y tế
CREATE TABLE IF NOT EXISTS medical_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12,0) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Bảng lượt khám (visits)
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'examining', 'prescribed', 'paid')),
  visit_date TIMESTAMPTZ DEFAULT now(),
  symptoms TEXT DEFAULT '',
  diagnosis TEXT,
  prescription_notes TEXT,
  services UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Bảng chi tiết đơn thuốc (prescription items)
CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  quantity INT NOT NULL DEFAULT 0,
  instruction TEXT DEFAULT '',
  price NUMERIC(12,0) DEFAULT 0
);

-- 9. Bảng hóa đơn
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  consultation_fee NUMERIC(12,0) DEFAULT 100000,
  drug_subtotal NUMERIC(12,0) DEFAULT 0,
  service_subtotal NUMERIC(12,0) DEFAULT 0,
  discount NUMERIC(12,0) DEFAULT 0,
  total_amount NUMERIC(12,0) DEFAULT 0,
  paid_amount NUMERIC(12,0) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
  payment_date TIMESTAMPTZ,
  debt NUMERIC(12,0) DEFAULT 0,
  cashier_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Bảng thanh toán (payment ledger)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,0) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  method TEXT CHECK (method IN ('Tiền mặt', 'Chuyển khoản', 'Thẻ GSK', 'QR VietQR')),
  cashier_id UUID REFERENCES users(id)
);

-- 11. Bảng nhật ký kho (stock logs)
CREATE TABLE IF NOT EXISTS stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  batch_id UUID REFERENCES medicine_batches(id),
  batch_number TEXT,
  type TEXT CHECK (type IN ('import', 'export')),
  quantity INT NOT NULL DEFAULT 0,
  log_date TIMESTAMPTZ DEFAULT now(),
  reason TEXT DEFAULT '',
  user_name TEXT DEFAULT ''
);

-- 12. Bảng nhà cung cấp
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Bảng lịch hẹn
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  symptoms TEXT DEFAULT '',
  status TEXT DEFAULT 'chưa khám'
    CHECK (status IN ('đã khám', 'chưa khám', 'quá hẹn')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Bảng phiếu nhập thuốc (purchase invoices)
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id),
  import_date DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  total_amount NUMERIC(12,0) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Bảng chi tiết phiếu nhập
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  quantity INT NOT NULL DEFAULT 0,
  import_price NUMERIC(12,0) DEFAULT 0,
  total_price NUMERIC(12,0) DEFAULT 0
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_clinic ON users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(clinic_id, full_name);
CREATE INDEX IF NOT EXISTS idx_medicines_clinic ON medicines(clinic_id);
CREATE INDEX IF NOT EXISTS idx_batches_clinic ON medicine_batches(clinic_id);
CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON medicine_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_visits_clinic ON visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(clinic_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_visit ON prescription_items(visit_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(clinic_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_visit ON invoices(visit_id);
CREATE INDEX IF NOT EXISTS idx_payments_clinic ON payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_clinic ON stock_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_medicine ON stock_logs(medicine_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_clinic ON suppliers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_clinic ON purchase_invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_invoice ON purchase_invoice_items(purchase_invoice_id);

-- ============================================================================
-- Auto-update updated_at trigger for clinics
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
