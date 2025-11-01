import React, { useState, useMemo, useEffect } from 'react';
import type { Payment, PaymentMethod } from '../types';

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3.375m-3.375 2.25h10.5m0 0a9 9 0 0 0-9-9m9 9a9 9 0 0 1-9-9m9 9v3.75a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3.75" /></svg>
);
const QrCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 0 1 4.5 3.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0 9a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm-4.5 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm-4.5 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm0 4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Zm9-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5Z" /></svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3.375m-3.375 2.25h10.5m0 0a9 9 0 0 0-9-9m9 9a9 9 0 0 1-9-9m9 9v3.75a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3.75" /></svg>
);
const Spinner = (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

interface PaymentModalProps {
  total: number;
  onFinalize: (payments: Payment[], changeGiven: number) => void;
  onCancel: () => void;
}

type CardState = 'idle' | 'processing' | 'approved' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onFinalize, onCancel }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Dinheiro');
    const [paymentValue, setPaymentValue] = useState('');
    const [receivedValue, setReceivedValue] = useState('');
    const [cardState, setCardState] = useState<CardState>('idle');
    const [isFinalizing, setIsFinalizing] = useState(false);

    const amountPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const amountRemaining = useMemo(() => total - amountPaid, [total, amountPaid]);
    const change = useMemo(() => {
        if (selectedMethod === 'Dinheiro') {
            const received = parseFloat(receivedValue) || 0;
            const toPay = parseFloat(paymentValue) || amountRemaining;
            return received > toPay ? received - toPay : 0;
        }
        return 0;
    }, [receivedValue, paymentValue, amountRemaining, selectedMethod]);

    useEffect(() => {
        setPaymentValue(amountRemaining > 0 ? amountRemaining.toFixed(2) : '');
    }, [amountRemaining]);
    
    const handleAddPayment = () => {
        let amount = parseFloat(paymentValue);
        if (isNaN(amount) || amount <= 0) return;

        if (selectedMethod === 'Dinheiro') {
            const received = parseFloat(receivedValue);
            if (!isNaN(received) && received >= amount) {
                amount = Math.min(amount, amountRemaining);
            } else {
                // Handle case where received amount is less than payment amount
                return;
            }
        }
        
        setPayments(prev => [...prev, { method: selectedMethod, amount }]);
        setReceivedValue('');
    };
    
    const handleCardPayment = () => {
        setCardState('processing');
        setTimeout(() => {
            setCardState('approved');
            setTimeout(() => {
                handleAddPayment();
                setCardState('idle');
            }, 1000);
        }, 2000);
    }
    
    const handleFinalize = async () => {
        setIsFinalizing(true);
        const finalChange = payments.some(p => p.method === 'Dinheiro') ? change : 0;
        await onFinalize(payments, finalChange);
        setIsFinalizing(false);
    }

    const renderPaymentMethodUI = () => {
        if (cardState !== 'idle') {
            return (
                <div className="text-center p-8 flex flex-col items-center justify-center h-48">
                    {cardState === 'processing' && <><Spinner className="w-12 h-12 text-brand-accent mb-4" /> <p>Processando...</p></>}
                    {cardState === 'approved' && <><CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" /> <p className="font-bold">Aprovado!</p></>}
                </div>
            );
        }

        switch (selectedMethod) {
            case 'Dinheiro':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-brand-subtle">Valor a Pagar</label>
                            <input type="number" value={paymentValue} onChange={e => setPaymentValue(e.target.value)} className="w-full bg-brand-primary p-2 rounded-md border border-brand-border text-lg text-right" />
                        </div>
                        <div>
                            <label className="text-sm text-brand-subtle">Valor Recebido</label>
                            <input type="number" value={receivedValue} onChange={e => setReceivedValue(e.target.value)} className="w-full bg-brand-primary p-2 rounded-md border border-brand-border text-lg text-right" placeholder="0,00" autoFocus />
                        </div>
                        <button onClick={handleAddPayment} className="w-full py-2 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-500">Adicionar Pagamento</button>
                    </div>
                );
            case 'Credito':
            case 'Debito':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-brand-subtle">Valor a Pagar</label>
                            <input type="number" value={paymentValue} onChange={e => setPaymentValue(e.target.value)} className="w-full bg-brand-primary p-2 rounded-md border border-brand-border text-lg text-right" />
                        </div>
                         <button onClick={handleCardPayment} className="w-full py-3 bg-blue-600 rounded-md text-white font-semibold hover:bg-blue-500">Processar Cartão</button>
                    </div>
                );
            case 'PIX':
                 return (
                    <div className="text-center p-4 flex flex-col items-center justify-center">
                       <QrCodeIcon className="w-24 h-24 text-brand-text mb-4" />
                       <p className="text-sm text-brand-subtle mb-4">Aponte a câmera para o QR Code para pagar.</p>
                       <button onClick={handleAddPayment} className="w-full py-2 bg-green-600 rounded-md text-white font-semibold hover:bg-green-500">Confirmar Pagamento PIX</button>
                    </div>
                );
        }
    }
    
    const methods: { name: PaymentMethod, icon: React.ReactNode }[] = [
        { name: 'Dinheiro', icon: <WalletIcon className="w-6 h-6" /> },
        { name: 'PIX', icon: <QrCodeIcon className="w-6 h-6" /> },
        { name: 'Debito', icon: <CreditCardIcon className="w-6 h-6" /> },
        { name: 'Credito', icon: <CreditCardIcon className="w-6 h-6" /> },
    ];
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-secondary rounded-lg shadow-2xl border border-brand-border w-full max-w-4xl flex">
        {/* Left Panel: Summary */}
        <div className="w-1/3 p-6 border-r border-brand-border flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Resumo da Venda</h2>
            <div className="space-y-4 text-lg flex-grow">
                <div className="flex justify-between"><span>Total:</span> <span className="font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                <div className="flex justify-between text-green-400"><span>Pago:</span> <span className="font-semibold">{amountPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                <div className="flex justify-between text-yellow-400"><span>Restante:</span> <span className="font-semibold">{amountRemaining > 0 ? amountRemaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</span></div>
                {change > 0 && <div className="flex justify-between text-blue-400"><span>Troco:</span> <span className="font-semibold">{change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
            </div>
            
            <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Pagamentos Adicionados</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
                {payments.map((p, i) => (
                    <div key={i} className="flex justify-between bg-brand-primary/50 p-2 rounded-md">
                        <span>{p.method}</span>
                        <span className="font-mono">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                ))}
                {payments.length === 0 && <p className="text-brand-subtle text-xs text-center">Nenhum pagamento adicionado.</p>}
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <button onClick={onCancel} className="w-full py-3 bg-red-600/80 text-white font-semibold rounded-md hover:bg-red-600 transition-colors">Cancelar</button>
                <button onClick={handleFinalize} disabled={amountRemaining > 0 || isFinalizing} className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-wait">
                    {isFinalizing ? <Spinner className="w-6 h-6 mx-auto" /> : 'Finalizar Venda'}
                </button>
            </div>
        </div>
        {/* Right Panel: Payment Methods */}
        <div className="w-2/3 p-6">
            <div className="flex justify-around mb-6">
                {methods.map(m => (
                    <button key={m.name} onClick={() => setSelectedMethod(m.name)} className={`flex flex-col items-center gap-2 p-3 rounded-lg w-24 ${selectedMethod === m.name ? 'bg-brand-accent text-white' : 'bg-brand-border/50 text-brand-subtle hover:bg-brand-border'}`}>
                        {m.icon}
                        <span>{m.name}</span>
                    </button>
                ))}
            </div>
            <div className="bg-brand-primary p-4 rounded-lg">
                {renderPaymentMethodUI()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;