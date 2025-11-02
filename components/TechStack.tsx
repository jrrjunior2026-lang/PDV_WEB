import React from 'react';
import Card from './Card';

const TechStack: React.FC = () => {
  const techs = ['React', 'TypeScript', 'TailwindCSS', 'NestJS', 'Prisma', 'PostgreSQL', 'Docker', 'Gemini API'];
  return (
    <Card title="Tecnologias Utilizadas">
      <div className="flex flex-wrap gap-2">
        {techs.map(tech => (
          <span key={tech} className="bg-brand-primary text-brand-accent text-sm font-semibold px-3 py-1 rounded-full">
            {tech}
          </span>
        ))}
      </div>
    </Card>
  );
};

export default TechStack;
