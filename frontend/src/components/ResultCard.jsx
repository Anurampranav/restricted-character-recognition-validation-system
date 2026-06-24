const statusClasses = {
  VALID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  INVALID: "border-red-200 bg-red-50 text-red-800",
  ERROR: "border-amber-200 bg-amber-50 text-amber-800",
};

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Upload an image and run analysis to view the validation result.</p>
      </section>
    );
  }

  const confidence = result.confidence === null || result.confidence === undefined ? "N/A" : `${(result.confidence * 100).toFixed(2)}%`;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">Analysis Result</h2>
        <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${statusClasses[result.status] || statusClasses.ERROR}`}>
          {result.status}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Detected Character</dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-950">{result.detected_character || "N/A"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Confidence</dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-950">{confidence}</dd>
        </div>
      </dl>
      <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{result.message}</p>
    </section>
  );
}
