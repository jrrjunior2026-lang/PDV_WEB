import type { CartItem, NFCe, Emitente, ProdutoNFCe, TotalNFCe, Payment, PaymentMethod, PagamentoNFCe } from '../types';

// --- FISCAL (NFC-e) LOGIC ---

const MOCK_EMITENTE: Emitente = {
  CNPJ: '00000000000191', xNome: 'Empresa Teste Ltda', xFant: 'PDV Fiscal Teste',
  enderEmit: {
    xLgr: 'Rua de Teste', nro: '123', xBairro: 'Centro', cMun: '3550308', 
    xMun: 'Sao Paulo', UF: 'SP', CEP: '01000000', cPais: '1058', xPais: 'Brasil',
  },
  IE: '111111111111', CRT: '1',
};

function createNFCeObject(cart: CartItem[], total: number, payments: Payment[]): NFCe {
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

  const paymentMethodMap: Record<PaymentMethod, string> = {
      'Dinheiro': '01',
      'Credito': '03',
      'Debito': '04',
      'PIX': '17',
  };

  const detPag: PagamentoNFCe[] = payments.map(p => ({
      tpag: paymentMethodMap[p.method],
      vPag: p.amount,
  }));

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
      pag: { detPag },
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

const generateNFCeXml = (cart: CartItem[], total: number, payments: Payment[]): Promise<string> => new Promise(resolve => {
  setTimeout(() => {
    const nfceObject = createNFCeObject(cart, total, payments);
    resolve(`<?xml version="1.0" encoding="UTF-8"?>\n<NFe xmlns="http://www.portalfiscal.inf.br/nfe">\n${objectToXml(nfceObject, '  ')}</NFe>`);
  }, 1000);
});

const signNFCeXml = (xml: string): Promise<string> => new Promise(resolve => {
  setTimeout(() => {
    const signature = `\n  <Signature>...</Signature>\n`;
    resolve(xml.replace('</NFe>', `${signature}</NFe>`));
  }, 800);
});


// --- ORCHESTRATION ---

export const generateAndSignNfce = async (
    cart: CartItem[], 
    total: number,
    payments: Payment[],
): Promise<string> => {
    const xml = await generateNFCeXml(cart, total, payments);
    const signedXml = await signNFCeXml(xml);
    return signedXml;
};