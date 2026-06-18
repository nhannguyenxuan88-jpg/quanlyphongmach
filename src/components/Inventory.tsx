/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useClinic } from "../context/ClinicContext";
import CatalogTab from "./inventory/CatalogTab";
import BatchesFEFOTab from "./inventory/BatchesFEFOTab";
import AlertsTab from "./inventory/AlertsTab";
import StockLogsTab from "./inventory/StockLogsTab";
import Modal from "./common/Modal";
import { useToast } from "./common/Toast";
import { Package, Layers, AlertCircle, PlusCircle, Search, FileText, Download } from "lucide-react";
import { Medicine, MedicineBatch } from "../types";
import { exportToCSV } from "../lib/exportUtils";

interface InventoryProps {
  currentUser?: any;
  onActionTrigger?: () => void;
}

export default function Inventory({ currentUser, onActionTrigger }: InventoryProps) {
  const {
    medicines,
    batches,
    stockLogs,
    registerMedicine,
    importMedicineBatch,
    currentUser: contextUser
  } = useClinic();
  const { toast } = useToast();

  const activeUser = currentUser || contextUser;

  // Filter tab switcher states
  const [activeTab, setActiveTab] = useState<"catalog" | "batches" | "warnings" | "logs">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  // Modals visibility
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form States - Add Medicine
  const [medName, setMedName] = useState("");
  const [medActive, setMedActive] = useState("");
  const [medUnit, setMedUnit] = useState("Viên");
  const [medGroup, setMedGroup] = useState("Giảm đau, hạ sốt");
  const [medManufacturer, setMedManufacturer] = useState("");
  const [medMinStock, setMedMinStock] = useState(100);

  // Form States - Import Batch
  const [importMedId, setImportMedId] = useState("");
  const [importBatchNo, setImportBatchNo] = useState("");
  const [importExpiry, setImportExpiry] = useState("2027-01-01");
  const [importQty, setImportQty] = useState(500);
  const [importPrice, setImportPrice] = useState(1000);
  const [importRetail, setImportRetail] = useState(1800);

  // Pre-fill fields on modal open
  useEffect(() => {
    if (showImportModal && medicines.length > 0 && !importMedId) {
      setImportMedId(medicines[0].id);
    }
  }, [showImportModal, medicines, importMedId]);

  // Submit adding medicine
  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medActive.trim()) {
      toast("Vui lòng cung cấp tên thuốc và công thức hoạt chất!", "warning");
      return;
    }

    registerMedicine({
      name: medName.trim(),
      activeIngredient: medActive.trim(),
      unit: medUnit,
      group: medGroup,
      manufacturer: medManufacturer.trim() || "Trong nước",
      minStock: medMinStock
    });

    setShowAddMedModal(false);
    toast(`Đã thêm thuốc "${medName}" vào danh mục phòng mạch!`, "success");
    if (onActionTrigger) onActionTrigger();
  };

  // Submit importing batch
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importMedId || !importBatchNo.trim() || importQty <= 0) {
      toast("Vui lòng nhập đầy đủ thông tin lô thuốc cần nhập!", "warning");
      return;
    }

    importMedicineBatch(
      importMedId,
      importBatchNo,
      importExpiry,
      importQty,
      importPrice,
      importRetail
    );

    setShowImportModal(false);
    toast(`Nhập kho thành công lô thuốc ${importBatchNo.toUpperCase()}!`, "success");
    if (onActionTrigger) onActionTrigger();
  };

  const handleExportData = () => {
    if (activeTab === "catalog") {
      const exportData = medicines.map(m => {
        const totalStock = batches.filter(b => b.medicineId === m.id).reduce((sum, b) => sum + b.currentQty, 0);
        return {
          name: m.name,
          activeIngredient: m.activeIngredient,
          group: m.group,
          unit: m.unit,
          minStock: m.minStock,
          totalStock: totalStock,
          manufacturer: m.manufacturer,
          status: totalStock === 0 ? "Hết thuốc" : totalStock < m.minStock ? "Cần nhập thêm" : "Hữu dụng"
        };
      });
      exportToCSV(exportData, "Danh_muc_duoc_pham", {
        name: "Tên Dược Phẩm",
        activeIngredient: "Hoạt Chất",
        group: "Phân Nhóm",
        unit: "Đơn Vị Tính",
        minStock: "Tồn Tối Thiểu",
        totalStock: "Tổng Tồn Kho",
        manufacturer: "Nhà Sản Xuất",
        status: "Trạng Thái"
      });
      toast("Đã xuất danh mục dược phẩm thành công!", "success");
    } else if (activeTab === "batches") {
      const exportData = batches.map(b => {
        const med = medicines.find(m => m.id === b.medicineId);
        return {
          batchNo: b.batchNo.toUpperCase(),
          medicineName: med ? med.name : "Không xác định",
          currentQty: b.currentQty,
          expiryDate: b.expiryDate,
          importPrice: b.importPrice,
          retailPrice: b.retailPrice,
          importDate: b.importDate
        };
      });
      exportToCSV(exportData, "Danh_sach_lo_thuoc_FEFO", {
        batchNo: "Mã Số Lô",
        medicineName: "Tên Dược Phẩm",
        currentQty: "Tồn Kho Hiện Tại",
        expiryDate: "Hạn Sử Dụng",
        importPrice: "Giá Nhập Lô",
        retailPrice: "Đơn Giá Bán",
        importDate: "Ngày Nhập Lô"
      });
      toast("Đã xuất danh sách lô thuốc FEFO thành công!", "success");
    }
  };

  // Distinct groups for select filter
  const medicineGroups = Array.from(new Set(medicines.map((m) => m.group)));

  return (
    <div className="space-y-6" id="inventory-module">
      
      {/* Header Widget Dashboard */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-xl bento-card">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Vận Hành Kho Dược & Lô Thuốc FEFO
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
            Quản lý cấu hình danh mục thuốc, công nợ nhập hàng và chi tiết xuất kho theo hạn sử dụng ngắn trước (FEFO).
          </p>
        </div>

        {/* Action Button triggers */}
        {(activeUser.role === "pharmacist" || activeUser.role === "manager") && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setMedName("");
                setMedActive("");
                setMedManufacturer("");
                setMedMinStock(100);
                setShowAddMedModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer"
            >
              Khai Tên Thuốc
            </button>
            <button
              onClick={() => {
                setImportBatchNo("");
                setImportQty(500);
                setImportPrice(1000);
                setImportRetail(1800);
                setShowImportModal(true);
              }}
              className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow shadow-indigo-900/40 flex-1 sm:flex-initial cursor-pointer"
            >
              Nhập Lô Hàng
            </button>
          </div>
        )}
      </div>

      {/* Tabs list selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto custom-scrollbar font-bold text-xs select-none">
        <button
          onClick={() => {
            setActiveTab("catalog");
            setSearchQuery("");
          }}
          className={`py-3.5 px-4 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "catalog" ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4" /> Danh Mục Dược Phẩm ({medicines.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("batches");
            setSearchQuery("");
          }}
          className={`py-3.5 px-4 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "batches" ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" /> Chi Tiết Lô Hàng FEFO ({batches.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("warnings");
            setSearchQuery("");
          }}
          className={`py-3.5 px-4 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "warnings" ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <AlertCircle className="w-4 h-4" /> Cảnh Báo An Toàn
        </button>
        <button
          onClick={() => {
            setActiveTab("logs");
            setSearchQuery("");
          }}
          className={`py-3.5 px-4 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "logs" ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 dark:border-indigo-400 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Nhật Ký Giao Dịch ({stockLogs.length})
        </button>
      </div>

      {/* Filter and search parameters */}
      {activeTab !== "logs" && activeTab !== "warnings" && (
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bento-card">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên thuốc, công thức hoạt chất, mã lô..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a]/40 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:bg-white dark:focus:bg-[#0f172a]/60 dark:text-slate-200 transition font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Nhóm dược:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-slate-55 dark:bg-[#0f172a]/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-slate-200 font-bold"
            >
              <option value="all">Tất cả nhóm thuốc</option>
              {medicineGroups.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleExportData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow shadow-emerald-900/10 cursor-pointer ml-2 whitespace-nowrap"
              title="Xuất danh sách đang chọn sang Excel"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Screen rendering */}
      <div className="transition-all duration-300">
        {activeTab === "catalog" && <CatalogTab searchQuery={searchQuery} groupFilter={groupFilter} />}
        {activeTab === "batches" && <BatchesFEFOTab searchQuery={searchQuery} groupFilter={groupFilter} />}
        {activeTab === "warnings" && <AlertsTab />}
        {activeTab === "logs" && <StockLogsTab />}
      </div>

      {/* ======================================================= MODALS ======================================================= */}

      {/* MODAL 1: ADD MEDICINE (Khai báo tên biệt dược) */}
      <Modal isOpen={showAddMedModal} onClose={() => setShowAddMedModal(false)} title="Khai báo dược phẩm mới">
        <form onSubmit={handleAddMedicineSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-700 dark:text-slate-300">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
              Tên thương hiệu biệt dược *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Hapacol 500mg, Augmentin 1g..."
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0f172a]/60 dark:text-slate-200 transition"
            />
          </div>

          <div>
            <label className="block text-slate-505 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
              Hoạt chất chính (công thức y khoa) *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Paracetamol, Amoxicillin-Clavulanic..."
              value={medActive}
              onChange={(e) => setMedActive(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0f172a]/60 dark:text-slate-200 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">Phân nhóm y khoa</label>
              <select
                value={medGroup}
                onChange={(e) => setMedGroup(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0f172a]/65 dark:text-slate-200 transition font-bold"
              >
                <option value="Kháng sinh">Kháng sinh</option>
                <option value="Giảm đau, hạ sốt">Giảm đau, hạ sốt</option>
                <option value="Giảm đau, kháng viêm">Giảm đau, kháng viêm</option>
                <option value="Kháng Histamin - Trị dị ứng">Kháng Histamin - Trị dị ứng</option>
                <option value="Trị tiểu đường">Trị tiểu đường</option>
                <option value="Giãn phế quản - Trị hen suyễn">Giãn phế quản - Trị hen suyễn</option>
                <option value="Hỗ trợ tiêu hóa, trào ngược">Hỗ trợ tiêu hóa, trào ngược</option>
                <option value="Thuốc bổ, Vitamin">Thuốc bổ, Vitamin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">Đơn vị tính (ĐVT) *</label>
              <select
                value={medUnit}
                onChange={(e) => setMedUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0f172a]/65 dark:text-slate-200 transition font-bold"
              >
                <option value="Viên">Viên</option>
                <option value="Vỉ">Vỉ</option>
                <option value="Lọ">Lọ</option>
                <option value="Hộp">Hộp</option>
                <option value="Ống">Ống</option>
                <option value="Chai">Chai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-505 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Định mức tồn tối thiểu *
              </label>
              <input
                type="number"
                min={10}
                value={medMinStock}
                onChange={(e) => setMedMinStock(parseInt(e.target.value) || 50)}
                className="w-full bg-slate-55 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">Nhà sản xuất</label>
              <input
                type="text"
                placeholder="OPV, Mekophar, DHG..."
                value={medManufacturer}
                onChange={(e) => setMedManufacturer(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddMedModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Đóng lại
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
            >
              Khai Tên Thuốc
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: IMPORT BATCH (Nhập lô thuốc FEFO) */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Phiếu nhập lô hàng kho dược">
        <form onSubmit={handleImportSubmit} className="space-y-4 text-left font-semibold text-xs text-slate-705 dark:text-slate-300">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
              Chọn nhãn dược phẩm *
            </label>
            <select
              value={importMedId}
              onChange={(e) => setImportMedId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 font-bold"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.activeIngredient}) [{m.unit}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Mã ký hiệu lô *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: AMX-2601"
                value={importBatchNo}
                onChange={(e) => setImportBatchNo(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 uppercase font-black tracking-wider"
              />
            </div>

            <div>
              <label className="block text-slate-550 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Hạn sử dụng (EXP) *
              </label>
              <input
                type="date"
                required
                value={importExpiry}
                onChange={(e) => setImportExpiry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 text-blue-900 dark:text-blue-400 font-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
              Số lượng nhập kho ban đầu *
            </label>
            <input
              type="number"
              min={1}
              required
              value={importQty}
              onChange={(e) => setImportQty(parseInt(e.target.value) || 100)}
              className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-200 font-black text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-550 dark:text-slate-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Giá vốn nhập kho (VNĐ) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={importPrice}
                onChange={(e) => setImportPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 text-right font-mono"
              />
            </div>

            <div>
              <label className="block text-indigo-650 dark:text-indigo-400 mb-1 uppercase tracking-wide text-[10px] font-bold">
                Giá niêm yết bán ra *
              </label>
              <input
                type="number"
                min={0}
                required
                value={importRetail}
                onChange={(e) => setImportRetail(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-[#0f172a]/20 px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 dark:text-indigo-400 text-indigo-750 dark:text-indigo-300 text-right font-mono font-black"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-150 cursor-pointer"
            >
              Nhập Kho
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
