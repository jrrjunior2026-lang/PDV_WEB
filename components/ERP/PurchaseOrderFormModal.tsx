import React, { useState, useMemo } from 'react';
import type { Supplier, Product, PurchaseOrderItem } from '../../types';

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

interface PurchaseOrderFormModalProps {
  suppliers: Supplier[];
  products: Product[];
  onSave: (data: any) => void;
  onClose: () => void;
}

const PurchaseOrderFormModal: React.FC<PurchaseOrderFormModalProps> = ({ suppliers, products, onSave, onClose }) => {
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for the "add item" form
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1', cost: '0' });

  const totalCost = useMemo(() => items.reduce((sum, item) => sum + item.cost * item.quantity, 0), [items]);

  const handleAddItem = () => {
    const product = products.find(p => p.id === currentItem.productId);
    const quantity = parseInt(currentItem.quantity, 10);
    const cost = parseFloat(currentItem.cost);

    if (product && quantity > 0 && cost >= 0 && !items.find(i => i.productId === product.id)) {
      setItems(prev => [...prev, {
        productId: product.id,
        productName: product.name,
        quantity,
        cost
      }]);
      // Reset form
      setCurrentItem({ productId: '', quantity: '1', cost: '0' });
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setCurrentItem(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

    setIsLoading(true);
    const supplier = suppliers.find(s => s.id === supplierId);
    
    await onSave({
        supplierId,
        supplierName: supplier?.name || 'N/A',
        items,
        totalCost
    });
    setIsLoading(false);
  };

  const availableProducts = products.filter(p => !items.some(item => item.productId === p.id));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Nova Ordem de Compra</h2>
          <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="mb-4">
              <label htmlFor="supplierId" className="block text-sm font-medium text-brand-subtle mb-1">Fornecedor</label>
              <select id="supplierId" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required className="w-full bg-brand-primary border border-brand-border text-brand-text rounded-md p-2">
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>

          <h3 className="text-lg font-semibold text-brand-accent mt-2 mb-2">Itens do Pedido</h3>
          
          {/* Add item form */}
          <div className="grid grid-cols-12 gap-2 p-2 bg-brand-primary/50 rounded-md">
                <select name="productId" value={currentItem.productId} onChange={handleItemFormChange} className="col-span-6 bg-brand-secondary border border-brand-border text-brand-text rounded-md p-2 text-sm">
                    <option value="">Selecione um produto...</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" name="quantity" value={currentItem.quantity} onChange={handleItemFormChange} placeholder="Qtd" min="1" className="col-span-2 bg-brand-secondary border border-brand-border text-brand-text rounded-md p-2 text-sm text-right" />
                <input type="number" name="cost" value={currentItem.cost} onChange={handleItemFormChange} placeholder="Custo (R$)" step="0.01" min="0" className="col-span-2 bg-brand-secondary border border-brand-border text-brand-text rounded-md p-2 text-sm text-right" />
                <button type="button" onClick={handleAddItem} className="col-span-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 text-sm">Adicionar</button>
          </div>

          {/* Items list */}
          <div className="flex-grow overflow-y-auto mt-4 border-t border-b border-brand-border py-2">
              {items.length === 0 ? (
                  <p className="text-center text-brand-subtle py-8">Nenhum item adicionado.</p>
              ) : items.map(item => (
                  <div key={item.productId} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-brand-primary/50 rounded-md">
                      <span className="col-span-6 text-sm font-medium text-white">{item.productName}</span>
                      <span className="col-span-2 text-sm text-brand-subtle text-right">{item.quantity} un</span>
                      <span className="col-span-2 text-sm text-brand-subtle text-right">{item.cost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                      <span className="col-span-1 text-sm font-semibold text-brand-accent text-right">{(item.quantity * item.cost).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                      <div className="col-span-1 text-right">
                        <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-400">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
              ))}
          </div>

          <div className="pt-4 flex justify-between items-center">
             <div className="text-2xl font-bold">
                <span className="text-brand-text">Custo Total:</span>
                <span className="text-brand-accent ml-2">{totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
             </div>
             <div className="flex gap-4">
                <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                Cancelar
                </button>
                <button type="submit" disabled={isLoading || items.length === 0} className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 disabled:opacity-50">
                {isLoading ? 'Salvando...' : 'Criar Ordem de Compra'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderFormModal;
