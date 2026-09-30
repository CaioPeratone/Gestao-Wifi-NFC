import React, { useState } from 'react';
import { Client } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  client?: Client | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  client,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!client) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Cliente"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200 leading-relaxed">
            Esta ação é irreversível. A página pública{' '}
            <span className="font-mono font-bold">/wifi/{client.publicId}</span>{' '}
            será removida e a placa NFC com este link deixará de funcionar.
          </div>
        </div>

        <p className="text-sm text-slate-300">
          Tem certeza de que deseja excluir permanentemente o estabelecimento{' '}
          <strong className="text-white font-bold">{client.businessName}</strong>?
        </p>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {deleting ? 'Excluindo...' : 'Sim, Excluir Cliente'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
