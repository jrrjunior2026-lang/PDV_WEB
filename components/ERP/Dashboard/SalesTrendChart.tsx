
import React, { useState } from 'react';

interface SalesTrendChartProps {
  data: { date: string; total: number }[];
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, total: number } | null>(null);

    if (!data || data.length === 0) return null;

    const width = 500;
    const height = 200;
    const padding = { top: 10, right: 10, bottom: 20, left: 10 };
    
    const maxValue = Math.max(...data.map(d => d.total), 0);
    const xScale = (i: number) => padding.left + i * (width - padding.left - padding.right) / (data.length - 1);
    const yScale = (value: number) => height - padding.bottom - (value / (maxValue || 1)) * (height - padding.top - padding.bottom);

    const pathData = data.map((point, i) => {
        const x = xScale(i);
        const y = yScale(point.total);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        
        const closestIndex = data.reduce((closest, _, i) => {
            const dist = Math.abs(xScale(i) - svgP.x);
            const closestDist = Math.abs(xScale(closest) - svgP.x);
            return dist < closestDist ? i : closest;
        }, 0);

        const point = data[closestIndex];
        setTooltip({
            x: xScale(closestIndex),
            y: yScale(point.total),
            date: point.date,
            total: point.total
        });
    };

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
                {/* Y-axis labels */}
                <text x={padding.left} y={padding.top} dy="0.3em" fontSize="10" fill="#8B949E">{maxValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</text>
                <text x={padding.left} y={height - padding.bottom} dy="-0.3em" fontSize="10" fill="#8B949E">R$ 0</text>

                {/* Path */}
                <path d={pathData} fill="none" stroke="#58A6FF" strokeWidth="2" />

                {/* X-axis labels */}
                {data.map((point, i) => (
                    <text key={i} x={xScale(i)} y={height} dy="-4" textAnchor="middle" fontSize="10" fill="#8B949E">
                        {point.date}
                    </text>
                ))}

                {/* Tooltip */}
                {tooltip && (
                    <>
                        <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="#C9D1D9" strokeDasharray="3,3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#58A6FF" stroke="#0D1117" strokeWidth="2" />
                    </>
                )}
            </svg>
             {tooltip && (
                <div 
                    className="absolute bg-brand-primary p-2 rounded-md text-xs pointer-events-none border border-brand-border shadow-lg"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 40, transform: `translateX(-${tooltip.x / width * 100}%)` }}
                >
                    <div className="font-bold text-brand-text">{tooltip.date}</div>
                    <div className="text-brand-accent">{tooltip.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
            )}
        </div>
    );
};

export default SalesTrendChart;
