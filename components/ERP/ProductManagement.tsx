import React, { useState } from 'react';
import type { Product } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';
import * as geminiService from '../../services/geminiService';

interface ProductManagementProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdate: (product: Product) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      await onDelete(selectedProduct.id);
      setConfirmOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSave = async (data: any) => {
    if (selectedProduct) {
      await onUpdate({ ...selectedProduct, ...data, price: parseFloat(data.price) });
    } else {
      await onAdd({ ...data, price: parseFloat(data.price) });
    }
    setFormOpen(false);
    setSelectedProduct(null);
  };

  const handleAIGenerate = async (fieldName: string, currentData: any): Promise<string | undefined> => {
      if (fieldName === 'name') {
          try {
              const suggestion = await geminiService.suggestProductName(currentData.name, currentData.category);
              return suggestion;
          } catch (error) {
              console.error("AI suggestion failed:", error);
              return undefined;
          }
      }
      return undefined;
  }
  
  const productFields = [
    { name: 'name', label: 'Nome do Produto', type: 'text', required: true, aiEnabled: true },
    { name: 'price', label: 'Preço', type: 'number', required: true, step: '0.01' },
    { name: 'category', label: 'Categoria', type: 'text', required: true },
    { name: 'imageUrl', label: 'URL da Imagem', type: 'text', required: true },
    { name: 'code', label: 'Código Interno', type: 'text', required: true },
    { name: 'fiscalData.ncm', label: 'NCM', type: 'text', required: true, nested: true },
    { name: 'fiscalData.cfop', label: 'CFOP', type: 'text', required: true, nested: true },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciamento de Produtos</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 transition-colors"
        >
          Adicionar Novo Produto
        </button>
      </div>
      <div className="bg-brand-secondary rounded-lg border border-brand-border overflow-hidden">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-border/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Produto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">Preço</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">NCM</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-brand-subtle uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-brand-border/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      <div className="text-sm text-brand-subtle">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-accent font-semibold">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-mono">{product.fiscalData?.ncm}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => handleOpenEdit(product)} className="text-indigo-400 hover:text-indigo-300 mr-4">Editar</button>
                  <button onClick={() => handleOpenDelete(product)} className="text-red-500 hover:text-red-400">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFormOpen && (
        <EntityFormModal
          title={selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}
          fields={productFields}
          initialData={selectedProduct}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
          onAIGenerate={handleAIGenerate}
        />
      )}
      {isConfirmOpen && selectedProduct && (
        <ConfirmationModal
          title="Excluir Produto"
          message={`Tem certeza que deseja excluir o produto "${selectedProduct.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductManagement;