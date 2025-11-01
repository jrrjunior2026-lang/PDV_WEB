
import React from 'react';
import type { TransactionState } from '../App';
import type { PixCharge } from '../types';

const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0 9a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm-4.5 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm-4.5 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin h-8 w-8 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const getStatusContent = (state: TransactionState): { title: string, subtitle: string } => {
    switch (state) {
        case 'generating_xml': return { title: 'Gerando XML da NFC-e...', subtitle: 'Por favor, aguarde um momento.' };
        case 'signing_xml': return { title: 'Assinando Documento Fiscal...', subtitle: 'Quase pronto para o pagamento.' };
        case 'generating_pix': return { title: 'Gerando PIX Dinâmico...', subtitle: 'Conectando ao provedor de pagamento.' };
        case 'awaiting_payment': return { title: 'Aguardando Pagamento via PIX', subtitle: 'Leia o QR Code com o app do seu banco.' };
        case 'payment_confirmed': return { title: 'Pagamento Confirmado!', subtitle: 'Sua NFC-e foi emitida com sucesso.' };
        case 'error': return { title: 'Erro na Transação', subtitle: 'Não foi possível concluir a operação.' };
        default: return { title: 'Iniciando Transação...', subtitle: 'Aguarde...' };
    }
}

interface TransactionModalProps {
  total: number;
  onClose: () => void;
  state: TransactionState;
  errorMessage: string | null;
  signedXml: string | null;
  pixCharge: PixCharge | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ total, onClose, state, errorMessage, signedXml, pixCharge }) => {
  const isProcessing = ['generating_xml', 'signing_xml', 'generating_pix'].includes(state);
  const { title, subtitle } = getStatusContent(state);

  const renderContent = () => {
    if (isProcessing) {
        return <Spinner />;
    }
    if (state === 'error') {
        return (
            <div className="my-4 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-md text-left w-full">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-red-400 flex-shrink-0"/>
                    <div>
                        <h4 className="font-bold">Falha na Emissão</h4>
                        <p className="text-sm break-words">{errorMessage}</p>
                    </div>
                </div>
            </div>
        );
    }
    if (state === 'awaiting_payment') {
        return (
            <div className="relative p-4 bg-white rounded-lg inline-block">
                <div className="absolute inset-0 rounded-lg bg-green-400/50 animate-ping"></div>
                <QrCodeIcon className="w-48 h-48 text-black relative z-10" />
            </div>
        )
    }
    if (state === 'payment_confirmed') {
        return <CheckCircleIcon className="w-48 h-48 text-green-500" />;
    }
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-secondary rounded-lg shadow-2xl p-8 border border-brand-border w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
        <p className="text-brand-subtle mb-6 min-h-[24px] text-center">{subtitle}</p>
        
        <div className="my-6">
            <p className="text-lg text-brand-text">Total da Transação:</p>
            <p className="text-4xl font-bold text-brand-accent">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="min-h-[208px] flex items-center justify-center w-full">
           {renderContent()}
        </div>

        {signedXml && state !== 'error' && (
             <details className="mt-4 text-left w-full">
                <summary className="cursor-pointer text-sm text-brand-subtle hover:text-brand-text">Ver XML da NFC-e</summary>
                <pre className="mt-2 p-2 text-xs bg-brand-primary border border-brand-border rounded-md max-h-32 overflow-auto">
                    <code>{signedXml}</code>
                </pre>
            </details>
        )}

        {state === 'payment_confirmed' && (
             <button 
                onClick={onClose} 
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition-colors"
            >
                <CheckCircleIcon className="w-6 h-6" />
                Concluir e Iniciar Nova Venda
            </button>
        )}

        {(state === 'error' || state === 'awaiting_payment') && (
            <button 
                onClick={onClose} 
                className="mt-6 w-full py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-colors"
            >
                {state === 'error' ? 'Fechar' : 'Cancelar Venda'}
            </button>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;