import React, { useState, useEffect } from 'react';
import { Client, ClientFormData, PixKeyType } from '../../types';
import { Modal } from '../common/Modal';
import { ColorPicker } from '../common/ColorPicker';
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
  DollarSign,
  MapPin,
  HelpCircle,
  ShieldCheck,
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

  // 1. Dados Gerais
  const [businessName, setBusinessName] = useState('');

  // 2. Módulo Wi-Fi
  const [active, setActive] = useState(true);
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isOpenNetwork, setIsOpenNetwork] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#0f172a');
  const [customTitle, setCustomTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  // 3. Módulo PIX
  const [pixEnabled, setPixEnabled] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('ALEATORIA');
  const [pixReceiverName, setPixReceiverName] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [pixAmount, setPixAmount] = useState('');
  const [pixDescription, setPixDescription] = useState('');
  const [pixBackgroundColor, setPixBackgroundColor] = useState('#00BFA5');
  const [pixPublicId, setPixPublicId] = useState<string | undefined>(undefined);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setSubmitError(null);
    if (clientToEdit) {
      setBusinessName(clientToEdit.businessName || '');

      // Wi-Fi
      setActive(clientToEdit.active ?? true);
      setSsid(clientToEdit.ssid || '');
      setWifiPassword(clientToEdit.wifiPassword || '');
      setIsOpenNetwork(!clientToEdit.wifiPassword);
      setBackgroundColor(clientToEdit.backgroundColor || '#0f172a');
      setCustomTitle(clientToEdit.customTitle || '');
      setInstructions(clientToEdit.instructions || '');

      // PIX
      setPixEnabled(Boolean(clientToEdit.pixEnabled));
      setPixKey(clientToEdit.pixKey || '');
      setPixKeyType(clientToEdit.pixKeyType || 'ALEATORIA');
      setPixReceiverName(clientToEdit.pixReceiverName || clientToEdit.businessName || '');
      setPixCity(clientToEdit.pixCity || 'SAO PAULO');
      setPixAmount(clientToEdit.pixAmount || '');
      setPixDescription(clientToEdit.pixDescription || '');
      setPixBackgroundColor(clientToEdit.pixBackgroundColor || '#00BFA5');
      setPixPublicId(clientToEdit.pixPublicId);
    } else {
      // Defaults for new client
      setBusinessName('');

      // Wi-Fi defaults
      setActive(true);
      setSsid('');
      setWifiPassword('');
      setIsOpenNetwork(false);
      setBackgroundColor('#0f172a');
      setCustomTitle('Conecte-se ao Wi-Fi');
      setInstructions('');

      // PIX defaults
      setPixEnabled(false);
      setPixKey('');
      setPixKeyType('ALEATORIA');
      setPixReceiverName('');
      setPixCity('SAO PAULO');
      setPixAmount('');
      setPixDescription('');
      setPixBackgroundColor('#00BFA5');
      setPixPublicId(undefined);
    }
    setErrors({});
  }, [clientToEdit, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Nome do estabelecimento é obrigatório.';
    }

    // Validate Wi-Fi only if active or if no modules enabled
    if (active) {
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
    }

    // Validate PIX if enabled
    if (pixEnabled) {
      if (!pixKey.trim()) {
        newErrors.pixKey = 'Chave PIX é obrigatória quando o módulo estiver ativo.';
      }

      if (
        pixBackgroundColor &&
        !/^#[0-9a-fA-F]{3,8}$/.test(pixBackgroundColor.trim())
      ) {
        newErrors.pixBackgroundColor = 'Cor hexadecimal inválida.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const payload: ClientFormData = {
        businessName: businessName.trim(),
        ssid: ssid.trim(),
        wifiPassword: isOpenNetwork ? '' : wifiPassword.trim(),
        backgroundColor: backgroundColor.trim(),
        active,
        customTitle: customTitle.trim() || undefined,
        instructions: instructions.trim() || undefined,

        // PIX module
        pixEnabled,
        pixPublicId, // preserved permanently
        pixKey: pixKey.trim(),
        pixKeyType,
        pixReceiverName: pixReceiverName.trim() || businessName.trim(),
        pixCity: pixCity.trim() || 'SAO PAULO',
        pixAmount: pixAmount.trim() || undefined,
        pixDescription: pixDescription.trim() || undefined,
        pixBackgroundColor: pixBackgroundColor.trim(),
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      let userMessage = err?.message || 'Erro ao processar salvamento';
      setSubmitError(userMessage);
      showToast(userMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente e Módulos' : 'Novo Cliente'}
      subtitle="Configure os dados do estabelecimento e ative os módulos NFC desejados."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Permanent Public ID Banner for Edit Mode */}
        {isEditing && clientToEdit && (
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-slate-400">ID Wi-Fi: </span>
                <span className="font-mono font-bold text-blue-300">
                  {clientToEdit.publicId}
                </span>
                {clientToEdit.pixPublicId && (
                  <>
                    <span className="text-slate-500 mx-2">|</span>
                    <span className="text-slate-400">ID PIX: </span>
                    <span className="font-mono font-bold text-emerald-300">
                      {clientToEdit.pixPublicId}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
              URLs NFC Preservadas
            </span>
          </div>
        )}

        {/* SECTION 1: DADOS GERAIS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
            <Building className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              1. Dados do Estabelecimento
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Restaurante Bella & Café"
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
        </div>

        {/* SECTION 2: MÓDULO WI-FI */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  2. Módulo Wi-Fi
                </h4>
                <p className="text-[11px] text-slate-400">
                  Página para conexão rápida à rede sem fio via NFC
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {active && (
            <div className="space-y-4 animate-in fade-in duration-150">
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
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      Senha da Rede
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 italic">
                      Rede aberta configurada (nenhuma senha solicitada aos clientes)
                    </div>
                  )}
                  {errors.wifiPassword && (
                    <p className="text-xs text-rose-400 mt-1">{errors.wifiPassword}</p>
                  )}
                </div>
              </div>

              {/* Wi-Fi Visual and text customization */}
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    Cor de Fundo da Página Wi-Fi
                  </label>
                  <ColorPicker
                    value={backgroundColor}
                    onChange={(hex) => setBackgroundColor(hex)}
                    businessNamePreview={businessName}
                    ssidPreview={ssid}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Título Customizado Wi-Fi
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
                      Instrução Extra Wi-Fi
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
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: MÓDULO PIX */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3. Módulo PIX
                </h4>
                <p className="text-[11px] text-slate-400">
                  Página para recebimento de pagamentos via PIX em tag NFC exclusiva
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pixEnabled}
                onChange={(e) => setPixEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {pixEnabled && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Tipo de Chave *
                  </label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALEATORIA">Chave Aleatória</option>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="TELEFONE">Telefone (+55...)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Chave PIX Exata *
                  </label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Cole a chave PIX cadastrada no banco"
                    maxLength={128}
                    className={`w-full bg-slate-800/90 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 ${
                      errors.pixKey
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-700 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.pixKey && (
                    <p className="text-xs text-rose-400 mt-1">{errors.pixKey}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nome do Titular *
                  </label>
                  <input
                    type="text"
                    value={pixReceiverName}
                    onChange={(e) => setPixReceiverName(e.target.value)}
                    placeholder={businessName || 'Nome do Recebedor'}
                    maxLength={60}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={pixCity}
                    onChange={(e) => setPixCity(e.target.value)}
                    placeholder="Ex: SAO PAULO"
                    maxLength={30}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Valor Fixo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={pixAmount}
                    onChange={(e) => setPixAmount(e.target.value)}
                    placeholder="Vazio = valor livre"
                    maxLength={15}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Descrição da Cobrança (Opcional)
                </label>
                <input
                  type="text"
                  value={pixDescription}
                  onChange={(e) => setPixDescription(e.target.value)}
                  placeholder="Ex: Consumo mesa ou balcão"
                  maxLength={100}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  Cor de Fundo da Página PIX
                </label>
                <ColorPicker
                  value={pixBackgroundColor}
                  onChange={(hex) => setPixBackgroundColor(hex)}
                  businessNamePreview="Pague com PIX"
                  ssidPreview={businessName || 'Estabelecimento'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Inline Submission Error Alert */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <span className="font-bold text-rose-400 shrink-0">⚠️ Erro:</span>
            <p className="leading-relaxed">{submitError}</p>
          </div>
        )}

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
              : 'Criar e Gerar Tags NFC'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
