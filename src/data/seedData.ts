/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Patient, Medicine, MedicineBatch, Visit, Invoice, Payment, StockLog, Supplier, Appointment, PurchaseInvoice, ClinicConfig, MedicalService } from "../types";

export const SEED_USERS: User[] = [
  { id: "u-receptionist-1", name: "Trần Thị Hoa", role: "receptionist", username: "hoa_receptionist", status: "active" },
  { id: "u-doctor-1", name: "BS. Nguyễn Văn An", role: "doctor", username: "an_doctor", status: "active" },
  { id: "u-doctor-2", name: "BS. Lê Thị Bình", role: "doctor", username: "binh_doctor", status: "active" },
  { id: "u-pharmacist-1", name: "Phạm Minh Hải", role: "pharmacist", username: "hai_pharmacist", status: "active" },
  { id: "u-manager-1", name: "Lê Hoàng Linh (Admin)", role: "manager", username: "linh_manager", status: "active" },
];

export const SEED_PATIENTS: Patient[] = [
  {
    id: "p-1",
    fullName: "Nguyễn Văn Khang",
    phone: "0901234567",
    gender: "Nam",
    dob: "1985-05-12",
    address: "123 Đường Lê Lợi, Quận 1, TP. HCM",
    medicalHistory: "Cao huyết áp (vấn đề tim mạch nhẹ)",
    drugAllergies: "Aspirin, Ibuprofen",
    createdAt: "2026-05-10T08:30:00Z"
  },
  {
    id: "p-2",
    fullName: "Trần Thị Mai",
    phone: "0918765432",
    gender: "Nữ",
    dob: "1992-09-24",
    address: "45/8 Điện Biên Phủ, Bình Thạnh, TP. HCM",
    medicalHistory: "Đau dạ dày cấp",
    drugAllergies: "Không có dị ứng thuốc",
    createdAt: "2026-05-15T09:00:00Z"
  },
  {
    id: "p-3",
    fullName: "Lê Phước Hải",
    phone: "0987654321",
    gender: "Nam",
    dob: "1970-11-03",
    address: "789 Cách Mạng Tháng 8, Tân Bình, TP. HCM",
    medicalHistory: "Tiểu đường type 2, mỡ máu cao",
    drugAllergies: "Penicillin",
    createdAt: "2026-05-20T10:15:00Z"
  },
  {
    id: "p-4",
    fullName: "Phạm Thúy Nga",
    phone: "0933445566",
    gender: "Nữ",
    dob: "1998-02-15",
    address: "12 Chùa Bộc, Đống Đa, Hà Nội",
    medicalHistory: "Hay mệt mỏi, thiếu máu nhẹ",
    drugAllergies: "Không có dị ứng thuốc",
    createdAt: "2026-06-01T14:20:00Z"
  },
  {
    id: "p-5",
    fullName: "Hoàng Văn Đức",
    phone: "0955667788",
    gender: "Nam",
    dob: "1965-07-30",
    address: "246 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    medicalHistory: "Hen suyễn mãn tính",
    drugAllergies: "Sulfonamide",
    createdAt: "2026-06-05T08:00:00Z"
  }
];

export const SEED_MEDICINES: Medicine[] = [
  {
    id: "m-1",
    name: "Amoxicillin 500mg",
    activeIngredient: "Amoxicillin",
    unit: "Vỉ",
    group: "Kháng sinh",
    manufacturer: "Dược Hậu Giang (DHG)",
    minStock: 50
  },
  {
    id: "m-2",
    name: "Paracetamol 500mg (Hapacol)",
    activeIngredient: "Paracetamol",
    unit: "Viên",
    group: "Giảm đau, hạ sốt",
    manufacturer: "Dược Hậu Giang (DHG)",
    minStock: 200
  },
  {
    id: "m-3",
    name: "Ibuprofen 400mg",
    activeIngredient: "Ibuprofen",
    unit: "Viên",
    group: "Giảm đau, kháng viêm",
    manufacturer: "Domesco",
    minStock: 80
  },
  {
    id: "m-4",
    name: "Cetirizine 10mg",
    activeIngredient: "Cetirizine dihydrochloride",
    unit: "Viên",
    group: "Kháng Histamin - Trị dị ứng",
    manufacturer: "Traphaco",
    minStock: 100
  },
  {
    id: "m-5",
    name: "Metformin 850mg (Glucophage)",
    activeIngredient: "Metformin HCl",
    unit: "Viên",
    group: "Trị tiểu đường",
    manufacturer: "Merck S.A.",
    minStock: 150
  },
  {
    id: "m-6",
    name: "Salbutamol 2mg",
    activeIngredient: "Salbutamol sulfate",
    unit: "Viên",
    group: "Giãn phế quản - Trị hen suyễn",
    manufacturer: "OPV",
    minStock: 60
  }
];

// Current date in demo context: 2026-06-17.
// We will create batches: some near expiry to show alerts, some expired, some long expiry.
export const SEED_MEDICINE_BATCHES: MedicineBatch[] = [
  // Amoxicillin Batches
  {
    id: "mb-1-1",
    medicineId: "m-1",
    batchNumber: "AMX2601",
    expiryDate: "2026-07-15", // Sắp hết hạn (trong vòng 1 tháng)
    originalQty: 100,
    currentQty: 42,
    importPrice: 8000, // Giá nhập 1 vỉ
    retailPrice: 12000, // Giá bán lẻ 1 vỉ
    importDate: "2026-01-10"
  },
  {
    id: "mb-1-2",
    medicineId: "m-1",
    batchNumber: "AMX2602",
    expiryDate: "2027-03-20", // Còn hạn dài
    originalQty: 500,
    currentQty: 500,
    importPrice: 8000,
    retailPrice: 12000,
    importDate: "2026-04-15"
  },
  // Paracetamol Batches
  {
    id: "mb-2-1",
    medicineId: "m-2",
    batchNumber: "PAR2601",
    expiryDate: "2026-06-25", // Cực kỳ gần hết hạn (8 ngày nữa!)
    originalQty: 300,
    currentQty: 25,
    importPrice: 400,
    retailPrice: 1000,
    importDate: "2026-01-20"
  },
  {
    id: "mb-2-2",
    medicineId: "m-2",
    batchNumber: "PAR2602",
    expiryDate: "2027-09-30",
    originalQty: 2000,
    currentQty: 1850,
    importPrice: 400,
    retailPrice: 1000,
    importDate: "2026-05-10"
  },
  // Ibuprofen Batches
  {
    id: "mb-3-1",
    medicineId: "m-3",
    batchNumber: "IBU2512",
    expiryDate: "2026-08-01", // Sắp hết hạn (1.5 tháng)
    originalQty: 150,
    currentQty: 12, // Dưới mức tồn tối thiểu
    importPrice: 1200,
    retailPrice: 2000,
    importDate: "2025-12-15"
  },
  {
    id: "mb-3-2",
    medicineId: "m-3",
    batchNumber: "IBU2604",
    expiryDate: "2027-11-15",
    originalQty: 1000,
    currentQty: 1000,
    importPrice: 1100,
    retailPrice: 2000,
    importDate: "2026-04-20"
  },
  // Cetirizine Batches
  {
    id: "mb-4-1",
    medicineId: "m-4",
    batchNumber: "CET2602",
    expiryDate: "2026-06-10", // ĐÃ HẾT HẠN (7 ngày trước!) để kiểm tra bộ lọc cảnh báo hết hạn
    originalQty: 100,
    currentQty: 15,
    importPrice: 600,
    retailPrice: 1500,
    importDate: "2026-02-12"
  },
  {
    id: "mb-4-2",
    medicineId: "m-4",
    batchNumber: "CET2605",
    expiryDate: "2027-06-30",
    originalQty: 1000,
    currentQty: 950,
    importPrice: 600,
    retailPrice: 1500,
    importDate: "2026-05-02"
  },
  // Metformin Batches
  {
    id: "mb-5-1",
    medicineId: "m-5",
    batchNumber: "MET2601",
    expiryDate: "2027-01-15",
    originalQty: 500,
    currentQty: 320,
    importPrice: 1500,
    retailPrice: 2500,
    importDate: "2026-01-22"
  },
  // Salbutamol
  {
    id: "mb-6-1",
    medicineId: "m-6",
    batchNumber: "SAL2603",
    expiryDate: "2026-09-01",
    originalQty: 120,
    currentQty: 55, // Tồn tối thiểu là 60 -> Tốn ít!
    importPrice: 1000,
    retailPrice: 1800,
    importDate: "2026-03-05"
  }
];

export const SEED_VISITS: Visit[] = [
  // Paid and Archived (Lịch sử)
  {
    id: "v-1",
    patientId: "p-3", // Lê Phước Hải
    doctorId: "u-doctor-1", // Nguyễn Văn An
    status: "paid",
    date: "2026-06-12 10:30",
    symptoms: "Kiểm tra định kỳ đường huyết, tê bì tay chân nhẹ về đêm.",
    diagnosis: "Tiểu đường Type 2 kiểm soát tốt, đau dây thần kinh ngoại biên do tiểu đường.",
    prescriptionNotes: "Uống thuốc đúng giờ, hạn chế tinh bột và đồ ngọt, tập thể dục nhẹ nhàng 30p mỗi ngày.",
    prescriptionItems: [
      { medicineId: "m-5", batchId: "mb-5-1", quantity: 30, price: 2500, instruction: "Uống 1 viên vào buổi sáng sau ăn" }
    ]
  },
  {
    id: "v-2",
    patientId: "p-2", // Trần Thị Mai
    doctorId: "u-doctor-2", // Lê Thị Bình
    status: "paid",
    date: "2026-06-15 14:15",
    symptoms: "Đau vùng thượng vị âm ỉ, đầy hơi, ợ chua tăng lên sau khi ăn đồ cay nóng.",
    diagnosis: "Viêm dạ dày cấp tính, trào ngược dạ dày thực quản (GERD).",
    prescriptionNotes: "Ăn đồ mềm, chia nhiều bữa nhỏ, tránh xa tỏi ớt, cà phê, rượu bia. Tránh nằm sau ăn 2 tiếng.",
    prescriptionItems: [
      { medicineId: "m-2", batchId: "mb-2-2", quantity: 20, price: 1000, instruction: "Uống khi đau, tối đa 3 viên một ngày" }
    ]
  },
  // Prescribed, pending payment (Đã kê đơn - Chờ thanh toán)
  {
    id: "v-3",
    patientId: "p-1", // Nguyễn Văn Khang (Allergic to Aspirin, Ibuprofen)
    doctorId: "u-doctor-1", // Nguyễn Văn An
    status: "prescribed",
    date: "2026-06-16 16:00",
    symptoms: "Sốt nhẹ 38.2 độ, đau đầu, mệt mỏi toàn thân, đau họng nhẹ.",
    diagnosis: "Viêm họng cấp / Cảm cúm.",
    prescriptionNotes: "Súc họng nước muối ấm 3 lần/ngày. Nghỉ ngơi và uống nhiều nước.",
    prescriptionItems: [
      { medicineId: "m-1", batchId: "mb-1-1", quantity: 14, price: 12000, instruction: "Uống 1 vỉ sáng, 1 vỉ chiều sau ăn trong 7 ngày" },
      { medicineId: "m-2", batchId: "mb-2-2", quantity: 15, price: 1000, instruction: "Uống 1 viên khi sốt trên 38.5 độ, cách 6 tiếng" }
    ]
  },
  // Examining (Đang khám)
  {
    id: "v-4",
    patientId: "p-5", // Hoàng Văn Đức (Allergic to Sulfonamide, history of Asthma)
    doctorId: "u-doctor-2", // Lê Thị Bình
    status: "examining",
    date: "2026-06-17 08:30",
    symptoms: "Khó thở nhẹ về đêm, ho khan thành cơn, có tiếng thở rít khò khè.",
    diagnosis: "Cơn hen phế quản nhẹ xuất hiện do thay đổi thời tiết.",
    prescriptionNotes: "Đeo khẩu trang khi ra đường, tránh khói bụi máy lạnh phả trực tiếp.",
    prescriptionItems: []
  },
  // Pending (Chờ khám)
  {
    id: "v-5",
    patientId: "p-4", // Phạm Thúy Nga
    doctorId: "u-doctor-1",
    status: "pending",
    date: "2026-06-17 09:15",
    symptoms: "Người mệt mỏi, mắt thâm quầng, chóng mặt nhẹ khi đứng lên đột ngột.",
    diagnosis: "",
    prescriptionNotes: "",
    prescriptionItems: []
  }
];

export const SEED_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    visitId: "v-1",
    consultationFee: 100000, // 100k vnd
    drugSubtotal: 75000, // 30 * 2500
    discount: 5000,
    totalAmount: 170000,
    paidAmount: 170000,
    paymentStatus: "paid",
    paymentDate: "2026-06-12 11:15",
    cashierId: "u-receptionist-1"
  },
  {
    id: "inv-2",
    visitId: "v-2",
    consultationFee: 80000, // 80k vnd
    drugSubtotal: 20000, // 20 * 1000
    discount: 0,
    totalAmount: 100000,
    paidAmount: 100000,
    paymentStatus: "paid",
    paymentDate: "2026-06-15 15:00",
    cashierId: "u-receptionist-1"
  },
  {
    id: "inv-3",
    visitId: "v-3",
    consultationFee: 100000,
    drugSubtotal: 183000, // (14 * 12000) + (15 * 1000) = 168000 + 15000 = 183000
    discount: 0,
    totalAmount: 283000,
    paidAmount: 0,
    paymentStatus: "unpaid",
    cashierId: undefined
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 170000,
    date: "2026-06-12 11:15",
    method: "Chuyển khoản",
    cashierId: "u-receptionist-1"
  },
  {
    id: "pay-2",
    invoiceId: "inv-2",
    amount: 100000,
    date: "2026-06-15 15:00",
    method: "Tiền mặt",
    cashierId: "u-receptionist-1"
  }
];

export const SEED_STOCK_LOGS: StockLog[] = [
  {
    id: "sl-1",
    medicineId: "m-5",
    batchId: "mb-5-1",
    batchNumber: "MET2601",
    type: "export",
    quantity: 30,
    date: "2026-06-12T11:15:00Z",
    reason: "Bác sĩ kê đơn - Phiếu khám v-1",
    user: "Phạm Minh Hải"
  },
  {
    id: "sl-2",
    medicineId: "m-2",
    batchId: "mb-2-2",
    batchNumber: "PAR2602",
    type: "export",
    quantity: 20,
    date: "2026-06-15T15:00:00Z",
    reason: "Bác sĩ kê đơn - Phiếu khám v-2",
    user: "Phạm Minh Hải"
  }
];

export const SEED_SUPPLIERS: Supplier[] = [
  { id: "s-1", name: "Dược Phẩm Hậu Giang (DHG)", phone: "18001099", email: "dhgpharma@dhgpharma.com.vn", address: "288 Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ", notes: "Nhà cung cấp chính các loại kháng sinh và giảm đau hạ sốt." },
  { id: "s-2", name: "Công ty Cổ phần Traphaco", phone: "18006612", email: "info@traphaco.com.vn", address: "75 Yên Ninh, Quận Ba Đình, Hà Nội", notes: "Chuyên cung cấp thuốc đông dược và các thuốc kháng histamin." },
  { id: "s-3", name: "Dược Phẩm Domesco", phone: "02773859370", email: "domesco@domesco.com", address: "352 Nguyễn Huệ, Mỹ Phú, TP. Cao Lãnh, Đồng Tháp", notes: "Cung cấp Ibuprofen và các dòng thuốc kháng viêm." }
];

export const SEED_SERVICES: MedicalService[] = [
  { id: "srv-1", name: "Khám bệnh lâm sàng (Bác sĩ chuyên khoa)", price: 100000 },
  { id: "srv-2", name: "Nội soi tai mũi họng nâng cao", price: 250000 },
  { id: "srv-3", name: "Siêu âm ổ bụng tổng quát", price: 200000 },
  { id: "srv-4", name: "Đo điện tâm đồ (ECG)", price: 120000 },
  { id: "srv-5", name: "Xét nghiệm công thức máu toàn bộ (CBC)", price: 150000 }
];

export const SEED_APPOINTMENTS: Appointment[] = [
  { id: "ap-1", patientId: "p-3", patientName: "Lê Phước Hải", phone: "0987654321", appointmentDate: "2026-06-17", appointmentTime: "08:00", symptoms: "Tái khám tiểu đường định kỳ và xét nghiệm máu", status: "đã khám" },
  { id: "ap-2", patientId: "p-1", patientName: "Nguyễn Văn Khang", phone: "0901234567", appointmentDate: "2026-06-17", appointmentTime: "10:30", symptoms: "Đau đầu dữ dội kèm sốt nhẹ", status: "chưa khám" },
  { id: "ap-3", patientId: "p-2", patientName: "Trần Thị Mai", phone: "0918765432", appointmentDate: "2026-06-17", appointmentTime: "14:00", symptoms: "Kiểm tra dạ dày định kỳ", status: "chưa khám" },
  { id: "ap-4", patientName: "Phạm Quốc Bảo", phone: "0909998877", appointmentDate: "2026-06-16", appointmentTime: "15:30", symptoms: "Đau rát họng, ho khan kéo dài 3 ngày", status: "quá hẹn" },
  { id: "ap-5", patientName: "Vũ Hoàng My", phone: "0977665544", appointmentDate: "2026-06-18", appointmentTime: "09:00", symptoms: "Tư vấn dinh dưỡng và xét nghiệm máu tổng quát", status: "chưa khám" }
];

export const SEED_PURCHASE_INVOICES: PurchaseInvoice[] = [
  {
    id: "pi-1",
    supplierId: "s-1",
    importDate: "2026-04-15",
    notes: "Nhập đợt thuốc Amoxicillin 500mg và Paracetamol dự phòng đợt hè.",
    items: [
      { medicineId: "m-1", quantity: 500, importPrice: 8000, totalPrice: 4000000 },
      { medicineId: "m-2", quantity: 2000, importPrice: 400, totalPrice: 800000 }
    ],
    totalAmount: 4800000
  },
  {
    id: "pi-2",
    supplierId: "s-3",
    importDate: "2026-04-20",
    notes: "Nhập thuốc Ibuprofen 400mg bổ sung kho bán lẻ.",
    items: [
      { medicineId: "m-3", quantity: 1000, importPrice: 1100, totalPrice: 1100000 }
    ],
    totalAmount: 1100000
  }
];

export const SEED_CLINIC_CONFIG: ClinicConfig = {
  name: "Phòng Khám Đa Khoa CLINIC CLOUD",
  logo: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=128&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  address: "456 Đường Nguyễn Chí Thanh, Phường 5, Quận 10, TP. Hồ Chí Minh",
  phone: "1900 6060 - 028 3835 1234",
  email: "contact@cliniccloud.vn",
  printSize: "A5",
  enableSTT: true,
  reminderTime: 120,
  enableZaloReminder: true
};

