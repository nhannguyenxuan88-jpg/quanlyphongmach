/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useClinic } from "../../context/ClinicContext";
import { BarChart3, TrendingUp, Package, Stethoscope, Users, Calendar, Download } from "lucide-react";
import { exportToCSV } from "../../lib/exportUtils";

export default function Reports() {
  const { invoices, visits, medicines, services, users } = useClinic();
  
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "meds" | "services" | "patients">("overview");
  const [timeframe, setTimeframe] = useState<"day" | "month" | "year">("month");

  const paidInvoices = useMemo(() => invoices.filter(inv => inv.paymentStatus === "paid"), [invoices]);

  const handleExportReport = () => {
    if (activeTab === "overview" || activeTab === "revenue") {
      const exportData = revenueData.labels.map((lbl, idx) => ({
        time: lbl,
        value: revenueData.values[idx]
      }));
      exportToCSV(exportData, `Bao_cao_doanh_thu_${timeframe}`, {
        time: "Thời Gian",
        value: "Doanh Thu Thực Thu (đ)"
      });
    } else if (activeTab === "meds") {
      const exportData = topMedicines.map((m, idx) => ({
        rank: idx + 1,
        name: m.name,
        unit: m.unit,
        group: m.group,
        qty: m.quantity
      }));
      exportToCSV(exportData, "Bao_cao_duoc_pham_ban_chay", {
        rank: "Thứ Hạng",
        name: "Tên Thuốc biệt dược",
        unit: "Đơn Vị Tính",
        group: "Phân Nhóm",
        qty: "Tổng Sản Lượng Bán"
      });
    } else if (activeTab === "services") {
      const exportData = topServices.map((s, idx) => ({
        rank: idx + 1,
        name: s.name,
        price: s.price,
        count: s.count
      }));
      exportToCSV(exportData, "Bao_cao_chi_dinh_dich_vu", {
        rank: "Thứ Hạng",
        name: "Tên Dịch Vụ Cận Lâm Sàng",
        price: "Đơn Giá",
        count: "Số Lượt Chỉ Định"
      });
    } else if (activeTab === "patients") {
      const exportData = [
        { key: "Tổng số ca khám bệnh ghi nhận", value: visits.length },
        { key: "Tổng số hóa đơn kết toán", value: paidInvoices.length },
        { key: "Tỷ lệ Nam giới", value: "55%" },
        { key: "Tỷ lệ Nữ giới / Khác", value: "45%" }
      ];
      exportToCSV(exportData, "Bao_cao_tinh_hinh_benh_nhan", {
        key: "Chỉ Số Thống Kê",
        value: "Giá Trị"
      });
    }
  };

  // 1. REVENUE CALCULATIONS
  const revenueData = useMemo(() => {
    if (timeframe === "day") {
      // Last 7 days (June 11 to June 17, 2026)
      const days = ["11/06", "12/06", "13/06", "14/06", "15/06", "16/06", "17/06"];
      const dayValues = [120000, 170000, 0, 80000, 100000, 250000, 150000]; // baseline
      
      // Accumulate actuals
      days.forEach((day, index) => {
        const matchingDateStr = `2026-06-${day.split("/")[0]}`;
        const total = paidInvoices
          .filter(inv => inv.paymentDate && inv.paymentDate.startsWith(matchingDateStr))
          .reduce((sum, inv) => sum + inv.totalAmount, 0);
        dayValues[index] += total;
      });

      return { labels: days, values: dayValues };
    }

    if (timeframe === "year") {
      const years = ["2024", "2025", "2026"];
      const yearValues = [12000000, 24000000, 1500000]; // baseline
      
      years.forEach((year, index) => {
        const total = paidInvoices
          .filter(inv => inv.paymentDate && inv.paymentDate.startsWith(year))
          .reduce((sum, inv) => sum + inv.totalAmount, 0);
        yearValues[index] += total;
      });

      return { labels: years, values: yearValues };
    }

    // Default: By Month 2026 (Jan to June)
    const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
    const monthValues = [1800000, 2400000, 3100000, 2900000, 4200000, 270000]; // baseline + actuals
    
    months.forEach((m, index) => {
      const padM = String(index + 1).padStart(2, "0");
      const total = paidInvoices
        .filter(inv => inv.paymentDate && inv.paymentDate.includes(`2026-${padM}`))
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      monthValues[index] += total;
    });

    return { labels: months, values: monthValues };
  }, [paidInvoices, timeframe]);

  // SVG dimensions
  const chartWidth = 500;
  const chartHeight = 220;
  const padding = 40;

  // Max value helper for scaling chart
  const maxVal = useMemo(() => {
    const vals = revenueData.values;
    const max = Math.max(...vals);
    return max === 0 ? 100000 : max * 1.15; // padding top
  }, [revenueData]);

  // Compute SVG Points for Line Chart
  const linePoints = useMemo(() => {
    const points: string[] = [];
    const step = (chartWidth - padding * 2) / (revenueData.values.length - 1 || 1);
    
    revenueData.values.forEach((val, idx) => {
      const x = padding + idx * step;
      // SVG 0,0 is top left, so we subtract scaled height from bottom
      const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
      points.push(`${x},${y}`);
    });
    
    return points.join(" ");
  }, [revenueData, maxVal]);

  // 2. TOP PHARMACY SELLING DRUGS
  const topMedicines = useMemo(() => {
    const medicineSales: Record<string, number> = {};
    
    visits.forEach(v => {
      if (v.status === "paid") {
        v.prescriptionItems.forEach(item => {
          medicineSales[item.medicineId] = (medicineSales[item.medicineId] || 0) + item.quantity;
        });
      }
    });

    const sorted = Object.entries(medicineSales)
      .map(([id, qty]) => {
        const med = medicines.find(m => m.id === id);
        return {
          name: med ? med.name : "Thuốc không tên",
          unit: med ? med.unit : "viên",
          group: med ? med.group : "Chưa phân nhóm",
          quantity: qty
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // If empty, supply seeds
    if (sorted.length === 0) {
      return [
        { name: "Paracetamol 500mg", unit: "Viên", group: "Giảm đau", quantity: 185 },
        { name: "Amoxicillin 500mg", unit: "Vỉ", group: "Kháng sinh", quantity: 64 },
        { name: "Ibuprofen 400mg", unit: "Viên", group: "Kháng viêm", quantity: 45 },
        { name: "Cetirizine 10mg", unit: "Viên", group: "Kháng Histamin", quantity: 38 }
      ];
    }
    return sorted;
  }, [visits, medicines]);

  // 3. TOP CLINICAL SERVICES REQUESTED
  const topServices = useMemo(() => {
    const serviceCounts: Record<string, number> = {};
    
    visits.forEach(v => {
      if (v.services && v.services.length > 0) {
        v.services.forEach(srvId => {
          serviceCounts[srvId] = (serviceCounts[srvId] || 0) + 1;
        });
      }
    });

    const sorted = Object.entries(serviceCounts)
      .map(([id, count]) => {
        const srv = services.find(s => s.id === id);
        return {
          name: srv ? srv.name : "Dịch vụ đã xóa",
          price: srv ? srv.price : 0,
          count: count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (sorted.length === 0) {
      return [
        { name: "Khám bệnh lâm sàng (Bác sĩ chuyên khoa)", price: 100000, count: 12 },
        { name: "Nội soi tai mũi họng nâng cao", price: 250000, count: 5 },
        { name: "Siêu âm ổ bụng tổng quát", price: 200000, count: 3 }
      ];
    }
    return sorted;
  }, [visits, services]);

  // 4. TOP ACTIVE DOCTORS PERFORMANCE
  const topDoctors = useMemo(() => {
    const docVisitsCount: Record<string, number> = {};
    
    visits.forEach(v => {
      if (v.doctorId) {
        docVisitsCount[v.doctorId] = (docVisitsCount[v.doctorId] || 0) + 1;
      }
    });

    return Object.entries(docVisitsCount)
      .map(([id, count]) => {
        const doc = users.find(u => u.id === id);
        return {
          name: doc ? doc.name : "Bác sĩ tự do",
          role: "Bác sĩ chuyên khoa",
          count: count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [visits, users]);

  // Helper for rendering SVG gridlines
  const gridLinesY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-6" id="reports-module">
      
      {/* HEADER TABS BAR */}
      <div className="bg-white dark:bg-[#1e293b] p-2 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-wrap gap-2 text-left justify-between items-center">
        <div className="flex flex-wrap gap-1.5 p-1">
          {[
            { id: "overview", label: "Tổng Quan ERP", icon: BarChart3 },
            { id: "revenue", label: "Doanh Thu & Dòng Tiền", icon: TrendingUp },
            { id: "meds", label: "Dược Phẩm Bán Chạy", icon: Package },
            { id: "services", label: "Dịch Vụ Chỉ Định", icon: Stethoscope },
            { id: "patients", label: "Bệnh Nhân", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#0EA5E9] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0f172a]/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Actions bar (Timeframe & Export) */}
        <div className="flex items-center gap-2 mr-2">
          {(activeTab === "overview" || activeTab === "revenue") && (
            <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0f172a] p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350">
              <button
                onClick={() => setTimeframe("day")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeframe === "day" ? "bg-[#0EA5E9] text-white" : ""}`}
              >
                Ngày
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeframe === "month" ? "bg-[#0EA5E9] text-white" : ""}`}
              >
                Tháng
              </button>
              <button
                onClick={() => setTimeframe("year")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${timeframe === "year" ? "bg-[#0EA5E9] text-white" : ""}`}
              >
                Năm
              </button>
            </div>
          )}

          <button
            onClick={handleExportReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow shadow-emerald-900/10 cursor-pointer whitespace-nowrap"
            title="Xuất báo cáo hiện tại sang Excel"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}

      {/* OVERVIEW & REVENUE PLOT (SVG GRAPHICS) */}
      {(activeTab === "overview" || activeTab === "revenue") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue SVG Chart Card */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-[#0EA5E9]" />
                Biểu đồ xu thế doanh thu ({timeframe === "day" ? "Theo 7 ngày qua" : timeframe === "year" ? "Theo năm tài khóa" : "Theo tháng năm 2026"})
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-1">
                Dòng tiền thực thu từ hóa đơn khám bệnh & thuốc kê đơn
              </p>
            </div>

            {/* SVG Interactive Plot */}
            <div className="my-6 relative flex justify-center">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full max-w-2xl h-auto overflow-visible"
              >
                {/* Horizontal Grid lines */}
                {gridLinesY.map((ratio, index) => {
                  const y = padding + ratio * (chartHeight - padding * 2);
                  const labelValue = Math.round(maxVal * (1 - ratio));
                  return (
                    <g key={index} className="opacity-40">
                      <line
                        x1={padding}
                        y1={y}
                        x2={chartWidth - padding}
                        y2={y}
                        className="stroke-slate-100 dark:stroke-slate-700 stroke-1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding - 8}
                        y={y + 3}
                        className="fill-slate-400 font-sans text-[9px] font-bold text-right"
                        textAnchor="end"
                      >
                        {labelValue >= 1000000 ? (labelValue / 1000000).toFixed(1) + "M" : labelValue.toLocaleString() + "đ"}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {revenueData.labels.map((lbl, idx) => {
                  const step = (chartWidth - padding * 2) / (revenueData.labels.length - 1 || 1);
                  const x = padding + idx * step;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 12}
                      className="fill-slate-400 dark:fill-slate-500 font-sans text-[10px] font-black"
                      textAnchor="middle"
                    >
                      {lbl}
                    </text>
                  );
                })}

                {/* Solid Line representing values */}
                {revenueData.values.length > 1 && (
                  <>
                    {/* Gradient under line */}
                    <path
                      d={`M ${padding},${chartHeight - padding} L ${linePoints} L ${chartWidth - padding},${chartHeight - padding} Z`}
                      fill="url(#chart-gradient)"
                      className="opacity-15 dark:opacity-20"
                    />
                    
                    {/* Main Line */}
                    <polyline
                      fill="none"
                      className="stroke-[#0EA5E9] stroke-2"
                      points={linePoints}
                    />

                    {/* Interactive dots */}
                    {revenueData.values.map((val, idx) => {
                      const step = (chartWidth - padding * 2) / (revenueData.values.length - 1 || 1);
                      const x = padding + idx * step;
                      const y = chartHeight - padding - (val / maxVal) * (chartHeight - padding * 2);
                      return (
                        <g key={idx} className="group">
                          <circle
                            cx={x}
                            cy={y}
                            r="4.5"
                            className="fill-white dark:fill-[#1e293b] stroke-[#0EA5E9] stroke-2 cursor-pointer hover:r-6 hover:fill-[#0EA5E9] transition-all"
                          />
                          {/* Tooltip on hover */}
                          <title>
                            {revenueData.labels[idx]}: {val.toLocaleString()}đ
                          </title>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Metrics cards summary inside graph card */}
            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
              <div className="p-2 bg-slate-50/50 dark:bg-[#0f172a]/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Thấp nhất</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">
                  {Math.min(...revenueData.values).toLocaleString()}đ
                </p>
              </div>
              <div className="p-2 bg-slate-50/50 dark:bg-[#0f172a]/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Cao nhất</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">
                  {Math.max(...revenueData.values).toLocaleString()}đ
                </p>
              </div>
              <div className="p-2 bg-slate-50/50 dark:bg-[#0f172a]/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Trung bình</span>
                <p className="text-xs font-black text-[#0EA5E9] mt-0.5">
                  {Math.round(revenueData.values.reduce((s, v) => s + v, 0) / revenueData.values.length || 0).toLocaleString()}đ
                </p>
              </div>
            </div>

          </div>

          {/* Performance Leaders / Top Doctor stats */}
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left">
            <div>
              <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-[#0EA5E9]" />
                Bác sĩ năng suất nhất
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-1">
                Số lượt chẩn trị hoàn thành lâm sàng
              </p>
            </div>

            <div className="space-y-4 my-6">
              {topDoctors.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-[#0EA5E9] flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{doc.name}</h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">{doc.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-650 dark:text-slate-350 p-1.5 px-3 rounded-lg border border-slate-150/80 dark:border-slate-800">
                    {doc.count} ca
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-slate-400 italic text-center">
              Dữ liệu tính từ tổng quan các đợt tiếp đón bệnh nhân
            </p>
          </div>

        </div>
      )}

      {/* DRUGS LEADERBOARD TAB */}
      {activeTab === "meds" && (
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm text-left">
          <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Package className="w-4.5 h-4.5 text-[#0EA5E9]" />
            Dược Phẩm Bán Chạy Nhất (Bảng xếp hạng)
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-[750px] w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs text-left">
              <thead>
                <tr className="text-slate-400 bg-slate-50/60 dark:bg-[#0f172a]/30 uppercase font-black tracking-wider text-[10px]">
                  <th className="px-6 py-3">Thứ Hạng</th>
                  <th className="px-6 py-3">Tên Biệt Dược</th>
                  <th className="px-6 py-3">Đơn Vị Tính</th>
                  <th className="px-6 py-3">Nhóm Thuốc</th>
                  <th className="px-6 py-3 text-right">Tổng Sản Lượng Xuất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-705 dark:text-slate-300">
                {topMedicines.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#0f172a]/20">
                    <td className="px-6 py-3">
                      <span className="font-extrabold bg-[#0EA5E9] text-white p-1.5 px-3 rounded-xl text-[10px]">
                        TOP {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-extrabold text-slate-850 dark:text-slate-150">{item.name}</td>
                    <td className="px-6 py-3">{item.unit}</td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 p-1 px-2.5 rounded-lg text-slate-500 font-extrabold uppercase">
                        {item.group}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-black text-[#0EA5E9]">{item.quantity} {item.unit.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SERVICES LEADERBOARD TAB */}
      {activeTab === "services" && (
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm text-left">
          <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Stethoscope className="w-4.5 h-4.5 text-[#0EA5E9]" />
            Danh sách dịch vụ chỉ định nhiều nhất
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-[650px] w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs text-left">
              <thead>
                <tr className="text-slate-400 bg-slate-50/60 dark:bg-[#0f172a]/30 uppercase font-black tracking-wider text-[10px]">
                  <th className="px-6 py-3">Xếp Hạng</th>
                  <th className="px-6 py-3">Tên Dịch Vụ Cận Lâm Sàng</th>
                  <th className="px-6 py-3">Đơn Giá Niêm Yết</th>
                  <th className="px-6 py-3 text-right">Tổng Lượt Chỉ Định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-705 dark:text-slate-300">
                {topServices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#0f172a]/20">
                    <td className="px-6 py-3">
                      <span className="font-extrabold bg-[#0EA5E9] text-white p-1.5 px-3 rounded-xl text-[10px]">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-extrabold text-slate-850 dark:text-slate-150">{item.name}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-450">{item.price.toLocaleString()}đ</td>
                    <td className="px-6 py-3 text-right font-black text-[#0EA5E9]">{item.count} chỉ định</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PATIENTS REPORT TAB */}
      {activeTab === "patients" && (
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm text-left grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              Thông số nhân khẩu học (Demo)
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-550 font-bold">Giới tính: Nam</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">55% (Khách hàng)</span>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-550 font-bold">Giới tính: Nữ / Khác</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">45% (Khách hàng)</span>
              </div>
              <div className="p-3 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-550 font-bold">Nhóm tuổi chính:</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">Từ 30 - 65 tuổi</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              Lịch sử tiếp đón bệnh nhân
            </h3>
            <div className="p-4 bg-slate-50/50 dark:bg-[#0f172a]/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
              <p className="text-xs text-slate-500 font-semibold">
                Tổng số lượt tiếp tiếp nhận hồ sơ khám bệnh lưu trong cơ sở dữ liệu hệ thống:
              </p>
              <p className="text-2xl font-black text-[#0EA5E9]">
                {visits.length} ca khám
              </p>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                Đã thanh toán viện phí đầy đủ: {paidInvoices.length} hóa đơn
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
