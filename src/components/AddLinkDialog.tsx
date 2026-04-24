import { useState, useEffect } from "react";
import { Plus, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LinkItem } from "@/hooks/useLinks";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Omit<LinkItem, "id" | "createdAt">) => void;
  editItem?: LinkItem | null;
  onUpdate?: (id: string, data: Partial<Omit<LinkItem, "id" | "createdAt">>) => void;
}

export default function AddLinkDialog({ open, onClose, onAdd, editItem, onUpdate }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setUrl(editItem.url);
      setDescription(editItem.description || "");
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
    }
  }, [editItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const data = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
    };
    if (isEdit && onUpdate) onUpdate(editItem.id, data);
    else onAdd(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/40 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[85vh] overflow-auto"
          >
            <div className="p-5 pb-8">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold">
                  {isEdit ? "Edit Link" : "Tambah Link"}
                </h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul link"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={80}
                  required
                />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://contoh.com"
                  type="url"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={500}
                  required
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi (opsional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={300}
                />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-surface-dark text-surface-dark-foreground font-extrabold text-sm shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isEdit ? <Save size={18} /> : <Plus size={18} />}
                  {isEdit ? "Simpan Perubahan" : "Simpan Link"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
