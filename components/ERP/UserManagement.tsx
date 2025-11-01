import React, { useState } from 'react';
import type { User } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementProps {
  users: User[];
  onAdd: (user: Omit<User, 'id'>) => Promise<void>;
  onUpdate: (user: User) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await onDelete(selectedUser.id);
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSave = async (data: any) => {
    if (selectedUser) {
      await onUpdate({ ...selectedUser, ...data });
    } else {
      await onAdd(data);
    }
    setFormOpen(false);
    setSelectedUser(null);
  };
  
  const userFields = [
    { name: 'name', label: 'Nome Completo', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { 
      name: 'role', 
      label: 'Função', 
      type: 'select', 
      required: true, 
      options: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Caixa', label: 'Caixa' },
      ]
    },
     { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      required: true, 
      options: [
        { value: 'Active', label: 'Ativo' },
        { value: 'Inactive', label: 'Inativo' },
      ]
    },
  ];


  const getStatusBadge = (status: 'Active' | 'Inactive') => {
    return status === 'Active'
      ? 'bg-green-900/50 text-green-300'
      : 'bg-red-900/50 text-red-300';
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Controle de Usuários</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
        >
          Adicionar Novo Usuário
        </button>
      </div>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Função</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-sm text-brand-subtle">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                    {user.status === 'Active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => handleOpenEdit(user)} className="text-indigo-400 hover:text-indigo-300 mr-4">Editar</button>
                  <button onClick={() => handleOpenDelete(user)} className="text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {isFormOpen && (
        <EntityFormModal
          title={selectedUser ? 'Editar Usuário' : 'Adicionar Usuário'}
          fields={userFields}
          initialData={selectedUser}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}
      {isConfirmOpen && selectedUser && (
        <ConfirmationModal
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário "${selectedUser.name}"?`}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;