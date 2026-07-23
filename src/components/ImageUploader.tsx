import React, { useState } from 'react';
import { ImagePlus, Upload, Link, X, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

const PRESET_IMAGES = [
  { name: 'Sound System / Speaker', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Proyektor & Layar', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kabel Roll / Alat Listrik', url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Genset / Listrik', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kipas Angin / Posko', url: 'https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mobil Pick-Up Transport', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
  { name: 'Posko KKN', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, label = 'Foto / Gambar (Opsional)' }) => {
  const [activeInputTab, setActiveInputTab] = useState<'FILE' | 'URL' | 'PRESET'>('FILE');
  const [inputUrl, setInputUrl] = useState(value || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file maksimal 4MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      onChange(inputUrl.trim());
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 text-xs">
        {label}
      </label>

      {/* Current Image Preview */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-36 object-cover transition-transform group-hover:scale-105"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-950/80 text-rose-400 hover:text-rose-200 hover:bg-rose-900/80 transition-colors shadow"
            title="Hapus Foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
          {/* Method Selector */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveInputTab('FILE')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInputTab === 'FILE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('URL')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInputTab === 'URL'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link URL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('PRESET')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInputTab === 'PRESET'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preset Stok</span>
            </button>
          </div>

          {/* Input Controls */}
          {activeInputTab === 'FILE' && (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
              <ImagePlus className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
                Pilih foto dari komputer / HP
              </span>
              <span className="text-[10px] text-slate-500">Format PNG, JPG, WEBP (Max 4MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          {activeInputTab === 'URL' && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs text-slate-100 dark:text-slate-100 light:text-slate-900"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Gunakan
              </button>
            </div>
          )}

          {activeInputTab === 'PRESET' && (
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className="p-1.5 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-emerald-500 text-left flex items-center gap-2 transition-all group"
                >
                  <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  <span className="text-[10px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-800 truncate group-hover:text-emerald-400">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
