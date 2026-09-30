import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { validateImageFile } from '../../services/storageService';

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onFileSelect: (file: File | null) => void;
  onRemoveLogo: () => void;
}

export function LogoUploader({
  currentLogoUrl,
  onFileSelect,
  onRemoveLogo,
}: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogoUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileSelect(null);
    onRemoveLogo();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="flex items-center gap-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
          <div className="relative w-16 h-16 bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden flex items-center justify-center p-1">
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200">Logo selecionada</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Pronta para publicação
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Remover logo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Clique para selecionar ou arraste a imagem
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, WEBP ou SVG (máx. 5 MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
}
