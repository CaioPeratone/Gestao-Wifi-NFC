import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { isDarkColor, getContrastTheme } from '../../utils/contrast';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  businessNamePreview?: string;
  ssidPreview?: string;
}

const PRESET_COLORS = [
  { hex: '#0f172a', name: 'Slate Escuro' },
  { hex: '#000000', name: 'Preto Puro' },
  { hex: '#18181b', name: 'Zinco Dark' },
  { hex: '#1e1b4b', name: 'Índigo Noite' },
  { hex: '#064e3b', name: 'Esmeralda Nobre' },
  { hex: '#701a75', name: 'Fúcsia Profundo' },
  { hex: '#7c2d12', name: 'Terracota' },
  { hex: '#0284c7', name: 'Azul Real' },
  { hex: '#ffffff', name: 'Branco Puro' },
  { hex: '#f8fafc', name: 'Cinza Gelo' },
  { hex: '#fef3c7', name: 'Champagne Claro' },
  { hex: '#e0f2fe', name: 'Azul Suave' },
];

export function ColorPicker({
  value,
  onChange,
  businessNamePreview = 'Nome do Estabelecimento',
  ssidPreview = 'MinhaRede_Wi-Fi',
}: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(value);
  const theme = getContrastTheme(value);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.trim();
    if (!input.startsWith('#') && input.length > 0) {
      input = '#' + input;
    }
    setCustomHex(input);
    if (/^#[0-9a-fA-F]{6}$/.test(input) || /^#[0-9a-fA-F]{3}$/.test(input)) {
      onChange(input);
    }
  };

  const handleSelectPreset = (hex: string) => {
    setCustomHex(hex);
    onChange(hex);
  };

  return (
    <div className="space-y-4">
      {/* Palette Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Cores Recomendadas
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
          {PRESET_COLORS.map((preset) => {
            const isSelected = value.toLowerCase() === preset.hex.toLowerCase();
            const dark = isDarkColor(preset.hex);

            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => handleSelectPreset(preset.hex)}
                className={`group relative h-9 w-full rounded-lg border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-white'
                    : 'border-slate-700/60 hover:scale-105'
                }`}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      dark ? 'text-white' : 'text-slate-900'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Input and Native Color Picker */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            type="color"
            value={value.startsWith('#') && value.length === 7 ? value : '#0f172a'}
            onChange={(e) => {
              setCustomHex(e.target.value);
              onChange(e.target.value);
            }}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            title="Escolher cor na paleta do sistema"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={customHex}
            onChange={handleHexChange}
            placeholder="#0057FF"
            maxLength={7}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Contraste: {theme.isDark ? 'Texto Claro' : 'Texto Escuro'}</span>
        </div>
      </div>

      {/* Mini Live Preview of the Public Card */}
      <div className="mt-3">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Preview de Contraste em Tempo Real
        </span>
        <div
          className="p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center shadow-inner"
          style={{
            backgroundColor: value,
            borderColor: theme.cardBorder,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold text-xs"
            style={{
              backgroundColor: theme.fieldBg,
              color: theme.textPrimary,
              border: `1px solid ${theme.fieldBorder}`,
            }}
          >
            LOGO
          </div>
          <p
            className="text-sm font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            {businessNamePreview || 'Nome do Estabelecimento'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
            Rede: <span className="font-semibold">{ssidPreview || 'Nome_Rede'}</span>
          </p>
          <div
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.buttonText,
            }}
          >
            Copiar Senha
          </div>
        </div>
      </div>
    </div>
  );
}
