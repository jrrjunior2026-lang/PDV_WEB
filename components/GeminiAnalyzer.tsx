import React, { useState, useEffect, useCallback } from 'react';
import type { SaleRecord, Product } from '../types';
import * as geminiService from '../services/geminiService';

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);


interface GeminiAnalyzerProps {
    salesHistory: SaleRecord[];
    products: Product[];
}

const GeminiAnalyzer: React.FC<GeminiAnalyzerProps> = ({ salesHistory, products }) => {
    const [insights, setInsights] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [queryResponse, setQueryResponse] = useState<string | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(true);
    const [isLoadingQuery, setIsLoadingQuery] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            if (salesHistory.length > 0 && products.length > 0) {
                try {
                    const generatedInsights = await geminiService.generateBusinessInsights(salesHistory, products);
                    setInsights(generatedInsights);
                } catch (error) {
                    console.error("Failed to get Gemini insights:", error);
                    setInsights("Não foi possível gerar insights no momento.");
                } finally {
                    setIsLoadingInsights(false);
                }
            } else {
                 setIsLoadingInsights(false);
                 setInsights("Dados insuficientes para gerar insights.");
            }
        };
        fetchInsights();
    }, [salesHistory, products]);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoadingQuery(true);
        setQueryResponse(null);
        try {
            const response = await geminiService.answerBusinessQuery(query, salesHistory, products);
            setQueryResponse(response);
        } catch (error) {
            console.error("Failed to query Gemini:", error);
            setQueryResponse("Desculpe, não consegui processar sua pergunta.");
        } finally {
            setIsLoadingQuery(false);
        }
    };

    return (
        <div className="mt-8 bg-brand-secondary rounded-lg border border-brand-border p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-brand-accent"/>
                Análise e Previsão com IA (Gemini)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Proactive Insights */}
                <div>
                    <h4 className="font-semibold text-brand-text mb-2">Insights Proativos</h4>
                    <div className="bg-brand-primary/50 p-4 rounded-lg min-h-[150px] text-sm text-brand-subtle prose">
                        {isLoadingInsights ? (
                            <div className="flex items-center justify-center h-full">
                                <Spinner />
                                <span className="ml-2">Analisando dados...</span>
                            </div>
                        ) : (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{insights}</p>
                        )}
                    </div>
                </div>

                {/* Interactive Query */}
                <div>
                    <h4 className="font-semibold text-brand-text mb-2">Pergunte aos Seus Dados</h4>
                     <form onSubmit={handleQuerySubmit}>
                        <textarea
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ex: Qual a previsão de venda de Café para a próxima semana?"
                            className="w-full bg-brand-primary/50 p-2 rounded-md border border-brand-border text-sm h-20 resize-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoadingQuery}
                            className="w-full mt-2 py-2 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-accent/80 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoadingQuery ? <Spinner/> : 'Analisar'}
                        </button>
                    </form>
                    {queryResponse && (
                        <div className="mt-4 bg-brand-primary/50 p-4 rounded-lg text-sm text-brand-subtle">
                             <p style={{ whiteSpace: 'pre-wrap' }}>{queryResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeminiAnalyzer;
