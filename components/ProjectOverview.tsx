import React from 'react';
import Card from './Card';

const ProjectOverview: React.FC = () => {
  return (
    <Card title="Visão Geral do Projeto">
      <p>
        Este é um sistema de Ponto de Venda (PDV) com funcionalidades de Planejamento de Recursos Empresariais (ERP) integrado. 
        Projetado para ser robusto e funcionar offline, garantindo que as operações de venda nunca parem.
        O backend gerencia o inventário, clientes, fornecedores e dados fiscais, enquanto o frontend oferece uma interface rápida e intuitiva para o caixa.
      </p>
    </Card>
  );
};

export default ProjectOverview;
