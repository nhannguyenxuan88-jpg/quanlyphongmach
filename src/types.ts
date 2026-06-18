/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "receptionist" | "doctor" | "pharmacist" | "manager";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  avatar?: string;
  status: "active" | "inactive";
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  gender: "Nam" | "Nữ" | "Khác";
  dob: string; // YYYY-MM-DD
  address: string;
  medicalHistory: string; // Tiền sử bệnh lý
  drugAllergies: string; // Dị ứng thuốc
  createdAt: string;
}

export type VisitStatus = "pending" | "examining" | "prescribed" | "paid";

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string; // Users who are doctors
  status: VisitStatus;
  date: string; // ISO date string or YYYY-MM-DD HH:mm
  symptoms: string; // Triệu chứng lâm sàng
  diagnosis?: string; // Chẩn đoán của bác sĩ
  prescriptionNotes?: string; // Lời dặn của bác sĩ
  prescriptionItems: PrescriptionItem[];
  services?: string[]; // Danh sách ID dịch vụ được chỉ định thêm
}

export interface PrescriptionItem {
  medicineId: string;
  batchId: string; // Lô thuốc xuất theo FEFO
  quantity: number; // Số lượng xuất
  instruction: string; // Cách dùng
  price: number; // Giá bán lẻ tại thời điểm kê toa
}

export interface Medicine {
  id: string;
  name: string;
  activeIngredient: string; // Hoạt chất
  unit: string; // Đơn vị tính (viên, vỉ, lọ, hộp)
  group: string; // Nhóm thuốc
  manufacturer: string; // Nhà sản xuất
  minStock: number; // Mức tồn tối thiểu để cảnh báo
}

export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string; // Số lô
  expiryDate: string; // Ngày hết hạn (YYYY-MM-DD)
  originalQty: number; // Số lượng nhập ban đầu
  currentQty: number; // Số lượng tồn kho hiện tại
  importPrice: number; // Giá nhập (giá vốn)
  retailPrice: number; // Giá bán lẻ
  importDate: string; // Ngày nhập kho
}

export interface StockLog {
  id: string;
  medicineId: string;
  batchId: string;
  batchNumber: string;
  type: "import" | "export";
  quantity: number;
  date: string; // ISO string
  reason: string; // Lý do xuất nhập
  user: string; // Người thực hiện
}

export interface Invoice {
  id: string;
  visitId: string;
  consultationFee: number; // Tiền khám bệnh
  drugSubtotal: number; // Tổng tiền thuốc
  serviceSubtotal?: number; // Tổng tiền dịch vụ chỉ định thêm
  discount: number; // Giảm giá
  totalAmount: number; // Tổng số tiền phải trả
  paidAmount: number; // Số tiền khách đã trả
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  paymentDate?: string;
  debt?: number; // Công nợ
  cashierId?: string; // Thu ngân
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: "Tiền mặt" | "Chuyển khoản" | "Thẻ GSK" | "QR VietQR";
  cashierId: string;
}

// ================= NEW TYPES FOR SAAS/ERP EXPANSION =================

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId?: string; // Có thể liên kết bệnh nhân cũ
  patientName: string;
  phone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  symptoms: string; // Lý do khám
  status: "đã khám" | "chưa khám" | "quá hẹn";
}

export interface PurchaseInvoiceItem {
  medicineId: string;
  quantity: number;
  importPrice: number;
  totalPrice: number;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  importDate: string; // YYYY-MM-DD
  notes: string;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
}

export interface MedicalService {
  id: string;
  name: string;
  price: number;
}

export interface ClinicConfig {
  name: string;
  logo: string; // URL hoặc ảnh giả lập base64
  address: string;
  phone: string;
  email: string;
  printSize: "A4" | "A5";
  enableSTT: boolean;
  reminderTime: number; // số phút trước giờ hẹn
  enableZaloReminder: boolean;
}
