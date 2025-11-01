
import React, { useState, useCallback, useEffect } from 'react';
import { MOCK_PRODUCTS } from './constants';
import type { CartItem, Product, PixCharge } from './types';
import PDVHeader from './components/PDVHeader';
import ProductGrid from './components/ProductGrid';
import CartDisplay from './components/CartDisplay';
import TransactionModal from './components/PaymentModal';
import HomologationPanel from './components/HomologationPanel';
import { generateNFCeXml, signNFCeXml } from './services/fiscalService';
import { generateDynamicPix, listenForPixPayment } from './services/pixService';
import * as syncService from './services/syncService';


export type TransactionState =
  | 'idle'
  | 'generating_xml'
  | 'signing_xml'
  | 'generating_pix'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'error';


const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>('idle');
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [paymentListenerUnsubscribe, setPaymentListenerUnsubscribe] = useState<(() => void) | null>(null);

  // States for Offline/Sync functionality
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // State for final phase panel
  const [isHomologationPanelOpen, setHomologationPanelOpen] = useState(false);


  // Function to sync pending sales
  const handleSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    const queuedSales = syncService.getQueuedSales();
    if (queuedSales.length === 0) return;

    setIsSyncing(true);
    setTransactionError(null);
    try {
      const { syncedIds } = await syncService.synchronizeSales(queuedSales);
      syncService.clearSyncedSales(syncedIds);
      const newQueue = syncService.getQueuedSales();
      setPendingSalesCount(newQueue.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro de sincronização.';
      setTransactionError(message); // Maybe show this in a toast later
      console.error(message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline]);

  // Effect to check queue on initial load
  useEffect(() => {
    const queuedSales = syncService.getQueuedSales();
    setPendingSalesCount(queuedSales.length);
  }, []);

  // Effect to trigger sync when coming back online
  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline, handleSync]);


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

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInitiateTransaction = useCallback(async () => {
    if (cart.length === 0) return;

    setModalOpen(true);
    setTransactionError(null);
    setGeneratedXml(null);
    setPixCharge(null);

    try {
      setTransactionState('generating_xml');
      const xml = await generateNFCeXml(cart, total);
      
      setTransactionState('signing_xml');
      const signedXml = await signNFCeXml(xml);
      setGeneratedXml(signedXml);
      
      setTransactionState('generating_pix');
      const charge = await generateDynamicPix(total);
      setPixCharge(charge);
      
      setTransactionState('awaiting_payment');
      const unsubscribe = listenForPixPayment(charge.transactionId, (payload) => {
        console.log('Payment confirmed via webhook simulation:', payload);
        setTransactionState('payment_confirmed');
      });
      setPaymentListenerUnsubscribe(() => unsubscribe);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      setTransactionError(message);
      setTransactionState('error');
    }
  }, [cart, total]);

  const handleCloseModal = useCallback(() => {
    // Clean up the webhook listener if it exists
    if (paymentListenerUnsubscribe) {
      paymentListenerUnsubscribe();
      setPaymentListenerUnsubscribe(null);
    }
    
    setModalOpen(false);
    
    if (transactionState === 'payment_confirmed') {
      const saleData = { items: cart, total };
      if (isOnline) {
        // Add to queue and sync immediately
        syncService.addSaleToQueue(saleData);
        handleSync();
      } else {
        // Just add to queue for later sync
        syncService.addSaleToQueue(saleData);
        const newQueue = syncService.getQueuedSales();
        setPendingSalesCount(newQueue.length);
      }
      handleClearCart();
    }
     // Reset transaction state for the next one
    setTransactionState('idle');
    setTransactionError(null);
    setGeneratedXml(null);
    setPixCharge(null);
  }, [transactionState, handleClearCart, paymentListenerUnsubscribe, cart, total, isOnline, handleSync]);
  
  // Cleanup listener on component unmount
  useEffect(() => {
    return () => {
      if (paymentListenerUnsubscribe) {
        paymentListenerUnsubscribe();
      }
    };
  }, [paymentListenerUnsubscribe]);

  return (
    <div className="flex flex-col h-screen font-sans bg-brand-primary text-brand-text">
      <PDVHeader
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline(prev => !prev)}
        pendingSalesCount={pendingSalesCount}
        isSyncing={isSyncing}
        onOpenHomologationPanel={() => setHomologationPanelOpen(true)}
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-2/3 flex flex-col p-4 overflow-y-auto">
          <ProductGrid products={MOCK_PRODUCTS} onAddToCart={handleAddToCart} />
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
        <HomologationPanel 
          onClose={() => setHomologationPanelOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
