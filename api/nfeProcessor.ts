import { v4 as uuidv4 } from 'uuid';
import type { NFeImportResult, Product, Supplier } from '../types';
import * as productApi from './products';
import * as supplierApi from './suppliers';
import * as inventoryApi from './inventory';

// In a real app, use a proper XML parsing library (e.g., fast-xml-parser)
const simulateXmlParse = (xmlContent: string) => {
    console.log("Simulating parsing of XML content:", xmlContent.substring(0, 100) + "...");
    // This is a mock representation of a parsed NF-e XML for demonstration
    return {
        nfeProc: {
            NFe: {
                infNFe: {
                    ide: { nNF: `99${Math.floor(Math.random() * 900) + 100}` },
                    emit: { 
                        xNome: "Fornecedor de Teste XML", 
                        CNPJ: `11.222.333/0001-${Math.floor(Math.random() * 90) + 10}` 
                    },
                    det: [
                        { prod: { cProd: `XML-${uuidv4().substring(0,4)}`, xProd: "Produto Novo do XML", qCom: "15.0000", vUnCom: "25.50", NCM: "33049990" } },
                        { prod: { cProd: "PROD001", xProd: "Café Espresso", qCom: "50.0000", vUnCom: "4.50", NCM: "21011110" } },
                        { prod: { cProd: `XML-${uuidv4().substring(0,4)}`, xProd: "Outro Item XML", qCom: "5.0000", vUnCom: "149.90", NCM: "85171231" } },
                    ]
                }
            }
        }
    };
};

export const processNFeFile = async (xmlContent: string): Promise<NFeImportResult> => {
    const parsedNFe = simulateXmlParse(xmlContent);
    const nfe = parsedNFe.nfeProc.NFe.infNFe;

    const result: NFeImportResult = {
        summary: {
            invoiceNumber: nfe.ide.nNF,
            supplierFound: false,
            supplierCreated: false,
            productsProcessed: nfe.det.length,
            newProductsCreated: 0,
            stockEntries: 0,
        },
        details: {
            supplierName: nfe.emit.xNome,
            products: [],
        },
    };

    // 1. Process Supplier
    const supplierCnpj = nfe.emit.CNPJ;
    let supplier = await supplierApi.findSupplierByCnpj(supplierCnpj);

    if (supplier) {
        result.summary.supplierFound = true;
    } else {
        const newSupplierData: Omit<Supplier, 'id'> = {
            name: nfe.emit.xNome,
            cnpj: supplierCnpj,
            contactPerson: 'Contato (via XML)',
            email: 'email@xml.com',
            phone: '(00) 0000-0000',
        };
        supplier = await supplierApi.addSupplier(newSupplierData);
        result.summary.supplierCreated = true;
    }
    result.details.supplierName = supplier.name;

    // 2. Process Products
    const stockEntries: { productId: string, productName: string, quantity: number }[] = [];
    
    for (const item of nfe.det) {
        const prod = item.prod;
        let product = await productApi.findProductByCode(prod.cProd);
        let isNewProduct = false;

        if (!product) {
            isNewProduct = true;
            result.summary.newProductsCreated++;
            const newProductData: Omit<Product, 'id'> = {
                code: prod.cProd,
                name: prod.xProd,
                price: parseFloat(prod.vUnCom) * 1.6, // Mock markup
                category: 'Importado (XML)',
                imageUrl: `https://source.unsplash.com/random/400x400/?product,${prod.xProd.split(' ')[0]}`,
                fiscalData: {
                    ncm: prod.NCM,
                    cfop: '5102', // Default
                },
            };
            product = await productApi.addProduct(newProductData);
        }

        const quantity = parseFloat(prod.qCom);
        stockEntries.push({
            productId: product.id,
            productName: product.name,
            quantity: quantity,
        });
        result.summary.stockEntries += quantity;

        result.details.products.push({
            code: product.code,
            name: product.name,
            quantity: quantity,
            isNew: isNewProduct,
        });
    }

    // 3. Record all stock movements in one go
    if (stockEntries.length > 0) {
        await inventoryApi.recordStockEntry(stockEntries, `NF-e #${nfe.ide.nNF}`);
    }

    console.log('[API_LOG] NF-e processed successfully.', result);
    return result;
};