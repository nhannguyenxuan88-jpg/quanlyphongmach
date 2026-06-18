/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useClinic } from "../../context/ClinicContext";
import { Medicine } from "../../types";

interface CatalogTabProps {
  searchQuery: string;
  groupFilter: string;
}

export default function CatalogTab({ searchQuery, groupFilter }: CatalogTabProps) {
  const { medicines, batches } = useClinic();

  const getMedicineStockTotal = (medId: string) => {
    return batches
      .filter((b) => b.medicineId === medId)
      .reduce((sum, b) => sum + b.currentQty, 0);
  };

  const getMedicineStockStatus = (m: Medicine) => {
    const total = getMedicineStockTotal(m.id);
    if (total === 0) {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full dark:bg-rose-950/40 dark:text-rose-450 dark:border-rose-900/60 whitespace-nowrap">
          Hết thuốc
        </span>
      );
    }
    if (total < m.minStock) {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full dark:bg-amber-950/40 dark:text-amber-450 dark:border-amber-900/60 whitespace-nowrap">
          Cần nhập thêm
        </span>
      );
    }
    return (
      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full font-mono dark:bg-emerald-950/40 dark:text-emerald-450 dark:border-emerald-900/60 whitespace-nowrap">
        Hữu dụng
      </span>
    );
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === "all" || m.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden text-left bento-card font-semibold text-xs text-slate-700 dark:text-slate-300">
      
      {/* Desktop Table view */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4 text-left">Tên Dược Phẩm</th>
              <th className="p-4 text-left">Hoạt Chất Điều Trị</th>
              <th className="p-4 text-left">Phân Nhóm</th>
              <th className="p-4 text-center">ĐVT</th>
              <th className="p-4 text-center">Tồn tối thiểu</th>
              <th className="p-4 text-center">Tổng tồn kho</th>
              <th className="p-4 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400 dark:text-slate-500 italic">
                  Không tìm thấy nhãn thuốc nào khớp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredMedicines.map((m) => {
                const totalQty = getMedicineStockTotal(m.id);
                return (
                  <tr key={m.id} className="text-slate-800 dark:text-slate-300 hover:bg-slate-50/40 dark:hover:bg-[#0f172a]/20 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{m.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold">NSX: {m.manufacturer}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 font-medium">{m.activeIngredient}</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-205">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-extrabold">
                        {m.group}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 text-center font-medium">{m.unit}</td>
                    <td className="p-4 text-xs font-bold text-slate-400 dark:text-slate-550 text-center">{m.minStock}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg font-mono ${
                          totalQty === 0
                            ? "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
                            : totalQty < m.minStock
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-450"
                        }`}
                      >
                        {totalQty}
                      </span>
                    </td>
                    <td className="p-4 text-center">{getMedicineStockStatus(m)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view */}
      <div className="block md:hidden p-4 space-y-3">
        {filteredMedicines.length === 0 ? (
          <div className="p-8 text-center text-slate-450 dark:text-slate-500 italic">Không tìm thấy nhãn thuốc nào.</div>
        ) : (
          filteredMedicines.map((m) => {
            const totalQty = getMedicineStockTotal(m.id);
            return (
              <div key={m.id} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/30 dark:bg-[#0f172a]/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{m.name}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold mt-0.5">NSX: {m.manufacturer}</span>
                  </div>
                  {getMedicineStockStatus(m)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2 font-semibold">
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Hoạt chất</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{m.activeIngredient}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Phân nhóm</span>
                    <span className="bg-slate-105 dark:bg-slate-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg inline-block mt-0.5 dark:text-slate-300">
                      {m.group}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">ĐVT / Tối thiểu</span>
                    <span className="text-slate-655 dark:text-slate-400 font-medium">{m.unit} (Min: {m.minStock})</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wide">Tổng tồn kho</span>
                    <span
                      className={`text-xs font-black font-mono ${
                        totalQty === 0 ? "text-red-500 dark:text-red-400" : totalQty < m.minStock ? "text-amber-600 dark:text-amber-400" : "text-teal-605 dark:text-teal-400"
                      }`}
                    >
                      {totalQty}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
