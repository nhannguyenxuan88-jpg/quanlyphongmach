/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as db from "../lib/supabaseDb";
import type {
  User, Patient, Visit, Medicine, MedicineBatch, Invoice, Payment, StockLog,
  Supplier, Appointment, PurchaseInvoice, ClinicConfig, MedicalService
} from "../types";

interface ClinicContextType {
  // States
  currentUser: User;
  users: User[];
  patients: Patient[];
  visits: Visit[];
  medicines: Medicine[];
  batches: MedicineBatch[];
  invoices: Invoice[];
  payments: Payment[];
  stockLogs: StockLog[];
  dashboardStats: db.DashboardStats;
  suppliers: Supplier[];
  appointments: Appointment[];
  purchases: PurchaseInvoice[];
  services: MedicalService[];
  config: ClinicConfig;
  darkMode: boolean;
  isLoading: boolean;
  
  // Actions (all async now)
  registerPatient: (patient: Omit<Patient, "id" | "createdAt">) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  checkInVisit: (patientId: string, doctorId: string, symptoms: string) => Promise<Visit>;
  prescribeMedications: (
    visitId: string,
    diagnosis: string,
    notes: string,
    items: { medicineId: string; quantity: number; instruction: string }[],
    services?: string[]
  ) => Promise<{ visit: Visit; warningMsgs: string[] }>;
  receivePayment: (
    invoiceId: string,
    amountPaid: number,
    discount: number,
    paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK" | "QR VietQR"
  ) => Promise<{ invoice: Invoice; success: boolean; errMsg?: string }>;
  registerMedicine: (medicine: Omit<Medicine, "id">) => Promise<Medicine>;
  importMedicineBatch: (
    medicineId: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    importPrice: number,
    retailPrice: number
  ) => Promise<MedicineBatch>;
  settlePatientDebt: (invoiceId: string, amount: number) => Promise<void>;
  refreshData: () => Promise<void>;

  // SaaS ERP Actions
  saveSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  saveAppointment: (appointment: Appointment) => Promise<void>;
  savePurchaseInvoice: (invoice: PurchaseInvoice) => Promise<void>;
  saveClinicConfig: (config: ClinicConfig) => Promise<void>;
  saveService: (service: MedicalService) => Promise<void>;
  toggleDarkMode: () => void;
  triggerSkeleton: () => void;
  createStaffMember: (email: string, password: string, fullName: string, role: User["role"]) => Promise<string>;
  resetStaffPassword: (userId: string, newPassword: string) => Promise<boolean>;
  updateStaffMember: (userId: string, payload: { name?: string; role?: User["role"]; status?: User["status"] }) => Promise<void>;
}

const DEFAULT_STATS: db.DashboardStats = {
  totalPatients: 0,
  visitsToday: 0,
  pendingVisits: 0,
  revenueThisMonth: 0,
  totalRevenue: 0,
  totalProfit: 0,
  lowStockItemsCount: 0,
  nearExpiryItemsCount: 0,
};

const DEFAULT_CONFIG: ClinicConfig = {
  name: "Clinic Cloud",
  logo: "",
  address: "",
  phone: "",
  email: "",
  printSize: "A5",
  enableSTT: true,
  reminderTime: 120,
  enableZaloReminder: true,
};

const DEFAULT_USER: User = {
  id: "",
  name: "Chưa đăng nhập",
  role: "receptionist",
  username: "",
  status: "active",
};

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, clinicId } = useAuth();
  
  const [currentUser, setCurrentUser] = useState<User>(authUser || DEFAULT_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<db.DashboardStats>(DEFAULT_STATS);
  
  // SaaS ERP States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [config, setConfig] = useState<ClinicConfig>(DEFAULT_CONFIG);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("clinic_dark_mode") === "true";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync current user from auth
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  const refreshData = useCallback(async () => {
    if (!clinicId) return;
    
    try {
      const [
        usersData,
        patientsData,
        visitsData,
        medicinesData,
        batchesData,
        invoicesData,
        paymentsData,
        stockLogsData,
        suppliersData,
        appointmentsData,
        purchasesData,
        servicesData,
        configData,
        statsData,
      ] = await Promise.all([
        db.getUsers(clinicId),
        db.getPatients(clinicId),
        db.getVisits(clinicId),
        db.getMedicines(clinicId),
        db.getBatches(clinicId),
        db.getInvoices(clinicId),
        db.getPayments(clinicId),
        db.getStockLogs(clinicId),
        db.getSuppliers(clinicId),
        db.getAppointments(clinicId),
        db.getPurchaseInvoices(clinicId),
        db.getServices(clinicId),
        db.getClinicConfig(clinicId),
        db.getDashboardStats(clinicId),
      ]);

      setUsers(usersData);
      setPatients(patientsData);
      setVisits(visitsData);
      setMedicines(medicinesData);
      setBatches(batchesData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setStockLogs(stockLogsData);
      setSuppliers(suppliersData);
      setAppointments(appointmentsData);
      setPurchases(purchasesData);
      setServices(servicesData);
      setConfig(configData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  }, [clinicId]);

  // Load data when clinicId becomes available
  useEffect(() => {
    if (clinicId) {
      setIsLoading(true);
      refreshData().finally(() => setIsLoading(false));
    }
  }, [clinicId, refreshData]);

  // Apply dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("clinic_dark_mode", String(darkMode));
  }, [darkMode]);

  // Actions
  const registerPatient = async (patientData: Omit<Patient, "id" | "createdAt">) => {
    if (!clinicId) throw new Error("No clinic context");
    const newPatient = await db.savePatient(clinicId, patientData);
    await refreshData();
    return newPatient;
  };

  const deletePatient = async (id: string) => {
    await db.deletePatient(id);
    await refreshData();
  };

  const checkInVisit = async (patientId: string, doctorId: string, symptoms: string) => {
    if (!clinicId) throw new Error("No clinic context");
    const visit = await db.createVisit(clinicId, patientId, doctorId, symptoms);
    await refreshData();
    return visit;
  };

  const prescribeMedications = async (
    visitId: string,
    diagnosis: string,
    notes: string,
    items: { medicineId: string; quantity: number; instruction: string }[],
    servicesList?: string[]
  ) => {
    if (!clinicId) throw new Error("No clinic context");
    const res = await db.submitPrescription(clinicId, visitId, diagnosis, notes, items, servicesList);
    await refreshData();
    return res;
  };

  const receivePayment = async (
    invoiceId: string,
    amountPaid: number,
    discount: number,
    paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK" | "QR VietQR"
  ) => {
    if (!clinicId) throw new Error("No clinic context");
    const res = await db.processPayment(
      clinicId, invoiceId, amountPaid, discount, paymentMethod, currentUser.id, currentUser.name
    );
    await refreshData();
    return res;
  };

  const registerMedicine = async (medicineData: Omit<Medicine, "id">) => {
    if (!clinicId) throw new Error("No clinic context");
    const newMed = await db.saveMedicine(clinicId, medicineData);
    await refreshData();
    return newMed;
  };

  const importMedicineBatch = async (
    medicineId: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    importPrice: number,
    retailPrice: number
  ) => {
    if (!clinicId) throw new Error("No clinic context");
    const res = await db.addInventoryStock(
      clinicId, medicineId, batchNumber, expiryDate, quantity, importPrice, retailPrice, currentUser.name
    );
    await refreshData();
    return res;
  };

  const settlePatientDebt = async (invoiceId: string, amount: number) => {
    if (!clinicId) throw new Error("No clinic context");
    await db.settlePatientDebt(clinicId, invoiceId, amount, currentUser.id);
    await refreshData();
  };

  // SaaS ERP actions
  const saveSupplierAction = async (supplier: Supplier) => {
    if (!clinicId) return;
    await db.saveSupplier(clinicId, supplier);
    await refreshData();
  };

  const deleteSupplierAction = async (id: string) => {
    await db.deleteSupplier(id);
    await refreshData();
  };

  const saveAppointmentAction = async (appointment: Appointment) => {
    if (!clinicId) return;
    await db.saveAppointment(clinicId, appointment);
    await refreshData();
  };

  const savePurchaseInvoiceAction = async (invoice: PurchaseInvoice) => {
    if (!clinicId) return;
    await db.savePurchaseInvoice(clinicId, invoice, currentUser.name);
    await refreshData();
  };

  const saveClinicConfigAction = async (newConfig: ClinicConfig) => {
    if (!clinicId) return;
    await db.saveClinicConfig(clinicId, newConfig);
    setConfig(newConfig);
    await refreshData();
  };

  const saveServiceAction = async (service: MedicalService) => {
    if (!clinicId) return;
    await db.saveService(clinicId, service);
    await refreshData();
  };

  const createStaffMemberAction = async (email: string, password: string, fullName: string, role: User["role"]) => {
    if (!clinicId) throw new Error("No clinic context");
    const newId = await db.createStaffMember(clinicId, email, password, fullName, role);
    await refreshData();
    return newId;
  };

  const resetStaffPasswordAction = async (userId: string, newPassword: string) => {
    const success = await db.resetStaffPassword(userId, newPassword);
    return success;
  };

  const updateStaffMemberAction = async (userId: string, payload: { name?: string; role?: User["role"]; status?: User["status"] }) => {
    await db.updateStaffMember(userId, payload);
    await refreshData();
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const triggerSkeleton = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        users,
        patients,
        visits,
        medicines,
        batches,
        invoices,
        payments,
        stockLogs,
        dashboardStats,
        suppliers,
        appointments,
        purchases,
        services,
        config,
        darkMode,
        isLoading,
        registerPatient,
        deletePatient,
        checkInVisit,
        prescribeMedications,
        receivePayment,
        registerMedicine,
        importMedicineBatch,
        settlePatientDebt,
        refreshData,
        saveSupplier: saveSupplierAction,
        deleteSupplier: deleteSupplierAction,
        saveAppointment: saveAppointmentAction,
        savePurchaseInvoice: savePurchaseInvoiceAction,
        saveClinicConfig: saveClinicConfigAction,
        saveService: saveServiceAction,
        toggleDarkMode,
        triggerSkeleton,
        createStaffMember: createStaffMemberAction,
        resetStaffPassword: resetStaffPasswordAction,
        updateStaffMember: updateStaffMemberAction,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
