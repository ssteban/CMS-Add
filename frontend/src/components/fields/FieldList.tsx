import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import FieldRow from './FieldRow';
import type { ComponentField } from './FieldRow';

interface FieldListProps {
  fields: ComponentField[];
  onUpdate: (id: string, data: Partial<ComponentField>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const FieldList = ({ fields, onUpdate, onDelete, onAdd, onReorder }: FieldListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, onReorder]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onReorder]);

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="mx-auto w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Plus size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Aún no hay campos</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Añade tu primer campo para empezar a construir el esquema de contenido de tu sitio web.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Añadir Campo
          </button>
        </div>
      ) : (
        <>
          {fields.map((field, index) => (
            <div
              key={field.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <FieldRow
                field={field}
                index={index}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Añadir otro campo
          </button>
        </>
      )}
    </div>
  );
};

export default FieldList;
