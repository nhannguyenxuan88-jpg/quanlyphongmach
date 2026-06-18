/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as db from "../lib/db";
import {
  User, Patient, Visit, Medicine, MedicineBatch, Invoice, Payment, StockLog,
  Supplier, Appointment, PurchaseInvoice, ClinicConfig, MedicalService
} from "../types";
import { DashboardStats } from "../lib/db";
import { SYSTEM_DATE, getCurrentDateTimeStr } from "../lib/utils";

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
  dashboardStats: DashboardStats;
  suppliers: Supplier[];
  appointments: Appointment[];
  purchases: PurchaseInvoice[];
  services: MedicalService[];
  config: ClinicConfig;
  darkMode: boolean;
  isLoading: boolean;
  
  // Actions
  changeUser: (user: User) => void;
  resetDb: () => void;
  registerPatient: (patient: Omit<Patient, "id" | "createdAt">) => Patient;
  checkInVisit: (patientId: string, doctorId: string, symptoms: string) => Visit;
  prescribeMedications: (
    visitId: string,
    diagnosis: string,
    notes: string,
    items: { medicineId: string; quantity: number; instruction: string }[],
    services?: string[]
  ) => { visit: Visit; warningMsgs: string[] };
  receivePayment: (
    invoiceId: string,
    amountPaid: number,
    discount: number,
    paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK" | "QR VietQR"
  ) => { invoice: Invoice; success: boolean; errMsg?: string };
  registerMedicine: (medicine: Omit<Medicine, "id">) => Medicine;
  importMedicineBatch: (
    medicineId: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    importPrice: number,
    retailPrice: number
  ) => MedicineBatch;
  settlePatientDebt: (invoiceId: string, amount: number) => void;
  refreshData: () => void;

  // SaaS ERP Actions
  saveSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  saveAppointment: (appointment: Appointment) => void;
  savePurchaseInvoice: (invoice: PurchaseInvoice) => void;
  saveClinicConfig: (config: ClinicConfig) => void;
  saveService: (service: MedicalService) => void;
  toggleDarkMode: () => void;
  triggerSkeleton: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(() => db.getDashboardStats(SYSTEM_DATE));
  
  // SaaS ERP States
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [config, setConfig] = useState<ClinicConfig>(() => db.getClinicConfig());
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("clinic_dark_mode") === "true";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = useCallback(() => {
    setUsers(db.getUsers());
    setPatients(db.getPatients());
    setVisits(db.getVisits());
    setMedicines(db.getMedicines());
    setBatches(db.getBatches());
    setInvoices(db.getInvoices());
    setPayments(db.getPayments());
    setStockLogs(db.getStockLogs());
    setDashboardStats(db.getDashboardStats(SYSTEM_DATE));
    
    // SaaS ERP lists
    setSuppliers(db.getSuppliers());
    setAppointments(db.getAppointments());
    setPurchases(db.getPurchaseInvoices());
    setServices(db.getServices());
    setConfig(db.getClinicConfig());
  }, []);

  // Sync state initially
  useEffect(() => {
    db.initializeDB();
    refreshData();
  }, [refreshData]);

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
  const changeUser = (user: User) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    refreshData();
  };

  const resetDb = () => {
    db.initializeDB(true);
    setCurrentUser(db.getCurrentUser());
    refreshData();
  };

  const registerPatient = (patientData: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...patientData,
      id: "p-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    db.savePatient(newPatient);
    refreshData();
    return newPatient;
  };

  const checkInVisit = (patientId: string, doctorId: string, symptoms: string) => {
    const id = "v-" + Math.random().toString(36).substring(2, 9);
    const dateStr = getCurrentDateTimeStr();
    
    const visit: Visit = {
      id,
      patientId,
      doctorId,
      status: "pending",
      date: dateStr,
      symptoms,
      prescriptionItems: [],
      services: [],
    };
    db.saveVisit(visit);

    const invoice: Invoice = {
      id: "inv-" + Math.random().toString(36).substring(2, 9),
      visitId: id,
      consultationFee: 100000,
      drugSubtotal: 0,
      serviceSubtotal: 0,
      discount: 0,
      totalAmount: 100000,
      paidAmount: 0,
      paymentStatus: "unpaid"
    };
    db.saveInvoice(invoice);

    refreshData();
    return visit;
  };

  const prescribeMedications = (
    visitId: string,
    diagnosis: string,
    notes: string,
    items: { medicineId: string; quantity: number; instruction: string }[],
    servicesList?: string[]
  ) => {
    const res = db.submitPrescription(visitId, diagnosis, notes, items, servicesList);
    refreshData();
    return res;
  };

  const receivePayment = (
    invoiceId: string,
    amountPaid: number,
    discount: number,
    paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK" | "QR VietQR"
  ) => {
    const res = db.processPayment(invoiceId, amountPaid, discount, paymentMethod as any, currentUser.id);
    refreshData();
    return res;
  };

  const registerMedicine = (medicineData: Omit<Medicine, "id">) => {
    const newMed: Medicine = {
      ...medicineData,
      id: "m-" + Math.random().toString(36).substring(2, 9)
    };
    db.saveMedicine(newMed);
    refreshData();
    return newMed;
  };

  const importMedicineBatch = (
    medicineId: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    importPrice: number,
    retailPrice: number
  ) => {
    const res = db.addInventoryStock(
      medicineId,
      batchNumber,
      expiryDate,
      quantity,
      importPrice,
      retailPrice,
      currentUser.id
    );
    refreshData();
    return res;
  };

  const settlePatientDebt = (invoiceId: string, amount: number) => {
    const currentInvoices = db.getInvoices();
    const idx = currentInvoices.findIndex(inv => inv.id === invoiceId);
    if (idx >= 0) {
      const inv = currentInvoices[idx];
      inv.paidAmount += amount;
      inv.debt = Math.max(0, (inv.debt || 0) - amount);
      
      if (inv.debt === 0) {
        inv.paymentStatus = "paid";
      } else {
        inv.paymentStatus = "partially_paid";
      }
      
      localStorage.setItem("clinic_invoices", JSON.stringify(currentInvoices));

      // Log Payment transaction
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const paymentRecord = {
        id: "pay-" + Math.random().toString(36).substring(2, 9),
        invoiceId: inv.id,
        amount: amount,
        date: `${SYSTEM_DATE} ${hours}:${minutes}`,
        method: "Tiền mặt" as any,
        cashierId: currentUser.id
      };
      
      const currentPayments = db.getPayments();
      currentPayments.unshift(paymentRecord);
      localStorage.setItem("clinic_payments", JSON.stringify(currentPayments));
      
      refreshData();
    }
  };

  // SaaS ERP actions implementation
  const saveSupplier = (supplier: Supplier) => {
    db.saveSupplier(supplier);
    refreshData();
  };

  const deleteSupplier = (id: string) => {
    db.deleteSupplier(id);
    refreshData();
  };

  const saveAppointment = (appointment: Appointment) => {
    db.saveAppointment(appointment);
    refreshData();
  };

  const savePurchaseInvoice = (invoice: PurchaseInvoice) => {
    db.savePurchaseInvoice(invoice);
    
    // Extemely critical: Auto-create medication batches and log imports!
    const now = new Date();
    const batchesData = db.getBatches();
    const medicinesData = db.getMedicines();
    
    invoice.items.forEach(item => {
      // Find matching medicine unit/details to decide retail price (markup of 40% if not found or new batch)
      const med = medicinesData.find(m => m.id === item.medicineId);
      if (med) {
        // Look up previous batches to find typical retailPrice
        const prevBatch = batchesData.find(b => b.medicineId === item.medicineId);
        const retailPrice = prevBatch ? prevBatch.retailPrice : Math.round(item.importPrice * 1.4);
        
        // Auto-allocate a new batch number
        const batchNum = "PI-" + invoice.id.substring(3).toUpperCase() + "-" + Math.random().toString(36).substring(2, 5).toUpperCase();
        const expiryDate = new Date(SYSTEM_DATE);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2); // default 2 years expiry
        const formattedExpiry = expiryDate.toISOString().split("T")[0];
        
        db.addInventoryStock(
          item.medicineId,
          batchNum,
          formattedExpiry,
          item.quantity,
          item.importPrice,
          retailPrice,
          currentUser.id
        );
      }
    });

    refreshData();
  };

  const saveClinicConfig = (newConfig: ClinicConfig) => {
    db.saveClinicConfig(newConfig);
    setConfig(newConfig);
    refreshData();
  };

  const saveService = (service: MedicalService) => {
    db.saveService(service);
    refreshData();
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const triggerSkeleton = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400); // 400ms loading transition
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
        changeUser,
        resetDb,
        registerPatient,
        checkInVisit,
        prescribeMedications,
        receivePayment,
        registerMedicine,
        importMedicineBatch,
        settlePatientDebt,
        refreshData,
        saveSupplier,
        deleteSupplier,
        saveAppointment,
        savePurchaseInvoice,
        saveClinicConfig,
        saveService,
        toggleDarkMode,
        triggerSkeleton
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
