import React from 'react';
import type { NcmCode, CfopCode } from '../../types';

interface FiscalManagementProps {
  ncmCodes: NcmCode[];
  cfopCodes: CfopCode[];
}

const FiscalTable: React.FC<{ title: string; data: { code: string, description: string }[] }> = ({ title, data }) => (
    <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <h3 className="text-xl font-bold text-white p-4 bg-brand-border/30">{title}</h3>
        <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-brand-border">
                <thead className="bg-brand-border/50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider w-1/4">Código</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Descrição</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {data.map((item) => (
                        <tr key={item.code} className="hover:bg-brand-border/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">{item.code}</td>
                            <td className="px-6 py-4 text-sm text-brand-text">{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const FiscalManagement: React.FC<FiscalManagementProps> = ({ ncmCodes, cfopCodes }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Gerenciamento Fiscal (Cadastros)</h2>
      <div className="space-y-8">
        <FiscalTable title="NCM - Nomenclatura Comum do Mercosul" data={ncmCodes} />
        <FiscalTable title="CFOP - Código Fiscal de Operações e Prestações" data={cfopCodes} />
      </div>
    </div>
  );
};

export default FiscalManagement;
