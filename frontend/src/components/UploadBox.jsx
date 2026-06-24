import { useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";

export default function UploadBox({ file, previewUrl, onFileChange, onClear }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function acceptFile(selectedFile) {
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section
      className={`rounded-md border border-dashed bg-white p-5 ${isDragging ? "border-slate-900" : "border-slate-300"}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
      {previewUrl ? (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <img src={previewUrl} alt="Selected upload preview" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Selected image</p>
              <p className="mt-1 break-all text-base font-semibold text-slate-950">{file?.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus size={16} aria-hidden="true" />
                Change Image
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                onClick={onClear}
              >
                <X size={16} aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex min-h-56 w-full flex-col items-center justify-center rounded-md px-4 text-center hover:bg-slate-50"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={36} className="text-slate-500" aria-hidden="true" />
          <span className="mt-4 text-base font-semibold text-slate-950">Upload or drag an image here</span>
          <span className="mt-2 text-sm text-slate-500">PNG, JPG, WEBP, BMP, and TIFF images are supported.</span>
        </button>
      )}
    </section>
  );
}
