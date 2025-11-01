import React, { useState } from 'react';
import type { Product } from '../../types';
import EntityFormModal from './EntityFormModal';
import ConfirmationModal from './ConfirmationModal';
import LabelPrintModal from './LabelPrintModal';
import * as geminiService from '../../services/geminiService';

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
);


interface ProductManagementProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdate: (product: Product) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
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

  const handleOpenPrint = (product: Product) => {
    setSelectedProduct(product);
    setPrintModalOpen(true);
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
    { name: 'ean', label: 'EAN-13', type: 'text' },
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-subtle uppercase tracking-wider">EAN-13</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text font-mono">{product.ean || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={() => handleOpenPrint(product)} className="text-teal-400 hover:text-teal-300 mr-4 inline-flex items-center gap-1"><PrinterIcon className="w-4 h-4" /> Etiquetas</button>
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
      {isPrintModalOpen && selectedProduct && (
        <LabelPrintModal
          product={selectedProduct}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductManagement;