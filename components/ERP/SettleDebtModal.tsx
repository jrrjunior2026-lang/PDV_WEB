import React, { useState } from 'react';
import type { Customer } from '../../types';

interface SettleDebtModalProps {
  customer: Customer;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
);


const SettleDebtModal: React.FC<SettleDebtModalProps> = ({ customer, onConfirm, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmClick = async () => {
        setIsLoading(true);
        await onConfirm();
        setIsLoading(false);
    }
  
    return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <BanknotesIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                    Receber Pagamento de Dívida
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-brand-subtle">
                        Confirmar o recebimento do valor total de <strong className="text-brand-accent">{customer.currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> do cliente <strong>{customer.name}</strong>?
                    </p>
                     <p className="text-xs text-brand-subtle mt-2">
                        Esta ação irá zerar o saldo devedor do cliente e marcar as contas a receber pendentes como "Pagas".
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            disabled={isLoading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50"
            onClick={handleConfirmClick}
          >
            {isLoading ? 'Processando...' : 'Confirmar Recebimento'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-brand-border shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-border/50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettleDebtModal;