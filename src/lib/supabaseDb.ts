/**
 * Supabase Database Access Layer
 * Replaces the localStorage-based db.ts with real Supabase PostgreSQL queries.
 * All functions are async and include clinic_id scoping for multi-tenant isolation.
 */

import { supabase } from './supabase';
import type {
  User, Patient, Visit, Medicine, MedicineBatch, Invoice, Payment, StockLog,
  Supplier, Appointment, PurchaseInvoice, PurchaseInvoiceItem, ClinicConfig, MedicalService,
  PrescriptionItem
} from '../types';

// ============================================================================
// Helper: Get current date string (YYYY-MM-DD)
// ============================================================================
export function getCurrentDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================================
// USERS
// ============================================================================
export async function getUsers(clinicId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapUserRow);
}

export async function getUserProfile(): Promise<{
  user: User;
  clinic: ClinicConfig & { id: string };
  trial: TrialStatus;
} | null> {
  const { data, error } = await supabase.rpc('get_user_profile');
  if (error || !data?.found) return null;
  return {
    user: {
      id: data.user.id,
      name: data.user.full_name,
      role: data.user.role,
      username: data.user.username || '',
      avatar: data.user.avatar || '',
      status: data.user.status,
    },
    clinic: {
      id: data.clinic.id,
      name: data.clinic.name,
      logo: data.clinic.logo || '',
      address: data.clinic.address || '',
      phone: data.clinic.phone || '',
      email: data.clinic.email || '',
      printSize: 'A5',
      enableSTT: true,
      reminderTime: 120,
      enableZaloReminder: true,
    },
    trial: data.trial as TrialStatus,
  };
}

// ============================================================================
// PATIENTS
// ============================================================================
export async function getPatients(clinicId: string): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPatientRow);
}

export async function savePatient(clinicId: string, patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      full_name: patient.fullName,
      phone: patient.phone,
      gender: patient.gender,
      dob: patient.dob || null,
      address: patient.address,
      medical_history: patient.medicalHistory,
      drug_allergies: patient.drugAllergies,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPatientRow(data);
}

export async function updatePatient(patient: Patient): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .update({
      full_name: patient.fullName,
      phone: patient.phone,
      gender: patient.gender,
      dob: patient.dob || null,
      address: patient.address,
      medical_history: patient.medicalHistory,
      drug_allergies: patient.drugAllergies,
    })
    .eq('id', patient.id)
    .select()
    .single();
  if (error) throw error;
  return mapPatientRow(data);
}

export async function deletePatient(id: string): Promise<void> {
  // Nullify patient reference in appointments to avoid foreign key reference errors
  const { error: apptError } = await supabase
    .from('appointments')
    .update({ patient_id: null })
    .eq('patient_id', id);
  
  if (apptError) {
    console.error("Lỗi khi gỡ liên kết lịch hẹn của bệnh nhân:", apptError);
    throw apptError;
  }
  
  // Delete the patient record
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    console.error("Lỗi khi xóa bệnh nhân trong database:", error);
    throw error;
  }
}

// ============================================================================
// MEDICINES
// ============================================================================
export async function getMedicines(clinicId: string): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMedicineRow);
}

export async function saveMedicine(clinicId: string, medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
  const { data, error } = await supabase
    .from('medicines')
    .insert({
      clinic_id: clinicId,
      name: medicine.name,
      active_ingredient: medicine.activeIngredient,
      unit: medicine.unit,
      "group": medicine.group,
      manufacturer: medicine.manufacturer,
      min_stock: medicine.minStock,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMedicineRow(data);
}

// ============================================================================
// MEDICINE BATCHES
// ============================================================================
export async function getBatches(clinicId: string): Promise<MedicineBatch[]> {
  const { data, error } = await supabase
    .from('medicine_batches')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('expiry_date', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapBatchRow);
}

export async function addInventoryStock(
  clinicId: string,
  medicineId: string,
  batchNumber: string,
  expiryDate: string,
  quantity: number,
  importPrice: number,
  retailPrice: number,
  userName: string
): Promise<MedicineBatch> {
  // Insert batch
  const { data: batchData, error: batchError } = await supabase
    .from('medicine_batches')
    .insert({
      clinic_id: clinicId,
      medicine_id: medicineId,
      batch_number: batchNumber.toUpperCase().trim(),
      expiry_date: expiryDate,
      original_qty: quantity,
      current_qty: quantity,
      import_price: importPrice,
      retail_price: retailPrice,
      import_date: getCurrentDateStr(),
    })
    .select()
    .single();
  if (batchError) throw batchError;

  // Insert stock log
  await supabase.from('stock_logs').insert({
    clinic_id: clinicId,
    medicine_id: medicineId,
    batch_id: batchData.id,
    batch_number: batchData.batch_number,
    type: 'import',
    quantity,
    reason: 'Nhập kho dược phẩm mới',
    user_name: userName,
  });

  return mapBatchRow(batchData);
}

// ============================================================================
// FEFO PROJECTION
// ============================================================================
export async function projectFEFOAllocation(
  clinicId: string,
  medicineId: string,
  requestedQty: number
): Promise<{
  allocated: { batchId: string; batchNumber: string; expiryDate: string; qty: number; retailPrice: number; importPrice: number }[];
  satisfied: boolean;
  unmetQty: number;
}> {
  const today = getCurrentDateStr();

  const { data: candidateBatches, error } = await supabase
    .from('medicine_batches')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('medicine_id', medicineId)
    .gt('current_qty', 0)
    .order('expiry_date', { ascending: true });

  if (error) throw error;

  // Prioritize non-expired batches
  const sorted = (candidateBatches || []).sort((a: any, b: any) => {
    const aExpired = a.expiry_date < today;
    const bExpired = b.expiry_date < today;
    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;
    return a.expiry_date.localeCompare(b.expiry_date);
  });

  let remaining = requestedQty;
  const allocated: { batchId: string; batchNumber: string; expiryDate: string; qty: number; retailPrice: number; importPrice: number }[] = [];

  for (const batch of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(batch.current_qty, remaining);
    allocated.push({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      expiryDate: batch.expiry_date,
      qty: take,
      retailPrice: Number(batch.retail_price),
      importPrice: Number(batch.import_price),
    });
    remaining -= take;
  }

  return { allocated, satisfied: remaining === 0, unmetQty: remaining };
}

// ============================================================================
// VISITS
// ============================================================================
export async function getVisits(clinicId: string): Promise<Visit[]> {
  const { data: visitsData, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('visit_date', { ascending: false });
  if (visitsError) throw visitsError;

  // Fetch prescription items for all visits
  const visitIds = (visitsData || []).map((v: any) => v.id);
  let prescriptionMap: Record<string, PrescriptionItem[]> = {};

  if (visitIds.length > 0) {
    const { data: prescData } = await supabase
      .from('prescription_items')
      .select('*')
      .in('visit_id', visitIds);

    if (prescData) {
      prescData.forEach((item: any) => {
        if (!prescriptionMap[item.visit_id]) prescriptionMap[item.visit_id] = [];
        prescriptionMap[item.visit_id].push({
          medicineId: item.medicine_id,
          batchId: item.batch_id || '',
          quantity: item.quantity,
          instruction: item.instruction || '',
          price: Number(item.price),
        });
      });
    }
  }

  return (visitsData || []).map((row: any) => mapVisitRow(row, prescriptionMap[row.id] || []));
}

export async function createVisit(
  clinicId: string,
  patientId: string,
  doctorId: string,
  symptoms: string
): Promise<Visit> {
  // Create visit
  const { data: visitData, error: visitError } = await supabase
    .from('visits')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      doctor_id: doctorId,
      status: 'pending',
      symptoms,
    })
    .select()
    .single();
  if (visitError) throw visitError;

  // Create unpaid invoice
  await supabase.from('invoices').insert({
    clinic_id: clinicId,
    visit_id: visitData.id,
    consultation_fee: 100000,
    drug_subtotal: 0,
    service_subtotal: 0,
    discount: 0,
    total_amount: 100000,
    paid_amount: 0,
    payment_status: 'unpaid',
  });

  return mapVisitRow(visitData, []);
}

export async function submitPrescription(
  clinicId: string,
  visitId: string,
  diagnosis: string,
  notes: string,
  items: { medicineId: string; quantity: number; instruction: string }[],
  services?: string[]
): Promise<{ visit: Visit; warningMsgs: string[] }> {
  const warningMsgs: string[] = [];
  let totalDrugCost = 0;
  const prescriptionItems: PrescriptionItem[] = [];

  // Get patient for allergy check
  const { data: visitRow } = await supabase.from('visits').select('patient_id').eq('id', visitId).single();
  const { data: patientRow } = await supabase.from('patients').select('drug_allergies, full_name').eq('id', visitRow?.patient_id).single();
  const allergies = patientRow?.drug_allergies?.toLowerCase() || '';

  for (const item of items) {
    const { data: medRow } = await supabase.from('medicines').select('*').eq('id', item.medicineId).single();

    if (medRow) {
      // 1. Allergy check
      if (allergies && allergies !== 'không có dị ứng thuốc' && allergies !== 'no') {
        const medNameWord = medRow.name.toLowerCase();
        const activeWord = (medRow.active_ingredient || '').toLowerCase();
        const allergyWords = allergies.split(/[\s,;.-]+/).filter((w: string) => w.length > 2);
        const hasAllergyMatch = allergyWords.some((word: string) => medNameWord.includes(word) || activeWord.includes(word));
        if (hasAllergyMatch) {
          warningMsgs.push(`⚠️ Cảnh báo dị ứng: Bệnh nhân dị ứng với "${patientRow?.drug_allergies}". Thuốc "${medRow.name}" có thể gây tương tác nguy hại!`);
        }
      }

      // 2. FEFO allocation
      const projection = await projectFEFOAllocation(clinicId, item.medicineId, item.quantity);
      if (!projection.satisfied) {
        warningMsgs.push(`⚠️ Cảnh báo tồn kho: Thuốc "${medRow.name}" không đủ số lượng. Còn thiếu ${projection.unmetQty} đơn vị.`);
      }

      if (projection.allocated.length > 0) {
        for (const alloc of projection.allocated) {
          const pi: PrescriptionItem = {
            medicineId: item.medicineId,
            batchId: alloc.batchId,
            quantity: alloc.qty,
            instruction: item.instruction,
            price: alloc.retailPrice,
          };
          prescriptionItems.push(pi);
          totalDrugCost += alloc.retailPrice * alloc.qty;

          // Insert prescription_item row
          await supabase.from('prescription_items').insert({
            visit_id: visitId,
            medicine_id: item.medicineId,
            batch_id: alloc.batchId,
            quantity: alloc.qty,
            instruction: item.instruction,
            price: alloc.retailPrice,
          });
        }
      } else {
        const pi: PrescriptionItem = {
          medicineId: item.medicineId,
          batchId: '',
          quantity: item.quantity,
          instruction: item.instruction,
          price: 0,
        };
        prescriptionItems.push(pi);
        await supabase.from('prescription_items').insert({
          visit_id: visitId,
          medicine_id: item.medicineId,
          batch_id: null,
          quantity: item.quantity,
          instruction: item.instruction,
          price: 0,
        });
      }
    }
  }

  // Calculate services cost
  let serviceCost = 0;
  if (services && services.length > 0) {
    const { data: srvData } = await supabase.from('medical_services').select('*').in('id', services);
    serviceCost = (srvData || []).reduce((sum: number, s: any) => sum + Number(s.price), 0);
  }

  // Update visit
  const { data: updatedVisit, error: visitError } = await supabase
    .from('visits')
    .update({
      diagnosis,
      prescription_notes: notes,
      status: 'prescribed',
      services: services || [],
    })
    .eq('id', visitId)
    .select()
    .single();
  if (visitError) throw visitError;

  // Update invoice
  await supabase
    .from('invoices')
    .update({
      drug_subtotal: totalDrugCost,
      service_subtotal: serviceCost,
      total_amount: 100000 + totalDrugCost + serviceCost,
    })
    .eq('visit_id', visitId);

  return {
    visit: mapVisitRow(updatedVisit, prescriptionItems),
    warningMsgs,
  };
}

// ============================================================================
// INVOICES & PAYMENTS
// ============================================================================
export async function getInvoices(clinicId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapInvoiceRow);
}

export async function getPayments(clinicId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('payment_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPaymentRow);
}

export async function processPayment(
  clinicId: string,
  invoiceId: string,
  amountPaid: number,
  discount: number,
  paymentMethod: string,
  cashierId: string,
  cashierName: string
): Promise<{ invoice: Invoice; success: boolean; errMsg?: string }> {
  // Get invoice
  const { data: invoiceRow, error: invoiceErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  if (invoiceErr || !invoiceRow) return { invoice: {} as Invoice, success: false, errMsg: 'Không tìm thấy hóa đơn.' };

  // Get visit
  const { data: visitRow } = await supabase.from('visits').select('*').eq('id', invoiceRow.visit_id).single();
  if (!visitRow) return { invoice: mapInvoiceRow(invoiceRow), success: false, errMsg: 'Không tìm thấy phiếu khám.' };

  const totalAmount = Number(invoiceRow.consultation_fee) + Number(invoiceRow.drug_subtotal) + Number(invoiceRow.service_subtotal || 0) - discount;
  const debt = totalAmount - amountPaid;

  // Update invoice
  const { data: updatedInv, error: updErr } = await supabase
    .from('invoices')
    .update({
      discount,
      total_amount: totalAmount,
      paid_amount: amountPaid,
      payment_status: debt > 0 ? 'partially_paid' : 'paid',
      debt: Math.max(0, debt),
      payment_date: new Date().toISOString(),
      cashier_id: cashierId,
    })
    .eq('id', invoiceId)
    .select()
    .single();
  if (updErr) throw updErr;

  // Create payment record
  await supabase.from('payments').insert({
    clinic_id: clinicId,
    invoice_id: invoiceId,
    amount: amountPaid,
    method: paymentMethod,
    cashier_id: cashierId,
  });

  // Update visit status to paid
  await supabase.from('visits').update({ status: 'paid' }).eq('id', invoiceRow.visit_id);

  // Deduct inventory from batches
  const { data: prescItems } = await supabase.from('prescription_items').select('*').eq('visit_id', invoiceRow.visit_id);
  if (prescItems) {
    for (const item of prescItems) {
      if (!item.batch_id) continue;
      const { data: batch } = await supabase.from('medicine_batches').select('*').eq('id', item.batch_id).single();
      if (batch) {
        const newQty = Math.max(0, batch.current_qty - item.quantity);
        const actualDeducted = batch.current_qty - newQty;
        await supabase.from('medicine_batches').update({ current_qty: newQty }).eq('id', item.batch_id);

        if (actualDeducted > 0) {
          await supabase.from('stock_logs').insert({
            clinic_id: clinicId,
            medicine_id: item.medicine_id,
            batch_id: item.batch_id,
            batch_number: batch.batch_number,
            type: 'export',
            quantity: actualDeducted,
            reason: `Bác sĩ kê đơn - Phiếu khám ${visitRow.id}`,
            user_name: cashierName,
          });
        }
      }
    }
  }

  return { invoice: mapInvoiceRow(updatedInv), success: true };
}

export async function settlePatientDebt(
  clinicId: string,
  invoiceId: string,
  amount: number,
  cashierId: string
): Promise<void> {
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
  if (!inv) return;

  const newPaid = Number(inv.paid_amount) + amount;
  const newDebt = Math.max(0, (Number(inv.debt) || 0) - amount);

  await supabase.from('invoices').update({
    paid_amount: newPaid,
    debt: newDebt,
    payment_status: newDebt === 0 ? 'paid' : 'partially_paid',
  }).eq('id', invoiceId);

  await supabase.from('payments').insert({
    clinic_id: clinicId,
    invoice_id: invoiceId,
    amount,
    method: 'Tiền mặt',
    cashier_id: cashierId,
  });
}

// ============================================================================
// STOCK LOGS
// ============================================================================
export async function getStockLogs(clinicId: string): Promise<StockLog[]> {
  const { data, error } = await supabase
    .from('stock_logs')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('log_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapStockLogRow);
}

// ============================================================================
// SUPPLIERS
// ============================================================================
export async function getSuppliers(clinicId: string): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapSupplierRow);
}

export async function saveSupplier(clinicId: string, supplier: Supplier): Promise<Supplier> {
  const payload = {
    clinic_id: clinicId,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    notes: supplier.notes,
  };

  if (supplier.id && supplier.id.length > 10) {
    // Update existing
    const { data, error } = await supabase
      .from('suppliers')
      .update(payload)
      .eq('id', supplier.id)
      .select()
      .single();
    if (error) throw error;
    return mapSupplierRow(data);
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapSupplierRow(data);
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  await supabase.from('suppliers').delete().eq('id', id);
}

// ============================================================================
// APPOINTMENTS
// ============================================================================
export async function getAppointments(clinicId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('appointment_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAppointmentRow);
}

export async function saveAppointment(clinicId: string, appointment: Appointment): Promise<Appointment> {
  const payload = {
    clinic_id: clinicId,
    patient_id: appointment.patientId || null,
    patient_name: appointment.patientName,
    phone: appointment.phone,
    appointment_date: appointment.appointmentDate,
    appointment_time: appointment.appointmentTime,
    symptoms: appointment.symptoms,
    status: appointment.status,
  };

  if (appointment.id && appointment.id.length > 10) {
    const { data, error } = await supabase.from('appointments').update(payload).eq('id', appointment.id).select().single();
    if (error) throw error;
    return mapAppointmentRow(data);
  } else {
    const { data, error } = await supabase.from('appointments').insert(payload).select().single();
    if (error) throw error;
    return mapAppointmentRow(data);
  }
}

// ============================================================================
// PURCHASE INVOICES
// ============================================================================
export async function getPurchaseInvoices(clinicId: string): Promise<PurchaseInvoice[]> {
  const { data, error } = await supabase
    .from('purchase_invoices')
    .select('*, purchase_invoice_items(*)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPurchaseInvoiceRow);
}

export async function savePurchaseInvoice(
  clinicId: string,
  invoice: PurchaseInvoice,
  userName: string
): Promise<PurchaseInvoice> {
  // Insert purchase invoice
  const { data: piData, error: piError } = await supabase
    .from('purchase_invoices')
    .insert({
      clinic_id: clinicId,
      supplier_id: invoice.supplierId || null,
      import_date: invoice.importDate,
      notes: invoice.notes,
      total_amount: invoice.totalAmount,
    })
    .select()
    .single();
  if (piError) throw piError;

  // Insert items
  if (invoice.items && invoice.items.length > 0) {
    const itemPayloads = invoice.items.map(item => ({
      purchase_invoice_id: piData.id,
      medicine_id: item.medicineId,
      quantity: item.quantity,
      import_price: item.importPrice,
      total_price: item.totalPrice,
    }));
    await supabase.from('purchase_invoice_items').insert(itemPayloads);

    // Auto-create batches for each item
    for (const item of invoice.items) {
      const { data: medRow } = await supabase.from('medicines').select('*').eq('id', item.medicineId).single();
      if (medRow) {
        // Find previous batch for retail price reference
        const { data: prevBatches } = await supabase
          .from('medicine_batches')
          .select('retail_price')
          .eq('medicine_id', item.medicineId)
          .limit(1);
        const retailPrice = prevBatches && prevBatches.length > 0
          ? Number(prevBatches[0].retail_price)
          : Math.round(item.importPrice * 1.4);

        const batchNum = 'PI-' + piData.id.substring(0, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);

        await addInventoryStock(
          clinicId,
          item.medicineId,
          batchNum,
          expiryDate.toISOString().split('T')[0],
          item.quantity,
          item.importPrice,
          retailPrice,
          userName
        );
      }
    }
  }

  return {
    id: piData.id,
    supplierId: piData.supplier_id || '',
    importDate: piData.import_date,
    notes: piData.notes || '',
    items: invoice.items,
    totalAmount: Number(piData.total_amount),
  };
}

// ============================================================================
// SERVICES
// ============================================================================
export async function getServices(clinicId: string): Promise<MedicalService[]> {
  const { data, error } = await supabase
    .from('medical_services')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
  }));
}

export async function saveService(clinicId: string, service: MedicalService): Promise<MedicalService> {
  const payload = {
    clinic_id: clinicId,
    name: service.name,
    price: service.price,
  };

  if (service.id && service.id.length > 10) {
    const { data, error } = await supabase.from('medical_services').update(payload).eq('id', service.id).select().single();
    if (error) throw error;
    return { id: data.id, name: data.name, price: Number(data.price) };
  } else {
    const { data, error } = await supabase.from('medical_services').insert(payload).select().single();
    if (error) throw error;
    return { id: data.id, name: data.name, price: Number(data.price) };
  }
}

// ============================================================================
// CLINIC CONFIG
// ============================================================================
export async function getClinicConfig(clinicId: string): Promise<ClinicConfig> {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();
  if (error) throw error;
  return {
    name: data.name || '',
    logo: data.logo || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    printSize: (data.print_size as 'A4' | 'A5') || 'A5',
    enableSTT: data.enable_stt ?? true,
    reminderTime: data.reminder_time || 120,
    enableZaloReminder: data.enable_zalo_reminder ?? true,
  };
}

export async function saveClinicConfig(clinicId: string, config: ClinicConfig): Promise<ClinicConfig> {
  const { error } = await supabase
    .from('clinics')
    .update({
      name: config.name,
      logo: config.logo,
      address: config.address,
      phone: config.phone,
      email: config.email,
      print_size: config.printSize,
      enable_stt: config.enableSTT,
      reminder_time: config.reminderTime,
      enable_zalo_reminder: config.enableZaloReminder,
    })
    .eq('id', clinicId);
  if (error) throw error;
  return config;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================
export interface DashboardStats {
  totalPatients: number;
  visitsToday: number;
  pendingVisits: number;
  revenueThisMonth: number;
  totalRevenue: number;
  totalProfit: number;
  lowStockItemsCount: number;
  nearExpiryItemsCount: number;
}

export async function getDashboardStats(clinicId: string): Promise<DashboardStats> {
  const today = getCurrentDateStr();
  const startOfToday = `${today}T00:00:00`;
  const endOfToday = `${today}T23:59:59`;
  const currentMonth = today.substring(0, 7); // YYYY-MM

  // Count patients
  const { count: patientCount } = await supabase
    .from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId);

  // Visits today
  const { count: visitsTodayCount } = await supabase
    .from('visits').select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('visit_date', startOfToday)
    .lte('visit_date', endOfToday);

  // Pending visits
  const { count: pendingCount } = await supabase
    .from('visits').select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId).eq('status', 'pending');

  // Revenue
  const { data: paidInvoices } = await supabase
    .from('invoices').select('total_amount, consultation_fee, service_subtotal, payment_date, visit_id')
    .eq('clinic_id', clinicId).eq('payment_status', 'paid');

  const totalRevenue = (paidInvoices || []).reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0);
  const revenueThisMonth = (paidInvoices || [])
    .filter((inv: any) => inv.payment_date && inv.payment_date.startsWith(currentMonth))
    .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0);

  // Profit calculation (simplified)
  let totalProfit = (paidInvoices || []).reduce((sum: number, inv: any) => {
    return sum + Number(inv.consultation_fee) + Number(inv.service_subtotal || 0);
  }, 0);

  // Add drug margins from prescription items
  if (paidInvoices && paidInvoices.length > 0) {
    const visitIds = paidInvoices.map((inv: any) => inv.visit_id);
    const { data: prescItems } = await supabase
      .from('prescription_items').select('*, medicine_batches(import_price)')
      .in('visit_id', visitIds);
    if (prescItems) {
      totalProfit += prescItems.reduce((sum: number, item: any) => {
        const importPrice = item.medicine_batches?.import_price || item.price * 0.6;
        return sum + (Number(item.price) - Number(importPrice)) * item.quantity;
      }, 0);
    }
  }

  // Inventory warnings
  const { data: medicines } = await supabase.from('medicines').select('id, min_stock').eq('clinic_id', clinicId);
  const { data: batches } = await supabase.from('medicine_batches').select('medicine_id, current_qty, expiry_date').eq('clinic_id', clinicId);

  let lowStockItemsCount = 0;
  let nearExpiryItemsCount = 0;

  if (medicines && batches) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    medicines.forEach((med: any) => {
      const totalQty = batches
        .filter((b: any) => b.medicine_id === med.id)
        .reduce((sum: number, b: any) => sum + b.current_qty, 0);
      if (totalQty < med.min_stock) lowStockItemsCount++;
    });

    batches.forEach((b: any) => {
      if (b.current_qty > 0 && (b.expiry_date < today || (b.expiry_date >= today && b.expiry_date <= nextMonthStr))) {
        nearExpiryItemsCount++;
      }
    });
  }

  return {
    totalPatients: patientCount || 0,
    visitsToday: visitsTodayCount || 0,
    pendingVisits: pendingCount || 0,
    revenueThisMonth,
    totalRevenue,
    totalProfit,
    lowStockItemsCount,
    nearExpiryItemsCount,
  };
}

// ============================================================================
// TRIAL STATUS CHECK
// ============================================================================
export interface TrialStatus {
  active: boolean;
  reason: string;
  days_remaining: number;
  message: string;
  trial_end_date?: string;
}

export async function checkTrialStatus(clinicId: string): Promise<TrialStatus> {
  const { data, error } = await supabase.rpc('check_clinic_trial', { p_clinic_id: clinicId });
  if (error) {
    return { active: false, reason: 'error', days_remaining: 0, message: 'Lỗi kiểm tra trạng thái.' };
  }
  return data as TrialStatus;
}

export async function registerNewClinic(
  clinicName: string,
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; message: string; clinic_id?: string; user_id?: string }> {
  const { data, error } = await supabase.rpc('admin_register_new_clinic', {
    p_clinic_name: clinicName,
    p_email: email,
    p_password: password,
    p_full_name: fullName,
  });
  if (error) throw error;
  return data as { success: boolean; message: string; clinic_id?: string; user_id?: string };
}

// ============================================================================
// STAFF MANAGEMENT (RPC WRAPPERS)
// ============================================================================
export async function createStaffMember(
  clinicId: string,
  email: string,
  password: string,
  fullName: string,
  role: string
): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_staff_member', {
    p_email: email,
    p_password: password,
    p_full_name: fullName,
    p_role: role,
    p_clinic_id: clinicId,
  });
  if (error) throw error;
  return data as string;
}

export async function resetStaffPassword(userId: string, newPassword: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('admin_reset_staff_password', {
    p_user_id: userId,
    p_new_password: newPassword,
  });
  if (error) throw error;
  return data as boolean;
}

export async function updateStaffMember(
  userId: string,
  payload: { name?: string; role?: string; status?: 'active' | 'inactive' }
): Promise<void> {
  const updateData: any = {};
  if (payload.name !== undefined) updateData.full_name = payload.name;
  if (payload.role !== undefined) updateData.role = payload.role;
  if (payload.status !== undefined) updateData.status = payload.status;

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);
  if (error) throw error;
}

// ============================================================================
// ROW MAPPERS: Convert Supabase snake_case rows to camelCase TypeScript types
// ============================================================================
function mapUserRow(row: any): User {
  return {
    id: row.id,
    name: row.full_name,
    role: row.role,
    username: row.username || '',
    avatar: row.avatar || '',
    status: row.status || 'active',
  };
}

function mapPatientRow(row: any): Patient {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone || '',
    gender: row.gender || 'Nam',
    dob: row.dob || '',
    address: row.address || '',
    medicalHistory: row.medical_history || '',
    drugAllergies: row.drug_allergies || '',
    createdAt: row.created_at || '',
  };
}

function mapMedicineRow(row: any): Medicine {
  return {
    id: row.id,
    name: row.name,
    activeIngredient: row.active_ingredient || '',
    unit: row.unit || '',
    group: row.group || '',
    manufacturer: row.manufacturer || '',
    minStock: row.min_stock || 0,
  };
}

function mapBatchRow(row: any): MedicineBatch {
  return {
    id: row.id,
    medicineId: row.medicine_id,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date,
    originalQty: row.original_qty,
    currentQty: row.current_qty,
    importPrice: Number(row.import_price),
    retailPrice: Number(row.retail_price),
    importDate: row.import_date,
  };
}

function mapVisitRow(row: any, prescriptionItems: PrescriptionItem[]): Visit {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    status: row.status,
    date: row.visit_date || '',
    symptoms: row.symptoms || '',
    diagnosis: row.diagnosis || '',
    prescriptionNotes: row.prescription_notes || '',
    prescriptionItems,
    services: row.services || [],
  };
}

function mapInvoiceRow(row: any): Invoice {
  return {
    id: row.id,
    visitId: row.visit_id,
    consultationFee: Number(row.consultation_fee),
    drugSubtotal: Number(row.drug_subtotal),
    serviceSubtotal: Number(row.service_subtotal || 0),
    discount: Number(row.discount),
    totalAmount: Number(row.total_amount),
    paidAmount: Number(row.paid_amount),
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date || undefined,
    debt: Number(row.debt || 0),
    cashierId: row.cashier_id || undefined,
  };
}

function mapPaymentRow(row: any): Payment {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: Number(row.amount),
    date: row.payment_date || '',
    method: row.method,
    cashierId: row.cashier_id || '',
  };
}

function mapStockLogRow(row: any): StockLog {
  return {
    id: row.id,
    medicineId: row.medicine_id,
    batchId: row.batch_id || '',
    batchNumber: row.batch_number || '',
    type: row.type,
    quantity: row.quantity,
    date: row.log_date || '',
    reason: row.reason || '',
    user: row.user_name || '',
  };
}

function mapSupplierRow(row: any): Supplier {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    notes: row.notes || '',
  };
}

function mapAppointmentRow(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id || undefined,
    patientName: row.patient_name,
    phone: row.phone || '',
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    symptoms: row.symptoms || '',
    status: row.status || 'chưa khám',
  };
}

function mapPurchaseInvoiceRow(row: any): PurchaseInvoice {
  const items: PurchaseInvoiceItem[] = (row.purchase_invoice_items || []).map((item: any) => ({
    medicineId: item.medicine_id,
    quantity: item.quantity,
    importPrice: Number(item.import_price),
    totalPrice: Number(item.total_price),
  }));

  return {
    id: row.id,
    supplierId: row.supplier_id || '',
    importDate: row.import_date,
    notes: row.notes || '',
    items,
    totalAmount: Number(row.total_amount),
  };
}
