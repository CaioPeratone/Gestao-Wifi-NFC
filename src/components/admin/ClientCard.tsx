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
  DollarSign,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { copyToClipboard } from '../../utils/clipboard';
import {
  getPublicWifiUrl,
  getPublicPixUrl,
  getPublicBaseUrl,
} from '../../utils/url';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  onTogglePixStatus: (client: Client) => void;
  onShowQr: (client: Client) => void;
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePixStatus,
  onShowQr,
}: ClientCardProps) {
  const { showToast } = useToast();
  const [copiedWifiLink, setCopiedWifiLink] = useState(false);
  const [copiedPixLink, setCopiedPixLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // URLs definitivas para as tags NFC
  const wifiNfcUrl = getPublicWifiUrl(client.publicId);
  const pixNfcUrl = client.pixPublicId ? getPublicPixUrl(client.pixPublicId) : '';

  const defaultWifiImage = `${import.meta.env.BASE_URL}default-wifi.png`;
  const defaultPixImage = `${import.meta.env.BASE_URL}pix.jpg`;

  const handleCopyWifiLink = async () => {
    const success = await copyToClipboard(wifiNfcUrl);
    if (success) {
      setCopiedWifiLink(true);
      showToast('URL definitiva do Wi-Fi copiada!', 'success');
      setTimeout(() => setCopiedWifiLink(false), 2000);
    } else {
      showToast('Não foi possível copiar o link', 'error');
    }
  };

  const handleCopyPixLink = async () => {
    if (!pixNfcUrl) return;
    const success = await copyToClipboard(pixNfcUrl);
    if (success) {
      setCopiedPixLink(true);
      showToast('URL definitiva da placa PIX copiada!', 'success');
      setTimeout(() => setCopiedPixLink(false), 2000);
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

  const isPixActive = Boolean(client.pixEnabled);
  const hasPixConfigured = Boolean(client.pixPublicId && client.pixKey);

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-2xl flex flex-col justify-between space-y-4">
      {/* Top Header: Business Name, Date, Edit & Delete */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-700/80 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img
              src={defaultWifiImage}
              alt="Wi-Fi"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-base text-slate-100 truncate group-hover:text-blue-400 transition-colors">
              {client.businessName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Global Client Actions: Edit & Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(client)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
            title="Editar dados e módulos do cliente"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            onClick={() => onDelete(client)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            title="Excluir cliente e todas as suas placas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MÓDULOS SECTION */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
          <span>Módulos Ativos</span>
          <span className="text-slate-500 font-mono text-[10px]">Independente por Tag</span>
        </div>

        {/* MÓDULO 1: WI-FI */}
        <div
          className={`p-3.5 rounded-xl border transition-all space-y-3 ${
            client.active
              ? 'bg-slate-950/80 border-blue-900/40'
              : 'bg-slate-950/40 border-slate-800/80 opacity-75'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  client.active ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Módulo Wi-Fi</span>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
          </div>

          {/* Wi-Fi Details */}
          <div className="text-xs space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Rede (SSID):</span>
              <span className="font-mono font-semibold truncate max-w-[180px]">{client.ssid}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Senha:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-medium">
                  {client.wifiPassword ? (
                    showPassword ? client.wifiPassword : '••••••••'
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Rede Aberta</span>
                  )}
                </span>
                {client.wifiPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Wi-Fi NFC URL */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <div className="min-w-0 flex-1 truncate text-slate-400">
              <span>{getPublicBaseUrl()}?wifi=</span>
              <span className="font-bold text-blue-400">{client.publicId}</span>
            </div>
          </div>

          {/* Wi-Fi Actions */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/80">
            <button
              onClick={handleCopyWifiLink}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                copiedWifiLink
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
              }`}
            >
              {copiedWifiLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWifiLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <a
              href={wifiNfcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Visualizar página Wi-Fi em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => onShowQr(client)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Ver QR Code do Wi-Fi"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleStatus(client)}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                client.active
                  ? 'bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-400 border-slate-700/60'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
              }`}
              title={client.active ? 'Desativar página Wi-Fi' : 'Ativar página Wi-Fi'}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MÓDULO 2: PIX */}
        <div
          className={`p-3.5 rounded-xl border transition-all space-y-3 ${
            isPixActive && hasPixConfigured
              ? 'bg-slate-950/80 border-emerald-900/40'
              : 'bg-slate-950/40 border-slate-800/80 opacity-75'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white border border-slate-700/80 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <img
                  src={defaultPixImage}
                  alt="PIX"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-xs font-bold text-slate-200">Módulo PIX</span>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPixActive && hasPixConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : hasPixConfigured
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPixActive && hasPixConfigured
                    ? 'bg-emerald-400'
                    : hasPixConfigured
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              {isPixActive && hasPixConfigured
                ? 'Ativo'
                : hasPixConfigured
                ? 'Desativado'
                : 'Não Configurado'}
            </span>
          </div>

          {hasPixConfigured ? (
            <>
              {/* PIX Details */}
              <div className="text-xs space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Chave ({client.pixKeyType}):</span>
                  <span className="font-mono font-semibold truncate max-w-[180px] text-emerald-400">
                    {client.pixKey}
                  </span>
                </div>

                {client.pixAmount && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Valor Fixo:</span>
                    <span className="font-mono font-bold text-slate-100">
                      R$ {parseFloat(client.pixAmount.replace(',', '.')).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>

              {/* PIX NFC URL */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
                <div className="min-w-0 flex-1 truncate text-slate-400">
                  <span>{getPublicBaseUrl()}?pix=</span>
                  <span className="font-bold text-emerald-400">{client.pixPublicId}</span>
                </div>
              </div>

              {/* PIX Actions */}
              <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/80">
                <button
                  onClick={handleCopyPixLink}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    copiedPixLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {copiedPixLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPixLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>

                <a
                  href={pixNfcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                  title="Visualizar página PIX em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onTogglePixStatus(client)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isPixActive
                      ? 'bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-400 border-slate-700/60'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                  }`}
                  title={isPixActive ? 'Desativar página PIX' : 'Ativar página PIX'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-slate-400">
                Gere uma tag NFC exclusiva para pagamentos via PIX.
              </p>
              <button
                type="button"
                onClick={() => onEdit(client)}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Configurar Módulo PIX</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
