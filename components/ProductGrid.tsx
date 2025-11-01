import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => (
  <div
    className="bg-brand-secondary rounded-lg overflow-hidden border border-brand-border cursor-pointer group hover:border-brand-accent transition-all duration-300"
    onClick={() => onAddToCart(product)}
  >
    <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
    <div className="p-3">
      <h3 className="text-sm font-semibold text-brand-text truncate">{product.name}</h3>
      <p className="text-lg font-bold text-brand-accent mt-1">
        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </div>
    <div className="bg-brand-accent/10 text-brand-accent text-center py-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
      Adicionar ao Carrinho
    </div>
  </div>
);

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
