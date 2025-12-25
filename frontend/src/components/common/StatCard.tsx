import React from "react";
export const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);
