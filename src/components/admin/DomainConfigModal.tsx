import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Globe, Check, RotateCcw, Radio } from 'lucide-react';
import { getPublicBaseUrl, setCustomBaseUrl } from '../../utils/url';
import { useToast } from '../../context/ToastContext';
import firebaseConfig from '../../../firebase-applet-config.json';

interface DomainConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDomainUpdated: () => void;
}

export function DomainConfigModal({
  isOpen,
  onClose,
  onDomainUpdated,
}: DomainConfigModalProps) {
  const { showToast } = useToast();
  const defaultGitHubPages = 'https://usuario.github.io/linknfc/';
  const [domainInput, setDomainInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDomainInput(getPublicBaseUrl());
    }
  }, [isOpen]);

  const handleSave = () => {
    let clean = domainInput.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    clean = clean + '/';

    setCustomBaseUrl(clean);
    showToast('URL base do GitHub Pages configurada!', 'success');
    onDomainUpdated();
    onClose();
  };

  const handleResetToDefault = () => {
    setCustomBaseUrl('');
    setDomainInput(defaultGitHubPages);
    showToast('Restaurado para padrão', 'info');
    onDomainUpdated();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="URL Base para GitHub Pages"
      subtitle="Defina o endereço base do seu repositório GitHub Pages"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-300">
        <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <Radio className="w-4 h-4 text-blue-400" />
            Compatibilidade com GitHub Pages
          </div>
          <p className="text-slate-300 leading-relaxed">
            As tags NFC serão gravadas no formato com parâmetro{' '}
            <strong className="text-white">?wifi=PUBLIC_ID</strong> (ex:{' '}
            <strong className="text-white">https://usuario.github.io/linknfc/?wifi=PWyRj6rpV</strong>).
            Isso garante que o GitHub Pages abra a página instantaneamente sem erros de 404!
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            URL Base do GitHub Pages (ou Domínio Próprio)
          </label>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="https://usuario.github.io/linknfc/"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Exemplo de link final gerado para a tag NFC:{' '}
            <span className="font-mono text-blue-400 font-semibold break-all">
              {domainInput ? domainInput.replace(/\/+$/, '') : 'https://usuario.github.io/linknfc'}/?wifi=PWyRj6rpV
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30"
            >
              <Check className="w-3.5 h-3.5" />
              Salvar URL Base
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
