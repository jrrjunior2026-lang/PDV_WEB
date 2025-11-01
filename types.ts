
import type { ReactNode } from 'react';

// === PDV Types ===

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  fiscalData?: {
    ncm: string;
    cfop: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}


// === Fiscal Types (NFC-e) ===

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
  items: CartItem[];
  total: number;
}

// === Homologation Types ===
export interface HomologationItem {
  id: string;
  text: string;
  completed: boolean;
}


// FIX: Added missing type definitions from previous planning phase
// to prevent compilation errors in unused components, which will be removed.
export interface StackItem {
  name: string;
  description: string;
}

export interface StackCategory {
  title: string;
  items: StackItem[];
}

export interface Feature {
  title: string;
  icon: ReactNode;
  details: string[];
}

export interface Phase {
  name: string;
  description: string;
  outputs: string[];
}

export interface AnalysisTopic {
  id: string;
  name: string;
  data: any;
}
