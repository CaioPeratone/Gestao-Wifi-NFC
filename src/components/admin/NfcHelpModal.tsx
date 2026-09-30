import React from 'react';
import { Modal } from '../common/Modal';
import { Radio, Smartphone, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

interface NfcHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NfcHelpModal({ isOpen, onClose }: NfcHelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guia Prático: Como Gravar a Tag NFC"
      subtitle="Passo a passo para programar placas e adesivos NFC com a URL do cliente"
      maxWidth="lg"
    >
      <div className="space-y-5 text-sm text-slate-300">
        {/* Intro Banner */}
        <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-start gap-3">
          <Radio className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-relaxed">
            A tag NFC precisa ser programada apenas <strong>uma única vez</strong> com o link do cliente (ex: <code className="text-blue-300 bg-blue-900/50 px-1 py-0.5 rounded font-mono">?wifi=PWyRj6rpV</code>). Quando você alterar senha, nome da rede ou logo no painel, a placa continuará funcionando sem precisar ser regravada!
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-xs">Instale um app gravador de NFC</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No celular Android ou iPhone, baixe gratuitamente o app <strong>NFC Tools</strong> (ou <em>NXP TagWriter</em>) na Google Play Store ou App Store.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-xs">Copie o link do cliente no painel</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No card do estabelecimento no painel administrativo, clique no botão <strong>&quot;Copiar Link&quot;</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-xs">Grave na placa NFC</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                No app <em>NFC Tools</em>:
                <br />
                • Toque na aba <strong>Escrever</strong> (Write)
                <br />
                • Toque em <strong>Adicionar um registro</strong> → <strong>URL / URI</strong>
                <br />
                • Cole o link e confirme
                <br />
                • Toque no botão <strong>Escrever</strong> e aproxime a placa NFC na traseira do celular até vibrar com sinal de sucesso!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              4
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-xs">Teste a aproximação</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Bloqueie ou feche o app, desbloqueie o celular e aproxime da placa. A tela com o cartão Wi-Fi do cliente abrirá automaticamente!
              </p>
            </div>
          </div>
        </div>

        {/* Tip: Chip Compatibility */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
          <p className="font-semibold text-slate-300">Chips NFC recomendados:</p>
          <p className="text-slate-400">
            Qualquer chip padrão <strong>NTAG213</strong>, <strong>NTAG215</strong> ou <strong>NTAG216</strong> funciona perfeitamente com 100% dos smartphones modernos (Android e iPhone).
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Entendi, Fechar Guia
          </button>
        </div>
      </div>
    </Modal>
  );
}
