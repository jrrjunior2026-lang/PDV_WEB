import React, { useState, useEffect } from 'react';

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  step?: string;
  nested?: boolean;
  options?: { value: string; label: string }[];
}

interface EntityFormModalProps {
  title: string;
  fields: Field[];
  initialData: any | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({ title, fields, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

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
    if (field.type === 'select') {
        return (
             <select
                name={field.name}
                id={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                className="w-full bg-brand-primary border border-brand-border text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent"
             >
                <option value="" disabled>Selecione...</option>
                {field.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        );
    }
    return (
        <input
            type={field.type}
            name={field.name}
            id={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            step={field.step}
            className="w-full bg-brand-primary border border-brand-border text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent"
        />
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