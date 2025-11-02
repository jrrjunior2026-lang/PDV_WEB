import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-brand-secondary rounded-lg border border-brand-border p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="text-brand-subtle">
        {children}
      </div>
    </div>
  );
};

export default Card;
