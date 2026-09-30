import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicWifiData } from '../../types';
import { getPublicWifiData } from '../../services/clientService';
import { getContrastTheme } from '../../utils/contrast';
import { copyToClipboard } from '../../utils/clipboard';
import {
  Wifi,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react';

interface PublicWifiPageProps {
  publicId?: string;
}

export function PublicWifiPage(props: PublicWifiPageProps) {
  const routeParams = useParams<{ publicId: string }>();

  // Determine effective publicId from:
  // 1. Explicit prop
  // 2. Query param ?wifi=PUBLIC_ID (GitHub Pages primary format)
  // 3. Hash query param #/?wifi=PUBLIC_ID
  // 4. Route param /wifi/:publicId
  const getEffectivePublicId = (): string | null => {
    if (props.publicId) return props.publicId;

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryWifi = searchParams.get('wifi');
      if (queryWifi) return queryWifi;

      if (window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        const hashWifi = hashParams.get('wifi');
        if (hashWifi) return hashWifi;
      }
    }

    return routeParams.publicId || null;
  };

  const publicId = getEffectivePublicId();

  const [data, setData] = useState<PublicWifiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Interaction states
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [ssidCopied, setSsidCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!publicId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const wifiData = await getPublicWifiData(publicId);
        if (wifiData) {
          setData(wifiData);
          document.title = `${wifiData.businessName} - Wi-Fi`;
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Erro ao carregar cartão Wi-Fi:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [publicId]);

  const handleCopyPassword = async () => {
    if (!data?.wifiPassword) return;
    const success = await copyToClipboard(data.wifiPassword);
    if (success) {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    }
  };

  const handleCopySsid = async () => {
    if (!data?.ssid) return;
    const success = await copyToClipboard(data.ssid);
    if (success) {
      setSsidCopied(true);
      setTimeout(() => setSsidCopied(false), 2500);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-20 h-20 rounded-2xl bg-slate-800" />
          <div className="w-36 h-5 rounded-lg bg-slate-800" />
          <div className="w-48 h-4 rounded-lg bg-slate-800" />
          <div className="w-full h-24 rounded-2xl bg-slate-800 mt-4" />
          <div className="w-full h-12 rounded-2xl bg-slate-800" />
        </div>
      </div>
    );
  }

  // Not Found State (Invalid or deleted publicId)
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 text-slate-100 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
            <Wifi className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Estabelecimento Não Encontrado</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O link desta placa NFC não foi localizado ou foi removido pelo administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const theme = getContrastTheme(data.backgroundColor);

  // Inactive Customer Page (active === false)
  // As requested: "deve mostrar uma mensagem elegante: 'Página temporariamente indisponível.' Não mostrar SSID nem senha."
  if (!data.active) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
        style={{ backgroundColor: data.backgroundColor }}
      >
        <div
          className="max-w-sm w-full p-8 rounded-3xl border text-center space-y-4 backdrop-blur-xl shadow-2xl"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
            color: theme.textPrimary,
          }}
        >
          {data.logoUrl ? (
            <div className="w-20 h-20 rounded-2xl p-1.5 mx-auto flex items-center justify-center overflow-hidden">
              <img
                src={data.logoUrl}
                alt={data.businessName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md"
              style={{
                backgroundColor: theme.fieldBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.fieldBorder}`,
              }}
            >
              {data.businessName.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-xl font-bold tracking-tight">
            {data.businessName}
          </h1>

          <div
            className="p-4 rounded-2xl text-xs leading-relaxed font-medium"
            style={{
              backgroundColor: theme.fieldBg,
              color: theme.textSecondary,
              border: `1px solid ${theme.fieldBorder}`,
            }}
          >
            Página temporariamente indisponível.
          </div>
        </div>
      </div>
    );
  }

  // Active Public Wi-Fi Card (Mobile-First Digital Card)
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 select-none"
      style={{ backgroundColor: data.backgroundColor }}
    >
      <main
        className="w-full max-w-sm rounded-[32px] border p-6 sm:p-8 backdrop-blur-2xl transition-all duration-200"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow,
          color: theme.textPrimary,
        }}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center text-center space-y-3">
          {data.logoUrl ? (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 flex items-center justify-center overflow-hidden transition-transform duration-200"
              style={{
                backgroundColor: theme.fieldBg,
                border: `1px solid ${theme.fieldBorder}`,
              }}
            >
              <img
                src={data.logoUrl}
                alt={data.businessName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm"
              style={{
                backgroundColor: theme.fieldBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.fieldBorder}`,
              }}
            >
              {data.businessName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Nome do Estabelecimento */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {data.businessName}
            </h1>
            <p
              className="text-xs sm:text-sm font-medium mt-0.5 tracking-wide"
              style={{ color: theme.textSecondary }}
            >
              {data.customTitle || 'Conecte-se ao Wi-Fi'}
            </p>
          </div>
        </div>

        {/* Informações da Rede & Senha */}
        <div className="mt-6 space-y-3">
          {/* Campo Rede / SSID */}
          <div
            className="p-3.5 rounded-2xl border transition-all"
            style={{
              backgroundColor: theme.fieldBg,
              borderColor: theme.fieldBorder,
            }}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider mb-1">
              <span
                className="flex items-center gap-1.5"
                style={{ color: theme.textSecondary }}
              >
                <Wifi className="w-3.5 h-3.5" />
                Rede Wi-Fi
              </span>
              <button
                type="button"
                onClick={handleCopySsid}
                className="flex items-center gap-1 text-[11px] font-bold transition-opacity hover:opacity-80 active:scale-95"
                style={{ color: theme.textPrimary }}
                title="Copiar nome da rede"
              >
                {ssidCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <p
              className="font-mono text-base font-bold tracking-tight truncate"
              style={{ color: theme.textPrimary }}
            >
              {data.ssid}
            </p>
          </div>

          {/* Campo Senha */}
          {data.wifiPassword ? (
            <div
              className="p-3.5 rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.fieldBg,
                borderColor: theme.fieldBorder,
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider mb-1">
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: theme.textSecondary }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Senha
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-[11px] font-bold transition-opacity hover:opacity-80"
                  style={{ color: theme.textPrimary }}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Mostrar</span>
                    </>
                  )}
                </button>
              </div>
              <p
                className="font-mono text-base font-bold tracking-tight select-all truncate"
                style={{ color: theme.textPrimary }}
              >
                {showPassword ? data.wifiPassword : '••••••••••••'}
              </p>
            </div>
          ) : (
            <div
              className="p-3.5 rounded-2xl border text-center text-xs font-semibold"
              style={{
                backgroundColor: theme.fieldBg,
                borderColor: theme.fieldBorder,
                color: theme.textSecondary,
              }}
            >
              Rede aberta (conexão direta sem senha)
            </div>
          )}
        </div>

        {/* Instrução Opcional */}
        {data.instructions && (
          <p
            className="text-xs text-center mt-4 px-2 leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            {data.instructions}
          </p>
        )}

        {/* BOTÃO PRINCIPAL: COPIAR SENHA */}
        {data.wifiPassword && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCopyPassword}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer`}
              style={{
                backgroundColor: passwordCopied ? '#10b981' : theme.buttonBg,
                color: passwordCopied ? '#ffffff' : theme.buttonText,
                boxShadow: passwordCopied
                  ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              }}
            >
              {passwordCopied ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>✓ Senha Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Senha</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Feedback visual sutil sobre conectar */}
        <div className="mt-4 text-center">
          <p
            className="text-[11px] font-medium"
            style={{ color: theme.textMuted }}
          >
            {passwordCopied
              ? 'Cole no painel de Wi-Fi do seu celular para navegar'
              : 'Toque para copiar e conecte-se na rede'}
          </p>
        </div>
      </main>
    </div>
  );
}
