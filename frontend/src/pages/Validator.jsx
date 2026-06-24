import { useEffect, useState } from "react";
import { Loader2, SearchCheck } from "lucide-react";

import ResultCard from "../components/ResultCard.jsx";
import UploadBox from "../components/UploadBox.jsx";
import { getFriendlyApiError, uploadCharacterImage } from "../services/api.js";

export default function Validator() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  function handleFileChange(selectedFile) {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a supported image file.");
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setError("");
  }

  function clearFile() {
    setFile(null);
    setResult(null);
    setError("");
  }

  async function analyzeImage() {
    if (!file) {
      setError("Please upload an image before analysis.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(await uploadCharacterImage(file));
    } catch (apiError) {
      setError(getFriendlyApiError(apiError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Character Validator</h2>
        <p className="mt-1 text-sm text-slate-600">Upload a single-character image for OCR recognition and dataset validation.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <UploadBox file={file} previewUrl={previewUrl} onFileChange={handleFileChange} onClear={clearFile} />
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button
            type="button"
            onClick={analyzeImage}
            disabled={!file || loading}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <SearchCheck size={16} aria-hidden="true" />}
            {loading ? "Analyzing" : "Analyze Image"}
          </button>
        </div>
        <ResultCard result={result} />
      </div>
    </div>
  );
}
