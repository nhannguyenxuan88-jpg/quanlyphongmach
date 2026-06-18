/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Patient, Medicine, MedicineBatch, Visit, Invoice, Payment, StockLog, PrescriptionItem, VisitStatus, Supplier, Appointment, PurchaseInvoice, ClinicConfig, MedicalService } from "../types";
export type { User, Patient, Medicine, MedicineBatch, Visit, Invoice, Payment, StockLog, PrescriptionItem, VisitStatus, Supplier, Appointment, PurchaseInvoice, ClinicConfig, MedicalService };
import { SYSTEM_DATE } from "./utils";
import {
  SEED_USERS,
  SEED_PATIENTS,
  SEED_MEDICINES,
  SEED_MEDICINE_BATCHES,
  SEED_VISITS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_STOCK_LOGS,
  SEED_SUPPLIERS,
  SEED_SERVICES,
  SEED_APPOINTMENTS,
  SEED_PURCHASE_INVOICES,
  SEED_CLINIC_CONFIG
} from "../data/seedData";

// LocalStorage Keys
const KEYS = {
  USERS: "clinic_users",
  PATIENTS: "clinic_patients",
  MEDICINES: "clinic_medicines",
  BATCHES: "clinic_batches",
  VISITS: "clinic_visits",
  INVOICES: "clinic_invoices",
  PAYMENTS: "clinic_payments",
  STOCK_LOGS: "clinic_stock_logs",
  CURRENT_USER: "clinic_current_user",
  SUPPLIERS: "clinic_suppliers",
  SERVICES: "clinic_services",
  APPOINTMENTS: "clinic_appointments",
  PURCHASES: "clinic_purchases",
  CONFIG: "clinic_config",
};

// Seed db if not existing
export function initializeDB(forceReset = false) {
  if (forceReset || !localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    localStorage.setItem(KEYS.MEDICINES, JSON.stringify(SEED_MEDICINES));
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(SEED_MEDICINE_BATCHES));
    localStorage.setItem(KEYS.VISITS, JSON.stringify(SEED_VISITS));
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
    localStorage.setItem(KEYS.STOCK_LOGS, JSON.stringify(SEED_STOCK_LOGS));
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(SEED_SUPPLIERS));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    localStorage.setItem(KEYS.PURCHASES, JSON.stringify(SEED_PURCHASE_INVOICES));
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(SEED_CLINIC_CONFIG));
    
    // Default logged in user: Receptionist first
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
  }
}

// Ensure initialized
initializeDB();

// Helper to get raw data
function get<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Helper to set raw data
function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// CURRENT LOGGED IN USER
export function getCurrentUser(): User {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  if (!data) return SEED_USERS[0];
  return JSON.parse(data);
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  // Dispatch a storage event so tabs/state synchronize
  window.dispatchEvent(new Event("storage_user_changed"));
}

// USERS
export function getUsers(): User[] {
  return get<User>(KEYS.USERS);
}

// PATIENTS
export function getPatients(): Patient[] {
  return get<Patient>(KEYS.PATIENTS);
}

export function savePatient(patient: Patient): Patient {
  const patients = getPatients();
  const existingIndex = patients.findIndex(p => p.id === patient.id);
  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
  } else {
    patients.unshift(patient); // new at start
  }
  set(KEYS.PATIENTS, patients);
  return patient;
}

// MEDICINES
export function getMedicines(): Medicine[] {
  return get<Medicine>(KEYS.MEDICINES);
}

export function saveMedicine(medicine: Medicine): Medicine {
  const medicines = getMedicines();
  const existingIndex = medicines.findIndex(m => m.id === medicine.id);
  if (existingIndex >= 0) {
    medicines[existingIndex] = medicine;
  } else {
    medicines.unshift(medicine);
  }
  set(KEYS.MEDICINES, medicines);
  return medicine;
}

// BATCHES
export function getBatches(): MedicineBatch[] {
  return get<MedicineBatch>(KEYS.BATCHES);
}

export function saveBatch(batch: MedicineBatch): MedicineBatch {
  const batches = getBatches();
  const existingIndex = batches.findIndex(b => b.id === batch.id);
  if (existingIndex >= 0) {
    batches[existingIndex] = batch;
  } else {
    batches.unshift(batch);
  }
  set(KEYS.BATCHES, batches);
  return batch;
}

// VISITS
export function getVisits(): Visit[] {
  return get<Visit>(KEYS.VISITS);
}

export function getVisitWithDetails(id: string): Visit | undefined {
  return getVisits().find(v => v.id === id);
}

export function saveVisit(visit: Visit): Visit {
  const visits = getVisits();
  const existingIndex = visits.findIndex(v => v.id === visit.id);
  if (existingIndex >= 0) {
    visits[existingIndex] = visit;
  } else {
    visits.unshift(visit);
  }
  set(KEYS.VISITS, visits);
  return visit;
}

// INVOICES
export function getInvoices(): Invoice[] {
  return get<Invoice>(KEYS.INVOICES);
}

export function saveInvoice(invoice: Invoice): Invoice {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice);
  }
  set(KEYS.INVOICES, invoices);
  return invoice;
}

// PAYMENTS
export function getPayments(): Payment[] {
  return get<Payment>(KEYS.PAYMENTS);
}

export function savePayment(payment: Payment): Payment {
  const payments = getPayments();
  payments.unshift(payment);
  set(KEYS.PAYMENTS, payments);
  return payment;
}

// STOCK LOGS
export function getStockLogs(): StockLog[] {
  return get<StockLog>(KEYS.STOCK_LOGS);
}

export function saveStockLog(log: StockLog): StockLog {
  const logs = getStockLogs();
  logs.unshift(log);
  set(KEYS.STOCK_LOGS, logs);
  return log;
}

// FEFO PROJECTION LOGIC
// Given a medicine ID and requested quantity, identify which batches would be deducted representing FEFO,
// without actually mutating the state database.
// Matches batches that are unexpired (expiryDate >= today) first, sorted by expiryDate ascending.
// If not enough stock of unexpired, can take from other active batches to satisfy or alert.
export function projectFEFOAllocation(
  medicineId: string,
  requestedQty: number,
  currentDateStr = SYSTEM_DATE
): {
  allocated: { batchId: string; batchNumber: string; expiryDate: string; qty: number; retailPrice: number; importPrice: number }[];
  satisfied: boolean;
  unmetQty: number;
} {
  const allBatches = getBatches();
  
  // Filter batches for this medicine that have quantity > 0
  const candidateBatches = allBatches
    .filter(b => b.medicineId === medicineId && b.currentQty > 0)
    // FEFO: Sort by expiry date ascending
    .sort((a, b) => {
      // Prioritize non-expired batches first, but sort both collections by expiration date
      const aExpired = a.expiryDate < currentDateStr;
      const bExpired = b.expiryDate < currentDateStr;
      if (aExpired && !bExpired) return 1; // puts expired to the end
      if (!aExpired && bExpired) return -1;
      return a.expiryDate.localeCompare(b.expiryDate);
    });

  let remaining = requestedQty;
  const allocated: { batchId: string; batchNumber: string; expiryDate: string; qty: number; retailPrice: number; importPrice: number }[] = [];

  for (const batch of candidateBatches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.currentQty, remaining);
    allocated.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      qty: take,
      retailPrice: batch.retailPrice,
      importPrice: batch.importPrice
    });
    remaining -= take;
  }

  return {
    allocated,
    satisfied: remaining === 0,
    unmetQty: remaining
  };
}

// CORE METRICS (FOR OFFICE MANAGEMENT BOARD)
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

export function getDashboardStats(currentDateStr = SYSTEM_DATE): DashboardStats {
  const patientsCount = getPatients().length;
  const visits = getVisits();
  
  // Visits today
  const visitsToday = visits.filter(v => v.date.startsWith(currentDateStr)).length;
  const pendingVisits = visits.filter(v => v.status === "pending").length;

  const invoices = getInvoices();
  const paidInvoices = invoices.filter(i => i.paymentStatus === "paid");
  
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Month revenue (June 2026)
  const revenueThisMonth = paidInvoices
    .filter(inv => inv.paymentDate && inv.paymentDate.includes("2026-06"))
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Calculate profit
  // Profit = Visit revenue + Medication margins.
  // Medication margin = Sold Price - Batch Cost Price.
  // We can calculate profit by summing: Total Consultaion Fee (Revenue) + Drug markups from visits
  const stockLogs = getStockLogs();
  const exportLogs = stockLogs.filter(log => log.type === "export" && log.reason.includes("Phiếu khám"));
  
  let totalProfit = 0;
  
  // Total fees from paid invoices
  paidInvoices.forEach(inv => {
    totalProfit += inv.consultationFee + (inv.serviceSubtotal || 0); // Consultation and services are 100% margin (services)
    
    // Find corresponding visit
    const visit = visits.find(v => v.id === inv.visitId);
    if (visit) {
      // Sum the margin of each medicine item in this visit
      visit.prescriptionItems.forEach(item => {
        // Find batch to verify cost
        const batch = getBatches().find(b => b.id === item.batchId);
        if (batch) {
          const margin = (item.price - batch.importPrice) * item.quantity;
          totalProfit += margin;
        } else {
          // Fallback margin (assume 40% markup if batch deleted)
          totalProfit += item.price * 0.4 * item.quantity;
        }
      });
    }
  });

  // Inventory warnings
  const medicines = getMedicines();
  const batches = getBatches();
  
  let lowStockItemsCount = 0;
  let nearExpiryItemsCount = 0;

  medicines.forEach(m => {
    // Total quantity in stock for this medicine
    const totalQty = batches
      .filter(b => b.medicineId === m.id)
      .reduce((sum, b) => sum + b.currentQty, 0);
    
    if (totalQty < m.minStock) {
      lowStockItemsCount++;
    }
  });

  const nextMonthDate = new Date(currentDateStr);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthStr = nextMonthDate.toISOString().split("T")[0]; // YYYY-MM-DD for 1 month out

  batches.forEach(b => {
    if (b.currentQty > 0) {
      // Check if already expired
      const isExpired = b.expiryDate < currentDateStr;
      // Check if expiring within 30 days
      const isNearExpiry = b.expiryDate >= currentDateStr && b.expiryDate <= nextMonthStr;
      
      if (isExpired || isNearExpiry) {
        nearExpiryItemsCount++;
      }
    }
  });

  return {
    totalPatients: patientsCount,
    visitsToday,
    pendingVisits,
    revenueThisMonth,
    totalRevenue,
    totalProfit,
    lowStockItemsCount,
    nearExpiryItemsCount
  };
}

// COMPLETE WORKFLOW CLINIC ACTIONS

// Step 1 & 2: Receptionist creates visit
export function createVisit(patientId: string, doctorId: string, symptoms: string): Visit {
  const id = "v-" + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  const formattedDate = `${SYSTEM_DATE} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  const visit: Visit = {
    id,
    patientId,
    doctorId,
    status: "pending",
    date: formattedDate,
    symptoms,
    prescriptionItems: [],
  };

  saveVisit(visit);

  // Initialize unpaid invoice
  const invoice: Invoice = {
    id: "inv-" + Math.random().toString(36).substring(2, 9),
    visitId: id,
    consultationFee: 100000, // Standard fee (100k)
    drugSubtotal: 0,
    serviceSubtotal: 0,
    discount: 0,
    totalAmount: 100000,
    paidAmount: 0,
    paymentStatus: "unpaid"
  };

  saveInvoice(invoice);
  return visit;
}

// Step 3 & 4: Doctor saves exam and prescription
// This resolves the exact FEFO batch selection and updates prescription items
export function submitPrescription(
  visitId: string,
  diagnosis: string,
  notes: string,
  items: { medicineId: string; quantity: number; instruction: string }[],
  services?: string[]
): { visit: Visit; warningMsgs: string[] } {
  const visit = getVisitWithDetails(visitId);
  if (!visit) throw new Error("Không tìm thấy hồ sơ khám.");

  // Get patient for allergy checker
  const patients = getPatients();
  const patient = patients.find(p => p.id === visit.patientId);
  const allergies = patient ? patient.drugAllergies.toLowerCase() : "";

  const warningMsgs: string[] = [];
  const finalPrescriptionItems: PrescriptionItem[] = [];
  let totalDrugCost = 0;

  for (const item of items) {
    const med = getMedicines().find(m => m.id === item.medicineId);
    if (med) {
      // 1. Check Allergy
      if (allergies && allergies !== "không có dị ứng thuốc" && allergies !== "no") {
        const medNameWord = med.name.toLowerCase();
        const activeWord = med.activeIngredient.toLowerCase();
        // Simple word matches for allergies
        const allergyWords = allergies.split(/[\s,;.-]+/).filter(w => w.length > 2);
        
        const hasAllergyStrMatch = allergyWords.some(word => medNameWord.includes(word) || activeWord.includes(word));
        if (hasAllergyStrMatch) {
          warningMsgs.push(`⚠️ Cảnh báo dị ứng: Bệnh nhân dị ứng với "${patient?.drugAllergies}". Thuốc "${med.name}" có thể gây tương tác nguy hại!`);
        }
      }

      // 2. Resolve via FEFO projected allocation
      const projection = projectFEFOAllocation(item.medicineId, item.quantity);
      if (!projection.satisfied) {
        warningMsgs.push(`⚠️ Cảnh báo tồn kho: Thuốc "${med.name}" không đủ số lượng trong kho hữu dụng. Còn thiếu ${projection.unmetQty} đơn vị.`);
      }

      // Add to prescription items mapping to specific batches
      // If we allocated multiple batches, add each as an item
      if (projection.allocated.length > 0) {
        projection.allocated.forEach(alloc => {
          finalPrescriptionItems.push({
            medicineId: item.medicineId,
            batchId: alloc.batchId,
            quantity: alloc.qty,
            instruction: item.instruction,
            price: alloc.retailPrice
          });
          totalDrugCost += alloc.retailPrice * alloc.qty;
        });
      } else {
        // Fallback if no stock exists at all, assign empty batch placeholder for reference
        finalPrescriptionItems.push({
          medicineId: item.medicineId,
          batchId: "",
          quantity: item.quantity,
          instruction: item.instruction,
          price: 0
        });
      }
    }
  }

  // Update visit
  visit.diagnosis = diagnosis;
  visit.prescriptionNotes = notes;
  visit.prescriptionItems = finalPrescriptionItems;
  visit.services = services || [];
  visit.status = "prescribed";
  saveVisit(visit);

  // Update Invoice total
  const invoices = getInvoices();
  const invoice = invoices.find(inv => inv.visitId === visitId);
  if (invoice) {
    invoice.drugSubtotal = totalDrugCost;
    
    // Calculate services cost
    let serviceCost = 0;
    if (services && services.length > 0) {
      const allServices = getServices();
      services.forEach(srvId => {
        const srv = allServices.find(s => s.id === srvId);
        if (srv) {
          serviceCost += srv.price;
        }
      });
    }
    invoice.serviceSubtotal = serviceCost;
    invoice.totalAmount = invoice.consultationFee + totalDrugCost + serviceCost - invoice.discount;
    saveInvoice(invoice);
  }

  return { visit, warningMsgs };
}

// Step 5 & 6: Invoice Payment and Stock Deduction Commit
// This actually deducts currentQty and writes logs
export function processPayment(
  invoiceId: string,
  amountPaid: number,
  discount = 0,
  paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK",
  cashierId: string
): { invoice: Invoice; success: boolean; errMsg?: string } {
  const invoices = getInvoices();
  const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
  if (invoiceIndex < 0) return { invoice: {} as Invoice, success: false, errMsg: "Không tìm thấy hóa đơn." };

  const invoice = invoices[invoiceIndex];
  const visit = getVisits().find(v => v.id === invoice.visitId);
  if (!visit) return { invoice, success: false, errMsg: "Không tìm thấy phiếu khám liên quan." };

  // Set values
  invoice.discount = discount;
  invoice.totalAmount = invoice.consultationFee + invoice.drugSubtotal - discount;
  invoice.paidAmount = amountPaid;
  
  const debt = invoice.totalAmount - amountPaid;
  if (debt > 0) {
    invoice.paymentStatus = "partially_paid";
    invoice.debt = debt;
  } else {
    invoice.paymentStatus = "paid";
    invoice.debt = 0;
  }

  const now = new Date();
  invoice.paymentDate = `${SYSTEM_DATE} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  invoice.cashierId = cashierId;
  saveInvoice(invoice);

  // Save payment ledger record
  const paymentRecord: Payment = {
    id: "pay-" + Math.random().toString(36).substring(2, 9),
    invoiceId: invoiceId,
    amount: amountPaid,
    date: invoice.paymentDate,
    method: paymentMethod,
    cashierId: cashierId
  };
  savePayment(paymentRecord);

  // EXTREMELY CRITICAL: Actually deduct inventory and write logs!
  // Move Visit Status to "paid"
  visit.status = "paid";
  saveVisit(visit);

  const batches = getBatches();
  const staff = getUsers().find(u => u.id === cashierId)?.name || "Lễ tân hệ thống";

  // Deduct from each batch
  visit.prescriptionItems.forEach(item => {
    if (!item.batchId) return; // skip if no batch was assigned
    
    const batchIndex = batches.findIndex(b => b.id === item.batchId);
    if (batchIndex >= 0) {
      const b = batches[batchIndex];
      const previousQty = b.currentQty;
      b.currentQty = Math.max(0, b.currentQty - item.quantity);
      
      // Save updated batch quantity
      saveBatch(b);

      // Create Stock Log
      const actualDeducted = previousQty - b.currentQty;
      if (actualDeducted > 0) {
        const stockLog: StockLog = {
          id: "sl-" + Math.random().toString(36).substring(2, 9),
          medicineId: item.medicineId,
          batchId: item.batchId,
          batchNumber: b.batchNumber,
          type: "export",
          quantity: actualDeducted,
          date: new Date().toISOString(),
          reason: `Bác sĩ kê đơn - Phiếu khám ${visit.id}`,
          user: staff
        };
        saveStockLog(stockLog);
      }
    }
  });

  return { invoice, success: true };
}

// INVENTORY MANUAL LOG (Import/Adjust)
export function addInventoryStock(
  medicineId: string,
  batchNumber: string,
  expiryDate: string,
  quantity: number,
  importPrice: number,
  retailPrice: number,
  userId: string
): MedicineBatch {
  const id = "mb-" + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  
  const newBatch: MedicineBatch = {
    id,
    medicineId,
    batchNumber: batchNumber.toUpperCase().trim(),
    expiryDate,
    originalQty: quantity,
    currentQty: quantity,
    importPrice,
    retailPrice,
    importDate: SYSTEM_DATE
  };

  saveBatch(newBatch);

  // Save stock log
  const staffName = getUsers().find(u => u.id === userId)?.name || "Hệ thống";
  const stockLog: StockLog = {
    id: "sl-" + Math.random().toString(36).substring(2, 9),
    medicineId,
    batchId: id,
    batchNumber: newBatch.batchNumber,
    type: "import",
    quantity,
    date: now.toISOString(),
    reason: "Nhập kho dược phẩm mới",
    user: staffName
  };
  saveStockLog(stockLog);

  return newBatch;
}

// ================= SAAS ERP HELPERS =================

// SUPPLIERS
export function getSuppliers(): Supplier[] {
  return get<Supplier>(KEYS.SUPPLIERS);
}

export function saveSupplier(supplier: Supplier): Supplier {
  const suppliers = getSuppliers();
  const existingIndex = suppliers.findIndex(s => s.id === supplier.id);
  if (existingIndex >= 0) {
    suppliers[existingIndex] = supplier;
  } else {
    suppliers.unshift(supplier);
  }
  set(KEYS.SUPPLIERS, suppliers);
  return supplier;
}

export function deleteSupplier(id: string): void {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter(s => s.id !== id);
  set(KEYS.SUPPLIERS, filtered);
}

// APPOINTMENTS
export function getAppointments(): Appointment[] {
  return get<Appointment>(KEYS.APPOINTMENTS);
}

export function saveAppointment(appointment: Appointment): Appointment {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex(ap => ap.id === appointment.id);
  if (existingIndex >= 0) {
    appointments[existingIndex] = appointment;
  } else {
    appointments.unshift(appointment);
  }
  set(KEYS.APPOINTMENTS, appointments);
  return appointment;
}

// SERVICES
export function getServices(): MedicalService[] {
  return get<MedicalService>(KEYS.SERVICES);
}

export function saveService(service: MedicalService): MedicalService {
  const services = getServices();
  const existingIndex = services.findIndex(s => s.id === service.id);
  if (existingIndex >= 0) {
    services[existingIndex] = service;
  } else {
    services.push(service);
  }
  set(KEYS.SERVICES, services);
  return service;
}

// PURCHASES
export function getPurchaseInvoices(): PurchaseInvoice[] {
  return get<PurchaseInvoice>(KEYS.PURCHASES);
}

export function savePurchaseInvoice(invoice: PurchaseInvoice): PurchaseInvoice {
  const invoices = getPurchaseInvoices();
  const existingIndex = invoices.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice);
  }
  set(KEYS.PURCHASES, invoices);
  return invoice;
}

// CONFIG
export function getClinicConfig(): ClinicConfig {
  const data = localStorage.getItem(KEYS.CONFIG);
  if (!data) return SEED_CLINIC_CONFIG;
  return JSON.parse(data);
}

export function saveClinicConfig(config: ClinicConfig): ClinicConfig {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  return config;
}

