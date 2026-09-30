import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, ShieldCheck, Wifi, Smartphone, Zap } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Radio className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight">
              NFC Wi-Fi Connect
            </span>
          </div>

          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <span>Acessar Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Placas NFC de Alta Conversão para Estabelecimentos
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Conexão Wi-Fi rápida e elegante com apenas um toque
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Grave a placa NFC uma única vez com uma URL permanente. Altere a senha, nome da rede e logo em tempo real pelo painel administrativo sem nunca precisar regravar a tag física.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/admin"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <span>Abrir Painel Administrativo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">
              Gravação Única Permanente
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O link gravado na tag é definitivo. O cliente pode trocar a senha da rede quantas vezes quiser sem perder a placa.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">
              Mobile-First & Clean
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Páginas ultra velozes com botão de cópia instantânea da senha e cálculo de contraste automático.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">
              Segurança e Whitelist
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Painel protegido por regras no Firestore e whitelist de e-mails Google com listagem pública estritamente bloqueada.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        NFC Wi-Fi Connect • Sistema Profissional para Placas NFC
      </footer>
    </div>
  );
}
