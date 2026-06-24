import { useEffect, useState } from "react";

import StatCard from "../components/StatCard.jsx";
import { getFriendlyApiError, getStats } from "../services/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState({ total_uploads: 0, valid_count: 0, invalid_count: 0, error_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setStats(await getStats());
        setError("");
      } catch (apiError) {
        setError(getFriendlyApiError(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Summary of uploaded character validation results.</p>
      </div>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Uploads" value={loading ? "..." : stats.total_uploads ?? 0} />
        <StatCard label="Valid Characters" value={loading ? "..." : stats.valid_count ?? 0} />
        <StatCard label="Invalid Characters" value={loading ? "..." : stats.invalid_count ?? 0} />
        <StatCard label="OCR Errors" value={loading ? "..." : stats.error_count ?? 0} />
      </div>
    </div>
  );
}
