import type { NcmCode, CfopCode } from '../types';

const MOCK_NCM_CODES: NcmCode[] = [
    { code: '21011110', description: 'Café solúvel, mesmo descafeinado' },
    { code: '19059090', description: 'Outros pães, bolachas, etc., exceto pão de forma' },
    { code: '20091200', description: 'Suco de laranja, não fermentado, sem adição de álcool' },
    { code: '19053100', description: 'Bolos e outros produtos de padaria, pastelaria ou da indústria de bolachas e biscoitos' },
    { code: '22011000', description: 'Águas minerais e águas gaseificadas' },
    { code: '16023220', description: 'Produtos de carne de aves, cozidos' },
    { code: '17049020', description: 'Chocolate e outras preparações alimentícias contendo cacau' },
];

const MOCK_CFOP_CODES: CfopCode[] = [
    { code: '5102', description: 'Venda de mercadoria adquirida ou recebida de terceiros' },
    { code: '5405', description: 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária' },
    { code: '1102', description: 'Compra para comercialização' },
    { code: '1949', description: 'Outra entrada de mercadoria ou prestação de serviço não especificada' },
];

/**
 * Simulates fetching fiscal data (NCM, CFOP, etc.) from the backend.
 */
export const getFiscalData = (): Promise<{ ncm: NcmCode[], cfop: CfopCode[] }> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ ncm: MOCK_NCM_CODES, cfop: MOCK_CFOP_CODES }), 250); // Simulate network delay
    });
};
