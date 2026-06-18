/**
 * TrialBanner - Shows remaining trial days in the header
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Zap } from 'lucide-react';

export default function TrialBanner() {
  const { trialStatus } = useAuth();

  if (!trialStatus || trialStatus.reason !== 'trial' || !trialStatus.active) {
    return null;
  }

  const daysLeft = trialStatus.days_remaining;
  const isUrgent = daysLeft <= 7;
  const isCritical = daysLeft <= 3;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
        isCritical
          ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
          : isUrgent
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      }`}
    >
      {isCritical ? (
        <Zap className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>
        {isCritical
          ? `⚠️ Còn ${daysLeft} ngày dùng thử!`
          : isUrgent
          ? `Còn ${daysLeft} ngày dùng thử`
          : `Dùng thử · ${daysLeft} ngày còn lại`}
      </span>
    </div>
  );
}
