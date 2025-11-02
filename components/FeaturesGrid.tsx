import React from 'react';
import Card from './Card';

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="bg-brand-primary/50 p-4 rounded-lg">
        <h4 className="font-bold text-brand-text">{title}</h4>
        <p className="text-sm">{description}</p>
    </div>
);

const FeaturesGrid: React.FC = () => {
  return (
    <Card title="Principais Funcionalidades">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureItem title="PDV Offline-First" description="Continue vendendo mesmo sem internet. Os dados são sincronizados quando a conexão é restabelecida." />
            <FeatureItem title="Gestão de Estoque" description="Controle de inventário em tempo real, importação de NF-e, e relatórios de auditoria." />
            <FeatureItem title="Módulo Financeiro" description="Gerencie contas a pagar e a receber, integrado com as vendas a prazo." />
            <FeatureItem title="Análise com IA" description="Utiliza a API do Gemini para gerar insights de negócio e previsões a partir dos seus dados." />
            <FeatureItem title="Controle de Caixa" description="Abertura, fechamento, sangrias e suprimentos para um controle financeiro preciso." />
            <FeatureItem title="Emissão Fiscal" description="Preparado para emissão de NFC-e, garantindo conformidade fiscal." />
        </div>
    </Card>
  );
};

export default FeaturesGrid;
