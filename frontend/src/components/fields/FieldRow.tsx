import { Trash2, GripVertical } from 'lucide-react';

export interface ComponentField {
  id: string;
  key_name: string;
  key_value: string;
  key_type: string;
}

interface FieldRowProps {
  field: ComponentField;
  index: number;
  onUpdate: (id: string, data: Partial<ComponentField>) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'image', label: 'Imagen' },
  { value: 'link', label: 'Enlace' },
  { value: 'color', label: 'Color' },
  { value: 'number', label: 'Número' },
  { value: 'richtext', label: 'Texto Rico' },
];

const FieldRow = ({ field, index, onUpdate, onDelete, onDragStart, onDragEnd, isDragging, isDragOver }: FieldRowProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    onDragStart(index);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`
        group flex items-start gap-3 p-4 bg-white border rounded-xl transition-all
        ${isDragging
          ? 'opacity-50 ring-2 ring-blue-400 scale-[1.01] shadow-lg border-blue-300'
          : isDragOver
            ? 'border-t-2 border-blue-500 border-slate-200'
            : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'
        }
      `}
    >
      <div className="shrink-0 mt-2.5 text-slate-400 cursor-grab active:cursor-grabbing transition-colors hover:text-blue-500">
        <GripVertical size={18} />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 items-start">
        <input
          type="text"
          value={field.key_name}
          onChange={(e) => onUpdate(field.id, { key_name: e.target.value })}
          placeholder="nombre-del-campo"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {field.key_type === 'richtext' ? (
          <textarea
            value={field.key_value}
            onChange={(e) => onUpdate(field.id, { key_value: e.target.value })}
            placeholder="Valor del campo..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        ) : (
          <input
            type={field.key_type === 'number' ? 'number' : field.key_type === 'color' ? 'text' : 'text'}
            value={field.key_value}
            onChange={(e) => onUpdate(field.id, { key_value: e.target.value })}
            placeholder={
              field.key_type === 'image' ? 'https://ejemplo.com/imagen.jpg' :
              field.key_type === 'link' ? 'https://ejemplo.com' :
              field.key_type === 'color' ? '#1e40af' :
              field.key_type === 'number' ? '0' :
              'Valor del campo...'
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        )}

        <div className="flex items-center gap-2">
          <select
            value={field.key_type}
            onChange={(e) => onUpdate(field.id, { key_type: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onDelete(field.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar campo"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldRow;
