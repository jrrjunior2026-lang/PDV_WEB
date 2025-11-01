
import type { CartItem, NFCe, Emitente, ProdutoNFCe, TotalNFCe, PixCharge, PixWebhookPayload } from '../types';
import type { TransactionState } from '../App';
import { v4 as uuidv4 } from 'uuid';

// --- FISCAL (NFC-e) LOGIC ---

const MOCK_EMITENTE: Emitente = {
  CNPJ: '00000000000191', xNome: 'Empresa Teste Ltda', xFant: 'PDV Fiscal Teste',
  enderEmit: {
    xLgr: 'Rua de Teste', nro: '123', xBairro: 'Centro', cMun: '3550308', 
    xMun: 'Sao Paulo', UF: 'SP', CEP: '01000000', cPais: '1058', xPais: 'Brasil',
  },
  IE: '111111111111', CRT: '1',
};

function createNFCeObject(cart: CartItem[], total: number): NFCe {
  const produtos: ProdutoNFCe[] = cart.map(item => {
    const vProd = item.price * item.quantity;
    return {
      cProd: item.id, cEAN: `SEM GTIN`, xProd: item.name, NCM: item.fiscalData?.ncm || '00000000',
      CFOP: item.fiscalData?.cfop || '5102', uCom: 'UN', qCom: item.quantity, vUnCom: item.price,
      vProd, cEANTrib: `SEM GTIN`, uTrib: 'UN', qTrib: item.quantity, vUnTrib: item.price,
      indTot: 1, imposto: {
        vTotTrib: vProd * 0.15, // Mock tribute calculation
        ICMS: { ICMSSN102: { orig: '0', CSOSN: '102' } },
        PIS: { PISSN: { CST: '99' } }, COFINS: { COFINSSN: { CST: '99' } },
      },
    };
  });
  const vTotTribGlobal = produtos.reduce((sum, p) => sum + p.imposto.vTotTrib, 0);
  const icmsTot: TotalNFCe = {
      vBC: 0.00, vICMS: 0.00, vICMSDeson: 0.00, vFCP: 0.00, vBCST: 0.00, vST: 0.00,
      vFCPST: 0.00, vFCPSTRet: 0.00, vProd: total, vFrete: 0.00, vSeg: 0.00, vDesc: 0.00,
      vII: 0.00, vIPI: 0.00, vIPIDevol: 0.00, vPIS: 0.00, vCOFINS: 0.00, vOutro: 0.00,
      vNF: total, vTotTrib: vTotTribGlobal
  };
  return {
    infNFe: {
      versao: '4.00',
      ide: {
        cUF: '35', cNF: String(Math.floor(Math.random() * 10000000)), natOp: 'VENDA',
        mod: 65, serie: 1, nNF: Math.floor(Math.random() * 1000), dhEmi: new Date().toISOString(),
        tpNF: 1, idDest: 1, cMunFG: MOCK_EMITENTE.enderEmit.cMun, tpImp: 4, tpEmis: 1,
        cDV: 1, tpAmb: 2, finNFe: 1, indFinal: 1, indPres: 1, procEmi: 0, verProc: '1.0.0',
      },
      emit: MOCK_EMITENTE, det: produtos, total: { ICMSTot: icmsTot },
      pag: { detPag: [{ tpag: '01', vPag: total }] },
    },
  };
}

function objectToXml(obj: any, indent = ''): string {
    return Object.entries(obj).map(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map(item => `${indent}<${key}>\n${objectToXml(item, indent + '  ')}${indent}</${key}>`).join('\n');
        } else if (typeof value === 'object' && value !== null) {
            return `${indent}<${key}>\n${objectToXml(value, indent + '  ')}${indent}</${key}>`;
        }
        return `${indent}<${key}>${value}</${key}>`;
    }).join('\n');
}

const generateNFCeXml = (cart: CartItem[], total: number): Promise<string> => new Promise(resolve => {
  setTimeout(() => {
    const nfceObject = createNFCeObject(cart, total);
    resolve(`<?xml version="1.0" encoding="UTF-8"?>\n<NFe xmlns="http://www.portalfiscal.inf.br/nfe">\n${objectToXml(nfceObject, '  ')}</NFe>`);
  }, 1000);
});

const signNFCeXml = (xml: string): Promise<string> => new Promise(resolve => {
  setTimeout(() => {
    const signature = `\n  <Signature>...</Signature>\n`;
    resolve(xml.replace('</NFe>', `${signature}</NFe>`));
  }, 800);
});

// --- PIX LOGIC ---

const generateDynamicPix = (total: number, transactionId: string): Promise<PixCharge> => new Promise(resolve => {
  setTimeout(() => {
    const charge: PixCharge = {
      transactionId,
      qrCodeData: `00020126580014br.gov.bcb.pix0136${transactionId}5204000053039865802BR5913Empresa Teste6009Sao Paulo62070503***6304E${Math.floor(Math.random() * 9000 + 1000)}`,
      amount: total,
      createdAt: new Date(),
    };
    console.log(`[API_LOG] PIX charge created for R$${total.toFixed(2)}. TxID: ${transactionId}`);
    resolve(charge);
  }, 1000);
});

export const listenForPixPayment = (
    transactionId: string, 
    onPaymentConfirmed: (payload: PixWebhookPayload) => void
): (() => void) => {
    const paymentDelay = Math.random() * 5000 + 3000; 
    const timeoutId = setTimeout(() => {
        const payload: PixWebhookPayload = { transactionId, status: 'PAID', paidAt: new Date(), amount: 0 };
        console.log(`[API_LOG] Webhook received: Payment confirmed for TxID ${transactionId}.`);
        onPaymentConfirmed(payload);
    }, paymentDelay);
    return () => clearTimeout(timeoutId);
};


// --- ORCHESTRATION ---

export const processSaleTransaction = async (
    cart: CartItem[], 
    total: number,
    setState: (state: TransactionState) => void
): Promise<{ signedXml: string, pixCharge: PixCharge, transactionId: string }> => {
    const transactionId = uuidv4();

    setState('generating_xml');
    const xml = await generateNFCeXml(cart, total);
    
    setState('signing_xml');
    const signedXml = await signNFCeXml(xml);
    
    setState('generating_pix');
    const pixCharge = await generateDynamicPix(total, transactionId);

    return { signedXml, pixCharge, transactionId };
};
