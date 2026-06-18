/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  key: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => any;
  className?: string;
}

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface TableFilter<T> {
  key: string;
  label: string;
  options: TableFilterOption[];
  filterFn: (item: T, value: string) => boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchFields?: (keyof T | ((item: T) => string))[];
  filters?: TableFilter<T>[];
  pageSize?: number;
  emptyStateText?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Tìm kiếm...",
  searchFields = [],
  filters = [],
  pageSize = 8,
  emptyStateText = "Không tìm thấy dữ liệu phù hợp",
  onRowClick
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter & Search Logic
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.keys(activeFilters).forEach(filterKey => {
      const filterValue = activeFilters[filterKey];
      if (!filterValue) return;
      const filterObj = filters.find(f => f.key === filterKey);
      if (filterObj) {
        result = result.filter(item => filterObj.filterFn(item, filterValue));
      }
    });

    // Apply Search
    if (searchTerm.trim() !== "" && searchFields.length > 0) {
      const query = searchTerm.toLowerCase();
      result = result.filter(item => {
        return searchFields.some(field => {
          if (typeof field === "function") {
            return field(item).toLowerCase().includes(query);
          }
          const val = item[field];
          return val ? String(val).toLowerCase().includes(query) : false;
        });
      });
    }

    // Apply Sorting
    if (sortConfig) {
      const col = columns.find(c => c.key === sortConfig.key);
      result.sort((a, b) => {
        let valA = col?.sortValue ? col.sortValue(a) : (a as any)[sortConfig.key];
        let valB = col?.sortValue ? col.sortValue(b) : (b as any)[sortConfig.key];

        // String locale comparison fallback
        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, activeFilters, filters, searchTerm, searchFields, sortConfig, columns]);

  // Handle pagination pages count
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    // Reset page if bounds exceeded
    const adjustedPage = currentPage > totalPages ? 1 : currentPage;
    const startIndex = (adjustedPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, totalPages]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Search */}
        {searchFields.length > 0 && (
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] text-slate-805 dark:text-slate-200"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {/* Custom Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(filter => (
              <div key={filter.key} className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  {filter.label}:
                </span>
                <select
                  className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 px-3 text-[11px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none focus:border-[#0EA5E9]"
                  value={activeFilters[filter.key] || ""}
                  onChange={e => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-150/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-500 dark:text-slate-400">
              <tr>
                {columns.map(col => {
                  const isSorted = sortConfig?.key === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-6 py-4 select-none ${col.sortable ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" : ""} ${col.className || ""}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {isSorted ? (
                              sortConfig?.direction === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 opacity-20" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`${onRowClick ? "cursor-pointer hover:bg-slate-50/85 dark:hover:bg-[#0f172a]/40" : ""} transition-colors duration-150`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className={`px-6 py-3.5 whitespace-nowrap align-middle ${col.className || ""}`}>
                        {col.accessor(item)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 italic">
                    {emptyStateText}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-[#F8FAFC] dark:bg-[#0f172a] px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-450 dark:text-slate-400">
            Hiển thị <span className="text-slate-750 dark:text-slate-200">{Math.min(processedData.length, (currentPage - 1) * pageSize + 1)}-{Math.min(processedData.length, currentPage * pageSize)}</span> trong <span className="text-slate-750 dark:text-slate-200">{processedData.length}</span> kết quả
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer text-slate-650 dark:text-slate-350"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Trang {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer text-slate-650 dark:text-slate-350"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
