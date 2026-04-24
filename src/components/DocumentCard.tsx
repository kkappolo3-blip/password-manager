import { useState } from "react";
import { Pencil, Trash2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentItem } from "@/hooks/useDocuments";

interface Props {
  document: DocumentItem;
  onDelete: (id: string) => void;
  onEdit: (item: DocumentItem) => void;
}

export default function DocumentCard({ document, onDelete, onEdit }: Props) {
  const [preview, setPreview] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-card rounded-2xl shadow-md border border-border overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setPreview(true)}
          className="relative w-full block group"
        >
          <img
            src={document.image}
            alt={document.title}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
            <Maximize2
              size={24}
              className="text-card opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            />
          </div>
        </button>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-extrabold truncate flex-1">{document.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(document)}
                className="text-muted-foreground hover:text-primary transition-colors p-0.5"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(document.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {document.description && (
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
              {document.description}
            </p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(false)}
            className="fixed inset-0 bg-foreground/90 z-[60] flex items-center justify-center p-4"
          >
            <button
              onClick={() => setPreview(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card text-foreground flex items-center justify-center shadow-lg z-10"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={document.image}
              alt={document.title}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
