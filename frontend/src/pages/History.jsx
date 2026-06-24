import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";

import { getFriendlyApiError, getHistory } from "../services/api.js";

const PAGE_SIZE = 8;

function formatDate(value) {
  if (!value) {
    return "N/A";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatConfidence(value) {
  return value === null || value === undefined ? "N/A" : `${(value * 100).toFixed(2)}%`;
}

export default function History() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setItems(await getHistory());
      setError("");
    } catch (apiError) {
      setError(getFriendlyApiError(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();
    if (!normalizedQuery) {
      return items;
    }
    return items.filter((item) =>
      [item.detected_character, item.status, item.message, item.filename].some((value) =>
        String(value || "").toUpperCase().includes(normalizedQuery),
      ),
    );
  }, [items, query]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Upload History</h2>
          <p className="mt-1 text-sm text-slate-600">Newest character analysis records are shown first.</p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <label className="flex max-w-md items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
            <Search size={16} className="text-slate-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent text-sm outline-none"
              placeholder="Search history"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Character</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Confidence</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="4">Loading history...</td>
                </tr>
              ) : visibleItems.length ? (
                visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(item.upload_time)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-950">{item.detected_character || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatConfidence(item.confidence)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="4">No upload records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((previous) => Math.min(pageCount, previous + 1))}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
