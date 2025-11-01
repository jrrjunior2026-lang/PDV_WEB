
import type { CartItem, NFCe, Emitente, ProdutoNFCe, TotalNFCe } from '../types';

const MOCK_EMITENTE: Emitente = {
  CNPJ: '00000000000191',
  xNome: 'Empresa Teste Ltda',
  xFant: 'PDV Fiscal Teste',
  enderEmit: {
    xLgr: 'Rua de Teste',
    nro: '123',
    xBairro: 'Centro',
    cMun: '3550308', // São Paulo
    xMun: 'Sao Paulo',
    UF: 'SP',
    CEP: '01000000',
    cPais: '1058',
    xPais: 'Brasil',
  },
  IE: '111111111111',
  CRT: '1', // Simples Nacional
};

// Helper to format numbers to fiscal standards
const formatValue = (value: number) => value.toFixed(2);

/**
 * Generates a structured NFC-e object based on the current cart.
 */
function createNFCeObject(cart: CartItem[], total: number): NFCe {
  let itemCounter = 0;
  
  const produtos: ProdutoNFCe[] = cart.map(item => {
    itemCounter++;
    const vProd = item.price * item.quantity;
    const vTotTrib = vProd * 0.15; // Mock tribute calculation (15%)
    
    return {
      cProd: item.id,
      cEAN: `SEM GTIN`,
      xProd: item.name,
      NCM: item.fiscalData?.ncm || '00000000',
      CFOP: item.fiscalData?.cfop || '5102',
      uCom: 'UN',
      qCom: item.quantity,
      vUnCom: item.price,
      vProd: vProd,
      cEANTrib: `SEM GTIN`,
      uTrib: 'UN',
      qTrib: item.quantity,
      vUnTrib: item.price,
      indTot: 1,
      imposto: {
        vTotTrib,
        ICMS: {
          ICMSSN102: {
            orig: '0',
            CSOSN: '102',
          },
        },
        PIS: { PISSN: { CST: '99' } },
        COFINS: { COFINSSN: { CST: '99' } },
      },
    };
  });

  const vNF = total;
  const vTotTribGlobal = produtos.reduce((sum, p) => sum + p.imposto.vTotTrib, 0);

  const icmsTot: TotalNFCe = {
      vBC: 0.00, vICMS: 0.00, vICMSDeson: 0.00, vFCP: 0.00, vBCST: 0.00, vST: 0.00,
      vFCPST: 0.00, vFCPSTRet: 0.00, vProd: total, vFrete: 0.00, vSeg: 0.00, vDesc: 0.00,
      vII: 0.00, vIPI: 0.00, vIPIDevol: 0.00, vPIS: 0.00, vCOFINS: 0.00, vOutro: 0.00,
      vNF: vNF, vTotTrib: vTotTribGlobal
  };

  const now = new Date();
  
  return {
    infNFe: {
      versao: '4.00',
      ide: {
        cUF: '35', // São Paulo
        cNF: String(Math.floor(Math.random() * 10000000)),
        natOp: 'VENDA',
        mod: 65, // NFC-e
        serie: 1,
        nNF: Math.floor(Math.random() * 1000),
        dhEmi: now.toISOString(),
        tpNF: 1, // Saída
        idDest: 1, // Operação interna
        cMunFG: MOCK_EMITENTE.enderEmit.cMun,
        tpImp: 4, // DANFE NFC-e
        tpEmis: 1, // Emissão normal
        cDV: 1,
        tpAmb: 2, // Homologação
        finNFe: 1, // Finalidade normal
        indFinal: 1, // Consumidor final
        indPres: 1, // Operação presencial
        procEmi: 0, // Emissão com aplicativo do contribuinte
        verProc: '1.0.0',
      },
      emit: MOCK_EMITENTE,
      // dest: undefined, // Consumidor não identificado
      det: produtos,
      total: {
        ICMSTot: icmsTot
      },
      pag: {
        detPag: [{ tpag: '01', vPag: total }] // 01 = Dinheiro (mock)
      },
    },
  };
}


/**
 * Converts a JS object to a simplified XML string for demonstration.
 * A real implementation would use a robust library like `xml-js` or `xmlbuilder`.
 */
function objectToXml(obj: any, indent = ''): string {
    let xml = '';
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const isObject = typeof value === 'object' && value !== null;
            const isArray = Array.isArray(value);
            
            if (isArray) {
                value.forEach(item => {
                    xml += `${indent}<${key}>\n${objectToXml(item, indent + '  ')}${indent}</${key}>\n`;
                });
            } else if (isObject) {
                xml += `${indent}<${key}>\n${objectToXml(value, indent + '  ')}${indent}</${key}>\n`;
            } else {
                xml += `${indent}<${key}>${value}</${key}>\n`;
            }
        }
    }
    return xml;
}

/**
 * Mocks the process of generating the NFC-e XML.
 */
export const generateNFCeXml = (cart: CartItem[], total: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nfceObject = createNFCeObject(cart, total);
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n<NFe xmlns="http://www.portalfiscal.inf.br/nfe">\n${objectToXml(nfceObject, '  ')}</NFe>`;
      resolve(xmlString);
    }, 1500); // Simulate network/processing delay
  });
};

/**
 * Mocks the process of signing the XML with a digital certificate.
 */
export const signNFCeXml = (xml: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const signature = `
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      ... (Informações da assinatura) ...
    </SignedInfo>
    <SignatureValue>... (Valor da assinatura mock) ...</SignatureValue>
    <KeyInfo>
      ... (Informações do certificado) ...
    </KeyInfo>
  </Signature>
`;
            const signedXml = xml.replace('</NFe>', `${signature}</NFe>`);
            resolve(signedXml);
        }, 1000); // Simulate signing delay
    });
};
