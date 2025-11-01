import React from 'react';
import type { Product } from '../../types';
import Barcode from '../Barcode';

interface PrintableLabelsProps {
    product: Product;
    quantity: number;
}

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 33mm)',
  gap: '4.5mm 5.5mm', // Common gaps for this label type
  padding: 0,
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  width: '33mm',
  height: '21mm',
  boxSizing: 'border-box',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Arial, sans-serif',
  lineHeight: 1.1,
  textAlign: 'center',
  pageBreakInside: 'avoid',
};

const productNameStyle: React.CSSProperties = {
    fontSize: '7pt',
    fontWeight: 'bold',
    margin: '0 0 1mm 0',
    maxHeight: '4mm',
    overflow: 'hidden',
    color: 'black',
};

const priceStyle: React.CSSProperties = {
    fontSize: '10pt',
    fontWeight: 'bold',
    margin: '0',
    color: 'black',
};

const barcodeContainerStyle: React.CSSProperties = {
    marginTop: '1mm',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};


const PrintableLabels: React.FC<PrintableLabelsProps> = ({ product, quantity }) => {
    const labels = Array.from({ length: quantity }, (_, i) => i);

    return (
        <div id="printable-labels-container" style={containerStyle}>
            {labels.map(i => (
                <div key={i} style={labelStyle}>
                    <div style={productNameStyle}>{product.name}</div>
                    <div style={priceStyle}>
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                     {product.ean && (
                        <div style={barcodeContainerStyle}>
                            <Barcode 
                                value={product.ean} 
                                width={1}
                                height={20}
                                fontSize={8}
                                displayValue={true}
                            />
                        </div>
                     )}
                </div>
            ))}
        </div>
    );
};

export default PrintableLabels;