import React, { useState, useCallback } from 'react';
import type { NFeImportResult } from '../../types';

interface NFeImportModalProps {
    onClose: () => void;
    onImport: (file: File) => Promise<NFeImportResult>;
    onComplete: (result: NFeImportResult) => void;
}

const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);


const NFeImportModal: React.FC<NFeImportModalProps> = ({ onClose, onImport, onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile && selectedFile.type === 'text/xml') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Por favor, selecione um arquivo XML válido.');
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
    
    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);


    const handleProcessImport = async () => {
        if (!file) {
            setError('Nenhum arquivo selecionado.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const result = await onImport(file);
            onComplete(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Importar NF-e de Compra (XML)</h2>
                    <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
                </div>

                <div className="flex-grow">
                    <p className="text-sm text-brand-subtle mb-4">
                        Faça o upload do arquivo XML da nota fiscal de compra. O sistema irá cadastrar o fornecedor e os produtos (se novos) e dará entrada no estoque automaticamente.
                    </p>

                    <label 
                        htmlFor="file-upload"
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`mt-2 flex justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-border hover:border-brand-subtle'}`}
                    >
                        <div className="text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-brand-subtle" />
                            <div className="mt-4 flex text-sm leading-6 text-brand-subtle">
                                <span className="relative cursor-pointer rounded-md font-semibold text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-accent focus-within:ring-offset-2 focus-within:ring-offset-brand-secondary hover:text-brand-accent/80">
                                    <span>Selecione um arquivo</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xml,text/xml" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}/>
                                </span>
                                <p className="pl-1">ou arraste e solte aqui</p>
                            </div>
                            <p className="text-xs leading-5">Apenas arquivos XML</p>
                        </div>
                    </label>

                    {file && (
                        <div className="mt-4 text-center text-sm text-green-400">
                           Arquivo selecionado: <strong>{file.name}</strong>
                        </div>
                    )}
                    {error && (
                         <div className="mt-4 text-center text-sm text-red-400">
                           <strong>Erro:</strong> {error}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border text-right flex-shrink-0">
                    <button 
                        onClick={handleProcessImport}
                        disabled={!file || isProcessing}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isProcessing ? <><Spinner /> Processando...</> : 'Importar e Dar Entrada'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NFeImportModal;