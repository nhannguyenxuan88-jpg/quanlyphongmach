-- ============================================================================
-- Clinic Cloud SaaS - Row Level Security Policies
-- Ensures each clinic can only access its own data (multi-tenant isolation)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper function: Get current user's clinic_id
-- ============================================================================
CREATE OR REPLACE FUNCTION get_my_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- CLINICS: Users can only see their own clinic
-- ============================================================================
CREATE POLICY "Users can view their own clinic"
  ON clinics FOR SELECT
  USING (id = get_my_clinic_id());

CREATE POLICY "Managers can update their own clinic"
  ON clinics FOR UPDATE
  USING (id = get_my_clinic_id())
  WITH CHECK (id = get_my_clinic_id());

-- ============================================================================
-- USERS: Users can see colleagues in the same clinic
-- ============================================================================
CREATE POLICY "Users can view same clinic users"
  ON users FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- PATIENTS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view patients"
  ON patients FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert patients"
  ON patients FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update patients"
  ON patients FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete patients"
  ON patients FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- MEDICINES: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view medicines"
  ON medicines FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert medicines"
  ON medicines FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update medicines"
  ON medicines FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete medicines"
  ON medicines FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- MEDICINE_BATCHES: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view batches"
  ON medicine_batches FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert batches"
  ON medicine_batches FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update batches"
  ON medicine_batches FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete batches"
  ON medicine_batches FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- MEDICAL_SERVICES: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view services"
  ON medical_services FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert services"
  ON medical_services FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update services"
  ON medical_services FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete services"
  ON medical_services FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- VISITS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view visits"
  ON visits FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert visits"
  ON visits FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update visits"
  ON visits FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

-- ============================================================================
-- PRESCRIPTION_ITEMS: Access via visit's clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view prescription items"
  ON prescription_items FOR SELECT
  USING (
    visit_id IN (SELECT id FROM visits WHERE clinic_id = get_my_clinic_id())
  );

CREATE POLICY "Clinic staff can insert prescription items"
  ON prescription_items FOR INSERT
  WITH CHECK (
    visit_id IN (SELECT id FROM visits WHERE clinic_id = get_my_clinic_id())
  );

CREATE POLICY "Clinic staff can update prescription items"
  ON prescription_items FOR UPDATE
  USING (
    visit_id IN (SELECT id FROM visits WHERE clinic_id = get_my_clinic_id())
  );

CREATE POLICY "Clinic staff can delete prescription items"
  ON prescription_items FOR DELETE
  USING (
    visit_id IN (SELECT id FROM visits WHERE clinic_id = get_my_clinic_id())
  );

-- ============================================================================
-- INVOICES: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view invoices"
  ON invoices FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update invoices"
  ON invoices FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

-- ============================================================================
-- PAYMENTS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view payments"
  ON payments FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert payments"
  ON payments FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

-- ============================================================================
-- STOCK_LOGS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view stock logs"
  ON stock_logs FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert stock logs"
  ON stock_logs FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

-- ============================================================================
-- SUPPLIERS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view suppliers"
  ON suppliers FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update suppliers"
  ON suppliers FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete suppliers"
  ON suppliers FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- APPOINTMENTS: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view appointments"
  ON appointments FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update appointments"
  ON appointments FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can delete appointments"
  ON appointments FOR DELETE
  USING (clinic_id = get_my_clinic_id());

-- ============================================================================
-- PURCHASE_INVOICES: Full CRUD for same clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view purchase invoices"
  ON purchase_invoices FOR SELECT
  USING (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can insert purchase invoices"
  ON purchase_invoices FOR INSERT
  WITH CHECK (clinic_id = get_my_clinic_id());

CREATE POLICY "Clinic staff can update purchase invoices"
  ON purchase_invoices FOR UPDATE
  USING (clinic_id = get_my_clinic_id())
  WITH CHECK (clinic_id = get_my_clinic_id());

-- ============================================================================
-- PURCHASE_INVOICE_ITEMS: Access via purchase_invoice's clinic
-- ============================================================================
CREATE POLICY "Clinic staff can view purchase items"
  ON purchase_invoice_items FOR SELECT
  USING (
    purchase_invoice_id IN (SELECT id FROM purchase_invoices WHERE clinic_id = get_my_clinic_id())
  );

CREATE POLICY "Clinic staff can insert purchase items"
  ON purchase_invoice_items FOR INSERT
  WITH CHECK (
    purchase_invoice_id IN (SELECT id FROM purchase_invoices WHERE clinic_id = get_my_clinic_id())
  );

CREATE POLICY "Clinic staff can update purchase items"
  ON purchase_invoice_items FOR UPDATE
  USING (
    purchase_invoice_id IN (SELECT id FROM purchase_invoices WHERE clinic_id = get_my_clinic_id())
  );
