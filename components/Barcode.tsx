import React, { useRef, useEffect } from 'react';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
}

const Barcode: React.FC<BarcodeProps> = ({ 
    value, 
    width = 1.2, 
    height = 30,
    displayValue = true,
    fontSize = 10,
}) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current && (window as any).JsBarcode) {
      try {
        (window as any).JsBarcode(ref.current, value, {
          format: "EAN13",
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          font: "monospace",
          textAlign: "center",
          textMargin: 2,
        });
      } catch (e) {
        console.error("Barcode generation failed:", e);
        if (ref.current) {
            ref.current.innerHTML = `<text x="0" y="10" font-size="8" fill="red">EAN Inválido</text>`;
        }
      }
    }
  }, [value, width, height, displayValue, fontSize]);

  // The svg will be populated by JsBarcode
  return <svg ref={ref} />;
};

export default Barcode;