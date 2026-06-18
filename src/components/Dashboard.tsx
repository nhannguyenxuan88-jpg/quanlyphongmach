/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import StatsOverview from "./dashboard/StatsOverview";
import PerformanceLeaderboard from "./dashboard/PerformanceLeaderboard";
import DebtTracker from "./dashboard/DebtTracker";

interface DashboardProps {
  currentUser?: any;
  onActionTrigger?: () => void;
}

export default function Dashboard({ currentUser, onActionTrigger }: DashboardProps) {
  return (
    <div className="space-y-6 text-left" id="dashboard-module">
      
      {/* Dashboard Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-150 uppercase tracking-wide">
            Bảng Điều Khiển ERP
          </h2>
          <p className="text-[11px] text-slate-405 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Báo cáo hiệu suất hoạt động lâm sàng, tài chính & doanh số dược phẩm
          </p>
        </div>
      </div>

      {/* 4 core metric figures */}
      <StatsOverview />

      {/* Grid of leaderboards & tables */}
      <PerformanceLeaderboard />

      {/* Patient debts logs ledger */}
      <DebtTracker />

    </div>
  );
}
