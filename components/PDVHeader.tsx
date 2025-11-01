
import React, { useState, useEffect } from 'react';

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const CloudArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

const ClipboardDocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.062.938-2.062 2.063v15.375c0 1.125.938 2.063 2.063 2.063h12.75c1.125 0 2.063-.938 2.063-2.063V12m-10.5-9.375h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Zm1.5 0h.008v.008h-.008v-.008Zm-4.5 9.375h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25h-7.5a2.25 2.25 0 0 0-2.25 2.25v7.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 14.872.938.938m-2.828-2.828.938.938m-2.828-2.828.938.938m2.828 2.828.938.938M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5" />
    </svg>
);

const Spinner = ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


interface PDVHeaderProps {
    isOnline: boolean;
    onToggleOnline: () => void;
    pendingSalesCount: number;
    isSyncing: boolean;
    onOpenHomologationPanel: () => void;
    onOpenERP: () => void;
}

const PDVHeader: React.FC<PDVHeaderProps> = ({ isOnline, onToggleOnline, pendingSalesCount, isSyncing, onOpenHomologationPanel, onOpenERP }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const renderSyncStatus = () => {
        if (isSyncing) {
            return (
                <div className="flex items-center gap-2 text-yellow-400">
                    <Spinner className="w-5 h-5" />
                    <span className="text-sm">Sincronizando...</span>
                </div>
            );
        }
        if (pendingSalesCount > 0) {
            return (
                <div className="flex items-center gap-2 text-yellow-400">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span className="text-sm">{pendingSalesCount} venda(s) pendente(s)</span>
                </div>
            );
        }
        return null;
    }


    return (
        <header className="flex items-center justify-between p-4 bg-brand-secondary border-b border-brand-border flex-shrink-0">
            <div>
                <h1 className="text-xl font-bold text-white">PDV Fiscal</h1>
                <p className="text-xs text-brand-subtle">Frente de Caixa</p>
            </div>
            <div className="flex items-center gap-6">
                <button 
                  onClick={onOpenERP}
                  className="flex items-center gap-2 text-brand-subtle hover:text-brand-accent transition-colors"
                  title="Painel ERP"
                >
                    <CogIcon className="w-6 h-6" />
                    <span className="text-sm font-semibold hidden md:inline">Painel ERP</span>
                </button>
                 <button 
                  onClick={onOpenHomologationPanel}
                  className="flex items-center gap-2 text-brand-subtle hover:text-brand-accent transition-colors"
                  title="Painel de Homologação"
                >
                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                    <span className="text-sm font-semibold hidden md:inline">Homologação</span>
                </button>
                {renderSyncStatus()}
                <div className="flex items-center gap-2 text-brand-subtle">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm">Usuário: Caixa 01</span>
                </div>
                <div className="flex items-center gap-2 text-brand-subtle">
                    <ClockIcon className="w-5 h-5" />
                    <span className="text-sm font-mono">{time.toLocaleTimeString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <label htmlFor="online-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="online-toggle" className="sr-only peer" checked={isOnline} onChange={onToggleOnline} />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
        </header>
    );
};

export default PDVHeader;
