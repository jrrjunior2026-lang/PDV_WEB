

import React, { useState, useCallback, useEffect, useMemo } from 'react';
// FIX: Add missing InventoryReport type to the import.
import type { CartItem, Product, SaleRecord, User, AccountTransaction, StockLevel, StockMovement, Customer, Supplier, NFeImportResult, CashShift, Payment, PurchaseOrder, InventoryCountItem, InventoryReport } from './types';
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
import CustomerSearchModal from './components/CustomerSearchModal';
import DiscountModal from './components/DiscountModal';
import LoyaltyRedemptionModal from './components/LoyaltyRedemptionModal';
import VoiceCommandControl, { VoiceStatus } from './components/VoiceCommandControl';
import Login from './components/Login';

import * as geminiService from './services/geminiService';
import * as tokenService from './services/tokenService';
import apiClient from './services/apiClient';
import { hasPermission } from './services/authService';


type AppView = 'pdv' | 'erp';
type ShiftModal = 'close' | 'movement' | null;
type DiscountTarget = { type: 'total' } | { type: 'item'; itemId: string };

const App: React.FC = () => {
  // Global State
  const [currentView, setCurrentView] = useState<AppView>('pdv');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
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
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // PDV State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState({ points: 0, amount: 0 });

  // Modals State
  const [isCustomerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<DiscountTarget | null>(null);
  const [isLoyaltyModalOpen, setLoyaltyModalOpen] = useState(false);

  // Shift State
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [isShiftOpenModalVisible, setShiftOpenModalVisible] = useState(false);
  const [activeShiftModal, setActiveShiftModal] = useState<ShiftModal>(null);
  const [movementType, setMovementType] = useState<'Suprimento' | 'Sangria'>('Sangria');

  // Voice Command State
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Offline/Sync State - This will be simplified as we assume online-first now
  const [isOnline, setIsOnline] = useState(true); // Default to online
  const [isSyncing, setIsSyncing] = useState(false);

  // Homologation Panel State
  const [isHomologationPanelOpen, setHomologationPanelOpen] = useState(false);
  
  // --- DATA REFRESH LOGIC ---
  const refreshInventoryData = useCallback(async () => {
    try {
      const [levels, movements] = await Promise.all([
          apiClient.get<StockLevel[]>('/inventory/levels'),
          apiClient.get<StockMovement[]>('/inventory/movements')
      ]);
      setStockLevels(levels);
      setStockMovements(movements);
    } catch (error) {
        console.error("Failed to refresh inventory data", error);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
        const prods = await apiClient.get<Product[]>('/products');
        setProducts(prods);
    } catch (error) {
        console.error("Failed to refresh products", error);
    }
  }, []);

  const refreshCustomers = useCallback(async () => {
    try {
        const custs = await apiClient.get<Customer[]>('/customers');
        setCustomers(custs);
    } catch (error) {
        console.error("Failed to refresh customers", error);
    }
  }, []);

  const refreshSuppliers = useCallback(async () => {
    try {
        const supps = await apiClient.get<Supplier[]>('/suppliers');
        setSuppliers(supps);
    } catch(error) {
        console.error("Failed to refresh suppliers", error);
    }
  }, []);
  
  const refreshUsers = useCallback(async () => {
    try {
        const userList = await apiClient.get<User[]>('/users');
        setUsers(userList);
    } catch(error) {
        console.error("Failed to refresh users", error);
    }
  }, []);

  const refreshFinancials = useCallback(async () => {
    try {
        const financialData = await apiClient.get<AccountTransaction[]>('/financials');
        setFinancials(financialData);
    } catch(error) {
        console.error("Failed to refresh financials", error);
    }
  }, []);

  const refreshShiftHistory = useCallback(async () => {
    try {
      const history = await apiClient.get<CashShift[]>('/shifts/history');
      setShiftHistory(history);
    } catch (error) {
      console.error("Failed to refresh shift history", error);
    }
  }, []);
  
  const refreshPurchaseOrders = useCallback(async () => {
    try {
        const orders = await apiClient.get<PurchaseOrder[]>('/purchasing/orders');
        setPurchaseOrders(orders);
    } catch (error) {
        console.error("Failed to refresh purchase orders", error);
    }
  }, []);


  // --- AUTH & DATA LOADING ---
  const handleLogin = useCallback(async (user: User) => {
    setIsLoadingData(true);
    setCurrentUser(user);

    if (user.role === 'Caixa') {
        setCurrentView('pdv');
    } else {
        setCurrentView('erp');
    }
    
    try {
        const [ prods, custs, supps, history, userList, financialData, sLevels, sMovements, shifts, pOrders, activeShift, analytics ] = await Promise.all([
            apiClient.get<Product[]>('/products'), 
            apiClient.get<Customer[]>('/customers'), 
            apiClient.get<Supplier[]>('/suppliers'),
            apiClient.get<SaleRecord[]>('/sales/history'), 
            apiClient.get<User[]>('/users'),
            apiClient.get<AccountTransaction[]>('/financials'), 
            apiClient.get<StockLevel[]>('/inventory/levels'), 
            apiClient.get<StockMovement[]>('/inventory/movements'),
            apiClient.get<CashShift[]>('/shifts/history'), 
            apiClient.get<PurchaseOrder[]>('/purchasing/orders'),
            apiClient.get<CashShift | null>('/shifts/current'),
            apiClient.get<any>('/analytics/dashboard') // Fetch analytics data
        ]);

        setProducts(prods); setCustomers(custs); setSuppliers(supps);
        setSalesHistory(history); setUsers(userList); setFinancials(financialData); 
        setStockLevels(sLevels); setStockMovements(sMovements); setShiftHistory(shifts); 
        setPurchaseOrders(pOrders); setAnalyticsData(analytics);
        
        setCurrentShift(activeShift);
        if (!activeShift && user.role === 'Caixa') {
            setShiftOpenModalVisible(true);
        }
    } catch (error) {
        console.error("Failed to load initial data", error);
        // Handle logout or show error message
    } finally {
        setIsLoadingData(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    tokenService.removeToken();
    setCurrentUser(null);
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSalesHistory([]);
    setUsers([]);
    setFinancials([]);
    setStockLevels([]);
    setStockMovements([]);
    setShiftHistory([]);
    setPurchaseOrders([]);
    setAnalyticsData(null);
    setCart([]);
    setCurrentShift(null);
    setPaymentModalOpen(false);
    setSearchTerm('');
    setSelectedCustomer(null);
  }, []);

  // --- PDV CART & DISCOUNT LOGIC ---
  const handleAddToCart = useCallback((product: Product, quantity: number = 1) => {
    if (!currentShift) return;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
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

  const handleClearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setLoyaltyDiscount({ points: 0, amount: 0 });
  }, []);

  const handleOpenDiscountModal = useCallback((target: DiscountTarget) => {
      setDiscountTarget(target);
      setDiscountModalOpen(true);
  }, []);

  const handleApplyDiscount = useCallback((amount: number, type: 'fixed' | 'percentage') => {
      if (!discountTarget) return;

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (discountTarget.type === 'item') {
          setCart(prevCart => prevCart.map(item => {
              if (item.id === discountTarget.itemId) {
                  return { ...item, discount: { amount, type } };
              }
              return item;
          }));
      } else { // 'total'
          if (subtotal === 0) return;
          const totalDiscountValue = type === 'fixed' ? amount : subtotal * (amount / 100);
          setCart(prevCart => prevCart.map(item => {
              const itemTotal = item.price * item.quantity;
              const proportionalDiscount = (itemTotal / subtotal) * totalDiscountValue;
              return { ...item, discount: { amount: proportionalDiscount, type: 'fixed' } };
          }));
      }
      setDiscountModalOpen(false);
      setDiscountTarget(null);
  }, [cart, discountTarget]);

  const handleApplyLoyaltyPoints = useCallback((pointsToRedeem: number, discountAmount: number) => {
    setLoyaltyDiscount({ points: pointsToRedeem, amount: discountAmount });
    setLoyaltyModalOpen(false);
  }, []);


  const { subtotal, promotionalDiscount, loyaltyDiscountAmount, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const promotionalDiscount = cart.reduce((sum, item) => {
      if (!item.discount) return sum;
      if (item.discount.type === 'fixed') {
        return sum + item.discount.amount;
      }
      const itemTotal = item.price * item.quantity;
      return sum + (itemTotal * (item.discount.amount / 100));
    }, 0);
    const loyaltyDiscountAmount = loyaltyDiscount.amount;
    const totalValue = subtotal - promotionalDiscount - loyaltyDiscountAmount;
    return { subtotal, promotionalDiscount, loyaltyDiscountAmount, total: totalValue };
  }, [cart, loyaltyDiscount]);


  // --- PDV TRANSACTION LOGIC ---
  const handleOpenPaymentModal = () => {
    if (cart.length > 0 && currentShift) setPaymentModalOpen(true);
  };

  const handleFinalizeSale = useCallback(async (payments: Payment[], changeGiven: number) => {
    try {
        const totalDiscountValue = promotionalDiscount + loyaltyDiscountAmount;
        let pointsEarned = 0;
        if (selectedCustomer) {
            pointsEarned = Math.floor(total / 10); // Example: 1 point per R$10
        }

        const salePayload = {
            items: cart, total, payments, changeGiven,
            customerId: selectedCustomer?.id,
            totalDiscount: totalDiscountValue, 
            loyaltyPointsEarned: pointsEarned,
            loyaltyPointsRedeemed: loyaltyDiscount.points, 
            loyaltyDiscountAmount: loyaltyDiscount.amount,
        };

        const { saleRecord, updatedShift } = await apiClient.post<{ saleRecord: SaleRecord, updatedShift: CashShift }>('/sales', salePayload);

        setCurrentShift(updatedShift);
        setSalesHistory(prev => [...prev, saleRecord]);
        
        await refreshInventoryData();
        if (selectedCustomer) {
            await refreshCustomers(); // Refresh to get updated points/balance
        }
        if (payments.some(p => p.method === 'Fiado')) {
            await refreshFinancials(); // Refresh to see new receivable
        }
        
        handleClearCart();
        setPaymentModalOpen(false);

    } catch (error) {
        console.error("Failed to finalize sale:", error);
        const errorMessage = (error as any)?.response?.data?.message || (error as Error).message;
        alert(`Erro ao finalizar a venda: ${errorMessage}`);
    }
  }, [cart, total, promotionalDiscount, loyaltyDiscountAmount, loyaltyDiscount, handleClearCart, refreshInventoryData, selectedCustomer, refreshCustomers, refreshFinancials]);

  // --- SHIFT LOGIC ---
  const handleOpenShift = useCallback(async (openingBalance: number) => {
    if (!currentUser) return;
    try {
        const newShift = await apiClient.post<CashShift>('/shifts/open', { openingBalance, userId: currentUser.id, userName: currentUser.name });
        setCurrentShift(newShift); 
        setShiftOpenModalVisible(false);
    } catch (error) {
        console.error("Failed to open shift", error);
        alert("Não foi possível abrir o caixa.");
    }
  }, [currentUser]);

  const handleCloseShift = useCallback(async (closingBalance: number) => {
      if (!currentShift) return;
      try {
        await apiClient.post('/shifts/close', { closingBalance });
        setCurrentShift(null); 
        await refreshShiftHistory();
        setActiveShiftModal(null); 
        setShiftOpenModalVisible(true);
      } catch (error) {
        console.error("Failed to close shift", error);
        alert("Não foi possível fechar o caixa.");
      }
  }, [currentShift, refreshShiftHistory]);

  const handleRecordShiftMovement = useCallback(async (amount: number, reason: string) => {
      if (!currentShift || !currentUser) return;
      try {
        const updatedShift = await apiClient.post<CashShift>('/shifts/movement', { type: movementType, amount, reason, userId: currentUser.id });
        setCurrentShift(updatedShift); 
        setActiveShiftModal(null);
      } catch (error) {
        console.error("Failed to record movement", error);
        alert("Não foi possível registrar a movimentação.");
      }
  }, [currentShift, movementType, currentUser]);

  const openMovementModal = (type: 'Suprimento' | 'Sangria') => {
      setMovementType(type); setActiveShiftModal('movement');
  }

  // --- VOICE COMMAND LOGIC ---
  const handleVoiceCommand = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Reconhecimento de voz não é suportado neste navegador.");
      setVoiceStatus('error');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceStatus('listening');
    recognition.onend = () => { if (voiceStatus !== 'processing') setVoiceStatus('idle'); };
    recognition.onerror = (event: any) => { setVoiceError(event.error); setVoiceStatus('error'); };

    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript;
      setVoiceStatus('processing');
      try {
        const itemsToAdd = await geminiService.parseAddToCartCommand(command, products);
        if (itemsToAdd.length > 0) {
          itemsToAdd.forEach(item => {
            const product = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
            if (product) handleAddToCart(product, item.quantity);
          });
        }
        setVoiceStatus('idle');
      } catch (e) {
        setVoiceError("Não foi possível entender o comando.");
        setVoiceStatus('error');
      }
    };
    recognition.start();
  }, [products, handleAddToCart, voiceStatus]);


  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isAnyModalOpen = isPaymentModalOpen || isHomologationPanelOpen || !!activeShiftModal || isShiftOpenModalVisible || isCustomerSearchModalOpen || isDiscountModalOpen || isLoyaltyModalOpen;
      if (currentView !== 'pdv' || isAnyModalOpen) return;

      if (event.key === 'F1') { event.preventDefault(); document.getElementById('product-search-input')?.focus();
      } else if (event.key === 'F2') { event.preventDefault(); if (cart.length > 0) handleOpenPaymentModal();
      } else if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) { event.preventDefault(); if (cart.length > 0) handleClearCart(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [currentView, cart.length, handleClearCart, isPaymentModalOpen, isHomologationPanelOpen, activeShiftModal, isShiftOpenModalVisible, isCustomerSearchModalOpen, isDiscountModalOpen, isLoyaltyModalOpen]);
  
  // --- ERP CRUD HANDLERS ---
  const handleAddProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    await apiClient.post('/products', productData); await refreshProducts(); await refreshInventoryData();
  }, [refreshProducts, refreshInventoryData]);

  const handleUpdateProduct = useCallback(async (productData: Product) => {
    await apiClient.put(`/products/${productData.id}`, productData); await refreshProducts();
  }, [refreshProducts]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await apiClient.delete(`/products/${productId}`); await refreshProducts(); await refreshInventoryData();
  }, [refreshProducts, refreshInventoryData]);

  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'createdAt' | 'creditLimit' | 'currentBalance'>) => {
    await apiClient.post('/customers', customerData); await refreshCustomers();
  }, [refreshCustomers]);

  const handleUpdateCustomer = useCallback(async (customerData: Customer) => {
    await apiClient.put(`/customers/${customerData.id}`, customerData); await refreshCustomers();
  }, [refreshCustomers]);

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    await apiClient.delete(`/customers/${customerId}`); await refreshCustomers();
  }, [refreshCustomers]);

  const handleSettleCustomerDebt = useCallback(async (customerId: string) => {
    await apiClient.post(`/financials/settle-debt/${customerId}`);
    await refreshFinancials();
    await refreshCustomers();
  }, [refreshFinancials, refreshCustomers]);

  const handleAddSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    await apiClient.post('/suppliers', supplierData); await refreshSuppliers();
  }, [refreshSuppliers]);
  
  const handleUpdateSupplier = useCallback(async (supplierData: Supplier) => {
    await apiClient.put(`/suppliers/${supplierData.id}`, supplierData); await refreshSuppliers();
  }, [refreshSuppliers]);

  const handleDeleteSupplier = useCallback(async (supplierId: string) => {
    await apiClient.delete(`/suppliers/${supplierId}`); await refreshSuppliers();
  }, [refreshSuppliers]);

  const handleAddUser = useCallback(async (userData: Omit<User, 'id'>) => {
    await apiClient.post('/users', userData); await refreshUsers();
  }, [refreshUsers]);
  
  const handleUpdateUser = useCallback(async (userData: User) => {
    await apiClient.put(`/users/${userData.id}`, userData); await refreshUsers();
  }, [refreshUsers]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    await apiClient.delete(`/users/${userId}`); await refreshUsers();
  }, [refreshUsers]);
  
  const handleAddPurchaseOrder = useCallback(async (orderData: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>) => {
    await apiClient.post('/purchasing/orders', orderData);
    await refreshPurchaseOrders();
  }, [refreshPurchaseOrders]);
  
  const handleUpdatePurchaseOrderStatus = useCallback(async (orderId: string, status: 'Recebido' | 'Cancelado') => {
    await apiClient.patch(`/purchasing/orders/${orderId}/status`, { status });
    await refreshPurchaseOrders();
    if (status === 'Recebido') {
        await refreshInventoryData();
    }
  }, [refreshPurchaseOrders, refreshInventoryData]);

  const handleUpdateTransactionStatus = useCallback(async (transactionId: string) => {
    await apiClient.patch(`/financials/transactions/${transactionId}/status`, { status: 'Pago' });
    await refreshFinancials();
  }, [refreshFinancials]);

  const handleProcessInventoryCount = useCallback(async (items: InventoryCountItem[]): Promise<InventoryReport> => {
    const report = await apiClient.post<InventoryReport>('/inventory/count', { counts: items });
    await refreshInventoryData();
    return report;
  }, [refreshInventoryData]);

  const handleNFeImport = useCallback(async (file: File): Promise<NFeImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    // FIX: The `isFormData` argument was missing in the `apiClient.post` call,
    // which is required for file uploads to be processed correctly by the backend.
    const result = await apiClient.post<NFeImportResult>('/inventory/import-nfe', formData, true);
    await Promise.all([ refreshProducts(), refreshSuppliers(), refreshInventoryData() ]);
    return result;
  }, [refreshProducts, refreshSuppliers, refreshInventoryData]);


  // --- RENDER LOGIC ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoadingData) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-brand-primary text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent mb-4"></div>
            <p>Carregando dados...</p>
            <p className="text-sm text-brand-subtle">Bem-vindo(a), {currentUser.name}!</p>
        </div>
    );
  }

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (currentView === 'erp' && hasPermission(currentUser.role, 'view_dashboard')) {
    return (
      <ERPDashboard
        currentUser={currentUser} 
        analyticsData={analyticsData}
        products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct}
        customers={customers} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} onSettleCustomerDebt={handleSettleCustomerDebt}
        suppliers={suppliers} onAddSupplier={handleAddSupplier} onUpdateSupplier={handleUpdateSupplier} onDeleteSupplier={handleDeleteSupplier}
        salesHistory={salesHistory} shiftHistory={shiftHistory}
        users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
        financials={financials} onUpdateTransactionStatus={handleUpdateTransactionStatus}
        stockLevels={stockLevels} stockMovements={stockMovements}
        purchaseOrders={purchaseOrders} onAddPurchaseOrder={handleAddPurchaseOrder} onUpdatePurchaseOrderStatus={handleUpdatePurchaseOrderStatus}
        onProcessInventoryCount={handleProcessInventoryCount} onNFeImport={handleNFeImport}
        onBackToPDV={() => setCurrentView('pdv')}
        onLogout={handleLogout}
      />
    );
  }

  const isPdvLocked = !currentShift;

  return (
    <div className="flex flex-col h-screen font-sans bg-brand-primary text-brand-text">
      <PDVHeader
        isOnline={isOnline} onToggleOnline={() => setIsOnline(prev => !prev)}
        pendingSalesCount={0} isSyncing={isSyncing} // Offline sync logic removed for now
        onOpenHomologationPanel={() => setHomologationPanelOpen(true)}
        onOpenERP={() => setCurrentView('erp')}
        shiftStatus={currentShift?.status || 'Fechado'}
        onCloseShift={() => setActiveShiftModal('close')}
        onSuprimento={() => openMovementModal('Suprimento')}
        onSangria={() => openMovementModal('Sangria')}
        currentUser={currentUser}
        onLogout={handleLogout}
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
            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-grow">
                    <label htmlFor="product-search-input" className="sr-only">Buscar Produto (F1)</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-brand-subtle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        id="product-search-input" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar produto... (F1)"
                        className="w-full bg-brand-secondary border border-brand-border rounded-md p-2 pl-10 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                    />
                </div>
                <VoiceCommandControl status={voiceStatus} onClick={handleVoiceCommand} />
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <ProductGrid products={filteredProducts} onAddToCart={(p) => handleAddToCart(p, 1)} />
            </div>
        </div>
        <aside className={`w-1/3 bg-brand-secondary border-l border-brand-border flex flex-col ${isPdvLocked ? 'pointer-events-none blur-sm' : ''}`}>
          <CartDisplay
            items={cart}
            subtotal={subtotal}
            promotionalDiscount={promotionalDiscount}
            loyaltyDiscount={loyaltyDiscountAmount}
            total={total}
            selectedCustomer={selectedCustomer}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onPay={handleOpenPaymentModal}
            onSelectCustomer={() => setCustomerSearchModalOpen(true)}
            onApplyDiscount={handleOpenDiscountModal}
            onRedeemPoints={() => setLoyaltyModalOpen(true)}
          />
        </aside>
      </main>
      
      {isShiftOpenModalVisible && <OpenShiftModal onOpen={handleOpenShift} />}

      {activeShiftModal === 'close' && currentShift && (
          <CloseShiftModal shift={currentShift} onClose={() => setActiveShiftModal(null)} onSubmit={handleCloseShift} />
      )}

      {activeShiftModal === 'movement' && currentShift && (
          <ShiftMovementModal type={movementType} onClose={() => setActiveShiftModal(null)} onSubmit={handleRecordShiftMovement} />
      )}

      {isCustomerSearchModalOpen && (
          <CustomerSearchModal
              customers={customers}
              onClose={() => setCustomerSearchModalOpen(false)}
              onSelect={(customer) => {
                  setSelectedCustomer(customer);
                  setCustomerSearchModalOpen(false);
              }}
          />
      )}
      
      {isDiscountModalOpen && discountTarget && (
          <DiscountModal
              target={discountTarget}
              onClose={() => setDiscountModalOpen(false)}
              onSubmit={handleApplyDiscount}
          />
      )}

      {isLoyaltyModalOpen && selectedCustomer && (
          <LoyaltyRedemptionModal
              customer={selectedCustomer}
              cartTotal={total + loyaltyDiscountAmount} // Pass total before loyalty discount
              onClose={() => setLoyaltyModalOpen(false)}
              onSubmit={handleApplyLoyaltyPoints}
          />
      )}

      {isPaymentModalOpen && (
        <PaymentModal 
          total={total} 
          onFinalize={handleFinalizeSale} 
          onCancel={() => setPaymentModalOpen(false)}
          selectedCustomer={selectedCustomer}
        />
      )}

       {isHomologationPanelOpen && <HomologationPanel onClose={() => setHomologationPanelOpen(false)} />}
      {currentView === 'pdv' && <ShortcutHelper />}
    </div>
  );
};

export default App;