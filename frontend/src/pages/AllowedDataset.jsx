import { useEffect, useState } from "react";

import { getAllowedDataset, getFriendlyApiError } from "../services/api.js";

function CharacterGrid({ title, values }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {values.map((value) => (
          <span
            key={value}
            className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-xl font-semibold text-slate-950"
          >
            {value}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function AllowedDataset() {
  const [dataset, setDataset] = useState({ allowed_numbers: [], allowed_letters: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDataset() {
      try {
        setLoading(true);
        setDataset(await getAllowedDataset());
        setError("");
      } catch (apiError) {
        setError(getFriendlyApiError(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadDataset();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Allowed Dataset</h2>
        <p className="mt-1 text-sm text-slate-600">Predefined characters accepted by the validation system.</p>
      </div>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <section className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading dataset...</section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CharacterGrid title="Allowed Numbers" values={dataset.allowed_numbers || []} />
          <CharacterGrid title="Allowed Letters" values={dataset.allowed_letters || []} />
        </div>
      )}
    </div>
  );
}
