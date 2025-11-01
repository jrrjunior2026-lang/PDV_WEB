import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
    return (
        <div className="bg-brand-secondary p-6 rounded-lg border border-brand-border">
            <h4 className="text-sm font-medium text-brand-subtle">{title}</h4>
            <p className="text-3xl font-bold text-brand-accent mt-2">{value}</p>
        </div>
    );
};

export default KpiCard;
