import React from 'react';

const ShortcutHelper: React.FC = () => {
  const shortcuts = [
    { key: 'F1', action: 'Buscar Produto' },
    { key: 'F2', action: 'Finalizar Venda' },
    { key: 'Ctrl + C', action: 'Limpar Carrinho' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-secondary border-t border-brand-border px-4 py-1 flex justify-center items-center gap-x-6 text-xs text-brand-subtle z-10">
      <span className="font-bold mr-2 text-brand-text">Atalhos:</span>
      {shortcuts.map(({ key, action }) => (
        <div key={key} className="flex items-center gap-x-2">
          <kbd className="px-2 py-1 text-xs font-sans font-semibold text-brand-text bg-brand-primary border border-brand-border rounded-md shadow-sm">
            {key}
          </kbd>
          <span>{action}</span>
        </div>
      ))}
    </div>
  );
};

export default ShortcutHelper;
