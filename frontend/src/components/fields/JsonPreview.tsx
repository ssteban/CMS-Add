import { useMemo } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';
import type { ComponentField } from './FieldRow';

interface JsonPreviewProps {
  fields: ComponentField[];
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

const JsonPreview = ({ fields, isOpen, onClose, projectName }: JsonPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const validFields = useMemo(() => fields.filter((f) => f.key_name.trim()), [fields]);

  const jsonOutput = useMemo(() => {
    const data = validFields.map((f) => ({
      key: f.key_name.trim(),
      value: f.key_value,
      type: f.key_type,
    }));
    const obj = {
      website: projectName,
      total_fields: data.length,
      data,
    };
    return JSON.stringify(obj, null, 2);
  }, [validFields, projectName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Code size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Vista JSON</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {validFields.length} campo(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Copiar JSON"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {validFields.length === 0 ? (
            <div className="text-center py-12">
              <Code size={32} className="mx-auto text-slate-300 dark:text-slate-500 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">JSON vacío</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Añade campos para ver el JSON en vivo.
              </p>
            </div>
          ) : (
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              <code>{jsonOutput}</code>
            </pre>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={16} />
                Copiar JSON
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonPreview;
