import React, { useState } from 'react';
import type { Product, SaleRecord, User, AccountTransaction, NcmCode, CfopCode, StockLevel, StockMovement, Customer, Supplier, NFeImportResult } from '../../types';
import ProductManagement from './ProductManagement';
import SalesHistory from './SalesHistory';
import UserManagement from './UserManagement';
import Financials from './Financials';
import FiscalManagement from './FiscalManagement';
import InventoryManagement from './InventoryManagement';
import CustomerManagement from './CustomerManagement';
import SupplierManagement from './SupplierManagement';

const ShoppingBagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5m-4.5-12.75V16.5m-4.5-12.75V16.5m0 0a9 9 0 1 0 18 0a9 9 0 0 0-18 0Z" />
  </svg>
);

const DocumentChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.53-2.473M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.67c.12-.241.252-.477.396-.702a.75.75 0 0 1 1.256-.217L21 13.5M15 19.128a9.38 9.38 0 0 0 2.625.372" />
    </svg>
);

const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-5.207 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.586l4.243 4.243" />
    </svg>
);

const BuildingStorefrontIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V11.25m0-1.125c.381 0 .75.18 1.01.478.43.514.995.91 1.638 1.156 1.348.49 2.825.187 3.86-.702.554-.48.97-.995 1.242-1.53M12 10.125c-.381 0-.75.18-1.01.478-.43.514-.995.91-1.638 1.156-1.348.49-2.825.187-3.86-.702-.554-.48-.97-.995-1.242-1.53" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-1.875m0 0a8.94 8.94 0 0 0-4.122-1.125 8.94 8.94 0 0 0-4.122 1.125M12 19.125a8.94 8.94 0 0 1 4.122-1.125 8.94 8.94 0 0 1 4.122 1.125M18 12.375a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 21h18" />
    </svg>
);


const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
);

const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);

const ArrowUturnLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);

interface ERPDashboardProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onUpdateCustomer: (customer: Customer) => Promise<void>;
  onDeleteCustomer: (customerId: string) => Promise<void>;

  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  onUpdateSupplier: (supplier: Supplier) => Promise<void>;
  onDeleteSupplier: (supplierId: string) => Promise<void>;

  salesHistory: SaleRecord[];
  users: User[];
  financials: AccountTransaction[];
  ncmCodes: NcmCode[];
  cfopCodes: CfopCode[];
  stockLevels: StockLevel[];
  stockMovements: StockMovement[];
  onRefreshInventory: () => Promise<void>;
  onNFeImport: (file: File) => Promise<NFeImportResult>;
  onBackToPDV: () => void;
}

type ERPView = 'products' | 'customers' | 'suppliers' | 'sales' | 'users' | 'financials' | 'fiscal' | 'inventory';

const ERPDashboard: React.FC<ERPDashboardProps> = (props) => {
  const [activeView, setActiveView] = useState<ERPView>('inventory');

  const renderContent = () => {
    switch (activeView) {
      case 'products':
        return <ProductManagement 
            products={props.products} 
            onAdd={props.onAddProduct}
            onUpdate={props.onUpdateProduct}
            onDelete={props.onDeleteProduct}
        />;
      case 'customers':
        return <CustomerManagement
            customers={props.customers}
            onAdd={props.onAddCustomer}
            onUpdate={props.onUpdateCustomer}
            onDelete={props.onDeleteCustomer}
        />;
      case 'suppliers':
        return <SupplierManagement
            suppliers={props.suppliers}
            onAdd={props.onAddSupplier}
            onUpdate={props.onUpdateSupplier}
            onDelete={props.onDeleteSupplier}
        />;
      case 'sales':
        return <SalesHistory sales={props.salesHistory} />;
      case 'inventory':
        return <InventoryManagement 
            stockLevels={props.stockLevels} 
            stockMovements={props.stockMovements}
            products={props.products}
            onInventoryUpdated={props.onRefreshInventory}
            onNFeImport={props.onNFeImport}
        />;
      case 'users':
        return <UserManagement users={props.users} />;
      case 'financials':
        return <Financials transactions={props.financials} />;
      case 'fiscal':
        return <FiscalManagement ncmCodes={props.ncmCodes} cfopCodes={props.cfopCodes} />;
      default:
        return null;
    }
  };

  const NavItem: React.FC<{
    label: string;
    view: ERPView;
    icon: React.ReactNode;
  }> = ({ label, view, icon }) => (
    <li
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
        activeView === view ? 'bg-brand-accent text-white' : 'hover:bg-brand-border text-brand-subtle'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </li>
  );

  return (
    <div className="flex h-screen font-sans bg-brand-primary text-brand-text">
      <aside className="w-64 bg-brand-secondary p-4 flex flex-col border-r border-brand-border">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Painel ERP</h1>
            <p className="text-sm text-brand-subtle">Administração</p>
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <h3 className="px-3 text-xs font-semibold text-brand-subtle uppercase tracking-wider mb-2">Cadastros</h3>
              <ul className="space-y-1">
                <NavItem label="Produtos" view="products" icon={<ShoppingBagIcon className="w-6 h-6" />} />
                <NavItem label="Clientes" view="customers" icon={<UserGroupIcon className="w-6 h-6" />} />
                <NavItem label="Fornecedores" view="suppliers" icon={<BuildingStorefrontIcon className="w-6 h-6" />} />
              </ul>
            </li>
             <li>
              <h3 className="px-3 text-xs font-semibold text-brand-subtle uppercase tracking-wider mb-2 mt-4">Operacional</h3>
              <ul className="space-y-1">
                <NavItem label="Estoque" view="inventory" icon={<ArchiveBoxIcon className="w-6 h-6" />} />
                <NavItem label="Relatórios de Vendas" view="sales" icon={<DocumentChartBarIcon className="w-6 h-6" />} />
                <NavItem label="Financeiro" view="financials" icon={<BanknotesIcon className="w-6 h-6" />} />
              </ul>
            </li>
             <li>
              <h3 className="px-3 text-xs font-semibold text-brand-subtle uppercase tracking-wider mb-2 mt-4">Sistema</h3>
              <ul className="space-y-1">
                <NavItem label="Cadastro Fiscal" view="fiscal" icon={<DocumentTextIcon className="w-6 h-6" />} />
                <NavItem label="Usuários" view="users" icon={<UsersIcon className="w-6 h-6" />} />
              </ul>
            </li>
          </ul>
        </nav>
        <button
          onClick={props.onBackToPDV}
          className="mt-auto flex items-center justify-center gap-2 w-full p-3 bg-brand-border rounded-md hover:bg-brand-accent/50 transition-colors"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
          <span className="font-semibold">Voltar ao PDV</span>
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default ERPDashboard;