import React, { useState } from 'react';
import type { Customer } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';

interface CustomerManagementProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onUpdate: (customer: Customer) => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCustomer) {
      await onDelete(selectedCustomer.id);
      setConfirmOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleSave = async (data: any) => {
    if (selectedCustomer) {
      await onUpdate({ ...selectedCustomer, ...data });
    } else {
      await onAdd(data);
    }
    setFormOpen(false);
    setSelectedCustomer(null);
  };
  
  const customerFields = [
    { name: 'name', label: 'Nome Completo', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Telefone', type: 'text', required: true },
    { name: 'cpf', label: 'CPF', type: 'text', required: true },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciamento de Clientes</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
        >
          Adicionar Novo Cliente
        </button>
      </div>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Contato</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">CPF</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-text">{customer.email}</div>
                  <div className="text-sm text-brand-subtle">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-mono">{customer.cpf}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => handleOpenEdit(customer)} className="text-indigo-400 hover:text-indigo-300 mr-4">Editar</button>
                  <button onClick={() => handleOpenDelete(customer)} className="text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <EntityFormModal
          title={selectedCustomer ? 'Editar Cliente' : 'Adicionar Cliente'}
          fields={customerFields}
          initialData={selectedCustomer}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}
      {isConfirmOpen && selectedCustomer && (
        <ConfirmationModal
          title="Excluir Cliente"
          message={`Tem certeza que deseja excluir o cliente "${selectedCustomer.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerManagement;