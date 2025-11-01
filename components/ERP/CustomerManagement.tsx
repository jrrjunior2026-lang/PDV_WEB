import React, { useState } from 'react';
import type { Customer } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';
import SettleDebtModal from './SettleDebtModal';

interface CustomerManagementProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'createdAt' | 'creditLimit' | 'currentBalance'>) => Promise<void>;
  onUpdate: (customer: Customer) => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
  onSettleDebt: (customerId: string) => Promise<void>;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onAdd, onUpdate, onDelete, onSettleDebt }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSettleDebtModalOpen, setSettleDebtModalOpen] = useState(false);
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

  const handleOpenSettleDebt = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSettleDebtModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCustomer) {
      await onDelete(selectedCustomer.id);
      setConfirmOpen(false);
      setSelectedCustomer(null);
    }
  };
  
  const handleConfirmSettleDebt = async () => {
      if (selectedCustomer) {
          await onSettleDebt(selectedCustomer.id);
          setSettleDebtModalOpen(false);
          setSelectedCustomer(null);
      }
  }

  const handleSave = async (data: any) => {
    if (selectedCustomer) {
      await onUpdate({ ...selectedCustomer, ...data, creditLimit: parseFloat(data.creditLimit) });
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
    { name: 'creditLimit', label: 'Limite de Crédito (R$)', type: 'number', required: true, step: '0.01' },
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Saldo Devedor</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <div>{customer.name}</div>
                    <div className="text-xs text-brand-subtle font-mono">{customer.cpf}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-brand-text">{customer.email}</div>
                  <div className="text-sm text-brand-subtle">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${customer.currentBalance > 0 ? 'text-red-400' : 'text-brand-text'}`}>
                        {customer.currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="text-xs text-brand-subtle">
                        Limite: {customer.creditLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {customer.currentBalance > 0 && (
                     <button onClick={() => handleOpenSettleDebt(customer)} className="text-green-400 hover:text-green-300 mr-4">Receber Pgto.</button>
                  )}
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
      {isSettleDebtModalOpen && selectedCustomer && (
          <SettleDebtModal
            customer={selectedCustomer}
            onConfirm={handleConfirmSettleDebt}
            onClose={() => setSettleDebtModalOpen(false)}
          />
      )}
    </div>
  );
};

export default CustomerManagement;