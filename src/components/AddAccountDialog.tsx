import { useState, useEffect } from "react";
import { Plus, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Account } from "@/hooks/useAccounts";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { platform: string; username: string; password: string; url?: string; notes?: string }) => void;
  editAccount?: Account | null;
  onUpdate?: (id: string, data: Partial<Omit<Account, "id" | "createdAt">>) => void;
}

const quickPlatforms = ["Google", "Facebook", "Instagram", "TikTok", "Discord", "Twitter", "GitHub", "Email"];

export default function AddAccountDialog({ open, onClose, onAdd, editAccount, onUpdate }: Props) {
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const isEdit = !!editAccount;

  useEffect(() => {
    if (editAccount) {
      setPlatform(editAccount.platform);
      setUsername(editAccount.username);
      setPassword(editAccount.password);
      setUrl(editAccount.url || "");
      setNotes(editAccount.notes || "");
    } else {
      reset();
    }
  }, [editAccount, open]);

  const reset = () => {
    setPlatform("");
    setUsername("");
    setPassword("");
    setUrl("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim()) return;
    const data = {
      platform: platform.trim(),
      username: username.trim(),
      password: password.trim(),
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && onUpdate) {
      onUpdate(editAccount.id, data);
    } else {
      onAdd(data);
    }
    reset();
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
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-auto"
          >
            <div className="p-5">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold">{isEdit ? "Edit Akun" : "Tambah Akun"}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              {!isEdit && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        platform === p
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary text-secondary-foreground hover:bg-primary/20"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Platform (wajib)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                  required
                />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username / Email (opsional)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (opsional)"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL / Link (opsional)"
                  type="url"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={500}
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan (opsional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={300}
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-surface-dark text-surface-dark-foreground font-extrabold text-sm shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isEdit ? <Save size={18} /> : <Plus size={18} />}
                  {isEdit ? "Simpan Perubahan" : "Simpan Akun"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
