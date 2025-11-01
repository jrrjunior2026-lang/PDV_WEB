import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, Product, SaleRecord, User, AccountTransaction, StockLevel, StockMovement, Customer, Supplier, NFeImportResult, CashShift, Payment } from './types';
import PDVHeader from './components/PDVHeader';
import ProductGrid from './components/ProductGrid';
import CartDisplay from './components/CartDisplay';
import PaymentModal from './components/PaymentModal';
import HomologationPanel from './components/HomologationPanel';
import ERPDashboard from './components/ERP/Dashboard';
import ShortcutHelper from './components/ShortcutHelper';
import OpenShiftModal from './components/OpenShiftModal';
import CloseShiftModal from './components/CloseShiftModal';
import ShiftMovementModal from './components/ShiftMovementModal';

import * as productApi from './api/products';
import * as customerApi from './api/customers';
import * as supplierApi from './api/suppliers';
import { generateAndSignNfce } from './api/sales';
import * as syncApi from './api/sync';
import * as inventoryApi from './api/inventory';
import * as nfeProcessor from './api/nfeProcessor';
import * as userApi from './api/users';
import { getFinancials } from './api/financials';
import * as cashRegisterApi from './api/cashRegister';


type AppView = 'pdv' | 'erp';
type ShiftModal = 'close' | 'movement' | null;

const App: React.FC = () => {
  // Global State
  const [currentView, setCurrentView] = useState<AppView>('pdv');
  
  // ERP Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [financials, setFinancials] = useState<AccountTransaction[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [shiftHistory, setShiftHistory] = useState<CashShift[]>([]);

  // PDV State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Shift State
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [isShiftOpenModalVisible, setShiftOpenModalVisible] = useState(false);
  const [activeShiftModal, setActiveShiftModal] = useState<ShiftModal>(null);
  const [movementType, setMovementType] = useState<'Suprimento' | 'Sangria'>('Sangria');

  // Offline/Sync State
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Homologation Panel State
  const [isHomologationPanelOpen, setHomologationPanelOpen] = useState(false);
  
  // --- DATA REFRESH LOGIC ---
  const refreshInventoryData = useCallback(async () => {
      const [levels, movements] = await Promise.all([
          inventoryApi.getStockLevels(),
          inventoryApi.getStockMovements()
      ]);
      setStockLevels(levels);
      setStockMovements(movements);
  }, []);

  const refreshProducts = useCallback(async () => {
    const prods = await productApi.getProducts();
    setProducts(prods);
  }, []);

  const refreshCustomers = useCallback(async () => {
    const custs = await customerApi.getCustomers();
    setCustomers(custs);
  }, []);

  const refreshSuppliers = useCallback(async () => {
    const supps = await supplierApi.getSuppliers();
    setSuppliers(supps);
  }, []);
  
  const refreshUsers = useCallback(async () => {
    const userList = await userApi.getUsers();
    setUsers(userList);
  }, []);

  const refreshShiftHistory = useCallback(async () => {
      const history = await cashRegisterApi.getShiftHistory();
      setShiftHistory(history);
  }, []);


  // --- DATA FETCHING ---
  useEffect(() => {
    const loadInitialData = async () => {
      // First, check for an active shift
      const activeShift = await cashRegisterApi.getCurrentShift();
      setCurrentShift(activeShift);
      if (!activeShift) {
        setShiftOpenModalVisible(true);
      }

      const [
        prods, custs, supps,
        queuedSales, history, userList, 
        financialData, sLevels, sMovements,
        shifts
      ] = await Promise.all([
        productApi.getProducts(),
        customerApi.getCustomers(),
        supplierApi.getSuppliers(),
        syncApi.getQueuedSales(),
        syncApi.getSalesHistory(),
        userApi.getUsers(),
        getFinancials(),
        inventoryApi.getStockLevels(),
        inventoryApi.getStockMovements(),
        cashRegisterApi.getShiftHistory()
      ]);

      setProducts(prods);
      setCustomers(custs);
      setSuppliers(supps);
      setPendingSalesCount(queuedSales.length);
      setSalesHistory(history);
      setUsers(userList);
      setFinancials(financialData);
      setStockLevels(sLevels);
      setStockMovements(sMovements);
      setShiftHistory(shifts);
    };
    loadInitialData();
  }, []);

  // --- SYNC LOGIC ---
  const handleSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    const queuedSales = syncApi.getQueuedSales();
    if (queuedSales.length === 0) return;
    setIsSyncing(true);
    try {
      const { syncedIds } = await syncApi.synchronizeSales(queuedSales);
      syncApi.clearSyncedSales(syncedIds);
      setPendingSalesCount(syncApi.getQueuedSales().length);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Erro de sincronização.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline]);

  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline, handleSync]);

  // --- PDV CART LOGIC ---
  const handleAddToCart = useCallback((product: Product) => {
    if (!currentShift) return;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, [currentShift]);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const handleClearCart = useCallback(() => setCart([]), []);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- PDV TRANSACTION LOGIC ---
  const handleOpenPaymentModal = () => {
    if (cart.length > 0 && currentShift) {
      setPaymentModalOpen(true);
    }
  };

  const handleFinalizeSale = useCallback(async (payments: Payment[], changeGiven: number) => {
    try {
        const signedXml = await generateAndSignNfce(cart, total, payments);

        const saleRecord: SaleRecord = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            items: cart,
            total: total,
            payments,
            changeGiven,
            nfceXml: signedXml,
        };

        syncApi.recordSale(saleRecord, isOnline);
        const updatedShift = await cashRegisterApi.addSaleToShift(saleRecord);
        setCurrentShift(updatedShift);

        setPendingSalesCount(syncApi.getQueuedSales().length);
        setSalesHistory(prev => [...prev, saleRecord]); // Optimistic update
        await refreshInventoryData();

        if (isOnline) {
            handleSync();
        }
        handleClearCart();
        setPaymentModalOpen(false);

    } catch (error) {
        console.error("Failed to finalize sale:", error);
        // Here you could show an error message to the user
    }
  }, [cart, total, isOnline, handleSync, handleClearCart, refreshInventoryData]);

  // --- SHIFT LOGIC ---
  const handleOpenShift = useCallback(async (openingBalance: number) => {
    const newShift = await cashRegisterApi.openShift(openingBalance, { id: 'user-2', name: 'João Silva (Caixa 1)' });
    setCurrentShift(newShift);
    setShiftOpenModalVisible(false);
  }, []);

  const handleCloseShift = useCallback(async (closingBalance: number) => {
      if (!currentShift) return;
      await cashRegisterApi.closeShift(closingBalance);
      setCurrentShift(null);
      await refreshShiftHistory();
      setActiveShiftModal(null);
      setShiftOpenModalVisible(true); // Force new shift opening
  }, [currentShift, refreshShiftHistory]);

  const handleRecordShiftMovement = useCallback(async (amount: number, reason: string) => {
      if (!currentShift) return;
      const updatedShift = await cashRegisterApi.recordMovement(movementType, amount, reason, {id: 'user-2'});
      setCurrentShift(updatedShift);
      setActiveShiftModal(null);
  }, [currentShift, movementType]);

  const openMovementModal = (type: 'Suprimento' | 'Sangria') => {
      setMovementType(type);
      setActiveShiftModal('movement');
  }

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentView !== 'pdv' || isPaymentModalOpen || isHomologationPanelOpen || !!activeShiftModal || isShiftOpenModalVisible) {
        return;
      }

      if (event.key === 'F1') {
        event.preventDefault();
        document.getElementById('product-search-input')?.focus();
      } else if (event.key === 'F2') {
        event.preventDefault();
        if (cart.length > 0) {
          handleOpenPaymentModal();
        }
      } else if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
        event.preventDefault();
        if (cart.length > 0) {
          handleClearCart();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, isPaymentModalOpen, isHomologationPanelOpen, cart.length, handleClearCart, activeShiftModal, isShiftOpenModalVisible]);
  
  // --- ERP CRUD HANDLERS ---
  const handleAddProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    await productApi.addProduct(productData);
    await refreshProducts();
    await refreshInventoryData(); // New products need stock initialized
  }, [refreshProducts, refreshInventoryData]);

  const handleUpdateProduct = useCallback(async (productData: Product) => {
    await productApi.updateProduct(productData);
    await refreshProducts();
  }, [refreshProducts]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await productApi.deleteProduct(productId);
    await refreshProducts();
    await refreshInventoryData();
  }, [refreshProducts, refreshInventoryData]);

  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
    await customerApi.addCustomer(customerData);
    await refreshCustomers();
  }, [refreshCustomers]);

  const handleUpdateCustomer = useCallback(async (customerData: Customer) => {
    await customerApi.updateCustomer(customerData);
    await refreshCustomers();
  }, [refreshCustomers]);

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await customerApi.deleteCustomer(customerId);
    await refreshCustomers();
  }, [refreshCustomers]);

  const handleAddSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    await supplierApi.addSupplier(supplierData);
    await refreshSuppliers();
  }, [refreshSuppliers]);
  
  const handleUpdateSupplier = useCallback(async (supplierData: Supplier) => {
    await supplierApi.updateSupplier(supplierData);
    await refreshSuppliers();
  }, [refreshSuppliers]);

  const handleDeleteSupplier = useCallback(async (supplierId: string) => {
    await supplierApi.deleteSupplier(supplierId);
    await refreshSuppliers();
  }, [refreshSuppliers]);

  const handleAddUser = useCallback(async (userData: Omit<User, 'id'>) => {
    await userApi.addUser(userData);
    await refreshUsers();
  }, [refreshUsers]);
  
  const handleUpdateUser = useCallback(async (userData: User) => {
    await userApi.updateUser(userData);
    await refreshUsers();
  }, [refreshUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    await userApi.deleteUser(userId);
    await refreshUsers();
  }, [refreshUsers]);


  // --- NF-e Import Handler ---
  const handleNFeImport = useCallback(async (file: File): Promise<NFeImportResult> => {
    const xmlContent = await file.text();
    const result = await nfeProcessor.processNFeFile(xmlContent);
    // After processing, refresh all relevant data sources
    await Promise.all([
        refreshProducts(),
        refreshSuppliers(),
        refreshInventoryData()
    ]);
    return result;
  }, [refreshProducts, refreshSuppliers, refreshInventoryData]);


  // --- RENDER LOGIC ---
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentView === 'erp') {
    return (
      <ERPDashboard 
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        customers={customers}
        onAddCustomer={handleAddCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        suppliers={suppliers}
        onAddSupplier={handleAddSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        onDeleteSupplier={handleDeleteSupplier}
        salesHistory={salesHistory}
        shiftHistory={shiftHistory}
        users={users}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        financials={financials}
        stockLevels={stockLevels}
        stockMovements={stockMovements}
        onRefreshInventory={refreshInventoryData}
        onNFeImport={handleNFeImport}
        onBackToPDV={() => setCurrentView('pdv')} 
      />
    );
  }

  const isPdvLocked = !currentShift;

  return (
    <div className="flex flex-col h-screen font-sans bg-brand-primary text-brand-text">
      <PDVHeader
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(prev => !prev)}
        pendingSalesCount={pendingSalesCount}
        isSyncing={isSyncing}
        onOpenHomologationPanel={() => setHomologationPanelOpen(true)}
        onOpenERP={() => setCurrentView('erp')}
        shiftStatus={currentShift?.status || 'Fechado'}
        onCloseShift={() => setActiveShiftModal('close')}
        onSuprimento={() => openMovementModal('Suprimento')}
        onSangria={() => openMovementModal('Sangria')}
      />
      <main className="flex flex-1 overflow-hidden relative">
        {isPdvLocked && (
            <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center">
                <div className="text-center p-8 bg-brand-secondary rounded-lg">
                    <h2 className="text-2xl font-bold text-white">Caixa Fechado</h2>
                    <p className="text-brand-subtle mt-2">Abra o caixa para iniciar as vendas.</p>
                </div>
            </div>
        )}
        <div className={`w-2/3 flex flex-col p-4 ${isPdvLocked ? 'pointer-events-none blur-sm' : ''}`}>
            <div className="mb-4 relative">
                <label htmlFor="product-search-input" className="sr-only">Buscar Produto (F1)</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-brand-subtle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    id="product-search-input"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto... (F1)"
                    className="w-full bg-brand-secondary border border-brand-border rounded-md p-2 pl-10 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                />
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
            </div>
        </div>
        <aside className={`w-1/3 bg-brand-secondary border-l border-brand-border flex flex-col ${isPdvLocked ? 'pointer-events-none blur-sm' : ''}`}>
          <CartDisplay
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onPay={handleOpenPaymentModal}
            total={total}
          />
        </aside>
      </main>
      
      {isShiftOpenModalVisible && <OpenShiftModal onOpen={handleOpenShift} />}

      {activeShiftModal === 'close' && currentShift && (
          <CloseShiftModal 
            shift={currentShift}
            onClose={() => setActiveShiftModal(null)}
            onSubmit={handleCloseShift}
          />
      )}

      {activeShiftModal === 'movement' && currentShift && (
          <ShiftMovementModal
            type={movementType}
            onClose={() => setActiveShiftModal(null)}
            onSubmit={handleRecordShiftMovement}
          />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          total={total}
          onFinalize={handleFinalizeSale}
          onCancel={() => setPaymentModalOpen(false)}
        />
      )}

       {isHomologationPanelOpen && (
        <HomologationPanel onClose={() => setHomologationPanelOpen(false)} />
      )}
      {currentView === 'pdv' && <ShortcutHelper />}
    </div>
  );
};

export default App;