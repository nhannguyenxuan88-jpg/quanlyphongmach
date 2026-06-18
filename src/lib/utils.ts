/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simulation date configuration (single source of truth for time in the app)
export const SYSTEM_DATE = "2026-06-17";

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

/**
 * Calculate age based on birth date string YYYY-MM-DD
 */
export function calculateAge(dobStr: string): number {
  if (!dobStr) return 0;
  const birthYear = parseInt(dobStr.split("-")[0]);
  const currentYear = parseInt(SYSTEM_DATE.split("-")[0]);
  return currentYear - birthYear;
}
