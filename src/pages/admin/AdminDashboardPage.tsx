import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Client, ClientFormData } from '../../types';
import {
  subscribeClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
  togglePixModule,
} from '../../services/clientService';
import { Header } from '../../components/common/Header';
import { ClientCard } from '../../components/admin/ClientCard';
import { ClientFormModal } from '../../components/admin/ClientFormModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { QrCodeModal } from '../../components/admin/QrCodeModal';
import { NfcHelpModal } from '../../components/admin/NfcHelpModal';
import { AdminWhitelistModal } from '../../components/admin/AdminWhitelistModal';
import { DomainConfigModal } from '../../components/admin/DomainConfigModal';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Radio,
  X,
} from 'lucide-react';

export function AdminDashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [isFormModalOpen, setIsFormModalOpen] =
    useState(false);

  const [clientToEdit, setClientToEdit] =
    useState<Client | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [clientToDelete, setClientToDelete] =
    useState<Client | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] =
    useState(false);

  const [clientForQr, setClientForQr] =
    useState<Client | null>(null);

  const [isNfcGuideOpen, setIsNfcGuideOpen] =
    useState(false);

  const [isWhitelistOpen, setIsWhitelistOpen] =
    useState(false);

  const [isDomainModalOpen, setIsDomainModalOpen] =
    useState(false);

  const [, setDomainRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login', {
        replace: true,
      });
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);

    const unsubscribe = subscribeClients(
      (data) => {
        setClients(data);
        setLoading(false);
      },

      (error) => {
        console.error(
          'Erro ao escutar clientes:',
          error
        );

        showToast(
          'Erro ao carregar clientes do Firestore',
          'error'
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin, showToast]);

  const metrics = useMemo(() => {
    const total = clients.length;

    const active = clients.filter(
      (client) => client.active
    ).length;

    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const search =
      searchTerm.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !search ||
        client.businessName
          .toLowerCase()
          .includes(search) ||
        client.ssid
          .toLowerCase()
          .includes(search) ||
        client.publicId
          .toLowerCase()
          .includes(search) ||
        (client.pixPublicId &&
          client.pixPublicId
            .toLowerCase()
            .includes(search)) ||
        (client.pixKey &&
          client.pixKey
            .toLowerCase()
            .includes(search));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          client.active) ||
        (statusFilter === 'inactive' &&
          !client.active);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    clients,
    searchTerm,
    statusFilter,
  ]);

  const handleOpenNewModal = () => {
    setClientToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (
    client: Client
  ) => {
    setClientToEdit(client);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (
    client: Client
  ) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleOpenQrModal = (
    client: Client
  ) => {
    setClientForQr(client);
    setIsQrModalOpen(true);
  };

  const handleFormSubmit = async (
    formData: ClientFormData
  ) => {
    if (clientToEdit) {
      await updateClient(
        clientToEdit.id,
        clientToEdit.publicId,
        formData
      );

      showToast(
        'Alterações salvas com sucesso!',
        'success'
      );
    } else {
      await createClient(formData);

      showToast(
        'Cliente criado com sucesso! Link NFC gerado.',
        'success'
      );
    }
  };

  const handleConfirmDelete =
    async () => {
      if (!clientToDelete) {
        return;
      }

      try {
        await deleteClient(
          clientToDelete.id,
          clientToDelete.publicId,
          clientToDelete.pixPublicId
        );

        showToast(
          'Cliente excluído com sucesso.',
          'success'
        );

        setIsDeleteModalOpen(false);
        setClientToDelete(null);
      } catch (err) {
        console.error(
          'Erro ao excluir cliente:',
          err
        );

        showToast(
          'Falha ao excluir cliente.',
          'error'
        );
      }
    };

  const handleToggleStatus = async (
    client: Client
  ) => {
    try {
      const newStatus =
        await toggleClientStatus(
          client.id,
          client.publicId,
          client.active
        );

      showToast(
        newStatus
          ? `Módulo Wi-Fi de ${client.businessName} ativado!`
          : `Módulo Wi-Fi de ${client.businessName} desativado!`,
        'info'
      );
    } catch (err) {
      console.error(
        'Erro ao alternar status do Wi-Fi:',
        err
      );

      showToast(
        'Erro ao atualizar status',
        'error'
      );
    }
  };

  const handleTogglePixStatus = async (
    client: Client
  ) => {
    if (!client.pixPublicId) {
      handleOpenEditModal(client);
      return;
    }

    try {
      const newStatus =
        await togglePixModule(
          client.id,
          client.pixPublicId,
          Boolean(client.pixEnabled)
        );

      showToast(
        newStatus
          ? `Módulo PIX de ${client.businessName} ativado!`
          : `Módulo PIX de ${client.businessName} desativado!`,
        'info'
      );
    } catch (err) {
      console.error(
        'Erro ao alternar status do PIX:',
        err
      );

      showToast(
        'Erro ao atualizar status do PIX',
        'error'
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        onOpenNfcGuide={() =>
          setIsNfcGuideOpen(true)
        }
        onOpenWhitelist={() =>
          setIsWhitelistOpen(true)
        }
        onOpenDomainConfig={() =>
          setIsDomainModalOpen(true)
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Clientes NFC
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Gerencie estabelecimentos, redes Wi-Fi e URLs gravadas nas placas.
            </p>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Cliente</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total de Clientes
              </p>

              <h3 className="text-3xl font-extrabold text-white mt-1">
                {metrics.total}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Clientes Ativos
              </p>

              <h3 className="text-3xl font-extrabold text-emerald-300 mt-1">
                {metrics.active}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Páginas Desativadas
              </p>

              <h3 className="text-3xl font-extrabold text-rose-300 mt-1">
                {metrics.inactive}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Pesquisar por estabelecimento, SSID ou publicId..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searchTerm && (
              <button
                onClick={() =>
                  setSearchTerm('')
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() =>
                setStatusFilter('all')
              }
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({metrics.total})
            </button>

            <button
              onClick={() =>
                setStatusFilter('active')
              }
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ativos ({metrics.active})
            </button>

            <button
              onClick={() =>
                setStatusFilter('inactive')
              }
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-slate-800 text-rose-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Desativados ({metrics.inactive})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800/60 animate-pulse"
                />
              )
            )}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map(
              (client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={
                    handleOpenEditModal
                  }
                  onDelete={
                    handleOpenDeleteModal
                  }
                  onToggleStatus={
                    handleToggleStatus
                  }
                  onTogglePixStatus={
                    handleTogglePixStatus
                  }
                  onShowQr={
                    handleOpenQrModal
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
              <Radio className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-200">
                {searchTerm
                  ? 'Nenhum resultado encontrado'
                  : 'Nenhum cliente cadastrado ainda'}
              </h3>

              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {searchTerm
                  ? `Não encontramos estabelecimentos correspondentes a "${searchTerm}".`
                  : 'Cadastre seu primeiro estabelecimento para gerar uma página exclusiva e gravar na placa NFC.'}
              </p>
            </div>

            {searchTerm ? (
              <button
                onClick={() =>
                  setSearchTerm('')
                }
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Limpar Pesquisa
              </button>
            ) : (
              <button
                onClick={
                  handleOpenNewModal
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />

                <span>
                  Cadastrar Primeiro Cliente
                </span>
              </button>
            )}
          </div>
        )}
      </main>

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setClientToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        clientToEdit={clientToEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        client={clientToDelete}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setClientForQr(null);
        }}
        client={clientForQr}
      />

      <NfcHelpModal
        isOpen={isNfcGuideOpen}
        onClose={() =>
          setIsNfcGuideOpen(false)
        }
      />

      <AdminWhitelistModal
        isOpen={isWhitelistOpen}
        onClose={() =>
          setIsWhitelistOpen(false)
        }
      />

      <DomainConfigModal
        isOpen={isDomainModalOpen}
        onClose={() =>
          setIsDomainModalOpen(false)
        }
        onDomainUpdated={() =>
          setDomainRefreshKey(
            (key) => key + 1
          )
        }
      />
    </div>
  );
}
