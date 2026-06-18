/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SkeletonProps {
  type?: "table" | "cards" | "dashboard" | "form" | "generic";
  rows?: number;
}

export default function Skeleton({ type = "generic", rows = 4 }: SkeletonProps) {
  if (type === "table") {
    return (
      <div className="space-y-4 w-full p-4 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/4 mb-6"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded col-span-1"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded col-span-2"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded col-span-1"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded col-span-1"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded col-span-1"></div>
          </div>
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-4 pt-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full animate-pulse">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="space-y-8 w-full">
        <Skeleton type="cards" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton type="table" rows={3} />
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-pulse shadow-sm">
            <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 w-full animate-pulse shadow-sm">
        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-slate-250 dark:bg-slate-650 rounded w-1/3"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-250 dark:bg-slate-650 rounded w-1/3"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="flex justify-end gap-3 pt-2">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-24"></div>
          <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded-xl w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-pulse w-full shadow-sm">
      <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      <div className="h-4 bg-slate-250 dark:bg-slate-650 rounded w-2/3"></div>
    </div>
  );
}
