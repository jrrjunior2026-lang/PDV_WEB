


import React, { useState, useCallback, useEffect, useMemo } from 'react';
// FIX: Add missing ShiftMovement type.
import type { CartItem, Product, SaleRecord, User, AccountTransaction, StockLevel, StockMovement, Customer, Supplier, NFeImportResult, CashShift, Payment, PurchaseOrder, InventoryCountItem, InventoryReport, ShiftMovement } from './types';
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
import { hasPermission } from './services/authService';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA ---
const mockUsers: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@pdv.com', role: 'Admin', status: 'Active' },
    { id: 'user-2', name: 'Gerente User', email: 'gerente@pdv.com', role: 'Gerente', status: 'Active' },
    { id: 'user-3', name: 'Caixa User', email: 'caixa@pdv.com', role: 'Caixa', status: 'Active' },
];

const mockProducts: Product[] = [
  { id: 'prod-1', code: 'p-001', ean: '7890000000017', name: 'Café Espresso', price: 5.00, imageUrl: 'https://images.unsplash.com/photo-1579992305312-04bde435d88f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80', category: 'Bebidas', fiscalData: { ncm: '0901.21.00', cfop: '5102' } },
  { id: 'prod-2', code: 'p-002', ean: '7890000000024', name: 'Cappuccino Italiano', price: 8.50, imageUrl: 'https://images.unsplash.com/photo-1557006029-765c9d1b3341?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80', category: 'Bebidas', fiscalData: { ncm: '0901.21.00', cfop: '5102' } },
  { id: 'prod-3', code: 'p-003', ean: '7890000000031', name: 'Pão de Queijo', price: 4.00, imageUrl: 'https://images.unsplash.com/photo-1633534509434-323a13295987?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80', category: 'Salgados', fiscalData: { ncm: '1905.90.90', cfop: '5102' } },
  { id: 'prod-4', code: 'p-004', ean: '7890000000048', name: 'Croissant de Chocolate', price: 9.00, imageUrl: 'https://images.unsplash.com/photo-1622327594914-1e5cb20881b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80', category: 'Doces', fiscalData: { ncm: '1905.31.00', cfop: '5102' } },
  { id: 'prod-5', code: 'p-005', ean: '7890000000055', name: 'Água Mineral', price: 3.00, imageUrl: 'https://images.unsplash.com/photo-1582294120348-e414b423198b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80', category: 'Bebidas', fiscalData: { ncm: '2201.10.00', cfop: '5405' } },
];

const mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'Consumidor Final', email: '', phone: '', cpf: '000.000.000-00', loyaltyPoints: 0, createdAt: new Date().toISOString(), creditLimit: 0, currentBalance: 0 },
    { id: 'cust-2', name: 'Maria Silva', email: 'maria@example.com', phone: '(11) 98765-4321', cpf: '123.456.789-10', loyaltyPoints: 150, createdAt: new Date().toISOString(), creditLimit: 500, currentBalance: 75.50 },
];
// --- END MOCK DATA ---

type AppView = 'pdv' | 'erp';
type ShiftModal = 'close' | 'movement' | null;
type DiscountTarget = { type: 'total' } | { type: 'item'; itemId: string };

const App: React.FC = () => {
  // Global State
  const [currentView, setCurrentView] = useState<AppView>('pdv');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
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

  // Offline/Sync State
  const [isOnline, setIsOnline] = useState(true); 
  const [isSyncing, setIsSyncing] = useState(false);

  // Homologation Panel State
  const [isHomologationPanelOpen, setHomologationPanelOpen] = useState(false);
  
  // --- AUTH & DATA LOADING ---
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    // Load mock data
    setProducts(mockProducts);
    setCustomers(mockCustomers);
    setUsers(mockUsers);
    setStockLevels(mockProducts.map(p => ({ productId: p.id, productName: p.name, quantity: 50 }))); // Start with 50 of each
    setFinancials([
        { id: uuidv4(), description: `Venda #123`, amount: 75.50, dueDate: new Date().toISOString(), status: 'Pendente', type: 'receivable', customerId: 'cust-2'},
    ]);

    if (user.role === 'Caixa') {
        setCurrentView('pdv');
        setShiftOpenModalVisible(true);
    } else {
        setCurrentView('erp');
        // Mock analytics data for ERP dashboard
        setAnalyticsData({
            kpis: {
                totalSalesToday: { value: 1250.75, trend: 15.2 },
                ticketMedio: { value: 45.20, trend: -2.1 },
                newCustomersToday: { value: 3, trend: 50 },
                itemsSoldToday: { value: 150, trend: 12 },
                totalPayablePending: 0,
                totalReceivablePending: 75.50
            },
            charts: {
                salesTrend: [ {date: 'D-6', total: 800}, {date: 'D-5', total: 950}, {date: 'D-4', total: 900}, {date: 'D-3', total: 1100}, {date: 'D-2', total: 1050}, {date: 'D-1', total: 1300}, {date: 'Hoje', total: 1250.75} ],
                paymentMethods: [ {name: 'Dinheiro', value: 500}, {name: 'PIX', value: 450.75}, {name: 'Credito', value: 300}]
            },
            lists: {
                topProducts: mockProducts.slice(0, 5).map(p => ({name: p.name, total: Math.random() * 500})),
                topCustomers: mockCustomers.slice(1, 2).map(c => ({name: c.name, total: c.currentBalance}))
            }
        });
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    // Clear all state
    setProducts([]); setCustomers([]); setSuppliers([]); setSalesHistory([]);
    setUsers([]); setFinancials([]); setStockLevels([]); setStockMovements([]);
    setShiftHistory([]); setPurchaseOrders([]); setAnalyticsData(null);
    setCart([]); setCurrentShift(null); setPaymentModalOpen(false);
    setSearchTerm(''); setSelectedCustomer(null);
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
          setCart(prevCart => prevCart.map(item => item.id === discountTarget.itemId ? { ...item, discount: { amount, type } } : item));
      } else { // 'total'
          if (subtotal === 0) return;
          const totalDiscountValue = type === 'fixed' ? amount : subtotal * (amount / 100);
          setCart(prevCart => prevCart.map(item => {
              const itemTotal = item.price * item.quantity;
              const proportionalDiscount = (itemTotal / subtotal) * totalDiscountValue;
              return { ...item, discount: { amount: proportionalDiscount, type: 'fixed' } };
          }));
      }
      setDiscountModalOpen(false); setDiscountTarget(null);
  }, [cart, discountTarget]);

  const handleApplyLoyaltyPoints = useCallback((pointsToRedeem: number, discountAmount: number) => {
    setLoyaltyDiscount({ points: pointsToRedeem, amount: discountAmount });
    setLoyaltyModalOpen(false);
  }, []);


  const { subtotal, promotionalDiscount, loyaltyDiscountAmount, total } = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const promotionalDiscount = cart.reduce((sum, item) => {
      if (!item.discount) return sum;
      if (item.discount.type === 'fixed') return sum + item.discount.amount;
      return sum + (item.price * item.quantity * (item.discount.amount / 100));
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
    const saleRecord: SaleRecord = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        items: cart,
        total,
        payments,
        changeGiven,
        nfceXml: '<nfce>simulada</nfce>',
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        totalDiscount: promotionalDiscount + loyaltyDiscountAmount,
        loyaltyPointsEarned: selectedCustomer ? Math.floor(total / 10) : 0,
        loyaltyPointsRedeemed: loyaltyDiscount.points,
        loyaltyDiscountAmount: loyaltyDiscount.amount,
    };
    setSalesHistory(prev => [...prev, saleRecord]);
    
    // Update stock levels and movements
    const newMovements: StockMovement[] = cart.map(item => ({
        id: uuidv4(), timestamp: saleRecord.timestamp, productId: item.id, productName: item.name,
        type: 'Venda', quantityChange: -item.quantity, reason: `Venda #${saleRecord.id.substring(0, 5)}`,
    }));
    setStockMovements(prev => [...prev, ...newMovements]);
    setStockLevels(prevLevels => {
        const newLevels = [...prevLevels];
        cart.forEach(item => {
            const index = newLevels.findIndex(sl => sl.productId === item.id);
            if (index > -1) newLevels[index].quantity -= item.quantity;
        });
        return newLevels;
    });

    // Update customer points/balance
    if (selectedCustomer) {
        setCustomers(prev => prev.map(c => {
            if (c.id === selectedCustomer.id) {
                const newBalance = payments.some(p => p.method === 'Fiado') ? c.currentBalance + total : c.currentBalance;
                const newPoints = c.loyaltyPoints - loyaltyDiscount.points + saleRecord.loyaltyPointsEarned;
                return { ...c, loyaltyPoints: newPoints, currentBalance: newBalance };
            }
            return c;
        }));
    }

    // Update financials if 'Fiado'
    if (payments.some(p => p.method === 'Fiado')) {
        setFinancials(prev => [...prev, { id: uuidv4(), description: `Venda para ${selectedCustomer?.name}`, amount: total, dueDate: new Date().toISOString(), status: 'Pendente', type: 'receivable', customerId: selectedCustomer?.id }]);
    }
    
    // Update shift data
    setCurrentShift(prev => {
        if (!prev) return null;
        const paymentTotals = { ...prev.paymentTotals };
        payments.forEach(p => {
            paymentTotals[p.method] = (paymentTotals[p.method] || 0) + p.amount;
        });
        return { ...prev, totalSales: prev.totalSales + total, sales: [...prev.sales, saleRecord], paymentTotals };
    });
    
    handleClearCart();
    setPaymentModalOpen(false);
  }, [cart, total, promotionalDiscount, loyaltyDiscountAmount, loyaltyDiscount, handleClearCart, selectedCustomer]);

  // --- SHIFT LOGIC ---
  const handleOpenShift = useCallback(async (openingBalance: number) => {
    if (!currentUser) return;
    const newShift: CashShift = {
        id: uuidv4(), status: 'Aberto', userId: currentUser.id, userName: currentUser.name, openedAt: new Date().toISOString(),
        closedAt: null, openingBalance, closingBalance: null, expectedBalance: null, balanceDifference: null,
        totalSales: 0, totalSuprimentos: openingBalance, totalSangrias: 0,
        paymentTotals: { Dinheiro: 0, PIX: 0, Credito: 0, Debito: 0, Fiado: 0 },
        movements: [{ id: uuidv4(), timestamp: new Date().toISOString(), type: 'Suprimento', amount: openingBalance, reason: 'Abertura de Caixa', userId: currentUser.id }],
        sales: []
    };
    setCurrentShift(newShift); 
    setShiftOpenModalVisible(false);
  }, [currentUser]);

  const handleCloseShift = useCallback(async (closingBalance: number) => {
      if (!currentShift) return;
      const totalSalesCash = currentShift.paymentTotals.Dinheiro || 0;
      const expectedCash = currentShift.openingBalance + totalSalesCash + currentShift.movements.filter(m => m.type === 'Suprimento' && m.reason !== 'Abertura de Caixa').reduce((sum, m) => sum + m.amount, 0) - currentShift.totalSangrias;
      const closedShift: CashShift = { ...currentShift, status: 'Fechado', closedAt: new Date().toISOString(), closingBalance, expectedBalance: expectedCash, balanceDifference: closingBalance - expectedCash };
      setShiftHistory(prev => [...prev, closedShift]);
      setCurrentShift(null); 
      setActiveShiftModal(null); 
      setShiftOpenModalVisible(true);
  }, [currentShift]);

  const handleRecordShiftMovement = useCallback(async (amount: number, reason: string) => {
      if (!currentShift || !currentUser) return;
      const newMovement: ShiftMovement = { id: uuidv4(), timestamp: new Date().toISOString(), type: movementType, amount, reason, userId: currentUser.id };
      setCurrentShift(prev => {
          if (!prev) return null;
          return {
              ...prev,
              movements: [...prev.movements, newMovement],
              totalSuprimentos: prev.totalSuprimentos + (movementType === 'Suprimento' ? amount : 0),
              totalSangrias: prev.totalSangrias + (movementType === 'Sangria' ? amount : 0)
          };
      });
      setActiveShiftModal(null);
  }, [currentShift, movementType, currentUser]);

  const openMovementModal = (type: 'Suprimento' | 'Sangria') => {
      setMovementType(type); setActiveShiftModal('movement');
  }

  // --- VOICE COMMAND LOGIC ---
  const handleVoiceCommand = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError("Reconhecimento de voz não é suportado."); setVoiceStatus('error'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
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
      if (event.key === 'F1') { event.preventDefault(); document.getElementById('product-search-input')?.focus(); } 
      else if (event.key === 'F2') { event.preventDefault(); if (cart.length > 0) handleOpenPaymentModal(); } 
      else if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) { event.preventDefault(); if (cart.length > 0) handleClearCart(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [currentView, cart.length, handleClearCart, isPaymentModalOpen, isHomologationPanelOpen, activeShiftModal, isShiftOpenModalVisible, isCustomerSearchModalOpen, isDiscountModalOpen, isLoyaltyModalOpen]);
  
  // --- ERP CRUD HANDLERS ---
  const handleAddProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
      const newProduct = { ...productData, id: uuidv4() };
      setProducts(prev => [...prev, newProduct]);
      setStockLevels(prev => [...prev, { productId: newProduct.id, productName: newProduct.name, quantity: 0 }]);
  }, []);

  const handleUpdateProduct = useCallback(async (productData: Product) => {
    setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
  }, []);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setStockLevels(prev => prev.filter(s => s.productId !== productId));
  }, []);

  const handleAddCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'createdAt' | 'creditLimit' | 'currentBalance'>) => {
      setCustomers(prev => [...prev, { ...customerData, id: uuidv4(), loyaltyPoints: 0, createdAt: new Date().toISOString(), creditLimit: 0, currentBalance: 0 }]);
  }, []);

  const handleUpdateCustomer = useCallback(async (customerData: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customerData.id ? customerData : c));
  }, []);

  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  }, []);

  const handleSettleCustomerDebt = useCallback(async (customerId: string) => {
      setFinancials(prev => prev.map(t => (t.customerId === customerId && t.type === 'receivable') ? { ...t, status: 'Pago' } : t));
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, currentBalance: 0 } : c));
  }, []);

  const handleAddSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplierData, id: uuidv4() }]);
  }, []);
  
  const handleUpdateSupplier = useCallback(async (supplierData: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplierData.id ? supplierData : s));
  }, []);

  const handleDeleteSupplier = useCallback(async (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  }, []);

  const handleAddUser = useCallback(async (userData: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...userData, id: uuidv4() }]);
  }, []);
  
  const handleUpdateUser = useCallback(async (userData: User) => {
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
  }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);
  
  const handleAddPurchaseOrder = useCallback(async (orderData: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>) => {
      const newOrder = { ...orderData, id: uuidv4(), status: 'Pendente' as const, createdAt: new Date().toISOString() };
      setPurchaseOrders(prev => [...prev, newOrder]);
  }, []);
  
  const handleUpdatePurchaseOrderStatus = useCallback(async (orderId: string, status: 'Recebido' | 'Cancelado') => {
      setPurchaseOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, receivedAt: new Date().toISOString() } : o));
      if (status === 'Recebido') {
          const order = purchaseOrders.find(o => o.id === orderId);
          if (order) {
              setStockLevels(prevLevels => {
                  const newLevels = [...prevLevels];
                  order.items.forEach(item => {
                      const index = newLevels.findIndex(sl => sl.productId === item.productId);
                      if (index > -1) newLevels[index].quantity += item.quantity;
                  });
                  return newLevels;
              });
          }
      }
  }, [purchaseOrders]);

  const handleUpdateTransactionStatus = useCallback(async (transactionId: string) => {
    setFinancials(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Pago' } : t));
  }, []);

  const handleProcessInventoryCount = useCallback(async (items: InventoryCountItem[]): Promise<InventoryReport> => {
      const discrepancies = items.map(item => {
          const stockLevel = stockLevels.find(sl => sl.productId === item.productId);
          const expected = stockLevel?.quantity || 0;
          // FIX: The returned object must match the InventoryReport discrepancy type, specifically mapping countedQuantity to 'counted'.
          return {
            productId: item.productId,
            productName: stockLevel?.productName || '',
            expected,
            counted: item.countedQuantity,
            difference: item.countedQuantity - expected,
          };
      }).filter(d => d.difference !== 0);
      return { discrepancies, timestamp: new Date().toISOString() };
  }, [stockLevels]);

  const handleNFeImport = useCallback(async (file: File): Promise<NFeImportResult> => {
    console.log("Mocking NFe import for file:", file.name);
    return {
        summary: { invoiceNumber: '12345', supplierFound: true, supplierCreated: false, productsProcessed: 1, newProductsCreated: 0, stockEntries: 1 },
        details: { supplierName: 'Fornecedor Mock', products: [{ code: 'p-001', name: 'Café Espresso', quantity: 10, isNew: false }] }
    };
  }, []);


  // --- RENDER LOGIC ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (currentView === 'erp' && hasPermission(currentUser.role, 'view_dashboard')) {
    return (
      <ERPDashboard
        currentUser={currentUser} analyticsData={analyticsData}
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
        pendingSalesCount={0} isSyncing={isSyncing}
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
                        <svg className="h-5 w-5 text-brand-subtle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="product-search-input" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar produto... (F1)" className="w-full bg-brand-secondary border border-brand-border rounded-md p-2 pl-10 text-brand-text placeholder-brand-subtle focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
                <VoiceCommandControl status={voiceStatus} onClick={handleVoiceCommand} />
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <ProductGrid products={filteredProducts} onAddToCart={(p) => handleAddToCart(p, 1)} />
            </div>
        </div>
        <aside className={`w-1/3 bg-brand-secondary border-l border-brand-border flex flex-col ${isPdvLocked ? 'pointer-events-none blur-sm' : ''}`}>
          <CartDisplay items={cart} subtotal={subtotal} promotionalDiscount={promotionalDiscount} loyaltyDiscount={loyaltyDiscountAmount} total={total} selectedCustomer={selectedCustomer} onUpdateQuantity={handleUpdateQuantity} onClearCart={handleClearCart} onPay={handleOpenPaymentModal} onSelectCustomer={() => setCustomerSearchModalOpen(true)} onApplyDiscount={handleOpenDiscountModal} onRedeemPoints={() => setLoyaltyModalOpen(true)} />
        </aside>
      </main>
      
      {isShiftOpenModalVisible && <OpenShiftModal onOpen={handleOpenShift} />}
      {activeShiftModal === 'close' && currentShift && <CloseShiftModal shift={currentShift} onClose={() => setActiveShiftModal(null)} onSubmit={handleCloseShift} />}
      {activeShiftModal === 'movement' && currentShift && <ShiftMovementModal type={movementType} onClose={() => setActiveShiftModal(null)} onSubmit={handleRecordShiftMovement} />}
      {isCustomerSearchModalOpen && <CustomerSearchModal customers={customers} onClose={() => setCustomerSearchModalOpen(false)} onSelect={(customer) => { setSelectedCustomer(customer); setCustomerSearchModalOpen(false); }} />}
      {isDiscountModalOpen && discountTarget && <DiscountModal target={discountTarget} onClose={() => setDiscountModalOpen(false)} onSubmit={handleApplyDiscount} />}
      {isLoyaltyModalOpen && selectedCustomer && <LoyaltyRedemptionModal customer={selectedCustomer} cartTotal={total + loyaltyDiscountAmount} onClose={() => setLoyaltyModalOpen(false)} onSubmit={handleApplyLoyaltyPoints} />}
      {isPaymentModalOpen && <PaymentModal total={total} onFinalize={handleFinalizeSale} onCancel={() => setPaymentModalOpen(false)} selectedCustomer={selectedCustomer} />}
      {isHomologationPanelOpen && <HomologationPanel onClose={() => setHomologationPanelOpen(false)} />}
      {currentView === 'pdv' && <ShortcutHelper />}
    </div>
  );
};

export default App;