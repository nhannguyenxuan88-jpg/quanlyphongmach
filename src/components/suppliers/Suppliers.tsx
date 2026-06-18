/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useClinic } from "../../context/ClinicContext";
import { Supplier } from "../../types";
import { useToast } from "../common/Toast";
import DataTable, { Column } from "../common/DataTable";
import Modal from "../common/Modal";
import { Plus, Edit2, Trash2, Truck, PlusCircle } from "lucide-react";

export default function Suppliers() {
  const { suppliers, saveSupplier, deleteSupplier } = useClinic();
  const { toast, confirm } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setNotes(sup.notes);
    setModalOpen(true);
  };

  const handleDelete = (sup: Supplier) => {
    confirm(
      `Bạn có chắc chắn muốn xóa nhà cung cấp "${sup.name}"? Việc này có thể ảnh hưởng đến lịch sử phiếu nhập liên quan.`,
      () => {
        deleteSupplier(sup.id);
        toast(`Đã xóa nhà cung cấp "${sup.name}" thành công!`, "success");
      },
      "Xác nhận xóa"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast("Vui lòng điền tên và số điện thoại nhà cung cấp", "error");
      return;
    }

    const supplierData: Supplier = {
      id: editingSupplier ? editingSupplier.id : "s-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim()
    };

    saveSupplier(supplierData);
    setModalOpen(false);
    toast(
      editingSupplier
        ? `Đã cập nhật thông tin nhà cung cấp "${name}"!`
        : `Đã thêm nhà cung cấp "${name}" thành công!`,
      "success"
    );
  };

  // Define Table columns
  const columns: Column<Supplier>[] = [
    {
      header: "Tên Nhà Cung Cấp",
      key: "name",
      sortable: true,
      accessor: (sup) => (
        <div className="font-extrabold text-slate-800 dark:text-slate-200">{sup.name}</div>
      )
    },
    {
      header: "Số Điện Thoại",
      key: "phone",
      sortable: true,
      accessor: (sup) => <span className="font-semibold text-slate-700 dark:text-slate-300">{sup.phone}</span>
    },
    {
      header: "Email",
      key: "email",
      accessor: (sup) => <span className="text-slate-500 dark:text-slate-400">{sup.email || "---"}</span>
    },
    {
      header: "Địa Chỉ",
      key: "address",
      accessor: (sup) => (
        <div className="max-w-[200px] truncate text-slate-500 dark:text-slate-400" title={sup.address}>
          {sup.address || "---"}
        </div>
      )
    },
    {
      header: "Ghi Chú",
      key: "notes",
      accessor: (sup) => (
        <div className="max-w-[150px] truncate italic text-slate-400 dark:text-slate-500" title={sup.notes}>
          {sup.notes || "Không có"}
        </div>
      )
    },
    {
      header: "Thao Tác",
      key: "actions",
      accessor: (sup) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(sup);
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#0EA5E9] hover:bg-sky-50 dark:hover:bg-[#0f172a] transition-all cursor-pointer"
            title="Sửa thông tin"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(sup);
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-455 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-6" id="suppliers-module">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#0EA5E9]" />
            Nhà Cung Cấp Dược Phẩm
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Quản lý danh mục đối tác phân phối dược phẩm của phòng khám
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#0EA5E9] hover:bg-sky-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-100 dark:shadow-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Nhà Cung Cấp
        </button>
      </div>

      {/* SUPPLIERS DATA TABLE */}
      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Tìm kiếm tên, số điện thoại..."
        searchFields={["name", "phone", "email", "address"]}
        pageSize={8}
      />

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? "Cập Nhật Nhà Cung Cấp" : "Thêm Nhà Cung Cấp Mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supplier Name */}
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tên Nhà Cung Cấp *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Nhập tên nhà cung cấp..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Số Điện Thoại *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Ví dụ: 028 3835 1234"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</label>
              <input
                type="email"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="contact@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Địa Chỉ</label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Nhập địa chỉ trụ sở..."
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ghi Chú</label>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#0EA5E9] h-20"
              placeholder="Ghi chú về mặt hàng chính, thời gian giao nhận..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="border border-slate-200 dark:border-slate-755 text-slate-650 dark:text-slate-350 hover:bg-slate-50 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="bg-[#0EA5E9] hover:bg-sky-600 text-white px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              {editingSupplier ? "Lưu thay đổi" : "Thêm nhà cung cấp"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
