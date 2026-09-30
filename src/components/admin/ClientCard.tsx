import React, { useState } from 'react';
import { Client } from '../../types';
import {
  Wifi,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Power,
  QrCode,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../utils/clipboard';
import { getPublicWifiUrl, getLocalWifiPath, getPublicBaseUrl } from '../../utils/url';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  onShowQr: (client: Client) => void;
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
  onShowQr,
}: ClientCardProps) {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Definitive production URL for GitHub Pages to be burned into physical NFC tags
  const nfcProductionUrl = getPublicWifiUrl(client.publicId);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(nfcProductionUrl);
    if (success) {
      setCopiedLink(true);
      showToast('URL definitiva para a tag NFC copiada!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      showToast('Não foi possível copiar o link', 'error');
    }
  };

  const formattedDate = client.createdAt?.toDate
    ? client.createdAt.toDate().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : client.createdAt
    ? new Date(client.createdAt).toLocaleDateString('pt-BR')
    : 'Recentemente';

  return (
    <div
      className={`group relative bg-slate-900 border rounded-2xl p-5 transition-all duration-200 hover:shadow-xl ${
        client.active
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-rose-900/30 bg-slate-900/50 opacity-80'
      }`}
    >
      {/* Top row: Logo, Business name, Status badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {client.logoUrl ? (
            <div className="w-13 h-13 rounded-xl bg-slate-800 border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img
                src={client.logoUrl}
                alt={client.businessName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-13 h-13 rounded-xl border flex items-center justify-center font-bold text-lg shrink-0 shadow-sm"
              style={{
                backgroundColor: client.backgroundColor || '#0f172a',
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
              }}
            >
              {client.businessName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h4 className="font-bold text-base text-slate-100 truncate group-hover:text-blue-400 transition-colors">
              {client.businessName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                  client.active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    client.active ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {client.active ? 'Ativo' : 'Desativado'}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Color preview dot */}
        <div
          className="w-4 h-4 rounded-full border border-slate-700/80 shadow-inner shrink-0"
          style={{ backgroundColor: client.backgroundColor }}
          title={`Cor de fundo do cartão: ${client.backgroundColor}`}
        />
      </div>

      {/* Network details */}
      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            Rede (SSID):
          </span>
          <span className="font-semibold text-slate-200 font-mono">
            {client.ssid}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Senha:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-200 font-medium">
              {client.wifiPassword ? (
                showPassword ? (
                  client.wifiPassword
                ) : (
                  '••••••••'
                )
              ) : (
                <span className="text-slate-400 italic">Rede Aberta</span>
              )}
            </span>
            {client.wifiPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Public NFC URL snippet */}
      <div className="mt-3.5 flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
        <div className="min-w-0 flex-1 truncate font-mono text-slate-300">
          <span className="text-slate-400 truncate">{getPublicBaseUrl()}?wifi=</span>
          <span className="font-semibold text-blue-400">{client.publicId}</span>
        </div>
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors shrink-0 ${
            copiedLink
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title={`Copiar URL de produção: ${nfcProductionUrl}`}
        >
          {copiedLink ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Action buttons footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* View Public Page in new tab */}
          <a
            href={nfcProductionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-colors"
            title="Abrir página pública de Wi-Fi em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visualizar</span>
          </a>

          {/* Show QR Code modal */}
          <button
            onClick={() => onShowQr(client)}
            className="p-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Ver QR Code do link"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {/* Toggle active status */}
          <button
            onClick={() => onToggleStatus(client)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              client.active
                ? 'bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-400 border-slate-700/60'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
            }`}
            title={client.active ? 'Desativar página' : 'Ativar página'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Edit Client */}
          <button
            onClick={() => onEdit(client)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            title="Editar informações do cliente"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            Editar
          </button>

          {/* Delete Client */}
          <button
            onClick={() => onDelete(client)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
            title="Excluir cliente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
