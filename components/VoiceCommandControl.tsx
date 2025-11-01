import React from 'react';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'error';

interface VoiceCommandControlProps {
    status: VoiceStatus;
    onClick: () => void;
}

const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 5.25v-1.5m-12 0h12M12 15a6 6 0 0 1-6-6v-1.5a6 6 0 0 1 12 0v1.5a6 6 0 0 1-6 6Z" /></svg>
);

const StopCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
);


const VoiceCommandControl: React.FC<VoiceCommandControlProps> = ({ status, onClick }) => {
    const renderContent = () => {
        switch (status) {
            case 'listening':
                return (
                    <div className="flex items-center justify-center">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </div>
                );
            case 'processing':
                return (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-accent"></div>
                );
             case 'error':
                return <StopCircleIcon className="w-6 h-6 text-red-500" />;
            case 'idle':
            default:
                return <MicrophoneIcon className="w-6 h-6 text-brand-subtle" />;
        }
    };
    
    const getTooltip = () => {
        switch (status) {
            case 'listening': return 'Ouvindo...';
            case 'processing': return 'Processando comando...';
            case 'error': return 'Erro no comando';
            case 'idle':
            default: return 'Adicionar por voz';
        }
    }

    return (
        <button
            onClick={onClick}
            disabled={status === 'processing' || status === 'listening'}
            className="flex-shrink-0 w-12 h-10 flex items-center justify-center bg-brand-secondary border border-brand-border rounded-md hover:border-brand-accent transition-colors disabled:cursor-not-allowed group relative"
            title={getTooltip()}
        >
            {renderContent()}
        </button>
    );
};

export default VoiceCommandControl;
