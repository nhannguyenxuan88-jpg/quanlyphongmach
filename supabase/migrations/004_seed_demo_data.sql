-- ============================================================================
-- Clinic Cloud SaaS - Demo Seed Data
-- Insert demo data for testing and demonstration purposes
-- NOTE: Run this AFTER creating auth users via Supabase Dashboard or Admin API
-- ============================================================================

-- ============================================================================
-- IMPORTANT: Before running this script, you must:
-- 1. Create auth users in Supabase Dashboard > Authentication > Users
-- 2. Replace the UUID placeholders below with actual auth.users IDs
-- ============================================================================

-- Step 1: Create demo clinic
INSERT INTO clinics (id, name, logo, address, phone, email, print_size, enable_stt, reminder_time, enable_zalo_reminder)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Phòng Khám Đa Khoa CLINIC CLOUD',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=128&auto=format&fit=crop&q=60',
  '456 Đường Nguyễn Chí Thanh, Phường 5, Quận 10, TP. Hồ Chí Minh',
  '1900 6060 - 028 3835 1234',
  'contact@cliniccloud.vn',
  'A5', true, 120, true
);

-- Step 2: Create users (replace UUIDs with actual Supabase Auth user IDs)
-- You must create these users in Supabase Auth Dashboard first, then use their IDs here.
-- Example accounts to create:
--   hoa@cliniccloud.vn   (password: Demo@2026) -> receptionist
--   an@cliniccloud.vn    (password: Demo@2026) -> doctor
--   binh@cliniccloud.vn  (password: Demo@2026) -> doctor
--   hai@cliniccloud.vn   (password: Demo@2026) -> pharmacist
--   linh@cliniccloud.vn  (password: Demo@2026) -> manager

-- UNCOMMENT and replace UUIDs after creating auth users:
/*
INSERT INTO users (id, clinic_id, full_name, role, username, status) VALUES
  ('REPLACE-WITH-AUTH-UUID-1', '00000000-0000-0000-0000-000000000001', 'Trần Thị Hoa', 'receptionist', 'hoa_receptionist', 'active'),
  ('REPLACE-WITH-AUTH-UUID-2', '00000000-0000-0000-0000-000000000001', 'BS. Nguyễn Văn An', 'doctor', 'an_doctor', 'active'),
  ('REPLACE-WITH-AUTH-UUID-3', '00000000-0000-0000-0000-000000000001', 'BS. Lê Thị Bình', 'doctor', 'binh_doctor', 'active'),
  ('REPLACE-WITH-AUTH-UUID-4', '00000000-0000-0000-0000-000000000001', 'Phạm Minh Hải', 'pharmacist', 'hai_pharmacist', 'active'),
  ('REPLACE-WITH-AUTH-UUID-5', '00000000-0000-0000-0000-000000000001', 'Lê Hoàng Linh (Admin)', 'manager', 'linh_manager', 'active');
*/

-- Step 3: Patients
INSERT INTO patients (id, clinic_id, full_name, phone, gender, dob, address, medical_history, drug_allergies) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Nguyễn Văn Khang', '0901234567', 'Nam', '1985-05-12', '123 Đường Lê Lợi, Quận 1, TP. HCM', 'Cao huyết áp (vấn đề tim mạch nhẹ)', 'Aspirin, Ibuprofen'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Trần Thị Mai', '0918765432', 'Nữ', '1992-09-24', '45/8 Điện Biên Phủ, Bình Thạnh, TP. HCM', 'Đau dạ dày cấp', 'Không có dị ứng thuốc'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Lê Phước Hải', '0987654321', 'Nam', '1970-11-03', '789 Cách Mạng Tháng 8, Tân Bình, TP. HCM', 'Tiểu đường type 2, mỡ máu cao', 'Penicillin'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Phạm Thúy Nga', '0933445566', 'Nữ', '1998-02-15', '12 Chùa Bộc, Đống Đa, Hà Nội', 'Hay mệt mỏi, thiếu máu nhẹ', 'Không có dị ứng thuốc'),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Hoàng Văn Đức', '0955667788', 'Nam', '1965-07-30', '246 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'Hen suyễn mãn tính', 'Sulfonamide');

-- Step 4: Medicines
INSERT INTO medicines (id, clinic_id, name, active_ingredient, unit, "group", manufacturer, min_stock) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Amoxicillin 500mg', 'Amoxicillin', 'Vỉ', 'Kháng sinh', 'Dược Hậu Giang (DHG)', 50),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Paracetamol 500mg (Hapacol)', 'Paracetamol', 'Viên', 'Giảm đau, hạ sốt', 'Dược Hậu Giang (DHG)', 200),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Ibuprofen 400mg', 'Ibuprofen', 'Viên', 'Giảm đau, kháng viêm', 'Domesco', 80),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Cetirizine 10mg', 'Cetirizine dihydrochloride', 'Viên', 'Kháng Histamin - Trị dị ứng', 'Traphaco', 100),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'Metformin 850mg (Glucophage)', 'Metformin HCl', 'Viên', 'Trị tiểu đường', 'Merck S.A.', 150),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Salbutamol 2mg', 'Salbutamol sulfate', 'Viên', 'Giãn phế quản - Trị hen suyễn', 'OPV', 60);

-- Step 5: Medicine Batches
INSERT INTO medicine_batches (id, clinic_id, medicine_id, batch_number, expiry_date, original_qty, current_qty, import_price, retail_price, import_date) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'AMX2601', '2026-07-15', 100, 42, 8000, 12000, '2026-01-10'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'AMX2602', '2027-03-20', 500, 500, 8000, 12000, '2026-04-15'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'PAR2601', '2026-06-25', 300, 25, 400, 1000, '2026-01-20'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'PAR2602', '2027-09-30', 2000, 1850, 400, 1000, '2026-05-10'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'IBU2512', '2026-08-01', 150, 12, 1200, 2000, '2025-12-15'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'IBU2604', '2027-11-15', 1000, 1000, 1100, 2000, '2026-04-20'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 'CET2602', '2026-06-10', 100, 15, 600, 1500, '2026-02-12'),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 'CET2605', '2027-06-30', 1000, 950, 600, 1500, '2026-05-02'),
  ('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000205', 'MET2601', '2027-01-15', 500, 320, 1500, 2500, '2026-01-22'),
  ('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000206', 'SAL2603', '2026-09-01', 120, 55, 1000, 1800, '2026-03-05');

-- Step 6: Medical Services
INSERT INTO medical_services (id, clinic_id, name, price) VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'Khám bệnh lâm sàng (Bác sĩ chuyên khoa)', 100000),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', 'Nội soi tai mũi họng nâng cao', 250000),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', 'Siêu âm ổ bụng tổng quát', 200000),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001', 'Đo điện tâm đồ (ECG)', 120000),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000001', 'Xét nghiệm công thức máu toàn bộ (CBC)', 150000);

-- Step 7: Suppliers
INSERT INTO suppliers (id, clinic_id, name, phone, email, address, notes) VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Dược Phẩm Hậu Giang (DHG)', '18001099', 'dhgpharma@dhgpharma.com.vn', '288 Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ', 'Nhà cung cấp chính các loại kháng sinh và giảm đau hạ sốt.'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'Công ty Cổ phần Traphaco', '18006612', 'info@traphaco.com.vn', '75 Yên Ninh, Quận Ba Đình, Hà Nội', 'Chuyên cung cấp thuốc đông dược và các thuốc kháng histamin.'),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', 'Dược Phẩm Domesco', '02773859370', 'domesco@domesco.com', '352 Nguyễn Huệ, Mỹ Phú, TP. Cao Lãnh, Đồng Tháp', 'Cung cấp Ibuprofen và các dòng thuốc kháng viêm.');

-- Step 8: Appointments
INSERT INTO appointments (id, clinic_id, patient_id, patient_name, phone, appointment_date, appointment_time, symptoms, status) VALUES
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'Lê Phước Hải', '0987654321', '2026-06-17', '08:00', 'Tái khám tiểu đường định kỳ và xét nghiệm máu', 'đã khám'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Nguyễn Văn Khang', '0901234567', '2026-06-17', '10:30', 'Đau đầu dữ dội kèm sốt nhẹ', 'chưa khám'),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'Trần Thị Mai', '0918765432', '2026-06-17', '14:00', 'Kiểm tra dạ dày định kỳ', 'chưa khám'),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000001', NULL, 'Phạm Quốc Bảo', '0909998877', '2026-06-16', '15:30', 'Đau rát họng, ho khan kéo dài 3 ngày', 'quá hẹn'),
  ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000001', NULL, 'Vũ Hoàng My', '0977665544', '2026-06-18', '09:00', 'Tư vấn dinh dưỡng và xét nghiệm máu tổng quát', 'chưa khám');

-- Step 9: Purchase Invoices
INSERT INTO purchase_invoices (id, clinic_id, supplier_id, import_date, notes, total_amount) VALUES
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', '2026-04-15', 'Nhập đợt thuốc Amoxicillin 500mg và Paracetamol dự phòng đợt hè.', 4800000),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000503', '2026-04-20', 'Nhập thuốc Ibuprofen 400mg bổ sung kho bán lẻ.', 1100000);

INSERT INTO purchase_invoice_items (purchase_invoice_id, medicine_id, quantity, import_price, total_price) VALUES
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000201', 500, 8000, 4000000),
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000202', 2000, 400, 800000),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000203', 1000, 1100, 1100000);

-- NOTE: Visits, invoices, payments, stock_logs require user IDs (doctor_id, cashier_id)
-- These will be inserted after auth users are created.
-- Use the Supabase Dashboard or the app's seed script to complete this data.
