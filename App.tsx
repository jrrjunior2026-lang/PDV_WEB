import React, { useState, useCallback, useEffect } from 'react';
import type { CartItem, Product, PixCharge, SaleRecord, User, AccountTransaction, NcmCode, CfopCode, StockLevel, StockMovement, Customer, Supplier, NFeImportResult } from './types';
import PDVHeader from './components/PDVHeader';
import ProductGrid from './components/ProductGrid';
import CartDisplay from './components/CartDisplay';
import TransactionModal from './components/PaymentModal';
import HomologationPanel from './components/HomologationPanel';
import ERPDashboard from './components/ERP/Dashboard';
import * as productApi from './api/products';
import * as customerApi from './api/customers';
import * as supplierApi from './api/suppliers';
import { processSaleTransaction, listenForPixPayment } from './api/sales';
import * as syncApi from './api/sync';
import * as inventoryApi from './api/inventory';
import * as nfeProcessor from './api/nfeProcessor';
import { getUsers } from './api/users';
import { getFinancials } from './api/financials';
import { getFiscalData } from './api/fiscal';


export type TransactionState =
  | 'idle'
  | 'generating_xml'
  | 'signing_xml'
  | 'generating_pix'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'error';

type AppView = 'pdv' | 'erp';


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
  const [ncmCodes, setNcmCodes] = useState<NcmCode[]>([]);
  const [cfopCodes, setCfopCodes] = useState<CfopCode[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);


  // PDV State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>('idle');
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [paymentListenerUnsubscribe, setPaymentListenerUnsubscribe] = useState<(() => void) | null>(null);

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


  // --- DATA FETCHING ---
  useEffect(() => {
    const loadInitialData = async () => {
      const [
        prods, custs, supps,
        queuedSales, history, userList, 
        financialData, fiscalInfo, sLevels, sMovements
      ] = await Promise.all([
        productApi.getProducts(),
        customerApi.getCustomers(),
        supplierApi.getSuppliers(),
        syncApi.getQueuedSales(),
        syncApi.getSalesHistory(),
        getUsers(),
        getFinancials(),
        getFiscalData(),
        inventoryApi.getStockLevels(),
        inventoryApi.getStockMovements()
      ]);

      setProducts(prods);
      setCustomers(custs);
      setSuppliers(supps);
      setPendingSalesCount(queuedSales.length);
      setSalesHistory(history);
      setUsers(userList);
      setFinancials(financialData);
      setNcmCodes(fiscalInfo.ncm);
      setCfopCodes(fiscalInfo.cfop);
      setStockLevels(sLevels);
      setStockMovements(sMovements);
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
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

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
  const handleInitiateTransaction = useCallback(async () => {
    if (cart.length === 0) return;
    setModalOpen(true);
    setTransactionState('idle');
    setTransactionError(null);
    setGeneratedXml(null);
    setPixCharge(null);
    try {
      const { signedXml, pixCharge: charge } = await processSaleTransaction(cart, total, setTransactionState);
      setGeneratedXml(signedXml);
      setPixCharge(charge);
      setTransactionState('awaiting_payment');
      const unsubscribe = listenForPixPayment(charge.transactionId, () => {
        setTransactionState('payment_confirmed');
      });
      setPaymentListenerUnsubscribe(() => unsubscribe);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      setTransactionError(message);
      setTransactionState('error');
    }
  }, [cart, total]);

  const handleCloseModal = useCallback(async () => {
    if (paymentListenerUnsubscribe) {
      paymentListenerUnsubscribe();
      setPaymentListenerUnsubscribe(null);
    }
    setModalOpen(false);
    if (transactionState === 'payment_confirmed' && pixCharge && generatedXml) {
      const saleRecord: SaleRecord = {
        id: pixCharge.transactionId,
        timestamp: new Date().toISOString(),
        items: cart,
        total: total,
        nfceXml: generatedXml,
        pixTransactionId: pixCharge.transactionId
      };
      syncApi.recordSale(saleRecord, isOnline);
      setPendingSalesCount(syncApi.getQueuedSales().length);
      setSalesHistory(syncApi.getSalesHistory());
      await refreshInventoryData();
      if (isOnline) {
        handleSync();
      }
      handleClearCart();
    }
    setTransactionState('idle');
  }, [transactionState, handleClearCart, paymentListenerUnsubscribe, cart, total, isOnline, handleSync, pixCharge, generatedXml, refreshInventoryData]);

  useEffect(() => {
    return () => {
      if (paymentListenerUnsubscribe) {
        paymentListenerUnsubscribe();
      }
    };
  }, [paymentListenerUnsubscribe]);
  
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
        users={users}
        financials={financials}
        ncmCodes={ncmCodes}
        cfopCodes={cfopCodes}
        stockLevels={stockLevels}
        stockMovements={stockMovements}
        onRefreshInventory={refreshInventoryData}
        onNFeImport={handleNFeImport}
        onBackToPDV={() => setCurrentView('pdv')} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-brand-primary text-brand-text">
      <PDVHeader
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(prev => !prev)}
        pendingSalesCount={pendingSalesCount}
        isSyncing={isSyncing}
        onOpenHomologationPanel={() => setHomologationPanelOpen(true)}
        onOpenERP={() => setCurrentView('erp')}
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-2/3 flex flex-col p-4 overflow-y-auto">
          <ProductGrid products={products} onAddToCart={handleAddToCart} />
        </div>
        <aside className="w-1/3 bg-brand-secondary border-l border-brand-border flex flex-col">
          <CartDisplay
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onPay={handleInitiateTransaction}
            total={total}
          />
        </aside>
      </main>
      {isModalOpen && (
        <TransactionModal
          total={total}
          onClose={handleCloseModal}
          state={transactionState}
          errorMessage={transactionError}
          signedXml={generatedXml}
          pixCharge={pixCharge}
        />
      )}
       {isHomologationPanelOpen && (
        <HomologationPanel onClose={() => setHomologationPanelOpen(false)} />
      )}
    </div>
  );
};

export default App;