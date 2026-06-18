/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dynamic date - uses real current date in production
export const SYSTEM_DATE = new Date().toISOString().split('T')[0];

/**
 * Format a number as Vietnamese Dong currency (e.g. 100,000 đ)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

/**
 * Format a date string to Vietnamese date format (e.g. DD/MM/YYYY)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  // If string contains time
  if (dateStr.includes(" ")) {
    const [datePart, timePart] = dateStr.split(" ");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year} ${timePart}`;
  }
  
  if (dateStr.includes("T")) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  
  return dateStr;
}

/**
 * Get current date string formatted as YYYY-MM-DD HH:mm for visit registration
 */
export function getCurrentDateTimeStr(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${SYSTEM_DATE} ${hours}:${minutes}`;
}

import type { MedicineBatch } from "../types";

/**
 * Calculate age based on birth date string YYYY-MM-DD
 */
export function calculateAge(dobStr: string): number {
  if (!dobStr) return 0;
  const birthYear = parseInt(dobStr.split("-")[0]);
  const currentYear = parseInt(SYSTEM_DATE.split("-")[0]);
  return currentYear - birthYear;
}

/**
 * FEFO (First Expired First Out) allocation projection logic.
 * Computes which batches will be deducted for a given medication and quantity.
 */
export function projectFEFOAllocation(
  batches: MedicineBatch[],
  medicineId: string,
  requestedQty: number,
  currentDateStr = SYSTEM_DATE
): {
  allocated: { batchId: string; batchNumber: string; expiryDate: string; qty: number; retailPrice: number; importPrice: number }[];
  satisfied: boolean;
  unmetQty: number;
} {
  // Filter batches for this medicine that have quantity > 0
  const candidateBatches = batches
    .filter((b) => b.medicineId === medicineId && b.currentQty > 0)
    // FEFO: Sort by expiry date ascending
    .sort((a, b) => {
      // Prioritize non-expired batches first
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

