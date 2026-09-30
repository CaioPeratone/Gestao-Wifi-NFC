import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Mail, Lock, UserCheck, AlertCircle } from 'lucide-react';
import { DEFAULT_ADMIN_EMAILS } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

interface AdminWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminWhitelistModal({
  isOpen,
  onClose,
}: AdminWhitelistModalProps) {
  const { user } = useAuth();
  const exclusiveEmail = DEFAULT_ADMIN_EMAILS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrador Único Autorizado"
      subtitle="Controle de acesso estrito do painel administrativo"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-300">
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-emerald-200 leading-relaxed">
            O sistema está configurado para acesso <strong>exclusivo e único</strong> de um só endereço de e-mail. Qualquer outra conta Google que tente se autenticar é bloqueada instantaneamente.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            E-mail do Administrador Exclusivo
          </label>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-mono font-semibold text-slate-100">{exclusiveEmail}</span>
            </div>
            {user?.email?.toLowerCase() === exclusiveEmail.toLowerCase() && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Conectado
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-slate-400">
          <p className="font-semibold text-slate-200">Segurança Ativa:</p>
          <p>
            Essa restrição está aplicada tanto no frontend quanto nas regras de segurança do <strong>Cloud Firestore</strong> (<code className="text-blue-300">firestore.rules</code>), impedindo qualquer leitura ou gravação não autorizada.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
