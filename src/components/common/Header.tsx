import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wifi, LogOut, ShieldCheck, Radio, BookOpen, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenNfcGuide?: () => void;
  onOpenWhitelist?: () => void;
  onOpenDomainConfig?: () => void;
}

export function Header({
  onOpenNfcGuide,
  onOpenWhitelist,
  onOpenDomainConfig,
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/admin"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight">
                NFC Wi-Fi Connect
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gestão de Placas NFC e Cartões Wi-Fi
            </p>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenDomainConfig && (
            <button
              onClick={onOpenDomainConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Configurar domínio de produção para links NFC"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Domínio NFC</span>
            </button>
          )}

          {onOpenNfcGuide && (
            <button
              onClick={onOpenNfcGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Guia de gravação de tags NFC"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Guia NFC</span>
            </button>
          )}

          {onOpenWhitelist && (
            <button
              onClick={onOpenWhitelist}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Ver e-mails autorizados"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Whitelist</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Admin'}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                    {user.email?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">
                    {user.displayName || 'Administrador'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 max-w-[150px] truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Sair do painel administrativo"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
