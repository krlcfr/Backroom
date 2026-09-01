"use client";

import dynamic from "next/dynamic";

export const AdminChartsClient = dynamic(
  () => import("./admin-charts").then((mod) => mod.AdminCharts),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full flex items-center justify-center border border-[#4a4455] rounded-xl bg-[#282a2b] text-[#958da1] animate-pulse">Cargando gráficos...</div>
  }
);
