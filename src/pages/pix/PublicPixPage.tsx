import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { PublicPixData } from '../../types';
import { getPublicPixData } from '../../services/clientService';
import { getContrastTheme } from '../../utils/contrast';
import { copyToClipboard } from '../../utils/clipboard';
import { generatePixPayload } from '../../utils/pixPayload';
import {
  QrCode,
  Copy,
  Check,
  Building,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface PublicPixPageProps {
  pixPublicId?: string;
}

export function PublicPixPage(props: PublicPixPageProps) {
  const routeParams = useParams<{ pixPublicId: string }>();

  // Determine effective pixPublicId from:
  // 1. Explicit prop
  // 2. Query param ?pix=PIX_PUBLIC_ID
  // 3. Hash query param #/?pix=PIX_PUBLIC_ID
  // 4. Route param /pix/:pixPublicId
  const getEffectivePixPublicId = (): string | null => {
    if (props.pixPublicId) return props.pixPublicId;

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryPix = searchParams.get('pix');
      if (queryPix) return queryPix;

      if (window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        const hashPix = hashParams.get('pix');
        if (hashPix) return hashPix;
      }
    }

    return routeParams.pixPublicId || null;
  };

  const pixPublicId = getEffectivePixPublicId();

  const [data, setData] = useState<PublicPixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Logo padrão do PIX
  const defaultPixImage = `${import.meta.env.BASE_URL}pix.jpg`;

  // Interaction feedback states
  const [keyCopied, setKeyCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      if (!pixPublicId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const pixData = await getPublicPixData(pixPublicId);
        if (pixData) {
          setData(pixData);
          document.title = `${pixData.businessName} - Pagamento PIX`;

          // Generate EMV Payload and QR Code
          const payload = generatePixPayload({
            pixKey: pixData.pixKey,
            receiverName: pixData.pixReceiverName,
            city: pixData.pixCity,
            amount: pixData.pixAmount,
            description: pixData.pixDescription,
          });

          if (payload) {
            QRCode.toDataURL(payload, {
              width: 320,
              margin: 2,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            })
              .then((url) => setQrCodeDataUrl(url))
              .catch((err) => console.warn('Erro ao gerar imagem QR Code PIX:', err));
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do PIX:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [pixPublicId]);

  const handleCopyKey = async () => {
    if (!data?.pixKey) return;
    const success = await copyToClipboard(data.pixKey);
    if (success) {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };

  const handleCopyPayload = async () => {
    if (!data) return;
    const payload = generatePixPayload({
      pixKey: data.pixKey,
      receiverName: data.pixReceiverName,
      city: data.pixCity,
      amount: data.pixAmount,
      description: data.pixDescription,
    });
    if (!payload) return;

    const success = await copyToClipboard(payload);
    if (success) {
      setPayloadCopied(true);
      setTimeout(() => setPayloadCopied(false), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-9 h-9 text-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Carregando informações de pagamento...
        </p>
      </div>
    );
  }

  // Not Found State
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
            <DollarSign className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Chave PIX Não Localizada</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O link desta placa NFC não foi localizado ou foi removido pelo administrador.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const theme = getContrastTheme(data.pixBackgroundColor || '#00BFA5');

  // Inactive Customer Page (active === false)
  if (!data.active) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-300 select-none"
        style={{ backgroundColor: data.pixBackgroundColor || '#00BFA5' }}
      >
        <div
          className="max-w-md w-full p-8 rounded-3xl text-center space-y-5 transition-all shadow-2xl backdrop-blur-md"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            borderWidth: '1px',
            color: theme.textPrimary,
          }}
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 mx-auto flex items-center justify-center overflow-hidden shadow-sm"
            style={{
              backgroundColor: theme.fieldBg,
              border: `1px solid ${theme.fieldBorder}`,
            }}
          >
            <img
              src={defaultPixImage}
              alt="Logo PIX"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>

          <h1 className="text-xl font-bold tracking-tight">
            {data.businessName}
          </h1>

          <div
            className="p-4 rounded-2xl space-y-2"
            style={{
              backgroundColor: theme.fieldBg,
              border: `1px solid ${theme.fieldBorder}`,
            }}
          >
            <p className="text-sm font-semibold tracking-wide">
              Pagamento via PIX temporariamente indisponível.
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: theme.textSecondary }}
            >
              Por favor, solicite outra forma de pagamento diretamente aos atendentes do estabelecimento.
            </p>
          </div>

          <p className="text-[11px]" style={{ color: theme.textMuted }}>
            Placa NFC oficial de pagamento
          </p>
        </div>
      </div>
    );
  }

  // Active Public PIX Page
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 select-none"
      style={{ backgroundColor: data.pixBackgroundColor || '#00BFA5' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-md shadow-2xl border"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          boxShadow: theme.cardShadow,
          color: theme.textPrimary,
        }}
      >
        {/* Header: PIX Emblem & Business Name */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl p-2 flex items-center justify-center overflow-hidden shadow-sm"
            style={{
              backgroundColor: theme.fieldBg,
              border: `1px solid ${theme.fieldBorder}`,
            }}
          >
            <img
              src={defaultPixImage}
              alt="Logo PIX"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {data.businessName}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pague com PIX
            </div>
          </div>
        </div>

        {/* Chave PIX Card */}
        <div className="mt-6 space-y-3.5">
          <div
            className="p-4 rounded-2xl border transition-all space-y-2"
            style={{
              backgroundColor: theme.fieldBg,
              borderColor: theme.fieldBorder,
            }}
          >
            <div className="flex items-center justify-between text-xs font-medium">
              <span
                className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-[11px]"
                style={{ color: theme.textSecondary }}
              >
                Chave PIX ({data.pixKeyType || 'Chave'})
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded font-mono font-bold"
                style={{
                  backgroundColor: theme.secondaryButtonBg,
                  color: theme.secondaryButtonText,
                }}
              >
                {data.pixKeyType}
              </span>
            </div>

            <p
              className="font-mono text-base sm:text-lg font-bold tracking-tight break-all select-all py-0.5"
              style={{ color: theme.textPrimary }}
            >
              {data.pixKey}
            </p>
          </div>

          {/* Valor (se houver) */}
          {data.pixAmount && (
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: theme.fieldBg,
                borderColor: theme.fieldBorder,
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme.textSecondary }}
              >
                Valor:
              </span>
              <span className="font-extrabold text-lg text-emerald-500 font-mono">
                R$ {parseFloat(data.pixAmount.replace(',', '.')).toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}

          {/* Dados do Recebedor */}
          <div
            className="p-3.5 rounded-2xl border space-y-2 text-xs"
            style={{
              backgroundColor: theme.fieldBg,
              borderColor: theme.fieldBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 font-medium"
                style={{ color: theme.textSecondary }}
              >
                <Building className="w-3.5 h-3.5 text-blue-400" />
                Recebedor:
              </span>
              <span className="font-bold text-right truncate max-w-[200px]" style={{ color: theme.textPrimary }}>
                {data.pixReceiverName}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-700/20">
              <span
                className="flex items-center gap-1.5 font-medium"
                style={{ color: theme.textSecondary }}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Cidade:
              </span>
              <span className="font-semibold text-right" style={{ color: theme.textPrimary }}>
                {data.pixCity}
              </span>
            </div>

            {data.pixDescription && (
              <div className="flex items-start justify-between pt-1 border-t border-slate-700/20">
                <span
                  className="flex items-center gap-1.5 font-medium shrink-0"
                  style={{ color: theme.textSecondary }}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Descrição:
                </span>
                <span className="font-normal text-right italic break-words pl-2" style={{ color: theme.textSecondary }}>
                  {data.pixDescription}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PRIMARY ACTION BUTTON: COPIAR CHAVE PIX */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleCopyKey}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: keyCopied ? '#10b981' : theme.buttonBg,
              color: keyCopied ? '#ffffff' : theme.buttonText,
              boxShadow: keyCopied
                ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            {keyCopied ? (
              <>
                <Check className="w-5 h-5 text-white stroke-[3]" />
                <span>Chave PIX Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar Chave PIX</span>
              </>
            )}
          </button>

          {/* SECONDARY ACTION: QR CODE / COPIA E COLA */}
          {qrCodeDataUrl && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border"
                style={{
                  backgroundColor: payloadCopied ? '#10b981' : theme.secondaryButtonBg,
                  color: payloadCopied ? '#ffffff' : theme.secondaryButtonText,
                  borderColor: theme.fieldBorder,
                }}
              >
                {payloadCopied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia e Cola</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border"
                style={{
                  backgroundColor: theme.secondaryButtonBg,
                  color: theme.secondaryButtonText,
                  borderColor: theme.fieldBorder,
                }}
              >
                <QrCode className="w-4 h-4 text-emerald-500" />
                <span>Ver QR Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer instruction */}
        <div className="mt-5 text-center">
          <p
            className="text-[11px] font-medium"
            style={{ color: theme.textMuted }}
          >
            Abra o app do seu banco e cole a chave para transferir
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-slate-100 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">QR Code PIX</h3>
            <p className="text-xs text-slate-400">
              Aponte a câmera do aplicativo do seu banco para escanear
            </p>

            <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-md">
              <img
                src={qrCodeDataUrl}
                alt="QR Code PIX"
                className="w-56 h-56 object-contain"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {payloadCopied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Código PIX Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Pix Copia e Cola</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
