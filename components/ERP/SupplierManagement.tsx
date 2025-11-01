import React, { useState } from 'react';
import type { Supplier } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onAdd: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  onUpdate: (supplier: Supplier) => Promise<void>;
  onDelete: (supplierId: string) => Promise<void>;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleOpenAdd = () => {
    setSelectedSupplier(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormOpen(true);
  };

  const handleOpenDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedSupplier) {
      await onDelete(selectedSupplier.id);
      setConfirmOpen(false);
      setSelectedSupplier(null);
    }
  };

  const handleSave = async (data: any) => {
    if (selectedSupplier) {
      await onUpdate({ ...selectedSupplier, ...data });
    } else {
      await onAdd(data);
    }
    setFormOpen(false);
    setSelectedSupplier(null);
  };
  
  const supplierFields = [
    { name: 'name', label: 'Nome do Fornecedor', type: 'text', required: true },
    { name: 'contactPerson', label: 'Pessoa de Contato', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Telefone', type: 'text', required: true },
    { name: 'cnpj', label: 'CNPJ', type: 'text', required: true },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciamento de Fornecedores</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
        >
          Adicionar Fornecedor
        </button>
      </div>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Fornecedor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Contato</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">CNPJ</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-brand-border/30">
                 <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{supplier.name}</div>
                  <div className="text-sm text-brand-subtle">{supplier.contactPerson}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-text">{supplier.email}</div>
                  <div className="text-sm text-brand-subtle">{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-mono">{supplier.cnpj}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => handleOpenEdit(supplier)} className="text-indigo-400 hover:text-indigo-300 mr-4">Editar</button>
                  <button onClick={() => handleOpenDelete(supplier)} className="text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <EntityFormModal
          title={selectedSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          fields={supplierFields}
          initialData={selectedSupplier}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}
      {isConfirmOpen && selectedSupplier && (
        <ConfirmationModal
          title="Excluir Fornecedor"
          message={`Tem certeza que deseja excluir o fornecedor "${selectedSupplier.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default SupplierManagement;