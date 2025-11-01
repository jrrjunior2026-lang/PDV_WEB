import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';

interface LoyaltyRedemptionModalProps {
    customer: Customer;
    cartTotal: number;
    onClose: () => void;
    onSubmit: (pointsToRedeem: number, discountAmount: number) => void;
}

const LoyaltyRedemptionModal: React.FC<LoyaltyRedemptionModalProps> = ({ customer, cartTotal, onClose, onSubmit }) => {
    const [points, setPoints] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const POINTS_TO_BRL_RATE = 10; // 10 points = R$ 1.00

    const { maxRedeemablePoints, discountValue, remainingPoints } = useMemo(() => {
        const pointsAsNumber = parseInt(points, 10) || 0;
        
        // Discount cannot be greater than the cart total
        const maxPointsForCart = Math.floor(cartTotal * POINTS_TO_BRL_RATE);
        
        // User cannot redeem more points than they have
        const maxRedeemablePoints = Math.min(customer.loyaltyPoints, maxPointsForCart);
        
        const clampedPoints = Math.max(0, Math.min(pointsAsNumber, maxRedeemablePoints));

        const discountValue = clampedPoints / POINTS_TO_BRL_RATE;
        const remainingPoints = customer.loyaltyPoints - clampedPoints;

        return { maxRedeemablePoints, discountValue, remainingPoints };
    }, [points, customer.loyaltyPoints, cartTotal]);
    
    const handlePointsChange = (value: string) => {
        const numericValue = parseInt(value, 10);
        if (value === '' || (!isNaN(numericValue) && numericValue >= 0)) {
            setPoints(value);
        }
    };

    const handleSetMaxPoints = () => {
        setPoints(maxRedeemablePoints.toString());
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pointsToRedeem = parseInt(points, 10) || 0;
        if (pointsToRedeem > 0) {
            setIsLoading(true);
            setTimeout(() => {
                onSubmit(pointsToRedeem, discountValue);
                setIsLoading(false);
            }, 300);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Resgatar Pontos de Fidelidade</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <div className="bg-brand-primary/50 p-4 rounded-lg text-center mb-4">
                    <p className="text-sm text-brand-subtle">Saldo Atual do Cliente</p>
                    <p className="text-3xl font-bold text-yellow-400">{customer.loyaltyPoints} <span className="text-lg">pontos</span></p>
                    <p className="text-xs text-brand-subtle mt-1">(Taxa de conversão: {POINTS_TO_BRL_RATE} pts = R$ 1,00)</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label htmlFor="redeem-points" className="block text-sm font-medium text-brand-subtle mb-1">
                            Pontos a resgatar
                        </label>
                        <div className="flex">
                            <input
                                id="redeem-points"
                                type="number"
                                value={points}
                                onChange={(e) => handlePointsChange(e.target.value)}
                                max={maxRedeemablePoints}
                                min="0"
                                required
                                autoFocus
                                className="w-full text-lg font-bold bg-brand-primary border border-brand-border text-brand-accent rounded-l-md p-2 focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="0"
                            />
                            <button
                                type="button"
                                onClick={handleSetMaxPoints}
                                className="bg-brand-border border border-brand-border text-brand-text px-4 rounded-r-md text-sm font-semibold hover:bg-brand-border/70"
                            >
                                Usar Max
                            </button>
                        </div>
                         {maxRedeemablePoints > 0 && <p className="text-xs text-brand-subtle mt-1">Máximo resgatável para esta compra: {maxRedeemablePoints} pontos.</p>}
                    </div>
                    
                     <div className="p-4 rounded-md text-center bg-brand-primary">
                        <span className="text-sm text-brand-subtle">Desconto Gerado</span>
                        <p className="text-2xl font-bold text-green-400">
                           {discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs text-brand-subtle mt-1">Saldo restante será de {remainingPoints} pontos.</p>
                    </div>


                    <div className="mt-6 pt-4 border-t border-brand-border flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading || !points || parseInt(points) <= 0}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                            {isLoading ? 'Aplicando...' : 'Confirmar Resgate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoyaltyRedemptionModal;
