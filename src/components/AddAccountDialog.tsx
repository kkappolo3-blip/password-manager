import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { platform: string; username: string; password: string; notes?: string }) => void;
}

const quickPlatforms = ["Google", "Facebook", "Instagram", "TikTok", "Discord", "Twitter", "GitHub", "Email"];

export default function AddAccountDialog({ open, onClose, onAdd }: Props) {
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setPlatform("");
    setUsername("");
    setPassword("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform.trim() || !username.trim() || !password.trim()) return;
    onAdd({ platform: platform.trim(), username: username.trim(), password: password.trim(), notes: notes.trim() || undefined });
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/40 z-50"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-auto"
          >
            <div className="p-5">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold">Tambah Akun</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              {/* Quick Platform Select */}
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

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Platform (misal: Google)"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                  required
                />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username / Email"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                  required
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                  required
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
                  <Plus size={18} />
                  Simpan Akun
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
