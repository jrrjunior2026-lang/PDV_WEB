
import React, { useState } from 'react';

interface DonutChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#58A6FF', '#1F6FEB', '#388BFD', '#8B949E', '#30363D'];

const PaymentMethodDonut: React.FC<DonutChartProps> = ({ data }) => {
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="h-64 flex items-center justify-center text-brand-subtle">Nenhum dado de pagamento.</div>;

    const getArcPath = (startAngle: number, endAngle: number, isHovered: boolean) => {
        const radius = 50;
        const innerRadius = isHovered ? 28 : 30;

        const startX = radius + radius * Math.cos(startAngle);
        const startY = radius + radius * Math.sin(startAngle);
        const endX = radius + radius * Math.cos(endAngle);
        const endY = radius + radius * Math.sin(endAngle);
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

        const innerStartX = radius + innerRadius * Math.cos(endAngle);
        const innerStartY = radius + innerRadius * Math.sin(endAngle);
        const innerEndX = radius + innerRadius * Math.cos(startAngle);
        const innerEndY = radius + innerRadius * Math.sin(startAngle);
        
        return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY} Z`;
    };
    
    let cumulativeAngle = 0;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 h-full">
            <div className="relative">
                <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                    {data.map((item, index) => {
                        const angle = (item.value / total) * 2 * Math.PI;
                        const startAngle = cumulativeAngle;
                        cumulativeAngle += angle;
                        const endAngle = cumulativeAngle;
                        const isHovered = hoveredSegment === item.name;

                        return (
                            <path
                                key={item.name}
                                d={getArcPath(startAngle, endAngle, isHovered)}
                                fill={COLORS[index % COLORS.length]}
                                onMouseEnter={() => setHoveredSegment(item.name)}
                                onMouseLeave={() => setHoveredSegment(null)}
                                className="transition-all duration-200"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xs text-brand-subtle">Total</span>
                     <span className="text-xl font-bold text-brand-text">
                         {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                 </div>
            </div>
            <ul className="space-y-2 text-sm w-full md:w-48">
                {data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    return (
                        <li key={item.name} className="flex items-center justify-between" onMouseEnter={() => setHoveredSegment(item.name)} onMouseLeave={() => setHoveredSegment(null)}>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="font-semibold text-brand-text">{item.name}</span>
                            </div>
                            <span className="font-mono text-brand-subtle">{percentage.toFixed(1)}%</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PaymentMethodDonut;
