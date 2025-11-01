import React, { useState, useEffect } from 'react';

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  step?: string;
  nested?: boolean;
  options?: { value: string; label: string }[];
  aiEnabled?: boolean;
}

interface EntityFormModalProps {
  title: string;
  fields: Field[];
  initialData: any | null;
  onSave: (data: any) => void;
  onClose: () => void;
  onAIGenerate?: (fieldName: string, currentData: any) => Promise<string | undefined>;
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({ title, fields, initialData, onSave, onClose, onAIGenerate }) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);

  useEffect(() => {
    const initialFormState = fields.reduce((acc, field) => {
        let value = '';
        if (initialData) {
            if (field.nested && field.name.includes('.')) {
                const [parent, child] = field.name.split('.');
                value = initialData[parent]?.[child] || '';
            } else {
                value = initialData[field.name] || '';
            }
        } else if (field.type === 'select') {
            value = field.options?.[0]?.value || '';
        }
        acc[field.name] = value;
        return acc;
    }, {} as any);
    setFormData(initialFormState);
  }, [initialData, fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAISuggestion = async (fieldName: string) => {
      if (!onAIGenerate) return;
      setIsAiLoading(fieldName);
      const suggestion = await onAIGenerate(fieldName, formData);
      if (suggestion) {
          setFormData((prev: any) => ({ ...prev, [fieldName]: suggestion }));
      }
      setIsAiLoading(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Reconstruct nested data
    const structuredData = Object.keys(formData).reduce((acc, key) => {
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!acc[parent]) acc[parent] = {};
            acc[parent][child] = formData[key];
        } else {
            acc[key] = formData[key];
        }
        return acc;
    }, {} as any);
    
    await onSave(structuredData);
    setIsLoading(false);
  };

  const renderField = (field: Field) => {
    const commonProps = {
        name: field.name,
        id: field.name,
        value: formData[field.name] || '',
        onChange: handleChange,
        required: field.required,
        className: "w-full bg-brand-primary border border-brand-border text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent",
    };

    if (field.type === 'select') {
        return (
             <select {...commonProps}>
                {field.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        );
    }
    return (
        <div className="relative">
            <input
                type={field.type}
                step={field.step}
                {...commonProps}
                className={`${commonProps.className} ${field.aiEnabled ? 'pr-10' : ''}`}
            />
            {field.aiEnabled && onAIGenerate && (
                <button
                    type="button"
                    onClick={() => handleAISuggestion(field.name)}
                    disabled={!!isAiLoading}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-accent hover:text-yellow-400 disabled:opacity-50"
                    title="Sugerir com IA"
                >
                    {isAiLoading === field.name 
                        ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-brand-subtle border-t-brand-accent"></div>
                        : <SparklesIcon className="w-5 h-5" />
                    }
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-brand-secondary rounded-lg shadow-2xl p-6 border border-brand-border w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-brand-subtle hover:text-white text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-brand-subtle mb-1">{field.label}</label>
              {renderField(field)}
            </div>
          ))}
          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-brand-border text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-border/70">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="bg-brand-accent text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-accent/80 disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityFormModal;