
import React from 'react';

const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
  </svg>
);

const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
  </svg>
);

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);


interface TrendIndicatorProps {
  trend: number;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  const isUp = trend > 0;
  const isDown = trend < 0;
  
  const color = isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-brand-subtle';
  const Icon = isUp ? ArrowUpIcon : isDown ? ArrowDownIcon : MinusIcon;

  return (
    <div className={`mt-2 flex items-center text-xs font-semibold ${color}`}>
      <Icon className="w-4 h-4 mr-1" />
      <span>{trend.toFixed(1)}% vs. dia anterior</span>
    </div>
  );
};

export default TrendIndicator;
