
import React, { useState, useCallback } from 'react';
import type { HomologationItem } from '../types';

const INITIAL_CHECKLIST_ITEMS: HomologationItem[] = [
    { id: '1', text: 'PDV funciona offline (venda + QR Pix + NFC-e contingência).', completed: false },
    { id: '2', text: 'Sincronização de vendas pendentes ao reconectar online.', completed: false },
    { id: '3', text: 'Emissão de NFC-e (simulada) segue o fluxo correto.', completed: false },
    { id: '4', text: 'Geração de PIX dinâmico (simulado) ocorre com sucesso.', completed: false },
    { id: '5', text: 'Webhook de confirmação de pagamento PIX é processado.', completed: false },
    { id: '6', text: 'Logs de segurança e auditoria são gerados (console).', completed: false },
];

type TestStatus = 'idle' | 'running' | 'success' | 'failed';

const Spinner = ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const TestRunner: React.FC<{ name: string; description: string }> = ({ name, description }) => {
    const [status, setStatus] = useState<TestStatus>('idle');
    const [result, setResult] = useState('');

    const runTest = useCallback(() => {
        setStatus('running');
        setResult('');
        const duration = Math.random() * 2000 + 1000; // 1-3 seconds
        const success = Math.random() > 0.15; // 85% chance of success

        setTimeout(() => {
            if (success) {
                setStatus('success');
                setResult(`Teste concluído com sucesso em ${(duration / 1000).toFixed(2)}s.`);
            } else {
                setStatus('failed');
                setResult('Falha: Timeout ao conectar com o servidor de teste.');
            }
        }, duration);

    }, []);

    const getStatusColor = () => {
        switch (status) {
            case 'success': return 'text-green-400';
            case 'failed': return 'text-red-400';
            case 'running': return 'text-yellow-400';
            default: return 'text-brand-subtle';
        }
    };

    return (
        <div className="bg-brand-primary/50 p-4 rounded-lg border border-brand-border">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white">{name}</h4>
                    <p className="text-sm text-brand-subtle mt-1">{description}</p>
                </div>
                <button
                    onClick={runTest}
                    disabled={status === 'running'}
                    className="bg-brand-accent/20 text-brand-accent font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/40 disabled:opacity-50 disabled:cursor-wait transition-colors"
                >
                    {status === 'running' ? 'Executando...' : 'Executar'}
                </button>
            </div>
            {result && (
                <div className={`mt-3 p-2 text-sm rounded-md border ${getStatusColor()} ${status === 'success' ? 'bg-green-900/50 border-green-500/30' : 'bg-red-900/50 border-red-500/30'}`}>
                    <strong>Resultado:</strong> {result}
                </div>
            )}
        </div>
    );
}


interface HomologationPanelProps {
    onClose: () => void;
}

const HomologationPanel: React.FC<HomologationPanelProps> = ({ onClose }) => {
    const [checklist, setChecklist] = useState<HomologationItem[]>(INITIAL_CHECKLIST_ITEMS);

    const toggleChecklistItem = (id: string) => {
        setChecklist(prev =>
            prev.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Painel de Homologação e Testes</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white">&times;</button>
                </div>
                
                <div className="overflow-y-auto space-y-6 pr-2">
                    {/* Checklist Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-accent mb-3 border-b border-brand-border pb-2">Checklist de Critérios de Aceite</h3>
                        <div className="space-y-2">
                            {checklist.map(item => (
                                <label key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-brand-primary/50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => toggleChecklistItem(item.id)}
                                        className="h-4 w-4 rounded bg-brand-primary border-brand-border text-brand-accent focus:ring-brand-accent"
                                    />
                                    <span className={`${item.completed ? 'text-brand-subtle line-through' : 'text-brand-text'}`}>{item.text}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Test Simulation Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-accent mb-3 border-b border-brand-border pb-2">Simulação de Testes</h3>
                        <div className="space-y-4">
                           <TestRunner name="Testes End-to-End (E2E)" description="Simula o fluxo completo: adicionar produto, pagar, emitir NFC-e e sincronizar." />
                           <TestRunner name="Teste de Carga" description="Simula 50 vendas simultâneas para verificar a performance do sistema." />
                        </div>
                    </section>

                    {/* Documentation Section */}
                    <section>
                         <h3 className="text-lg font-semibold text-brand-accent mb-3 border-b border-brand-border pb-2">Referências Normativas</h3>
                         <ul className="list-disc list-inside space-y-2 text-sm">
                             <li><a href="https://www.nfe.fazenda.gov.br/portal/principal.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Manual de Orientação do Contribuinte (MOC) — NFC-e</a></li>
                             <li><a href="https://www.bcb.gov.br/estabilidadefinanceira/pix" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Banco Central do Brasil — Especificações Técnicas do PIX</a></li>
                             <li><a href="http://sped.rfb.gov.br/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">SPED Fiscal — Layouts Oficiais</a></li>
                         </ul>
                    </section>
                </div>

                 <div className="mt-6 pt-4 border-t border-brand-border text-right">
                    <button 
                        onClick={onClose}
                        className="bg-brand-accent/80 text-white font-semibold px-6 py-2 rounded-md hover:bg-brand-accent transition-colors"
                    >
                        Fechar Painel
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default HomologationPanel;
