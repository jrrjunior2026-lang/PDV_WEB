import React, { useState } from 'react';
import type { PurchaseOrder, Supplier, Product } from '../../types';
import PurchaseOrderFormModal from './PurchaseOrderFormModal';
import ConfirmationModal from './ConfirmationModal';

interface PurchaseOrderManagementProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  onAdd: (order: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  onUpdateStatus: (orderId: string, status: 'Recebido' | 'Cancelado') => Promise<void>;
}

const PurchaseOrderManagement: React.FC<PurchaseOrderManagementProps> = ({ purchaseOrders, suppliers, products, onAdd, onUpdateStatus }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [actionType, setActionType] = useState<'receive' | 'cancel' | null>(null);

  const handleOpenAdd = () => {
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleOpenConfirm = (order: PurchaseOrder, type: 'receive' | 'cancel') => {
    setSelectedOrder(order);
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (selectedOrder && actionType) {
        const newStatus = actionType === 'receive' ? 'Recebido' : 'Cancelado';
        await onUpdateStatus(selectedOrder.id, newStatus);
        setConfirmOpen(false);
        setSelectedOrder(null);
        setActionType(null);
    }
  };

  const handleSave = async (data: any) => {
    await onAdd(data);
    setFormOpen(false);
  };
  
  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
        case 'Pendente': return 'bg-yellow-900/50 text-yellow-300';
        case 'Recebido': return 'bg-green-900/50 text-green-300';
        case 'Cancelado': return 'bg-red-900/50 text-red-300';
    }
  };
  
  const sortedOrders = [...purchaseOrders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciamento de Ordens de Compra</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
        >
          Nova Ordem de Compra
        </button>
      </div>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Data</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Fornecedor</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Itens</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-subtle uppercase tracking-wider">Custo Total</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {sortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.supplierName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-brand-text">{order.items.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-brand-accent">{order.totalCost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {order.status === 'Pendente' && (
                    <>
                        <button onClick={() => handleOpenConfirm(order, 'receive')} className="text-green-400 hover:text-green-300 mr-4">Receber</button>
                        <button onClick={() => handleOpenConfirm(order, 'cancel')} className="text-red-500 hover:text-red-400">Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <PurchaseOrderFormModal
            suppliers={suppliers}
            products={products}
            onSave={handleSave}
            onClose={() => setFormOpen(false)}
        />
      )}
      {isConfirmOpen && selectedOrder && (
        <ConfirmationModal
          title={`${actionType === 'receive' ? 'Receber' : 'Cancelar'} Ordem de Compra`}
          message={`Tem certeza que deseja ${actionType === 'receive' ? 'marcar como recebida' : 'cancelar'} a ordem de compra para "${selectedOrder.supplierName}"? ${actionType === 'receive' ? 'Isso dará entrada dos itens no estoque.' : ''}`}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default PurchaseOrderManagement;