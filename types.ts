// === PDV & ERP Shared Types ===

export interface Product {
  id: string;
  code: string; // For NF-e cProd matching
  ean?: string; // EAN-13 barcode
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  fiscalData?: {
    ncm: string;
    cfop: string;
  };
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    loyaltyPoints: number;
    createdAt: string;
    creditLimit: number;
    currentBalance: number;
}

export interface Supplier {
    id:string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    cnpj: string;
}


export interface CartItem extends Product {
  quantity: number;
  discount?: {
    amount: number;
    type: 'fixed' | 'percentage';
  };
}

export type PaymentMethod = 'Dinheiro' | 'PIX' | 'Credito' | 'Debito' | 'Fiado';

export interface Payment {
    method: PaymentMethod;
    amount: number;
}


export interface SaleRecord {
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  payments: Payment[];
  changeGiven: number;
  nfceXml: string;
  customerId?: string;
  customerName?: string;
  totalDiscount: number;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  loyaltyDiscountAmount: number;
}

export type UserRole = 'Admin' | 'Gerente' | 'Caixa';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Active' | 'Inactive';
}

export interface AccountTransaction {
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'Pendente' | 'Pago' | 'Atrasado';
    type: 'payable' | 'receivable';
    customerId?: string;
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_customers'
  | 'manage_suppliers'
  | 'view_reports'
  | 'manage_inventory'
  | 'manage_financials'
  | 'manage_users'
  | 'manage_purchasing';


// === Fiscal Types (NFC-e) ===

// Fix: Add missing NcmCode and CfopCode type definitions.
export interface NcmCode {
  code: string;
  description: string;
}

export interface CfopCode {
  code: string;
  description: string;
}

export interface Emitente {
  CNPJ: string;
  xNome: string;
  xFant: string;
  enderEmit: {
    xLgr: string;
    nro: string;
    xBairro: string;
    cMun: string;
    xMun: string;
    UF: string;
    CEP: string;
    cPais: string;
    xPais: string;
  };
  IE: string;
  CRT: string; // Código de Regime Tributário
}

export interface Destinatario {
  CPF?: string;
  xNome?: string;
}

export interface ProdutoNFCe {
  cProd: string;
  cEAN: string;
  xProd: string;
  NCM: string;
  CFOP: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vDesc?: number;
  cEANTrib: string;
  uTrib: string;
  qTrib: number;
  vUnTrib: number;
  indTot: number;
  imposto: {
    vTotTrib: number;
    ICMS: {
      ICMSSN102: {
        orig: string;
        CSOSN: string;
      };
    };
    PIS: {
      PISSN: {
        CST: string;
      };
    };
    COFINS: {
      COFINSSN: {
        CST: string;
      };
    };
  };
}

export interface TotalNFCe {
  vBC: number;
  vICMS: number;
  vICMSDeson: number;
  vFCP: number;
  vBCST: number;
  vST: number;
  vFCPST: number;
  vFCPSTRet: number;
  vProd: number;
  vFrete: number;
  vSeg: number;
  vDesc: number;
  vII: number;
  vIPI: number;
  vIPIDevol: number;
  vPIS: number;
  vCOFINS: number;
  vOutro: number;
  vNF: number;
  vTotTrib: number;
}

export interface PagamentoNFCe {
  tpag: string; // Forma de pagamento
  vPag: number; // Valor do pagamento
}

export interface NFCe {
  infNFe: {
    versao: string;
    ide: {
      cUF: string;
      cNF: string;
      natOp: string;
      mod: number;
      serie: number;
      nNF: number;
      dhEmi: string;
      tpNF: number;
      idDest: number;
      cMunFG: string;
      tpImp: number;
      tpEmis: number;
      cDV: number;
      tpAmb: number;
      finNFe: number;
      indFinal: number;
      indPres: number;
      procEmi: number;
      verProc: string;
    };
    emit: Emitente;
    dest?: Destinatario;
    det: ProdutoNFCe[];
    total: {
      ICMSTot: TotalNFCe;
    };
    pag: {
      detPag: PagamentoNFCe[];
    };
  };
}

// === PIX Types ===
export interface PixCharge {
  transactionId: string;
  qrCodeData: string; // The "copia e cola" string
  amount: number;
  createdAt: Date;
}

export interface PixWebhookPayload {
  transactionId: string;
  status: 'PAID';
  paidAt: Date;
  amount: number;
}

// === Offline Sync Types ===
export interface QueuedSale {
  id: string;
  timestamp: string;
  saleData: SaleRecord;
}

// === Homologation Types ===
export interface HomologationItem {
    id: string;
    text: string;
    completed: boolean;
}

// === Inventory Types ===
export interface StockLevel {
  productId: string;
  productName: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  type: 'Venda' | 'Ajuste de Inventário' | 'Entrada Inicial' | 'Entrada (NF-e)' | 'Entrada (Compra)';
  quantityChange: number;
  reason: string; // e.g., Sale ID or "Inventory Count"
}

export interface InventoryCountItem {
  productId: string;
  countedQuantity: number;
}

export interface InventoryReport {
  discrepancies: {
    productId: string;
    productName: string;
    expected: number;
    counted: number;
    difference: number;
  }[];
  timestamp: string;
}

// === NF-e Import Types ===
export interface NFeImportResult {
  summary: {
    invoiceNumber: string;
    supplierFound: boolean;
    supplierCreated: boolean;
    productsProcessed: number;
    newProductsCreated: number;
    stockEntries: number;
  };
  details: {
    supplierName: string;
    products: {
      code: string;
      name: string;
      quantity: number;
      isNew: boolean;
    }[];
  };
}

// === Cash Shift Types ===
export interface ShiftMovement {
    id: string;
    timestamp: string;
    type: 'Suprimento' | 'Sangria';
    amount: number;
    reason: string;
    userId: string; // User who performed the action
}

export interface CashShift {
    id: string;
    status: 'Aberto' | 'Fechado';
    userId: string;
    userName: string;
    openedAt: string;
    closedAt: string | null;

    // Balances
    openingBalance: number; // Suprimento inicial
    closingBalance: number | null; // Valor contado no fechamento
    expectedBalance: number | null; // Calculado no fechamento
    balanceDifference: number | null; // Quebra/Sobra

    // Aggregates
    totalSales: number;
    totalSuprimentos: number;
    totalSangrias: number;
    
    // Details
    paymentTotals: Record<PaymentMethod, number>;
    movements: ShiftMovement[];
    sales: SaleRecord[];
}

// === Purchasing Types ===
export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number; // cost per unit
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'Pendente' | 'Recebido' | 'Cancelado';
  createdAt: string;
  receivedAt?: string;
}