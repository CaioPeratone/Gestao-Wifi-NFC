import React, { useState, useEffect } from 'react';
import { Client, ClientFormData } from '../../types';
import { Modal } from '../common/Modal';
import { ColorPicker } from '../common/ColorPicker';
import { LogoUploader } from '../common/LogoUploader';
import { uploadLogo } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import {
  Wifi,
  Building,
  KeyRound,
  FileText,
  Palette,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Radio,
} from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  clientToEdit?: Client | null;
}

export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  clientToEdit,
}: ClientFormModalProps) {
  const { showToast } = useToast();
  const isEditing = Boolean(clientToEdit);

  const [businessName, setBusinessName] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isOpenNetwork, setIsOpenNetwork] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#0f172a');
  const [active, setActive] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clientToEdit) {
      setBusinessName(clientToEdit.businessName || '');
      setSsid(clientToEdit.ssid || '');
      setWifiPassword(clientToEdit.wifiPassword || '');
      setIsOpenNetwork(!clientToEdit.wifiPassword);
      setLogoUrl(clientToEdit.logoUrl || '');
      setBackgroundColor(clientToEdit.backgroundColor || '#0f172a');
      setActive(clientToEdit.active ?? true);
      setCustomTitle(clientToEdit.customTitle || '');
      setInstructions(clientToEdit.instructions || '');
      setSelectedFile(null);
    } else {
      // Defaults for new client
      setBusinessName('');
      setSsid('');
      setWifiPassword('');
      setIsOpenNetwork(false);
      setLogoUrl('');
      setSelectedFile(null);
      setBackgroundColor('#0f172a');
      setActive(true);
      setCustomTitle('Conecte-se ao Wi-Fi');
      setInstructions('');
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Nome do estabelecimento é obrigatório.';
    }

    if (!ssid.trim()) {
      newErrors.ssid = 'Nome da rede Wi-Fi (SSID) é obrigatório.';
    }

    if (!isOpenNetwork && !wifiPassword.trim()) {
      newErrors.wifiPassword =
        'Informe a senha ou marque como rede aberta/sem senha.';
    }

    if (
      !backgroundColor ||
      !/^#[0-9a-fA-F]{3,8}$/.test(backgroundColor.trim())
    ) {
      newErrors.backgroundColor = 'Cor hexadecimal inválida.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      // If user selected a new image file, upload to Firebase Storage
      if (selectedFile) {
        const tempId = clientToEdit ? clientToEdit.id : `client_${Date.now()}`;
        finalLogoUrl = await uploadLogo(tempId, selectedFile);
      }

      const payload: ClientFormData = {
        businessName: businessName.trim(),
        ssid: ssid.trim(),
        wifiPassword: isOpenNetwork ? '' : wifiPassword.trim(),
        logoUrl: finalLogoUrl,
        backgroundColor: backgroundColor.trim(),
        active,
        customTitle: customTitle.trim() || undefined,
        instructions: instructions.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      let userMessage = 'Erro ao salvar informações do cliente';
      try {
        if (err.message && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          userMessage = parsed.error || userMessage;
        } else if (err.message) {
          userMessage = err.message;
        }
      } catch {
        userMessage = err.message || userMessage;
      }
      showToast(userMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente NFC'}
      subtitle={
        isEditing
          ? 'Atualize os dados do cliente. A URL gravada na tag NFC permanecerá idêntica.'
          : 'Cadastre os dados da rede Wi-Fi para gerar a URL exclusiva da placa NFC.'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Permanent Public ID Banner for Edit Mode */}
        {isEditing && clientToEdit && (
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-slate-400">ID Público Permanente: </span>
                <span className="font-mono font-bold text-blue-300">
                  {clientToEdit.publicId}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
              Tag NFC Preservada
            </span>
          </div>
        )}

        {/* Section 1: Business and Network */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Bella Restaurante & Café"
              maxLength={120}
              className={`w-full bg-slate-800/90 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 ${
                errors.businessName
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-700 focus:ring-blue-500'
              }`}
            />
            {errors.businessName && (
              <p className="text-xs text-rose-400 mt-1">{errors.businessName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                Nome da Rede Wi-Fi (SSID) *
              </label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Ex: Bella_Clientes_5G"
                maxLength={64}
                className={`w-full bg-slate-800/90 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  errors.ssid
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:ring-blue-500'
                }`}
              />
              {errors.ssid && (
                <p className="text-xs text-rose-400 mt-1">{errors.ssid}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Senha do Wi-Fi
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpenNetwork}
                    onChange={(e) => {
                      setIsOpenNetwork(e.target.checked);
                      if (e.target.checked) setWifiPassword('');
                    }}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sem Senha</span>
                </label>
              </div>

              {!isOpenNetwork ? (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Digite a senha exata da rede"
                    maxLength={128}
                    className={`w-full bg-slate-800/90 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 pr-10 ${
                      errors.wifiPassword
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 italic">
                  Rede aberta configurada (nenhuma senha será solicitada aos clientes)
                </div>
              )}
              {errors.wifiPassword && (
                <p className="text-xs text-rose-400 mt-1">
                  {errors.wifiPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Logo and Visual Identity */}
        <div className="pt-2 border-t border-slate-800/80 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Logo do Estabelecimento
            </label>
            <LogoUploader
              currentLogoUrl={logoUrl}
              onFileSelect={(file) => setSelectedFile(file)}
              onRemoveLogo={() => {
                setSelectedFile(null);
                setLogoUrl('');
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              Cor de Fundo da Página Pública
            </label>
            <ColorPicker
              value={backgroundColor}
              onChange={(hex) => setBackgroundColor(hex)}
              businessNamePreview={businessName}
              ssidPreview={ssid}
            />
          </div>
        </div>

        {/* Section 3: Extra Options (Custom Title & Instructions & Status) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Título Personalizado (Opcional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Conecte-se ao Wi-Fi"
                maxLength={120}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Instrução Extra (Opcional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Aproveite nossa conexão de alta velocidade!"
                maxLength={300}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Active status toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Status da Página Pública
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Quando desativada, a página exibe &quot;Página temporariamente indisponível&quot; sem mostrar dados do Wi-Fi.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving
              ? 'Salvando...'
              : isEditing
              ? 'Salvar Alterações'
              : 'Criar e Gerar Link NFC'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
