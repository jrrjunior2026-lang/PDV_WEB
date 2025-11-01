import React from 'react';
import type { CartItem, Customer } from '../types';

interface CartDisplayProps {
  items: CartItem[];
  subtotal: number;
  promotionalDiscount: number;
  loyaltyDiscount: number;
  total: number;
  selectedCustomer: Customer | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onPay: () => void;
  onSelectCustomer: () => void;
  onApplyDiscount: (target: { type: 'item', itemId: string } | { type: 'total' }) => void;
  onRedeemPoints: () => void;
}

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
);
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>
);
const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);



const CartDisplay: React.FC<CartDisplayProps> = ({ items, subtotal, promotionalDiscount, loyaltyDiscount, total, selectedCustomer, onUpdateQuantity, onClearCart, onPay, onSelectCustomer, onApplyDiscount, onRedeemPoints }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-brand-border">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Venda Atual</h2>
            <button onClick={onClearCart} disabled={items.length === 0} className="text-brand-subtle hover:text-red-500 disabled:opacity-50 transition-colors" title="Limpar Carrinho (Ctrl+C)">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
        {selectedCustomer ? (
            <div className="mt-3 bg-brand-primary/50 p-3 rounded-lg text-sm space-y-2">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-brand-text">{selectedCustomer.name}</p>
                        <p className="text-xs text-brand-subtle">{selectedCustomer.cpf}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-yellow-400">{selectedCustomer.loyaltyPoints || 0} pts</p>
                        <button onClick={() => onSelectCustomer()} className="text-xs text-blue-400 hover:underline">Trocar</button>
                    </div>
                </div>
                {selectedCustomer.loyaltyPoints > 0 && (
                     <button onClick={onRedeemPoints} className="w-full flex flex-col items-center justify-center gap-1 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40 p-2 rounded-lg transition-colors">
                       <span className="text-xs font-bold">Você tem {selectedCustomer.loyaltyPoints} pontos!</span>
                       <div className="flex items-center gap-1">
                            <GiftIcon className="w-4 h-4" />
                            <span className="text-sm font-semibold underline">Resgatar agora</span>
                       </div>
                    </button>
                )}
            </div>
        ) : (
            <button onClick={onSelectCustomer} className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 p-2 rounded-lg text-sm font-semibold">
                <UserPlusIcon className="w-5 h-5" />
                Identificar Cliente
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-brand-subtle pt-10">Carrinho vazio.</p>
        ) : (
          items.map(item => {
            const itemSubtotal = item.price * item.quantity;
            const discountValue = item.discount
                ? item.discount.type === 'fixed'
                    ? item.discount.amount
                    : itemSubtotal * (item.discount.amount / 100)
                : 0;
            const itemTotal = itemSubtotal - discountValue;

            return (
                <div key={item.id} className="flex items-start gap-3 bg-brand-primary/50 p-2 rounded-md">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-1">
                    <p className="text-sm font-semibold text-brand-text">{item.name}</p>
                    <p className="text-xs text-brand-subtle">{item.quantity} x {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                     {discountValue > 0 && (
                        <p className="text-xs text-green-400">
                           Desconto: -{discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-14 bg-brand-primary border border-brand-border text-center rounded-md text-sm p-1"
                        />
                         <button onClick={() => onApplyDiscount({ type: 'item', itemId: item.id })} className="text-brand-subtle hover:text-brand-accent" title="Aplicar desconto no item">
                            <TagIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="w-24 text-right font-semibold text-brand-accent">
                        {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            )
          })
        )}
      </div>

      <div className="p-4 mt-auto border-t border-brand-border bg-brand-secondary/50">
        <div className="space-y-1 mb-4 text-sm">
            <div className="flex justify-between items-center">
                <span className="text-brand-subtle">Subtotal:</span>
                <span className="font-semibold">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-brand-subtle">Descontos Promocionais:</span>
                <span className="font-semibold text-green-400">-{promotionalDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            {loyaltyDiscount > 0 && (
                <div className="flex justify-between items-center">
                    <span className="text-brand-subtle">Desconto Fidelidade:</span>
                    <span className="font-semibold text-yellow-400">-{loyaltyDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            )}
        </div>

        <div className="flex justify-between items-center text-2xl font-bold mb-4">
          <span className="text-brand-text">Total:</span>
          <span className="text-brand-accent">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => onApplyDiscount({ type: 'total'})}
                disabled={items.length === 0}
                className="w-1/3 py-3 text-sm font-bold bg-brand-border text-brand-text rounded-md hover:bg-brand-border/70 disabled:opacity-50"
            >
                Desconto Total
            </button>
            <button
            onClick={onPay}
            disabled={items.length === 0}
            className="w-2/3 py-3 text-lg font-bold bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-brand-subtle disabled:cursor-not-allowed transition-colors"
            >
            Finalizar Venda (F2)
            </button>
        </div>
      </div>
    </div>
  );
};

export default CartDisplay;