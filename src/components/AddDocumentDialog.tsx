import { useState, useEffect, useRef } from "react";
import { Plus, Save, X, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentItem } from "@/hooks/useDocuments";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Omit<DocumentItem, "id" | "createdAt">) => void;
  editItem?: DocumentItem | null;
  onUpdate?: (id: string, data: Partial<Omit<DocumentItem, "id" | "createdAt">>) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddDocumentDialog({ open, onClose, onAdd, editItem, onUpdate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const imgInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description || "");
      setImage(editItem.image);
    } else {
      setTitle("");
      setDescription("");
      setImage("");
    }
  }, [editItem, open]);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran maksimal 3MB");
      return;
    }
    const base64 = await fileToBase64(file);
    setImage(base64);
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image) {
      alert("Judul dan foto wajib diisi");
      return;
    }
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      image,
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
                  {isEdit ? "Edit Dokumen" : "Tambah Dokumen"}
                </h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul dokumen (cth: KTP, SIM)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={80}
                  required
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan (opsional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={300}
                />

                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
                {image ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={image} alt="Dokumen" className="w-full max-h-60 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-foreground/70 text-card flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="w-full py-6 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <ImagePlus size={26} />
                    Pilih / Foto Dokumen
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-surface-dark text-surface-dark-foreground font-extrabold text-sm shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isEdit ? <Save size={18} /> : <Plus size={18} />}
                  {isEdit ? "Simpan Perubahan" : "Simpan Dokumen"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
