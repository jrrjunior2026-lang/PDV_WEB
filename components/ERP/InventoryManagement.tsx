import React, { useState } from 'react';
import type { StockLevel, StockMovement, Product, InventoryReport, NFeImportResult } from '../../types';
import InventoryCountModal from './InventoryCountModal';
import NFeImportModal from './NFeImportModal';

interface InventoryManagementProps {
    stockLevels: StockLevel[];
    stockMovements: StockMovement[];
    products: Product[];
    onInventoryUpdated: () => Promise<void>;
    onNFeImport: (file: File) => Promise<NFeImportResult>;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ stockLevels, stockMovements, products, onInventoryUpdated, onNFeImport }) => {
    const [isCountModalOpen, setCountModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
    const [importResult, setImportResult] = useState<NFeImportResult | null>(null);

    const sortedMovements = [...stockMovements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleStartInventoryCount = () => {
        setInventoryReport(null);
        setCountModalOpen(true);
    }
    
    const handleStartNFeImport = () => {
        setImportResult(null);
        setImportModalOpen(true);
    }

    const handleFinishInventoryCount = async (report: InventoryReport) => {
        setCountModalOpen(false);
        setInventoryReport(report);
        await onInventoryUpdated();
    }

    const handleFinishNFeImport = (result: NFeImportResult) => {
        setImportModalOpen(false);
        setImportResult(result);
        // The data refresh is already handled in App.tsx
    }

    const getMovementTypeClass = (type: StockMovement['type']) => {
        switch (type) {
            case 'Venda': return 'text-red-400';
            case 'Ajuste de Inventário': return 'text-yellow-400';
            case 'Entrada Inicial': return 'text-green-400';
            case 'Entrada (NF-e)': return 'text-blue-400';
            default: return 'text-brand-text';
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Gerenciamento de Estoque</h2>
                <div className="flex gap-4">
                    <button 
                        onClick={handleStartNFeImport}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
                    >
                        Importar NF-e (XML)
                    </button>
                    <button 
                        onClick={handleStartInventoryCount}
                        className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
                    >
                        Realizar Inventário
                    </button>
                </div>
            </div>

            {importResult && (
                 <div className="mb-8 bg-brand-secondary rounded-lg border border-blue-500/50 p-4">
                     <h3 className="text-xl font-bold text-white mb-3">Resumo da Importação da NF-e #{importResult.summary.invoiceNumber}</h3>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><strong>Fornecedor:</strong> {importResult.details.supplierName} {importResult.summary.supplierCreated ? '(Novo Cadastro)' : '(Existente)'}</p>
                            <p><strong>Itens Processados:</strong> {importResult.summary.productsProcessed}</p>
                            <p><strong>Novos Produtos Cadastrados:</strong> {importResult.summary.newProductsCreated}</p>
                            <p><strong>Total de Entradas no Estoque:</strong> {importResult.summary.stockEntries}</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">Produtos na Nota:</h4>
                            <ul className="list-disc list-inside text-brand-subtle">
                                {importResult.details.products.map(p => (
                                    <li key={p.code}>
                                        <span className="text-brand-text">{p.name}</span> - {p.quantity} un. {p.isNew && <span className="text-yellow-400 font-semibold">(Novo)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </div>
                 </div>
            )}

            {inventoryReport && (
                 <div className="mb-8 bg-brand-secondary rounded-lg border border-brand-border p-4">
                     <h3 className="text-xl font-bold text-white mb-3">Relatório de Inventário - {new Date(inventoryReport.timestamp).toLocaleString('pt-BR')}</h3>
                     {inventoryReport.discrepancies.length === 0 ? (
                         <p className="text-green-400">Nenhuma discrepância encontrada. O estoque está correto.</p>
                     ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="text-left text-xs font-medium text-brand-subtle uppercase tracking-wider py-2">Produto</th>
                                    <th className="text-right text-xs font-medium text-brand-subtle uppercase tracking-wider py-2">Esperado</th>
                                    <th className="text-right text-xs font-medium text-brand-subtle uppercase tracking-wider py-2">Contado</th>
                                    <th className="text-right text-xs font-medium text-brand-subtle uppercase tracking-wider py-2">Diferença</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryReport.discrepancies.map(d => (
                                    <tr key={d.productId}>
                                        <td className="py-1 text-sm text-brand-text">{d.productName}</td>
                                        <td className="py-1 text-sm text-brand-subtle text-right">{d.expected}</td>
                                        <td className="py-1 text-sm text-brand-text text-right">{d.counted}</td>
                                        <td className={`py-1 text-sm font-bold text-right ${d.difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {d.difference > 0 ? '+' : ''}{d.difference}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     )}
                 </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Stock */}
                <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
                    <h3 className="text-xl font-bold text-white p-4 bg-brand-border/30">Estoque Atual</h3>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="min-w-full divide-y divide-brand-border">
                            <thead className="bg-brand-border/50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Produto</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Quantidade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {stockLevels.map(item => (
                                    <tr key={item.productId} className="hover:bg-brand-border/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.productName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-brand-accent">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Trail */}
                <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
                    <h3 className="text-xl font-bold text-white p-4 bg-brand-border/30">Trilha de Auditoria de Estoque</h3>
                    <div className="max-h-[60vh] overflow-y-auto">
                         <table className="min-w-full divide-y divide-brand-border">
                            <thead className="bg-brand-border/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Produto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Tipo</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Alteração</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {sortedMovements.map(item => (
                                    <tr key={item.id} className="hover:bg-brand-border/30">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-brand-subtle">{new Date(item.timestamp).toLocaleString('pt-BR')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{item.productName}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${getMovementTypeClass(item.type)}`}>{item.type}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-bold ${item.quantityChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isCountModalOpen && (
                <InventoryCountModal 
                    products={products}
                    onClose={() => setCountModalOpen(false)}
                    onSubmit={handleFinishInventoryCount}
                />
            )}
            {isImportModalOpen && (
                <NFeImportModal
                    onClose={() => setImportModalOpen(false)}
                    onImport={onNFeImport}
                    onComplete={handleFinishNFeImport}
                />
            )}
        </div>
    );
};

export default InventoryManagement;