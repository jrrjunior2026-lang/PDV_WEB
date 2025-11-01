
import React from 'react';
import TrendIndicator from './TrendIndicator';

interface KpiCardProps {
    title: string;
    value: string | number;
    trend?: number;
    variant?: 'success' | 'danger';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, variant }) => {
    const valueColor = variant === 'danger'
        ? 'text-red-400'
        : variant === 'success'
            ? 'text-green-400'
            : 'text-brand-accent';
    
    return (
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border flex flex-col">
            <h4 className="text-sm font-medium text-brand-subtle">{title}</h4>
            <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
            {typeof trend !== 'undefined' && <TrendIndicator trend={trend} />}
        </div>
    );
};

export default KpiCard;
