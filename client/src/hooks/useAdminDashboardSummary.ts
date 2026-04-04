import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

export type AdminDashboardSummary = {
  generatedAt: string;
  metrics: Array<{
    label: string;
    value: string;
    tone: "blue" | "accent" | "gold" | "red" | "purple";
    helper: string;
  }>;
  charts: {
    depositWithdrawalTrend: Array<{
      period: string;
      deposits: number;
      withdrawals: number;
    }>;
    totals: {
      deposits7d: number;
      withdrawals7d: number;
    };
  };
  recentTransactions: Array<{
    id: string;
    reference: string;
    mpesaCode: string | null;
    userEmail: string;
    userPhone: string;
    type: "deposit" | "withdrawal";
    amount: number;
    fee: number;
    totalDebit: number;
    status: "pending" | "completed" | "failed";
    createdAt: string;
    channel: string;
  }>;
};

export function useAdminDashboardSummary() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<AdminDashboardSummary>(
        "/admin/dashboard/summary",
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, []);

  return { data, loading, error, refetch };
}
