import React from 'react';

interface SalesByHourChartProps {
    data: { hour: string; total: number }[];
}

const SalesByHourChart: React.FC<SalesByHourChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.total));

    return (
        <div className="h-64 flex items-end justify-around gap-2 p-4 bg-brand-primary/30 rounded-lg">
            {data.map(({ hour, total }) => (
                <div key={hour} className="flex-1 flex flex-col items-center justify-end" title={`${hour}: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}>
                    <div
                        className="w-full bg-brand-accent rounded-t-md hover:bg-blue-400 transition-colors"
                        style={{ height: `${maxValue > 0 ? (total / maxValue) * 100 : 0}%` }}
                    />
                    <div className="text-xs text-brand-subtle mt-2">{hour.substring(0,2)}h</div>
                </div>
            ))}
        </div>
    );
};

export default SalesByHourChart;
