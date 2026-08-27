"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LimitsData {
  plan: string;
  limits: any;
  current_usage: {
    storage_bytes: number;
    members: number;
    max_depth: number;
    resources: number;
    backrooms: number;
  };
  storage_percentage: number;
}

interface LimitsContextType {
  loading: boolean;
  data: LimitsData | null;
  canCreateBackroom: boolean;
  canCreateSala: (currentDepth: number) => boolean;
  canInviteMember: boolean;
}

const LimitsContext = createContext<LimitsContextType>({
  loading: true,
  data: null,
  canCreateBackroom: true,
  canCreateSala: () => true,
  canInviteMember: true,
});

export function LimitsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LimitsData | null>(null);

  useEffect(() => {
    async function fetchLimits() {
      try {
        const res = await fetch("/api/organizations/limits");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Error fetching limits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, []);

  const canCreateBackroom = data 
    ? (data.plan === "free" ? ((data.current_usage.backrooms ?? 0) < 1) : true)
    : true;

  const canCreateSala = (currentDepth: number) => {
    if (!data) return true;
    return (currentDepth + 1) <= data.limits.max_depth;
  };

  const canInviteMember = data 
    ? data.current_usage.members < data.limits.max_members 
    : true;

  return (
    <LimitsContext.Provider value={{ loading, data, canCreateBackroom, canCreateSala, canInviteMember }}>
      {children}
    </LimitsContext.Provider>
  );
}

export const useLimits = () => useContext(LimitsContext);
