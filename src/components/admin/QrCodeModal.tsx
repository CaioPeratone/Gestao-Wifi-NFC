import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Client } from '../../types';
import { Modal } from '../common/Modal';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../utils/clipboard';
import { getPublicWifiUrl, getLocalWifiPath } from '../../utils/url';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export function QrCodeModal({ isOpen, onClose, client }: QrCodeModalProps) {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  // Definitive production URL to be encoded in QR code and printed / programmed
  const publicProductionUrl = client ? getPublicWifiUrl(client.publicId) : '';
  const previewPath = client ? getLocalWifiPath(client.publicId) : '';

  useEffect(() => {
    if (isOpen && client && canvasRef.current && publicProductionUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        publicProductionUrl,
        {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Erro ao renderizar QR code:', error);
        }
      );
    }
  }, [isOpen, client, publicProductionUrl]);

  if (!client) return null;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(publicProductionUrl);
    if (success) {
      setCopied(true);
      showToast('URL definitiva copiada!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode_${client.businessName.replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('Download do QR Code iniciado', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QR Code: ${client.businessName}`}
      subtitle="Escaneie para testar o cartão digital ou baixe a imagem para impressão"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* QR Code Canvas */}
        <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-700/60">
          <canvas ref={canvasRef} />
        </div>

        {/* URL box */}
        <div className="w-full p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-slate-300 truncate">{publicProductionUrl}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            title="Copiar URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="w-full flex items-center gap-2 pt-2">
          <button
            onClick={handleDownloadQr}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar Imagem PNG
          </button>
          <a
            href={publicProductionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Abrir página no navegador"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
